import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Card, Button, Spin, Empty, Space } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function ChaptersForMCQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubject();
  }, [id]);

  const loadSubject = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/subjects", {
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error("Failed to load subjects");
      }

      const data = await resp.json();
      const subjects = data.subjects || [];
      const found = subjects.find((s) => String(s.id) === String(id));
      setSubject(found || null);

      if (found) {
        // Fetch chapters from API
        const chapterResp = await fetch(
          API_BASE + `/super-admin/chapters/subject/${id}`,
          { credentials: "include" }
        );

        if (chapterResp.ok) {
          const chapterData = await chapterResp.json();
          setChapters(chapterData.chapters || []);
        }
      }
    } catch (err) {
      setSubject(null);
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
            {subject?.name || "Subject"}
          </Title>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 20,
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Choose a chapter for MCQ quiz
          </Text>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Button onClick={() => navigate("/super-admin/subjects-list")}>Back</Button>
        </Space>

        {loading ? (
          <Card>
            <Spin />
          </Card>
        ) : !subject ? (
          <Card>
            <Empty description="Subject not found" />
          </Card>
        ) : chapters.length === 0 ? (
          <Card>
            <Empty description="No chapters available" />
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
                hoverable
                onClick={() =>
                  navigate(`/super-admin/mcq/create/${id}/${chapter.id}`)
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text strong>{chapter.name}</Text>
                  <Button type="primary" icon={<ArrowRightOutlined />}>
                    Create MCQ
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
