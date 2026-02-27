import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Button, Spin, message, Tag, Row, Col } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOutlined, CheckCircleOutlined, FolderOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const API_BASE = 'http://localhost:8000';

export default function MCQSubjectView() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    fetchChapters();
    fetchSubjectName();
  }, [subjectId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/mcq/subjects/${subjectId}/chapters`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch chapters');
      }

      const data = await res.json();
      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      message.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectName = async () => {
    try {
      const res = await fetch(`${API_BASE}/mcq/student/stats`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        const subject = data.stats.find(s => s.subjectId === parseInt(subjectId));
        if (subject) {
          setSubjectName(subject.subjectName);
        }
      }
    } catch (error) {
      console.error('Error fetching subject name:', error);
    }
  };

  const handleChapterClick = async (chapter) => {
    setSelectedChapter(chapter);
    try {
      setLoadingQuizzes(true);
      const res = await fetch(`${API_BASE}/mcq/chapters/${subjectId}/${chapter.id}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await res.json();
      if (data.success) {
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      message.error('Failed to load quizzes for this chapter');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
    setQuizzes([]);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      <Button 
        onClick={() => navigate('/mcq-dashboard')} 
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Dashboard
      </Button>
      
      <Card>
        <div style={{ marginBottom: '2rem' }}>
          <Title level={2}>
            <BookOutlined /> {subjectName || 'Subject'} - {selectedChapter ? selectedChapter.name : 'Select Chapter'}
          </Title>
          <Paragraph>
            {selectedChapter 
              ? `Select a quiz from ${selectedChapter.name} to start practicing MCQs`
              : 'Select a chapter to view available quizzes'
            }
          </Paragraph>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spin size="large" />
          </div>
        ) : !selectedChapter ? (
          // Show chapters list
          chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Paragraph>No chapters available for this subject yet.</Paragraph>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {chapters.map((chapter) => (
                <Col xs={24} sm={12} md={8} lg={6} key={chapter.id}>
                  <Card
                    hoverable
                    onClick={() => handleChapterClick(chapter)}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: '100%',
                      borderColor: '#1890ff',
                    }}
                    bodyStyle={{ padding: '2rem 1rem' }}
                  >
                    <FolderOutlined style={{ fontSize: '3rem', color: '#1890ff', marginBottom: '1rem' }} />
                    <Title level={4} style={{ margin: 0, fontSize: '1rem' }}>
                      {chapter.name}
                    </Title>
                    {chapter.description && (
                      <Paragraph style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                        {chapter.description}
                      </Paragraph>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )
        ) : (
          // Show quizzes for selected chapter
          <>
            <Button 
              onClick={handleBackToChapters} 
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Chapters
            </Button>
            
            {loadingQuizzes ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Spin size="large" />
              </div>
            ) : quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Paragraph>No quizzes available for this chapter yet.</Paragraph>
              </div>
            ) : (
              <List
                dataSource={quizzes}
                renderItem={(quiz) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        onClick={() => navigate(`/mcq-quiz/${quiz.id}`)}
                      >
                        Start Quiz
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <span style={{ fontSize: '1.1rem' }}>
                          {quiz.title}
                        </span>
                      }
                      description={
                        <>
                          <div>{quiz.description}</div>
                          <div style={{ marginTop: '0.5rem' }}>
                            <Tag color="blue">{quiz.questionCount} Questions</Tag>
                            <Tag color="green">
                              Created: {new Date(quiz.createdAt).toLocaleDateString()}
                            </Tag>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
