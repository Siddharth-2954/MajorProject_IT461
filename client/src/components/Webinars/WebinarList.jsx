import React from 'react';
import { Table, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { webinars } from '../../data/webinar';
// no redux dispatch required for webinar selection

export default function WebinarList() {
  const navigate = useNavigate();
  

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <span className="text-blue-700 font-medium">{text}</span>
      ),
    },
    {
      title: 'Webinar Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Webinar Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Button
          type="primary"
          shape="round"
          onClick={() => navigate(`/webinars/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <Table
        columns={columns}
        dataSource={webinars}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </section>
  );
}