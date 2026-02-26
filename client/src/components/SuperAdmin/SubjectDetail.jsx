import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Card, Button, Spin, Empty, Input, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterName, setEditingChapterName] = useState("");

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const resp = await fetch(API_BASE + "/super-admin/subjects", {
          credentials: "include",
        });

        if (!resp.ok) {
          throw new Error("Failed to load subjects");
        }

        const data = await resp.json();
        const subjects = data.subjects || [];
        const found = subjects.find((s) => String(s.id) === String(id));
        setSubject(found || null);

        if (found) {
          // Load chapters from API
          const chapterResp = await fetch(
            API_BASE + `/super-admin/chapters/subject/${id}`,
            { credentials: "include" }
          );

          if (chapterResp.ok) {
            const chapterData = await chapterResp.json();
            setChapters(chapterData.chapters || []);
          }
        }
      } catch (err) {
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    loadSubject();
  }, [id]);

  const handleAddChapter = async () => {
    const trimmed = chapterName.trim();
    if (!trimmed) return;

    try {
      const resp = await fetch(API_BASE + "/super-admin/chapters", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: id,
          name: trimmed,
          description: "",
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Failed to add chapter");
      }

      const data = await resp.json();
      setChapters((prev) => [...prev, { id: data.id, name: trimmed }]);
      setChapterName("");
      setShowChapterForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStart = (chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterName(chapter.name);
  };

  const handleEditCancel = () => {
    setEditingChapterId(null);
    setEditingChapterName("");
  };

  const handleEditSave = async () => {
    const trimmed = editingChapterName.trim();
    if (!trimmed) return;

    try {
      const resp = await fetch(API_BASE + `/super-admin/chapters/${editingChapterId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: "",
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Failed to update chapter");
      }

      setChapters((prev) =>
        prev.map((ch) => (ch.id === editingChapterId ? { ...ch, name: trimmed } : ch))
      );
      handleEditCancel();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const resp = await fetch(API_BASE + `/super-admin/chapters/${chapterId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Failed to delete chapter");
      }

      setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
      if (editingChapterId === chapterId) {
        handleEditCancel();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <div
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 36,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <Title
            level={1}
            style={{
              color: "white",
              margin: 0,
              fontSize: 32,
              fontWeight: "bold",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            {subject?.name || "Subject"}
          </Title>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 20,
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Subject Details
          </Text>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Button onClick={() => navigate("/super-admin/subjects")}>Back to Subjects</Button>
          <Button type="primary" onClick={() => setShowChapterForm(true)}>Add Chapter</Button>
        </div>
        {loading ? (
          <Card>
            <Spin />
          </Card>
        ) : subject ? (
          <>
            {showChapterForm && (
              <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: "100%" }}>
                  <Input
                    placeholder="Enter chapter name"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    onPressEnter={handleAddChapter}
                  />
                  <Button type="primary" onClick={handleAddChapter}>Add</Button>
                  <Button onClick={() => setShowChapterForm(false)}>Cancel</Button>
                </Space>
              </Card>
            )}

            <Card style={{ marginBottom: 16 }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                {subject.name}
              </Title>
              <Text type="secondary">
                {subject.description || "No description available"}
              </Text>
            </Card>

            {chapters.length === 0 ? (
              <Card>
                <Empty description="No chapters yet" />
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {chapters.map((chapter, index) => (
                  <Card key={chapter.id} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        {editingChapterId === chapter.id ? (
                          <Space style={{ width: "100%" }}>
                            <Input
                              value={editingChapterName}
                              onChange={(e) => setEditingChapterName(e.target.value)}
                              onPressEnter={handleEditSave}
                            />
                            <Button type="primary" onClick={handleEditSave}>Save</Button>
                            <Button onClick={handleEditCancel}>Cancel</Button>
                          </Space>
                        ) : (
                          <Text strong>{index + 1}. {chapter.name}</Text>
                        )}
                      </div>
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditStart(chapter)}
                          disabled={editingChapterId === chapter.id}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteChapter(chapter.id)}
                        />
                      </Space>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <Empty description="Subject not found" />
          </Card>
        )}
      </div>
    </div>
  );
}
