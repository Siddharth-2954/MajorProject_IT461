import React, { useEffect, useState } from "react";
import { Card, Typography, List } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:8000";

export default function AnnouncementsLMS() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(API_BASE + "/announcements?type=lms");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && Array.isArray(json.announcements))
          setItems(json.announcements);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function fmtDate(ts) {
    try {
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      });
    } catch (e) {
      return "";
    }
  }

  return (
    <div>
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto text-center bg-black/50 p-15">
          <Title level={1} style={{ color: "#fff", marginBottom: 8 }}>
            LMS Announcements
          </Title>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="bg-white shadow rounded">
          <div className="divide-y">
            {items.map((item) => {
              const adminName =
                item.admin_firstName || item.admin_lastName
                  ? `${item.admin_firstName || ""}${item.admin_firstName && item.admin_lastName ? " " : ""}${item.admin_lastName || ""}`.trim()
                  : null;
              const attachmentUrl =
                item.attachment_url || item.attachment || null;

              return (
                <div
                  key={item.id}
                  className="p-6 flex items-start gap-6 hover:bg-gray-50"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/announcements/lms/${item.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-sky-600 mb-2">
                      {fmtDate(item.ts)}
                    </div>
                    <div
                      className="text-lg font-semibold text-sky-900 truncate"
                      style={{ lineHeight: 1.2 }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="mt-3 text-gray-700 line-clamp-2"
                      style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        maxWidth: '100%'
                      }}
                    >
                      {item.body}
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      {adminName && <span>By: {adminName}</span>}
                    </div>
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
