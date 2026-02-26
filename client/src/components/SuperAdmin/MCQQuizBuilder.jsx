import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  Divider,
  Typography,
  Tag,
  Modal,
  message,
  Empty,
  Spin,
} from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function MCQQuizBuilder() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Retrieve quiz data from localStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("mcqQuizData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setQuizData(data);
        // Initialize questions array
        const initialQuestions = Array.from({ length: data.questionCount }, (_, i) => ({
          id: i + 1,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: null,
        }));
        setQuestions(initialQuestions);
      } catch (err) {
        console.error("Failed to load quiz data", err);
        navigate("/super-admin/mcq/subjects/" + subjectId);
      }
    } else {
      navigate("/super-admin/mcq/subjects/" + subjectId);
    }
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const handleQuestionChange = (value) => {
    const updated = [...questions];
    updated[currentQuestionIndex].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (optionIndex, value) => {
    const updated = [...questions];
    updated[currentQuestionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSetCorrectAnswer = (optionIndex) => {
    const updated = [...questions];
    updated[currentQuestionIndex].correctAnswer = optionIndex;
    setQuestions(updated);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleDeleteCurrentQuestion = () => {
    Modal.confirm({
      title: "Delete Question",
      content: `Are you sure you want to delete Question ${currentQuestionIndex + 1}?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        const updated = questions.filter((_, idx) => idx !== currentQuestionIndex);
        setQuestions(updated);
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
        message.success("Question deleted");
      },
    });
  };

  const handleSaveQuiz = async () => {
    // Validate all questions
    const allValid = questions.every(
      (q) =>
        q.question.trim() &&
        q.options.every((o) => o.trim()) &&
        q.correctAnswer !== null
    );

    if (!allValid) {
      message.error("Please complete all questions and set correct answers");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/super-admin/mcq/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...quizData,
          questions,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save quiz";
        try {
          const errorBody = await response.json();
          if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (parseError) {
          // Keep default message if response is not JSON.
        }
        throw new Error(errorMessage);
      }

      message.success("Quiz saved successfully!");
      sessionStorage.removeItem("mcqQuizData");
      navigate(`/super-admin/mcq/subjects/${subjectId}`);
    } catch (err) {
      console.error("Error saving quiz", err);
      message.error(err.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (!quizData || !currentQuestion) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  const isQuestionComplete =
    currentQuestion.question.trim() &&
    currentQuestion.options.every((o) => o.trim()) &&
    currentQuestion.correctAnswer !== null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: 24 }}>
      <Row gutter={24}>
        {/* Main Content - Question Builder */}
        <Col xs={24} md={16}>
          <Card>
            <div style={{ marginBottom: 24 }}>
              <Title level={3}>Create Questions</Title>
              <Text type="secondary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    background: "#f0f0f0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                      height: "100%",
                      background: "#1890ff",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            </div>

            <Divider />

            <Form layout="vertical">
              {/* Question Text */}
              <Form.Item label="Question Text" required>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter the question"
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                />
              </Form.Item>

              {/* Options */}
              <Form.Item label="Options" required>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx}>
                      <Space style={{ width: "100%" }}>
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <Button
                          type={
                            currentQuestion.correctAnswer === idx
                              ? "primary"
                              : "default"
                          }
                          onClick={() => handleSetCorrectAnswer(idx)}
                        >
                          {currentQuestion.correctAnswer === idx
                            ? "✓ Correct"
                            : "Set as Correct"}
                        </Button>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Form.Item>

              {/* Navigation Buttons */}
              <Divider />
              <Form.Item>
                <Space>
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Text type="secondary">
                    {currentQuestionIndex + 1} / {questions.length}
                  </Text>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteCurrentQuestion}
                  >
                    Delete Question
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Sidebar - Quiz Reference Card */}
        <Col xs={24} md={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              marginBottom: 16,
            }}
          >
            <Title level={4} style={{ color: "white", marginBottom: 16 }}>
              Quiz Details
            </Title>
            <Space direction="vertical" style={{ width: "100%", color: "white" }}>
              <div>
                <Text strong style={{ color: "white" }}>
                  Title:
                </Text>
                <br />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  {quizData.title}
                </Text>
              </div>
              <div>
                <Text strong style={{ color: "white" }}>
                  Total Questions:
                </Text>
                <br />
                <Tag color="blue">{questions.length}</Tag>
              </div>
              <div>
                <Text strong style={{ color: "white" }}>
                  Description:
                </Text>
                <br />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  {quizData.description || "No description"}
                </Text>
              </div>
              <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />
              <div>
                <Text strong style={{ color: "white" }}>
                  Progress:
                </Text>
                <br />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  {questions.filter(
                    (q) =>
                      q.question.trim() &&
                      q.options.every((o) => o.trim()) &&
                      q.correctAnswer !== null
                  ).length}{" "}
                  of {questions.length} completed
                </Text>
              </div>
            </Space>
          </Card>

          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<SaveOutlined />}
                onClick={handleSaveQuiz}
                loading={saving}
                disabled={!questions.every(
                  (q) =>
                    q.question.trim() &&
                    q.options.every((o) => o.trim()) &&
                    q.correctAnswer !== null
                )}
              >
                Save Quiz
              </Button>
              <Button
                block
                onClick={() => {
                  sessionStorage.removeItem("mcqQuizData");
                  navigate(`/super-admin/mcq/subjects/${subjectId}`);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Card>

          {/* Question Summary */}
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Questions Summary</Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    padding: 12,
                    background:
                      idx === currentQuestionIndex
                        ? "#e6f7ff"
                        : q.question.trim() &&
                          q.options.every((o) => o.trim()) &&
                          q.correctAnswer !== null
                        ? "#f6ffed"
                        : "#fff1f0",
                    borderLeft:
                      idx === currentQuestionIndex
                        ? "4px solid #1890ff"
                        : q.question.trim() &&
                          q.options.every((o) => o.trim()) &&
                          q.correctAnswer !== null
                        ? "4px solid #52c41a"
                        : "4px solid #ff4d4f",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  <Space>
                    <Text strong>Q{idx + 1}</Text>
                    {q.question.trim() &&
                    q.options.every((o) => o.trim()) &&
                    q.correctAnswer !== null ? (
                      <Tag color="green">Complete</Tag>
                    ) : (
                      <Tag color="red">Incomplete</Tag>
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
