import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function MCQDashboard() {
  return (
    <div style={{ maxWidth: 980, margin: '2rem auto', padding: '0 1rem' }}>
      <Card>
        <Title level={3}>MCQ Practice Dashboard</Title>
        <Paragraph>Welcome to the MCQ Practice area. This dashboard will list available quizzes and progress tracking.</Paragraph>
      </Card>
    </div>
  );
}
