import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, Row, Col, Empty, Button, message, Spin } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function SubjectsListForMCQ() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/subjects", {
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error("Failed to load subjects");
      }

      const data = await resp.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      message.error(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Header */}
      <div
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 36,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <Title
            level={1}
            style={{
              color: "white",
              margin: 0,
              fontSize: 32,
              fontWeight: "bold",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Create MCQ Quiz
          </Title>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 20,
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Choose a subject for MCQ quiz
          </Text>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <Button onClick={() => navigate("/super-admin")} style={{ marginBottom: 16 }}>
          Back to Dashboard
        </Button>

        {loading ? (
          <Card>
            <Spin />
          </Card>
        ) : subjects.length === 0 ? (
          <Card>
            <Empty description="No subjects available" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {subjects.map((subject) => (
              <Col xs={24} sm={12} lg={8} key={subject.id}>
                <Card
                  hoverable
                  style={{ height: "100%", cursor: "pointer" }}
                  onClick={() => navigate(`/super-admin/mcq/subjects/${subject.id}`)}
                >
                  <Title level={4} style={{ marginBottom: 8 }}>
                    {subject.name}
                  </Title>
                  <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    {subject.description || "No description available"}
                  </Text>
                  <Button type="primary" icon={<ArrowRightOutlined />}>
                    Select
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
