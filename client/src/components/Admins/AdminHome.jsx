import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, Row, Col, Statistic, Space } from "antd";
import { Column, Line } from "@ant-design/charts";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Where the server is running. You can set VITE_API_URL in client env to change this.
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function AdminHome() {
  const navigate = useNavigate();

  // State for the logged-in admin profile and for dashboard statistics
  const [adminProfile, setAdminProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the admin session and then the stats when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current session user/admin from backend
        const resp = await fetch(API_BASE + "/auth/me", { credentials: "include" });
        if (!resp.ok) {
          // Not logged in, go back to public site
          navigate("/");
          return;
        }

        const body = await resp.json();
        // Server may return admin under `admin` or `user` keys
        const session = body.admin || body.user || null;
        if (!session) {
          navigate("/");
          return;
        }

        setAdminProfile(session);

        // Fetch protected stats for dashboard. If it fails, we keep showing default values.
        try {
          const s = await fetch(API_BASE + "/admin/stats", { credentials: "include" });
          if (s.ok) {
            const j = await s.json();
            setDashboardStats(j.stats || null);
          }
        } catch (err) {
          // ignore stats errors - not critical
        }
      } catch (err) {
        // Any error means we should go back to the public site
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return <div style={{ padding: 32 }}>Loading admin dashboard…</div>;
  }

  if (!adminProfile) {
    // If there is no admin profile, show nothing (we already redirected)
    return null;
  }

  // Display name and id for the header
  const displayName = ("" + (adminProfile.firstName || "") + " " + (adminProfile.lastName || "")).trim() || adminProfile.email || adminProfile.username;
  const adminId = adminProfile.username || "-";

  // Provide fallback data for charts when server did not return stats
  const defaultMonthly = [
    { month: "Jan", signups: 40 },
    { month: "Feb", signups: 55 },
    { month: "Mar", signups: 70 },
    { month: "Apr", signups: 60 },
    { month: "May", signups: 90 },
    { month: "Jun", signups: 120 },
  ];

  const defaultCompletion = [
    { month: "Jan", rate: 20 },
    { month: "Feb", rate: 28 },
    { month: "Mar", rate: 35 },
    { month: "Apr", rate: 30 },
    { month: "May", rate: 45 },
    { month: "Jun", rate: 50 },
  ];

  const monthlyData = (dashboardStats && dashboardStats.monthlySignups) || defaultMonthly;
  const completionData = (dashboardStats && dashboardStats.courseCompletion) || defaultCompletion;

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ paddingInline: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Welcome, {displayName}
        </Title>
        <Text type="secondary">Registration ID: {adminId}</Text>
      </div>

      <div style={{ margin: 24 }}>
        <Row gutter={[24, 24]} style={{ alignItems: "stretch" }}>
          <Col xs={24} md={8} style={{ display: "flex" }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
              <Space align="center">
                <UserOutlined style={{ fontSize: 32 }} />
                <div>
                  <Text type="secondary">Admin</Text>
                  <div>{adminProfile.firstName}</div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8} style={{ display: "flex" }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
              <Space align="center">
                <TeamOutlined style={{ fontSize: 32 }} />
                <Statistic title="Total Students" value={(dashboardStats && typeof dashboardStats.students === "number" ? dashboardStats.students : 0)} />
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8} style={{ display: "flex" }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
              <Space align="center">
                <UserOutlined style={{ fontSize: 32 }} />
                <Statistic title="Total Admins" value={(dashboardStats && typeof dashboardStats.admins === "number" ? dashboardStats.admins : 1)} />
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Monthly Student Signups">
              <Column data={monthlyData} xField="month" yField="signups" height={260} color="#1f77b4" smooth />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Course Completion Rate">
              <Line data={completionData} xField="month" yField="rate" height={260} point={{ size: 4, shape: "diamond" }} color="#2ca02c" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Quick Links">
              <ul className="list-disc list-inside">
                <li>View organization profile</li>
                <li>Manage enrolled students</li>
                <li>Schedule live classes & webinars</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Recent Activity">
              <p>No recent activity yet. Start by inviting students or publishing a course.</p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}