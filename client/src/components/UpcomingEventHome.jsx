import React from 'react';
import { Button, Typography, Card } from 'antd';
import { VideoCameraOutlined, PlayCircleOutlined, FormOutlined, LaptopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function UpcomingEventHome() {
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
           Upcoming Events
          </Title>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-4 bg-white w-full h-28 cursor-pointer"
          onClick={() => navigate('/events/lvc')}
        >
          <div className="flex items-center gap-4">
            <div className="text-blue-600 text-3xl">
              <VideoCameraOutlined />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-1">LVC</h2>
              <p className="text-sm text-gray-600">Live Virtual Class schedule and details</p>
            </div>
          </div>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-4 bg-white w-full h-28 cursor-pointer"
          onClick={() => navigate('/events/lvrc')}
        >
          <div className="flex items-center gap-4">
            <div className="text-indigo-600 text-3xl">
              <PlayCircleOutlined />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-1">LVRC</h2>
              <p className="text-sm text-gray-600">Live Virtual Recorded Classes schedule</p>
            </div>
          </div>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-4 bg-white w-full h-28 cursor-pointer"
          onClick={() => navigate('/events/mocktest')}
        >
          <div className="flex items-center gap-4">
            <div className="text-green-600 text-3xl">
              <FormOutlined />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-1">Mock Test</h2>
              <p className="text-sm text-gray-600">Upcoming mock tests and registration</p>
            </div>
          </div>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-4 bg-white w-full h-28 cursor-pointer"
          onClick={() => navigate('/events/webinar')}
        >
          <div className="flex items-center gap-4">
            <div className="text-teal-600 text-3xl">
              <LaptopOutlined />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-1">Webinars</h2>
              <p className="text-sm text-gray-600">Upcoming webinars and recordings</p>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}