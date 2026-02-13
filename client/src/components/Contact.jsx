
import React from 'react';
import contactData from '../data/contact';
import { Card, Typography, Table } from 'antd';
const { Title } = Typography;

function Contact() {
  const sampleData = contactData;

  const columns = [
    { title: 'Paper No', dataIndex: 'paperNo', key: 'paperNo', width: 120 },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Faculty', dataIndex: 'faculty', key: 'faculty', width: 180 },
    { title: 'Email ID', dataIndex: 'email', key: 'email', render: (email) => (<a href={`mailto:${email}`} className="text-blue-600">{email}</a>) },
    { title: 'Phone Number', dataIndex: 'phone', key: 'phone', render: (phone) => (<a href={`tel:${phone}`}>{phone}</a>) },
  ];

  return (
    <>
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6,21,57,0.85), rgba(6,21,57,0.6)), url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            Paper / Faculty Directory
          </Title>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-10 px-6">
        <Card className="shadow-lg rounded-lg">
          <Title level={4}>Directory</Title>
          <p className="text-gray-600 mb-4">Listing of paper numbers, subjects and faculty contact details.</p>

          <Table columns={columns} dataSource={sampleData} pagination={{ pageSize: 5 }} rowKey="key" />
        </Card>
      </div>
    </>
  );
}

export default Contact;