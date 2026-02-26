import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Select, Table, Typography, Space, Button, Spin, Empty, message, Modal, Tag } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function PreviousQuizzes() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
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

  const loadChapters = async (subjectId) => {
    try {
      setLoading(true);
      const resp = await fetch(API_BASE + `/super-admin/chapters/subject/${subjectId}`, {
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error("Failed to load chapters");
      }
      const data = await resp.json();
      setChapters(data.chapters || []);
    } catch (err) {
      message.error(err.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (subjectId, chapterId) => {
    try {
      setLoading(true);
      const resp = await fetch(
        API_BASE + `/super-admin/mcq/chapters/${subjectId}/${chapterId}`,
        { credentials: "include" }
      );
      if (!resp.ok) {
        throw new Error("Failed to load quizzes");
      }
      const data = await resp.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      message.error(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetails = async (quizId) => {
    try {
      setDetailLoading(true);
      const resp = await fetch(API_BASE + `/super-admin/mcq/quizzes/${quizId}`, {
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error("Failed to load quiz details");
      }
      const data = await resp.json();
      setSelectedQuiz(data || null);
      setDetailOpen(true);
    } catch (err) {
      message.error(err.message || "Failed to load quiz details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedChapter(null);
    setQuizzes([]);
    loadChapters(value);
  };

  const handleChapterChange = (value) => {
    setSelectedChapter(value);
    setQuizzes([]);
    if (selectedSubject) {
      loadQuizzes(selectedSubject, value);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => text || "-",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button size="small" onClick={() => loadQuizDetails(record.id)}>
          View Questions
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Previous Quiz</Title>
            <Text type="secondary">Select a subject and chapter to view saved quizzes</Text>
          </div>
          <Button onClick={() => navigate("/super-admin")}>Back to Dashboard</Button>
        </Space>

        <Card>
          <Space wrap style={{ width: "100%" }}>
            <div style={{ minWidth: 220 }}>
              <Text type="secondary">Subject</Text>
              <Select
                placeholder="Select subject"
                style={{ width: "100%" }}
                value={selectedSubject}
                onChange={handleSubjectChange}
              >
                {subjects.map((subject) => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ minWidth: 220 }}>
              <Text type="secondary">Chapter</Text>
              <Select
                placeholder="Select chapter"
                style={{ width: "100%" }}
                value={selectedChapter}
                onChange={handleChapterChange}
                disabled={!selectedSubject}
              >
                {chapters.map((chapter) => (
                  <Option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </Card>

        <Card>
          {loading ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin />
            </div>
          ) : quizzes.length === 0 ? (
            <Empty description="No quizzes found" />
          ) : (
            <Table
              columns={columns}
              dataSource={quizzes}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
        <Modal
          title={selectedQuiz ? `Quiz: ${selectedQuiz.title}` : "Quiz Details"}
          open={detailOpen}
          onCancel={() => {
            setDetailOpen(false);
            setSelectedQuiz(null);
          }}
          footer={null}
          width={900}
        >
          {detailLoading ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin />
            </div>
          ) : !selectedQuiz ? (
            <Empty description="No quiz data" />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              {(selectedQuiz.questions || []).map((q, idx) => (
                <Card key={q.id || idx} size="small" title={`Q${idx + 1}: ${q.questionText || q.question}`}> 
                  <Space direction="vertical" style={{ width: "100%" }} size={8}>
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = Number(q.correctAnswerIndex ?? q.correctAnswer) === optIdx;
                      return (
                        <div
                          key={`${q.id || idx}-${optIdx}`}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #f0f0f0",
                            background: isCorrect ? "#f6ffed" : "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{opt}</span>
                          {isCorrect && <Tag color="green">Correct</Tag>}
                        </div>
                      );
                    })}
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Modal>
      </Space>
    </div>
  );
}
