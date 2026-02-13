import React from 'react';
import { Card, Typography, List } from 'antd';

const { Title, Paragraph } = Typography;

export default function AnnouncementsExam() {
  const data = [
    { title: 'Final exam schedule released', desc: 'Final exams start from 10th March. Check your dashboard for seat allocations.' },
    { title: 'Admit card issuance', desc: 'Admit cards will be available 5 days before the exam.' },
    { title: 'Guidelines for exam day', desc: 'Read the updated instructions and COVID precautions.' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <Card className="shadow-lg rounded-lg">
        <Title level={2}>Examination Announcements</Title>
        <Paragraph className="text-gray-600">
          Official notices related to examinations, schedules, admit cards and
          instructions for candidates.
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
