import React from 'react';
import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function StudyMaterialHome() {
  const navigate = useNavigate();

  const openFeedbackForm = () => {
    window.open('https://docs.google.com/forms/d/e/your-google-form-id/viewform', '_blank');
  };

  return (
    <>
      {/* Title Section with Background */}
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
            Study Materials
          </Title>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto flex justify-between flex-wrap gap-6">
        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-8 bg-white w-72"
          onClick={() => navigate('/study-materials/foundation')}
        >
          <h2 className="text-2xl font-semibold mb-2">Foundation</h2>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-8 bg-white w-72"
          onClick={() => navigate('/study-materials/intermediate')}
        >
          <h2 className="text-2xl font-semibold mb-2">Intermediate</h2>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-8 bg-white w-72"
          onClick={() => navigate('/study-materials/final')}
        >
          <h2 className="text-2xl font-semibold mb-2">Final</h2>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-8 bg-white w-72"
          onClick={() => navigate('/study-materials/self-paced')}
        >
          <h2 className="text-2xl font-semibold mb-2">Self-Paced Online Modules</h2>
        </Card>

        <Card
          hoverable
          className="text-center shadow-lg rounded-xl p-8 bg-white w-72"
          onClick={openFeedbackForm}
        >
          <h2 className="text-2xl font-semibold mb-2">Feedback Form</h2>
        </Card>
      </section>
    </>
  );
}
