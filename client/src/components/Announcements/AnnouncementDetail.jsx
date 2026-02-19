import React, { useEffect, useState } from 'react';
import { Card, Typography, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ann, setAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachmentKind, setAttachmentKind] = useState(null);
  const [lmsRecent, setLmsRecent] = useState([]);
  const [examRecent, setExamRecent] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [resLms, resExam] = await Promise.all([
          fetch(`${API_BASE}/announcements?type=lms`),
          fetch(`${API_BASE}/announcements?type=exam`),
        ]);

        if (!mounted) return;

        const limit = 5;
        let foundRecord = null;
        const idStr = String(id);

        if (resLms.ok) {
          const jl = await resLms.json();
          const listL = (jl && Array.isArray(jl.announcements)) ? jl.announcements : [];
          const filteredL = listL.filter(a => String(a.id) !== idStr);
          const finalL = (filteredL.length > 0 ? filteredL : listL).slice(0, limit);
          if (mounted) setLmsRecent(finalL);
          const foundL = listL.find(a => String(a.id) === idStr);
          if (!foundRecord && foundL) foundRecord = foundL;
        }

        if (resExam.ok) {
          const je = await resExam.json();
          const listE = (je && Array.isArray(je.announcements)) ? je.announcements : [];
          const filteredE = listE.filter(a => String(a.id) !== idStr);
          const finalE = (filteredE.length > 0 ? filteredE : listE).slice(0, limit);
          if (mounted) setExamRecent(finalE);
          const foundE = listE.find(a => String(a.id) === idStr);
          if (!foundRecord && foundE) foundRecord = foundE;
        }

        if (mounted) setAnn(foundRecord || null);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const attachmentUrl = ann && (ann.attachment_url || ann.attachment || null);

  function formatShortDate(ts) {
    try {
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  useEffect(() => {
    if (!attachmentUrl) {
      setAttachmentKind(null);
      return;
    }
    setAttachmentKind(/\.pdf$/i.test(attachmentUrl) ? 'pdf' : 'download');
  }, [attachmentUrl]);

  if (loading) return <div className="max-w-6xl mx-auto p-6"><Card><Paragraph>Loading...</Paragraph></Card></div>;

  if (!ann) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <Title level={4}>Announcement not found</Title>
          <Paragraph>The announcement you requested does not exist.</Paragraph>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </Card>
      </div>
    );
  }

  const adminName = (ann.admin_firstName || ann.admin_lastName)
    ? `${ann.admin_firstName || ''}${ann.admin_firstName && ann.admin_lastName ? ' ' : ''}${ann.admin_lastName || ''}`.trim()
    : null;

  const annType = (ann.type || '').trim().toLowerCase();

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
          <div className="max-w-6xl mx-auto px-6 text-center">
            <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>{ann.title}</Title>
            <Text style={{ color: '#e6f0ff' }}>{new Date(ann.ts || ann.date || '').toLocaleString()} {adminName ? <>• By: {adminName}</> : null}</Text>
          </div>
        </div>
      </section>

      <div className="mx-auto py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <Paragraph className="text-gray-800">{ann.body}</Paragraph>
              {attachmentUrl && (
                <div className="mt-3 space-y-3">
                  {attachmentKind === 'pdf' ? (
                    <div style={{ width: '100%', height: 600, border: '1px solid #e5e7eb', overflow: 'auto' }}>
                      <iframe src={attachmentUrl} title="attachment" style={{ width: '100%', height: '100%', border: 0 }} />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
                      Preview is not available for this document type. Please download the file to view it locally.
                    </div>
                  )}
                  <a href={attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600">Download attachment</a>
                </div>
              )}
              <div className="mt-4">
                <Button onClick={() => navigate(-1)}>Back</Button>
              </div>
            </Card>
          </div>
          <div className="md:col-span-1">
            <div className="p-4 space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <div className="font-semibold mb-2">LMS Announcements</div>
                <div className="space-y-2">
                  {lmsRecent.length === 0 && <div className="text-sm text-gray-500">No recent announcements</div>}
                  {lmsRecent.map((a, idx) => (
                    <div key={`lms-${a.id}`} className="cursor-pointer" onClick={() => navigate(`/announcements/lms/${a.id}`)} title={a.title}>
                      <div className="text-sm text-sky-800 hover:underline truncate">{a.title}</div>
                      <div className="text-xs text-gray-500">{formatShortDate(a.ts || a.date)}</div>
                      {idx < lmsRecent.length - 1 && <div className="border-b border-gray-200 my-2" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <div className="font-semibold mb-2">Exam Announcements</div>
                <div className="space-y-2">
                  {examRecent.length === 0 && <div className="text-sm text-gray-500">No recent announcements</div>}
                  {examRecent.map((a, idx) => (
                    <div key={`exam-${a.id}`} className="cursor-pointer" onClick={() => navigate(`/announcements/exam/${a.id}`)} title={a.title}>
                      <div className="text-sm text-sky-800 hover:underline truncate">{a.title}</div>
                      <div className="text-xs text-gray-500">{formatShortDate(a.ts || a.date)}</div>
                      {idx < examRecent.length - 1 && <div className="border-b border-gray-200 my-2" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
