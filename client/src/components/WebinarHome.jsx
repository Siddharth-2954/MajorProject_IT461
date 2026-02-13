import React from 'react';
import { Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function WebinarHome() {
  const navigate = useNavigate();

  return (
    <>
      {/* Title Section with Background */}
      <section
        className="w-full text-center "
        style={{
          backgroundImage:
            "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className=" bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            Webinars
          </Title>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto flex justify-between">
      <Card
        hoverable
        className="text-center shadow-lg rounded-xl p-5 bg-white w-90 h-23"
        onClick={() => navigate('/webinars/list')}
      >
        <h2 className="text-2xl font-semibold mb-6" >Webinars</h2>
      </Card>

      <Card
        hoverable
        className="text-center shadow-lg rounded-xl p-10 bg-white w-90 h-23"
        onClick={() => navigate('/webinars/pdf')}
      >
        <h2 className="text-2xl font-semibold mb-6">Webinar Q&A</h2>
      </Card>
    </section>
    </>
  );
}