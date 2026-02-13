import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import scheduleData from '../../data/scheduleData';
import { webinars } from '../../data/webinar';

const defaultBg = 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80';

function parseStartHour(timing) {
  // timing expected like "10:00 AM - 11:00 AM"
  if (!timing) return null;
  const parts = timing.split('-')[0].trim().split(' '); // ['10:00', 'AM']
  if (parts.length < 2) return null;
  const [time, meridiem] = parts;
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return null;
  if (meridiem.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
  return h;
}

function sessionLabel(timing) {
  const h = parseStartHour(timing);
  if (h === null) return '';
  if (h < 12) return 'Morning';
  if (h >= 12 && h < 16) return 'Afternoon';
  return 'Evening';
}

export default function LiveClasses() {
  const navigate = useNavigate();

  const containerStyle = {
    width: 'full',
    margin: '0 auto',
  };

  const cardStyle = (bgUrl) => ({
    width: '100%',
    height: 150,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundImage: `linear-gradient(rgba(0,0,0,0.36), rgba(0,0,0,0.36)), url(${bgUrl || defaultBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    boxShadow: '0 8px 20px rgba(156,163,175,0.12)',
    border: '1px solid rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '18px 20px',
  });

  const subjectStyle = {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    lineHeight: 1.1,
    textAlign: 'center',
  };

  const topicStyle = {
    margin: '6px 0 8px 0',
    fontSize: '1rem',
    fontWeight: 600,
    opacity: 0.95,
    textAlign: 'center',
  };

  const metaStyle = {
    display: 'flex',
    gap: 12,
    fontSize: '0.82rem',
    opacity: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Show only today's entries; if none, pick the next available date
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const todays = scheduleData.filter((s) => s.date === todayStr);
  let selectedDate = null;
  if (todays.length > 0) {
    selectedDate = todayStr;
  } else {
    // find next available date after today
    const futureDates = Array.from(new Set(scheduleData.map((s) => s.date))).sort();
    selectedDate = futureDates.find((d) => d >= todayStr) || futureDates[0];
  }

  const entries = scheduleData.filter((s) => s.date === selectedDate);
  const first = entries[0];
  const [question, setQuestion] = useState('');
  const sendQuestion = () => {
    if (!question.trim()) {
      alert('Please type a question before sending.');
      return;
    }
    // placeholder: currently just shows a confirmation and clears input
    alert('Your question has been sent.');
    setQuestion('');
  };

  const twoColumnContainer = {
    maxWidth: 1100,
    margin: '1rem auto',
    padding: '1rem',
  };

  const twoCols = {
    display: 'flex',
    gap: 16,
    alignItems: 'stretch',
    flexWrap: 'wrap',
  };

  const sideCard = {
    flex: '1 1 480px',
    minWidth: 280,
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 8px 20px rgba(156,163,175,0.12)',
    border: '1px solid rgba(0,0,0,0.04)',
    padding: 16,
    minHeight: 320,
  };

  const sideCardSmall = {
    flex: '1 1 480px',
    minWidth: 280,
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 8px 20px rgba(156,163,175,0.12)',
    border: '1px solid rgba(0,0,0,0.04)',
    padding: 16,
    minHeight: 320,
  };

  const videoItemStyle = {
    padding: '8px 10px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  };

  const textareaStyle = {
    width: '100%',
    minHeight: 180,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ddd',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const btnRow = { display: 'flex', gap: 8, marginTop: 10 };


  return (
    <div >
      <section style={containerStyle}>
        {first ? (
          <div style={cardStyle(first.bg || defaultBg)} onClick={() => navigate('/live_classes')} role="button" tabIndex={0}>
            <div>
              <h3 style={{ ...subjectStyle, fontSize: '1.6rem' }}>{first.subject}</h3>
              <div style={{ ...topicStyle }}>{first.topic}</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={metaStyle}>
                <span>{new Date(first.date).toLocaleDateString()}</span>
                <span style={{ opacity: 0.8 }}>•</span>
                <span style={{ fontWeight: 600 }}>{first.speaker}</span>
                <span style={{ opacity: 0.8 }}>•</span>
                <span>{first.timing} ({sessionLabel(first.timing)})</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center' }}>No upcoming live classes.</div>
        )}
      </section>
      
      <section style={twoColumnContainer}>
        <div style={twoCols}>
          <div style={{ ...sideCard, display: 'flex', flexDirection: 'column' }}>
            {(() => {
              const match = first
                ? webinars.find((w) => w.title.includes(first.subject) || w.title.includes(first.topic))
                : null;
              const video = match || (webinars.length ? webinars[0] : null);
              if (!video) return <div>No videos available.</div>;
              return (
                <div style={{ width: '100%',  }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <iframe
                      title={video.title}
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allowFullScreen
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 700 }}>{video.title}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{video.date} • {video.time}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={sideCardSmall}>
            <h4 style={{ margin: '0 0 8px 0' }}>Ask Question</h4>
            <div>
              <textarea placeholder="Type your question here..." value={question} onChange={(e) => setQuestion(e.target.value)} style={textareaStyle} />
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={sendQuestion} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#10b981', color: '#fff', marginBottom: 8 }}>Send Question</button>
              <div style={btnRow}>
                <button onClick={() => navigate('/live_classes')} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Join Zoom</button>
                <button onClick={() => navigate('/lvc_feedback')} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #e11d48', background: '#fff', color: '#e11d48' }}>Feedback</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
