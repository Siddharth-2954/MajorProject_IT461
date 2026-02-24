import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
const API_BASE = 'http://localhost:8000';

export default function StudyMaterialsAdmin() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/admin/study-materials', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        // Expecting an array of materials with fields: id, topic, uploaderName, date, type, fileUrl
        setMaterials((json || []).map((m) => ({ key: m.id || m._id || m.key || String(Math.random()), ...m })));
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error(err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const navigate = useNavigate();

  function filenameForRecord(record) {
    if (!record) return '';
    if (record.fileName) return record.fileName;
    if (record.fileUrl) {
      try {
        const parts = record.fileUrl.split('/');
        return parts[parts.length - 1];
      } catch (e) { return '' }
    }
    return '';
  }

  const handleDownload = (record) => {
    if (record.fileUrl) window.open(record.fileUrl, '_blank');
    else messageApi.warning('No file available for this material');
  };

  const columns = [
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Speaker',
      dataIndex: 'uploaderName',
      key: 'uploaderName',
      render: (t) => t || 'Unknown',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (c) => (
        <Tag color={c === 'Notes' ? 'blue' : 'green'}>{c}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const fname = filenameForRecord(record);
        return (
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (!fname) {
                  messageApi.error('File not available');
                  return;
                }
                navigate(`/admin/uploads/study-materials/${encodeURIComponent(fname)}`);
              }}
            >
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  // Upload form handling
  const [form] = Form.useForm();

  const handleCreate = async (values) => {
    const { topic, category, subject, upload } = values;
    if (!upload) {
      message.error('Please select a file to upload');
      return;
    }

    // upload may be normalized to an array (from getValueFromEvent) or be an object with fileList
    let selectedFileObj;
    if (Array.isArray(upload)) {
      if (upload.length === 0) {
        message.error('Please select a file to upload');
        return;
      }
      selectedFileObj = upload[0].originFileObj || upload[0];
    } else if (upload.fileList) {
      if (upload.fileList.length === 0) {
        message.error('Please select a file to upload');
        return;
      }
      selectedFileObj = upload.fileList[0].originFileObj || upload.fileList[0];
    } else {
      message.error('Invalid upload data');
      return;
    }

    const file = selectedFileObj;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('topic', topic);
    // Category: Notes or Assignment
    fd.append('category', category || 'Notes');
    // Add subject if selected
    if (subject) {
      fd.append('subject', subject);
    }
    // Use current admin name as uploader
    const uploaderName = user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : 'Admin';
    fd.append('uploaderName', uploaderName);

    try {
      setLoading(true);
      const res = await fetch(API_BASE + '/admin/study-materials', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (res.ok) {
        messageApi.success('Uploaded successfully');
        setModalOpen(false);
        form.resetFields();
        fetchMaterials();
      } else {
        const txt = await res.text();
        messageApi.error('Upload failed: ' + txt);
      }
    } catch (err) {
      console.error(err);
      messageApi.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Study Materials</h2>
        <div>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setModalOpen(true)}>
            Upload
          </Button>
        </div>
      </div>

      <Table columns={columns} dataSource={materials} loading={loading} pagination={{ pageSize: 10 }} />

      <Modal title="Upload Study Material" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]} initialValue="Notes">
            <Select>
              <Select.Option value="Notes">Notes</Select.Option>
              <Select.Option value="Assignment">Assignment</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="subject" label="Subject" rules={[{ required: false }]}>
            <Select placeholder="Select subject (optional)" allowClear>
              <Select.Option value="Accounting">Accounting</Select.Option>
              <Select.Option value="Business Law">Business Law</Select.Option>
              <Select.Option value="Quantitative Aptitude">Quantitative Aptitude</Select.Option>
              <Select.Option value="Business Economics">Business Economics</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="upload"
            label="File (PDF only)"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              // Normalize event to fileList array expected by Form
              if (!e) return;
              if (Array.isArray(e)) return e;
              return e && e.fileList;
            }}
            rules={[{ required: true }]}
          >
            <Upload
              accept=".pdf"
              beforeUpload={(file) => {
                const ok = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                if (!ok) messageApi.error('Only PDF files are allowed');
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Upload</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}