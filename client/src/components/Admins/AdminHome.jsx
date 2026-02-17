import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Row, Col, Statistic, Space } from 'antd';
import { Column, Line } from '@ant-design/charts';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AdminHome() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_BASE + '/auth/me', { credentials: 'include' });
        if (!res.ok) {
          navigate('/');
          return;
        }
        const data = await res.json();
        const sessionAdmin = data.admin || data.user || null;
        if (!sessionAdmin) {
          navigate('/');
          return;
        }

        // sessionAdmin is authoritative
        setAdmin(sessionAdmin);

        // fetch stats by session registrationId (server-side owner check)
        try {
          // use the protected aggregated stats endpoint (doesn't require DB admin record)
          const statsRes = await fetch(API_BASE + `/admin/stats`, { credentials: 'include' });
          if (statsRes.ok) {
            const js = await statsRes.json();
            setStats(js.stats || null);
          }
        } catch (e) {
          // ignore stats errors
        }
      } catch (e) {
        navigate('/');
        return;
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  if (loading) return <div style={{ padding: 32 }}>Loading admin dashboard…</div>;
  if (!admin) return null;

  const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email;
  const adminId = admin.registrationId || admin.id;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ paddingInline: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Welcome, {fullName}
        </Title>
        <Text type="secondary">Registration ID: {adminId}</Text>
      </div>

      <div style={{ margin: 24 }}>
        <Row gutter={[24, 24]} style={{ alignItems: 'stretch' }}>
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Space align="center">
                <UserOutlined style={{ fontSize: 32 }} />
                <div>
                  <Text type="secondary">Admin</Text>
                  <div>{admin.email}</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Space align="center">
                <TeamOutlined style={{ fontSize: 32 }} />
                <Statistic
                  title="Total Students"
                  value={stats && typeof stats.students === 'number' ? stats.students : 0}
                />
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex' }}>
            <Card style={{ flex: 1 }} bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Space align="center">
                <UserOutlined style={{ fontSize: 32 }} />
                <Statistic
                  title="Total Admins"
                  value={stats && typeof stats.admins === 'number' ? stats.admins : 1}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Charts row */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Monthly Student Signups">
              <Column
                data={(
                  stats && stats.monthlySignups
                ) || [
                  { month: 'Jan', signups: 40 },
                  { month: 'Feb', signups: 55 },
                  { month: 'Mar', signups: 70 },
                  { month: 'Apr', signups: 60 },
                  { month: 'May', signups: 90 },
                  { month: 'Jun', signups: 120 },
                ]}
                xField="month"
                yField="signups"
                height={260}
                color="#1f77b4"
                smooth
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Course Completion Rate">
              <Line
                data={(
                  stats && stats.courseCompletion
                ) || [
                  { month: 'Jan', rate: 20 },
                  { month: 'Feb', rate: 28 },
                  { month: 'Mar', rate: 35 },
                  { month: 'Apr', rate: 30 },
                  { month: 'May', rate: 45 },
                  { month: 'Jun', rate: 50 },
                ]}
                xField="month"
                yField="rate"
                height={260}
                point={{ size: 4, shape: 'diamond' }}
                color="#2ca02c"
              />
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