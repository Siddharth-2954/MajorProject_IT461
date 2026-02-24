import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Typography } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:8000';

export default function StudyMaterialViewer() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Try to fetch admin materials to find metadata for this file
        const res = await fetch(API_BASE + '/admin/study-materials', { credentials: 'include' });
        if (res.ok) {
          const arr = await res.json();
          const found = (arr || []).find(m => {
            const url = (m.fileUrl || '') + '';
            return url.endsWith('/' + filename) || (m.fileName || '') === filename;
          });
          if (found) setMaterial(found);
          else setMaterial({ topic: filename, fileUrl: '/uploads/study-materials/' + filename });
        } else {
          setMaterial({ topic: filename, fileUrl: '/uploads/study-materials/' + filename });
        }
      } catch (e) {
        console.error(e);
        setMaterial({ topic: filename, fileUrl: '/uploads/study-materials/' + filename });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filename]);

  const fileUrlAbsolute = material && material.fileUrl ? (material.fileUrl.startsWith('http') ? material.fileUrl : API_BASE + material.fileUrl) : '';

  const { Title, Paragraph } = Typography;

  return (
    <div className="min-h-screen bg-white">
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6,21,57,0.85), rgba(6,21,57,0.6)), url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="bg-black/50 py-10">
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/study-materials')} style={{ color: '#fff', marginRight: 12 }} />
            <Title level={1} className="!text-white mb-0">
              {material && material.topic ? material.topic : 'NA'}
            </Title>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '24px auto', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', minHeight: 400 }}>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spin /></div>
          ) : (
            <iframe title="pdf-viewer" src={fileUrlAbsolute} style={{ width: '100%', height: '80vh', border: 'none' }} />
          )}
        </div>
      </div>
    </div>
  );
}
