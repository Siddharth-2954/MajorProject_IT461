import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button } from 'antd';
import { otherAnnouncements, pdfGuidelines } from '../../data/mocktestData';

const { Title, Paragraph } = Typography;

export default function MocktestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find matching announcement or pdf
  const other = otherAnnouncements.find(item => item.id === id);
  const pdf = pdfGuidelines.id === id ? pdfGuidelines : null;

  if (!other && !pdf) {
    return (
      <div className="text-center py-16">
        <Title level={3}>Content Not Found</Title>
        <Button onClick={() => navigate('/events/mocktest')}>Back</Button>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-10 px-6">
      {other && (
        <>
          <Title>{other.title}</Title>
          <Paragraph>{other.description}</Paragraph>
          <Button onClick={() => navigate('/events/mocktest')}>Back</Button>
        </>
      )}

      {pdf && (
        <>
          <Title>{pdf.title}</Title>
          <Paragraph>{pdf.description}</Paragraph>
          <Button type="primary" onClick={() => window.open(pdf.fileUrl, "_blank")}>
            View PDF
          </Button>
          <Button className="ml-4" onClick={() => navigate('/events/mocktest')}>
            Back
          </Button>
        </>
      )}
    </section>
  );
}
