import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Spin, message, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const defaultBg = "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80";
const API_BASE = 'http://localhost:8000';

export default function MCQDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/mcq/student/stats`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to load MCQ statistics');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      key: 'subjectName',
    },
    {
      title: 'Total MCQ Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      align: 'center',
    },
    {
      title: 'Correct MCQ Questions',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      align: 'center',
    },
    {
      title: 'Completed',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center',
      render: (percentage, record) => (
        <span style={{ fontWeight: 'bold', color: percentage >= 70 ? '#52c41a' : percentage >= 40 ? '#faad14' : '#ff4d4f' }}>
          {percentage}%
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => navigate(`/mcq-subjects/${record.subjectId}`)}
        >
          View Quizzes
        </Button>
      ),
    },
  ];

  const heroStyle = {
    height: '220px',
    backgroundImage: `url(${defaultBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    position: 'relative',
    marginBottom: '2rem',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  const textStyle = {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
  };

  return (
    <div>
      {/* Hero Header with Background */}
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <div style={textStyle}>
          <Title level={1} style={{ color: 'white', margin: 0, fontSize: '2.5rem' }}>
            MCQ Practice Dashboard
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>
            Track your progress across all subjects
          </Paragraph>
        </div>
      </div>

      {/* Stats Table */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem 2rem' }}>
        <Card>
          <Title level={3}>Your MCQ Performance</Title>
          <Paragraph style={{ marginBottom: '1.5rem' }}>
            View your performance across all subjects created by the admin
          </Paragraph>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Spin size="large" />
            </div>
          ) : stats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Paragraph>No subjects available yet. Check back later!</Paragraph>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={stats}
              rowKey="subjectId"
              pagination={false}
              bordered
            />
          )}
        </Card>
      </div>
    </div>
  );
}

