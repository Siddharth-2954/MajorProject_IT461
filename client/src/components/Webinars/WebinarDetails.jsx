import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Divider } from 'antd';
import { webinars } from '../../data/webinar';
import { seminars } from '../../data/seminar';
// removed redux webinar slice usage

const { Title, Paragraph } = Typography;

export default function WebinarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // no local redux state required; component reads `id` from route param

  const webinar = webinars.find((w) => w.id === id); // string comparison
  const seminar = seminars[Number(id) - 1];

  if (!webinar) {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <Title level={3}>Webinar not found</Title>
        <Button onClick={() => navigate('/webinars/list')}>Back to List</Button>
      </section>
    );
  }

  return (
    <>
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
            Video
          </Title>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">

      {seminar && (
        <>
          <Divider />
          <Title level={3}>Seminar</Title>
          <div className="aspect-video mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${seminar.youtubeId}`}
              title={seminar.title}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full rounded-md"
              />
          </div>
          <Paragraph>
            <strong>{seminar.title}</strong> by {seminar.speaker} • {seminar.date}
          </Paragraph>
          <Paragraph>{seminar.description}</Paragraph>
        </>
      )}
    </section>
      </>
  );
}