import React, { useEffect, useState, useContext } from 'react';
import { Table, Card, Typography, Button, Space, message, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const { Title, Text } = Typography;

export default function StudentsList() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [admin, setAdmin] = useState(user || null);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');

  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(API_BASE + '/auth/me', { credentials: 'include' });
        if (res.ok) {
          const js = await res.json();
          setAdmin(js.admin || js.user || null);
        }
      } catch (e) {
        // ignore
      }
    }
    if (!admin) fetchMe();
  }, [admin]);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + '/admin/students-list', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) {
            message.error('Not authorized');
            navigate('/admin');
            return;
          }
          throw new Error('Failed to load');
        }
        const js = await res.json();
        const rows = (js && js.students) || [];
        // add key and serial
        const rowsWithKey = rows.map((r, i) => ({ key: r.registrationId || String(i), serial: i + 1, ...r }));
        setOriginalData(rowsWithKey);
        setData(rowsWithKey);
      } catch (e) {
        console.error('loadStudents error', e);
        message.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [navigate]);

  useEffect(() => {
    if (!originalData || originalData.length === 0) return;
    const q = (searchText || '').trim().toLowerCase();

    let filtered = originalData;
    if (q) {
      filtered = filtered.filter((r) => {
        return (
          String(r.registrationId || '').toLowerCase().includes(q) ||
          String(r.firstName || '').toLowerCase().includes(q) ||
          String(r.lastName || '').toLowerCase().includes(q) ||
          String(r.mobile || '').toLowerCase().includes(q) ||
          String(r.city || '').toLowerCase().includes(q)
        );
      });
    }
    setData(filtered);
  }, [searchText, originalData]);

  

  const columns = [
    { title: 'S.No', dataIndex: 'serial', key: 'serial', width: 80 },
    { title: 'ID', dataIndex: 'registrationId', key: 'registrationId' },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Qualification', dataIndex: 'qualification', key: 'qualification' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Students Details</Title>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input.Search
            placeholder="Search by name, id, city..."
            allowClear
            onSearch={(v) => setSearchText(v || '')}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260 }}
            value={searchText}
          />
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowKey={(r) => r.registrationId || r.key}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRows(rows);
            },
          }}
        />
      </Card>
    </div>
  );
}

// Apply client-side filtering when searchText or statusFilter changes
// (placed after component to keep main render concise)
