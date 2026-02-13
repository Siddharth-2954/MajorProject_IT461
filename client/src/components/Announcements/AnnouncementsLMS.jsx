import React from 'react';
import { Card, Typography, List } from 'antd';

const { Title, Paragraph } = Typography;

export default function AnnouncementsLMS() {
  const data = [
    { title: 'Platform maintenance on 25th Feb', desc: 'Scheduled maintenance from 2:00 AM to 4:00 AM IST.' },
    { title: 'New study material uploaded', desc: 'Foundation course: Chapter 5 notes now available.' },
    { title: 'Feature update', desc: 'Improved dashboard and progress tracking.' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <Card className="shadow-lg rounded-lg">
        <Title level={2}>LMS Announcements</Title>
        <Paragraph className="text-gray-600">
          Important updates about the LMS platform, content releases, and
          maintenance schedules.
        </Paragraph>

        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={<strong>{item.title}</strong>} description={item.desc} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
