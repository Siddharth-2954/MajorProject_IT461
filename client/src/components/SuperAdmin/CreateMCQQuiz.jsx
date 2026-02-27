import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Card, Button, Spin, Empty, Form, Input, Select } from "antd";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function CreateMCQQuiz() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectAndChapter();
  }, [subjectId, chapterId]);

  const loadSubjectAndChapter = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/subjects", {
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error("Failed to load subjects");
      }

      const data = await resp.json();
      const subjects = data.subjects || [];
      const found = subjects.find((s) => String(s.id) === String(subjectId));
      setSubject(found || null);

      // Fetch chapter from API
      if (found) {
        const chapterResp = await fetch(
          API_BASE + `/super-admin/chapters/subject/${subjectId}`,
          { credentials: "include" }
        );

        if (chapterResp.ok) {
          const chapterData = await chapterResp.json();
          const chapters = chapterData.chapters || [];
          const foundChapter = chapters.find((c) => String(c.id) === String(chapterId));
          setChapter(foundChapter || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = (values) => {
    // Store quiz data in session storage
    sessionStorage.setItem(
      "mcqQuizData",
      JSON.stringify({
        title: values.title,
        description: values.description,
        questionCount: values.questionCount,
        subjectId,
        chapterId,
      })
    );
    // Redirect to quiz builder
    navigate(`/super-admin/mcq/create/${subjectId}/${chapterId}`);
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
            {subject?.name} - {chapter?.name}
          </Text>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <Button
          onClick={() => navigate(`/super-admin/mcq/subjects/${subjectId}`)}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>

        {loading ? (
          <Card>
            <Spin />
          </Card>
        ) : !subject || !chapter ? (
          <Card>
            <Empty description="Subject or chapter not found" />
          </Card>
        ) : (
          <Card style={{ maxWidth: 800, margin: "0 auto" }}>
            <Form form={form} layout="vertical" onFinish={handleCreateQuiz}>
              <Form.Item
                label="Quiz Title"
                name="title"
                rules={[{ required: true, message: "Please enter quiz title" }]}
              >
                <Input placeholder="e.g., Chapter 1 Basics Quiz" />
              </Form.Item>

              <Form.Item
                label="Number of Questions"
                name="questionCount"
                rules={[{ required: true, message: "Please enter number of questions" }]}
              >
                <Select placeholder="Select number of questions">
                  <Select.Option value={5}>5 Questions</Select.Option>
                  <Select.Option value={10}>10 Questions</Select.Option>
                  <Select.Option value={15}>15 Questions</Select.Option>
                  <Select.Option value={20}>20 Questions</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
              >
                <Input.TextArea
                  placeholder="Optional description for the quiz"
                  rows={4}
                />
              </Form.Item>

              <Form.Item>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="primary" htmlType="submit">
                    Create Quiz
                  </Button>
                  <Button onClick={() => navigate(`/super-admin/mcq/subjects/${subjectId}`)}>
                    Cancel
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
