import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import announcements from '../../data/announcements';

const { Title, Paragraph, Text } = Typography;

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ann = announcements.find(a => String(a.id) === String(id));

  if (!ann) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto' }}>
        <Card>
          <Title level={4}>Announcement not found</Title>
          <Paragraph>The announcement you requested does not exist.</Paragraph>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <Card>
        <Title level={3}>{ann.title}</Title>
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">{ann.date} • {ann.author}</Text>
        </div>
        <Paragraph>{ann.body}</Paragraph>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </Card>
    </div>
  );
}
