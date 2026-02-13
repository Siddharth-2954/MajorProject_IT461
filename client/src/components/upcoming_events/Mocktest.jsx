import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { mainAnnouncements, otherAnnouncements, pdfGuidelines}  from '../../data/mocktestData';

const { Title, Paragraph } = Typography;

export default function Mocktest() {
  const navigate = useNavigate();

  return (
    <>
      {/* Title Section */}
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            Mock Test
          </Title>
        </div>
      </section>

      {/* Main Announcements */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <Title level={3} className="mb-6">Announcements</Title>
        <Row gutter={[24, 24]}>
          {mainAnnouncements.map((item) => (
            <Col xs={24} md={8} key={item.id}>
              <Card
                hoverable
                onClick={() => navigate(`/events/mocktest/${item.id}`)}
                className="shadow-lg rounded-lg p-4 cursor-pointer"
              >
                <Title level={5}>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
}
