// StudyMaterialFoundation.jsx
import React from 'react';
import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import  studyMaterials  from '../../data/studyMaterial';

const { Title } = Typography;

export default function StudyMaterialFoundation() {
  const navigate = useNavigate();

  // Filter only foundation-level materials
  const foundationMaterials = studyMaterials.filter(
    (material) => material.level === 'foundation'
  );

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
            Foundation Study Materials
          </Title>
        </div>
      </section>

      {/* Cards Section */}
      <section className='p-5'>
        {foundationMaterials.map((material) => (
          <Card
            hoverable
            key={material.id}
            className="text-center shadow-lg rounded-xl p-8 bg-white transition-transform transform hover:scale-105 hover:shadow-2xl cursor-pointer"
            onClick={() => navigate(`/study-materials/${material.id}`)}
          >
            <h2 className="text-2xl font-semibold mb-2">{material.title}</h2>
            <p className="text-gray-500">{material.description}</p>
          </Card>
        ))}
      </section>

      {/* Vertical Links Section */}
      <section className="py-10 text-center flex flex-col items-center gap-6 pt-0">
        <a
          href="#"
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-indigo-600 hover:to-blue-500 transition-all duration-300 w-120 text-center"
        >
          Applicable for May 2025 onwards
        </a>
        <a
          href="#"
          className="px-8 py-3 bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:from-teal-500 hover:to-green-400 transition-all duration-300 w-120 text-center"
        >
          Applicable for May 2026 onwards
        </a>
      </section>
    </>
  );
}
