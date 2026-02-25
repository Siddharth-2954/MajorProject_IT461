import React, { useState, useEffect } from 'react';
import {
  Table,
  Select,
  Button,
  Space,
  Card,
  Typography,
  Empty,
  Spin,
  Tag,
  Modal,
  Divider,
  Form,
  DatePicker,
  TimePicker,
  Input,
  InputNumber,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const API_BASE = 'http://localhost:8000';

const LVCSchedulesAdmin = () => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjectId, setFilteredSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadSchedules();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/super-admin/subjects`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Load subjects error:', err);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/super-admin/lvc-schedules`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log('LVC Schedules API Response:', data);
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        console.error('Failed to load schedules:', data.error);
      }
    } catch (err) {
      console.error('Load schedules error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setIsEditing(true);
      setEditingId(schedule.id);
      form.setFieldsValue({
        subjectId: schedule.subjectId,
        title: schedule.title,
        description: schedule.description,
        scheduledDate: dayjs(schedule.scheduledDate),
        startTime: dayjs(schedule.startTime, 'HH:mm:ss'),
        endTime: dayjs(schedule.endTime, 'HH:mm:ss'),
        instructorName: schedule.instructorName,
        meetingLink: schedule.meetingLink,
        capacity: schedule.capacity,
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        subjectId: values.subjectId,
        title: values.title,
        description: values.description,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        instructorName: values.instructorName,
        meetingLink: values.meetingLink,
        capacity: values.capacity || 0,
      };

      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE}/super-admin/lvc-schedules/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE}/super-admin/lvc-schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      }

      const data = await response.json();
      if (data.success) {
        await loadSchedules();
        handleCloseModal();
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Schedule',
      content: 'Are you sure you want to delete this schedule?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE}/super-admin/lvc-schedules/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          const data = await response.json();
          if (data.success) {
            await loadSchedules();
          }
        } catch (err) {
          console.error('Delete error:', err);
        }
      },
    });
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const filteredSchedules = filteredSubjectId
    ? schedules.filter(s => s.subjectId === Number(filteredSubjectId))
    : schedules;

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId) => getSubjectName(subjectId),
      width: 140,
      filters: subjects.map(s => ({ text: s.name, value: s.id })),
      filteredValue: filteredSubjectId ? [filteredSubjectId] : [],
      onFilter: (value, record) => record.subjectId === value,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: 'Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
      width: 130,
    },
    {
      title: 'Instructor',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 130,
    },
    {
      title: 'Meeting Link',
      dataIndex: 'meetingLink',
      key: 'meetingLink',
      render: (link) => link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          Join
        </a>
      ) : '-',
      width: 100,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 80,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header with Background Image */}
      <div
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 36,
        }}
      >
        {/* Overlay for better text visibility */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
        {/* Centered Text */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <Title
            level={1}
            style={{
              color: 'white',
              margin: 0,
              fontSize: 32,
              fontWeight: 'bold',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            LVC Schedules
          </Title>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 20,
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Manage all live virtual class schedules
          </Text>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, marginBottom: 12 }}>All LVC Schedules</Title>
            <Select
              placeholder="Filter by Subject"
              allowClear
              style={{ width: '100%', maxWidth: 300 }}
              onChange={(value) => setFilteredSubjectId(value)}
              value={filteredSubjectId}
            >
              {subjects.map(subject => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => handleOpenModal()}
          >
            Add Schedule
          </Button>
        </div>

        <Spin spinning={loading}>
          {filteredSchedules.length === 0 ? (
            <Card>
              <Empty
                description="No schedules found"
                style={{ marginTop: 48, marginBottom: 48 }}
              />
            </Card>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredSchedules}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>
      </div>

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={isEditing ? 'Edit Schedule' : 'Add LVC Schedule'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Subject"
            name="subjectId"
            rules={[{ required: true, message: 'Please select a subject' }]}
          >
            <Select placeholder="Select a subject">
              {subjects.map(subject => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter schedule title' }]}
          >
            <Input placeholder="e.g., Introduction to React" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Schedule description" />
          </Form.Item>

          <Form.Item
            label="Scheduled Date"
            name="scheduledDate"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: 'Please select start time' }]}
              style={{ flex: 1 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{ required: true, message: 'Please select end time' }]}
              style={{ flex: 1 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item
            label="Instructor Name"
            name="instructorName"
            rules={[{ required: true, message: 'Please enter instructor name' }]}
          >
            <Input placeholder="Instructor name" />
          </Form.Item>

          <Form.Item
            label="Meeting Link"
            name="meetingLink"
            rules={[
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input placeholder="https://zoom.us/..." />
          </Form.Item>

          <Form.Item
            label="Capacity"
            name="capacity"
          >
            <InputNumber min={0} placeholder="e.g., 100" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ width: '100%' }}>
              {isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LVCSchedulesAdmin;
