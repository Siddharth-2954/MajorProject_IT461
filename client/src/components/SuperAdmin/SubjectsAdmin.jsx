import React, { useState, useEffect } from "react";
import { Typography, Card, Row, Col, Empty, Button, message, Modal, Form, Input, Upload } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined, UserAddOutlined, UserDeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import LVCSchedule from "./LVCSchedule";

const { Title, Text } = Typography;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function SubjectsAdmin() {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedSubjectForAssign, setSelectedSubjectForAssign] = useState(null);
  const [selectedSubjectForSchedule, setSelectedSubjectForSchedule] = useState(null);
  const [filterAssigned, setFilterAssigned] = useState(false);
  const coverImageRef = React.useRef(null);

  useEffect(() => {
    loadSubjects();
    loadAdmins();
  }, []);

  const loadSubjects = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/subjects", {
        credentials: "include"
      });

      if (!resp.ok) {
        throw new Error("Failed to load subjects");
      }

      const data = await resp.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      message.error(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/admins", {
        credentials: "include"
      });

      if (!resp.ok) {
        throw new Error("Failed to load admins");
      }

      const data = await resp.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Failed to load admins:", err);
    }
  };

  const handleAddSubject = () => {
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    coverImageRef.current = null;
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("subject", values.subject);
      formData.append("description", values.description || "");
      if (coverImageRef.current) {
        console.log('Appending coverImage:', coverImageRef.current.name, coverImageRef.current.type, coverImageRef.current.size);
        formData.append("coverImage", coverImageRef.current);
      } else {
        console.log('No coverImage selected');
      }

      const response = await fetch(API_BASE + "/super-admin/subjects", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add subject");
      }

      const responseData = await response.json();
      console.log('Subject created successfully:', responseData);

      message.success("Subject added successfully!");
      setModalVisible(false);
      form.resetFields();
      coverImageRef.current = null;
      
      // Reload subjects from database
      loadSubjects();
    } catch (err) {
      message.error(err.message || "Failed to add subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (info) => {
    if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0];
      const originFile = file.originFileObj || file;
      console.log('Image selected:', originFile, originFile.name);
      coverImageRef.current = originFile;
    } else {
      coverImageRef.current = null;
    }
  };

  const handleDeleteSubject = (subjectId, subjectName) => {
    Modal.confirm({
      title: "Delete Subject",
      content: `Are you sure you want to delete "${subjectName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(API_BASE + `/super-admin/subjects/${subjectId}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete subject");
          }

          message.success("Subject deleted successfully!");
          setSubjects(subjects.filter(s => s.id !== subjectId));
        } catch (err) {
          message.error(err.message || "Failed to delete subject");
        }
      },
    });
  };

  const handleAssignClick = (subject) => {
    setSelectedSubjectForAssign(subject);
    setAssignModalVisible(true);
  };

  const handleAssignAdmin = async (adminUsername) => {
    setAssigning(true);
    try {
      const response = await fetch(API_BASE + `/super-admin/subjects/${selectedSubjectForAssign.id}/assign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign subject");
      }

      message.success("Subject assigned successfully!");
      setAssignModalVisible(false);
      setSelectedSubjectForAssign(null);
      loadSubjects();
    } catch (err) {
      message.error(err.message || "Failed to assign subject");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignSubject = (subjectId) => {
    Modal.confirm({
      title: "Unassign Subject",
      content: "Are you sure you want to unassign this subject from the admin?",
      okText: "Unassign",
      okType: "warning",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(API_BASE + `/super-admin/subjects/${subjectId}/unassign`, {
            method: "POST",
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to unassign subject");
          }

          message.success("Subject unassigned successfully!");
          loadSubjects();
        } catch (err) {
          message.error(err.message || "Failed to unassign subject");
        }
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Header with Background Image */}
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
        {/* Overlay for better text visibility */}
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
        {/* Centered Text */}
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
            Subjects Management
          </Title>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 20,
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            View and manage all subjects in the system
          </Text>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: 12 }}>Subjects List</Title>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type={!filterAssigned ? "primary" : "default"}
                onClick={() => setFilterAssigned(false)}
              >
                Unassigned
              </Button>
              <Button
                type={filterAssigned ? "primary" : "default"}
                onClick={() => setFilterAssigned(true)}
              >
                Assigned
              </Button>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAddSubject}
          >
            Add Subject
          </Button>
        </div>
      {loading ? (
        <Card>
          <Text>Loading subjects...</Text>
        </Card>
      ) : (
        () => {
          const filteredSubjects = filterAssigned
            ? subjects.filter(s => s.assignedTo)
            : subjects.filter(s => !s.assignedTo);
          return filteredSubjects.length === 0 ? (
            <Card>
              <Empty
                description={filterAssigned ? "No assigned subjects found" : "No unassigned subjects found"}
                style={{ marginTop: 48, marginBottom: 48 }}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredSubjects.map((subject) => (
                <Col xs={24} sm={12} lg={8} key={subject.id}>
                  <Card 
                    hoverable
                    style={{ height: "100%", display: "flex", flexDirection: "column" }}
                    cover={
                      subject.coverImage ? (
                        <div
                          style={{
                            height: 200,
                            backgroundImage: `url(${API_BASE}${subject.coverImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "8px 8px 0 0",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 200,
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px 8px 0 0",
                            color: "#999",
                            fontSize: 14,
                          }}
                        >
                          No Image
                        </div>
                      )
                    }
                  >
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {subject.name}
                    </Title>
                    {subject.assignedTo && (
                      <div style={{ marginBottom: 8, padding: 8, backgroundColor: "#e6f7ff", borderRadius: 4 }}>
                        <Text strong style={{ color: "#0050b3" }}>
                          Assigned to: {subject.displayName || subject.firstName || subject.assignedTo}
                        </Text>
                      </div>
                    )}
                    <Text 
                      type="secondary"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 16,
                      }}
                    >
                      {subject.description || "No description available"}
                    </Text>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {subject.assignedTo ? (
                          <Button 
                            type="text"
                            icon={<UserDeleteOutlined />}
                            onClick={() => handleUnassignSubject(subject.id)}
                            title="Unassign admin"
                          />
                        ) : (
                          <Button 
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => handleAssignClick(subject)}
                            title="Assign to admin"
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                      <Button 
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                        title="Delete subject"
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          );
        }
      )()}
      </div>

      {/* Add Subject Modal */}
      <Modal
        title="Add New Subject"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            label="Subject Name"
            name="subject"
            rules={[
              { required: true, message: "Please enter subject name" },
              { min: 2, message: "Subject name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="Enter subject name (e.g., Accounts, Audit)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              placeholder="Enter subject description (optional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Cover Image"
            name="coverImage"
          >
            <Upload
              maxCount={1}
              onChange={handleImageChange}
              beforeUpload={() => false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Cover Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                Add Subject
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal
        title={`Assign Admin to "${selectedSubjectForAssign?.name}"`}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {admins.length === 0 ? (
            <Empty description="No admins available" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {admins.map((admin) => (
                <Button
                  key={admin.username}
                  onClick={() => handleAssignAdmin(admin.username)}
                  loading={assigning}
                  block
                  style={{
                    padding: 12,
                    height: "auto",
                    textAlign: "left",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                >
                  <div>
                    <strong>{admin.displayName || `${admin.firstName} ${admin.lastName}`}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>@{admin.username}</div>
                    {admin.role && <div style={{ fontSize: 12, color: "#999" }}>{admin.role}</div>}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
