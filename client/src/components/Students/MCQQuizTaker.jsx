import React, { useEffect, useState } from 'react';
import { Card, Typography, Radio, Button, Spin, message, Progress, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const API_BASE = 'http://localhost:8000';

export default function MCQQuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/mcq/quizzes/${quizId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await res.json();
      setQuiz(data);
      // Initialize answers array
      setAnswers(new Array(data.questions.length).fill(null));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      message.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(a => a === null)) {
      message.warning('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/mcq/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setSubmitted(true);
        message.success('Quiz submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      message.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <Card>
          <Paragraph>Quiz not found</Paragraph>
          <Button onClick={() => navigate('/mcq-dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            {result.percentage >= 70 ? (
              <CheckCircleOutlined style={{ fontSize: '4rem', color: '#52c41a' }} />
            ) : (
              <CloseCircleOutlined style={{ fontSize: '4rem', color: '#ff4d4f' }} />
            )}
            <Title level={2} style={{ marginTop: '1rem' }}>
              Quiz Completed!
            </Title>
            <div style={{ margin: '2rem 0' }}>
              <Progress
                type="circle"
                percent={result.percentage}
                format={() => `${result.percentage}%`}
                strokeColor={
                  result.percentage >= 70 ? '#52c41a' :
                  result.percentage >= 40 ? '#faad14' : '#ff4d4f'
                }
                width={150}
              />
            </div>
            <Title level={3}>
              Score: {result.score} / {result.totalQuestions}
            </Title>
            <Paragraph>
              {result.percentage >= 70 
                ? 'Excellent work! Keep it up!' 
                : result.percentage >= 40 
                ? 'Good effort! Keep practicing to improve.'
                : 'Keep practicing! You can do better.'}
            </Paragraph>
            <Space>
              <Button type="primary" onClick={() => navigate('/mcq-dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retake Quiz
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <Card>
        <div style={{ marginBottom: '2rem' }}>
          <Title level={3}>{quiz.title}</Title>
          <Paragraph>{quiz.description}</Paragraph>
          <Progress 
            percent={Math.round(progress)} 
            showInfo={false}
            strokeColor="#1890ff"
          />
          <div style={{ marginTop: '0.5rem', textAlign: 'right', color: '#666' }}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>

        <Card style={{ backgroundColor: '#f5f5f5', marginBottom: '2rem' }}>
          <Title level={4} style={{ marginBottom: '1.5rem' }}>
            {currentQuestion + 1}. {question.questionText}
          </Title>
          <Radio.Group
            value={answers[currentQuestion]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.options.map((option, index) => (
                <Radio 
                  key={index} 
                  value={index}
                  style={{ 
                    padding: '1rem', 
                    display: 'block',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{option}</span>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div>
            {answers.filter(a => a !== null).length} / {quiz.questions.length} answered
          </div>

          {currentQuestion < quiz.questions.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={submitting}
              disabled={answers.some(a => a === null)}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
