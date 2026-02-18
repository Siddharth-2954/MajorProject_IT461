import React, { useEffect, useState } from 'react';
import { Card, Typography, List } from 'antd';

const { Title, Paragraph } = Typography;
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AnnouncementsExam() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(API_BASE + '/announcements?type=exam');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && Array.isArray(json.announcements)) setItems(json.announcements);
      } catch (e) {}
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <Card className="shadow-lg rounded-lg">
        <Title level={2}>Examination Announcements</Title>
        <Paragraph className="text-gray-600">Official notices related to examinations, schedules, admit cards and instructions for candidates.</Paragraph>

        <List
          itemLayout="vertical"
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={<strong>{item.title}</strong>} description={item.body} />
              {item.attachment_url && (
                <div className="mt-2">
                  <a href={item.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600">Download attachment</a>
                </div>
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
