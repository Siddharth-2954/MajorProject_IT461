import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AnnouncementsExam() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

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

  function fmtDate(ts) {
    try {
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  return (
    <div>
      <section
        className="w-full text-center"
        style={{
          backgroundImage: "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto text-center bg-black/50 p-15">
          <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>
            Examination Announcements
          </Title>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="bg-white shadow rounded">
          <div className="divide-y">
            {items.map((item) => {
              const adminName =
                item.admin_firstName || item.admin_lastName
                  ? `${item.admin_firstName || ''}${item.admin_firstName && item.admin_lastName ? ' ' : ''}${item.admin_lastName || ''}`.trim()
                  : null;

              return (
                <div
                  key={item.id}
                  className="p-6 flex items-start gap-6 hover:bg-gray-50"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/announcements/exam/${item.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-sky-600 mb-2">{fmtDate(item.ts)}</div>
                    <div className="text-lg font-semibold text-sky-900 truncate" style={{ lineHeight: 1.2 }}>{item.title}</div>
                    <div className="mt-3 text-sm text-gray-500">{adminName && <span>By: {adminName}</span>}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
