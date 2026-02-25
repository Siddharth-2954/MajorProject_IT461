import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Table,
  Space,
  DatePicker,
  TimePicker,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Empty,
  Spin,
  Tag,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const API_BASE = 'http://localhost:8000';

const LVCSchedule = ({ subjectId, subjectName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (subjectId) {
      loadSchedules();
    }
  }, [subjectId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/super-admin/lvc-schedules/subject/${subjectId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        message.error('Failed to load schedules');
      }
    } catch (err) {
      console.error('Load schedules error:', err);
      message.error('Error loading schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setIsEditing(true);
      setEditingId(schedule.id);
      form.setFieldsValue({
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
      const payload = {
        subjectId,
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE}/super-admin/lvc-schedules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      }

      const data = await response.json();
      if (data.success) {
        message.success(isEditing ? 'Schedule updated successfully' : 'Schedule created successfully');
        await loadSchedules();
        handleCloseModal();
      } else {
        message.error(data.error || 'Failed to save schedule');
      }
    } catch (err) {
      console.error('Submit error:', err);
      message.error('Error saving schedule');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/super-admin/lvc-schedules/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        message.success('Schedule deleted successfully');
        await loadSchedules();
      } else {
        message.error(data.error || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Delete error:', err);
      message.error('Error deleting schedule');
    }
  };

  const columns = [
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
      width: 120,
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
          Open
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
          <Popconfirm
            title="Delete Schedule"
            description="Are you sure you want to delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 180,
    },
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleOpenModal()}
        style={{ marginBottom: 16 }}
      >
        Add Schedule
      </Button>

      <Spin spinning={loading}>
        {schedules.length === 0 ? (
          <Empty description="No schedules yet" />
        ) : (
          <Table
            columns={columns}
            dataSource={schedules}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        )}
      </Spin>

      <Modal
        title={isEditing ? 'Edit Schedule' : 'Add LVC Schedule'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
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
            <InputNumber min={0} placeholder="e.g., 100" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LVCSchedule;
