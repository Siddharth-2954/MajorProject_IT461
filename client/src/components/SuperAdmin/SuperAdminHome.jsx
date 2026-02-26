import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Modal,
  message,
  Tabs,
  Badge,
  Space,
  Typography,
  Tooltip
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export default function SuperAdminHome() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadAdmins();
    loadAuditLogs();
    loadSystemHealth();
  }, []);

  const loadDashboard = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/dashboard", { 
        credentials: "include" 
      });
      
      if (!resp.ok) {
        throw new Error("Failed to load dashboard");
      }
      
      const data = await resp.json();
      setDashboard(data.dashboard);
    } catch (err) {
      message.error(err.message || "Failed to load dashboard");
      navigate("/admin/!login");
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/admins", { 
        credentials: "include" 
      });
      if (resp.ok) {
        const data = await resp.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/audit-logs?limit=50", { 
        credentials: "include" 
      });
      if (resp.ok) {
        const data = await resp.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const resp = await fetch(API_BASE + "/super-admin/system-health", { 
        credentials: "include" 
      });
      if (resp.ok) {
        const data = await resp.json();
        setSystemHealth(data.health);
      }
    } catch (err) {
      console.error("Failed to load system health:", err);
    }
  };

  const handleStatusChange = async (username, newStatus) => {
    try {
      const resp = await fetch(API_BASE + `/super-admin/admins/${username}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (resp.ok) {
        message.success(`Admin status updated to ${newStatus}`);
        loadAdmins();
        loadAuditLogs();
      } else {
        const data = await resp.json();
        message.error(data.error || "Failed to update status");
      }
    } catch (err) {
      message.error("Failed to update admin status");
    }
  };

  const handleRoleChange = async (username, newRole) => {
    try {
      const resp = await fetch(API_BASE + `/super-admin/admins/${username}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      
      if (resp.ok) {
        message.success(`Admin role updated to ${newRole}`);
        loadAdmins();
        loadAuditLogs();
      } else {
        const data = await resp.json();
        message.error(data.error || "Failed to update role");
      }
    } catch (err) {
      message.error("Failed to update admin role");
    }
  };

  const handleDeleteAdmin = async (username) => {
    Modal.confirm({
      title: "Suspend Admin",
      content: `Are you sure you want to suspend admin "${username}"? This will change their status to suspended.`,
      okText: "Yes, Suspend",
      okType: "danger",
      onOk: async () => {
        try {
          const resp = await fetch(API_BASE + `/super-admin/admins/${username}`, {
            method: "DELETE",
            credentials: "include"
          });
          
          if (resp.ok) {
            message.success("Admin suspended successfully");
            loadAdmins();
            loadAuditLogs();
          } else {
            const data = await resp.json();
            message.error(data.error || "Failed to suspend admin");
          }
        } catch (err) {
          message.error("Failed to suspend admin");
        }
      }
    });
  };

  const adminColumns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          {text}
          {record.role === 'super_admin' && <CrownOutlined style={{ color: '#faad14' }} />}
        </Space>
      )
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || '-'
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || '-'
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Tag color={role === 'super_admin' ? 'gold' : 'blue'}>
          {role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </Tag>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          active: 'green',
          suspended: 'red',
          pending: 'orange'
        };
        const icons = {
          active: <CheckCircleOutlined />,
          suspended: <StopOutlined />,
          pending: <ClockCircleOutlined />
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status?.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => date ? new Date(date).toLocaleString() : 'Never'
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedAdmin(record);
                setIsModalVisible(true);
              }}
            >
              Manage
            </Button>
          </Tooltip>
          <Tooltip title="Suspend Admin">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAdmin(record.username)}
            >
              Suspend
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const auditColumns = [
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date) => new Date(date).toLocaleString(),
      width: 180
    },
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      render: (actor, record) => (
        <Space>
          <Text>{actor || 'System'}</Text>
          <Tag color={record.role === 'super_admin' ? 'gold' : 'blue'} size="small">
            {record.role || 'system'}
          </Tag>
        </Space>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => <Tag color="purple">{action}</Tag>
    },
    {
      title: "Target",
      key: "target",
      render: (_, record) => (
        record.targetType && record.targetId 
          ? `${record.targetType}: ${record.targetId}`
          : '-'
      )
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      render: (ip) => ip || '-'
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <Text>Loading Super Admin Dashboard...</Text>
      </div>
    );
  }

  const stats = dashboard?.admins || {};

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <CrownOutlined style={{ fontSize: 32, color: '#faad14' }} />
          <Title level={2} style={{ margin: 0 }}>Super Admin Dashboard</Title>
        </Space>
        <Text type="secondary">Complete system oversight and administration</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Admins"
              value={stats.total_admins || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Badge status="success" text={`${stats.active_admins || 0} Active`} />
              <br />
              <Badge status="error" text={`${stats.suspended_admins || 0} Suspended`} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={dashboard?.students || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/super-admin/subjects')}
            hoverable
          >
            <Statistic
              title="Subjects"
              value={dashboard?.subjects || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="System Health"
              value={systemHealth?.database === 'healthy' ? 'Healthy' : 'Issues'}
              prefix={<SafetyOutlined />}
              valueStyle={{ 
                color: systemHealth?.database === 'healthy' ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Announcements"
              value={dashboard?.announcements || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Study Materials"
              value={dashboard?.studyMaterials || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/super-admin/subjects-list')}
            hoverable
          >
            <Statistic
              title="MCQ Quiz"
              value="Create"
              prefix={<QuestionOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/super-admin/prev-quiz')}
            hoverable
          >
            <Statistic
              title="Previous Quiz"
              value="View"
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/super-admin/feedbacks')}
            hoverable
          >
            <Statistic
              title="Feedbacks"
              value="View"
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different sections */}
      <Card>
        <Tabs defaultActiveKey="admins">
          <TabPane tab="Admin Management" key="admins">
            <Table
              columns={adminColumns}
              dataSource={admins}
              rowKey="username"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={`Audit Logs (${auditLogs.length})`} key="audit">
            <Table
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              size="small"
            />
          </TabPane>

          <TabPane tab="System Health" key="health">
            {systemHealth && (
              <div>
                <Card title="Database Status" style={{ marginBottom: 16 }}>
                  <Tag color={systemHealth.database === 'healthy' ? 'green' : 'red'}>
                    {systemHealth.database?.toUpperCase()}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Last checked: {new Date(systemHealth.timestamp).toLocaleString()}
                  </Text>
                </Card>
                
                <Card title="Database Tables">
                  <Table
                    dataSource={systemHealth.tables}
                    columns={[
                      { title: 'Table Name', dataIndex: 'table_name', key: 'table_name' },
                      { 
                        title: 'Rows', 
                        dataIndex: 'table_rows', 
                        key: 'table_rows',
                        render: (val) => val?.toLocaleString() || '0'
                      },
                      { 
                        title: 'Size (MB)', 
                        dataIndex: 'size_mb', 
                        key: 'size_mb',
                        render: (val) => `${val || 0} MB`
                      }
                    ]}
                    rowKey="table_name"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Admin Management Modal */}
      <Modal
        title={`Manage Admin: ${selectedAdmin?.username}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedAdmin(null);
        }}
        footer={null}
      >
        {selectedAdmin && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Name: </Text>
              <Text>{`${selectedAdmin.firstName || ''} ${selectedAdmin.lastName || ''}`.trim()}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Email: </Text>
              <Text>{selectedAdmin.email || 'Not set'}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Current Status: </Text>
              <Tag color={selectedAdmin.status === 'active' ? 'green' : 'red'}>
                {selectedAdmin.status?.toUpperCase()}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Current Role: </Text>
              <Tag color={selectedAdmin.role === 'super_admin' ? 'gold' : 'blue'}>
                {selectedAdmin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Tag>
            </div>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>Change Status</Title>
              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusChange(selectedAdmin.username, 'active');
                    setIsModalVisible(false);
                  }}
                  disabled={selectedAdmin.status === 'active'}
                >
                  Activate
                </Button>
                <Button
                  danger
                  onClick={() => {
                    handleStatusChange(selectedAdmin.username, 'suspended');
                    setIsModalVisible(false);
                  }}
                  disabled={selectedAdmin.status === 'suspended'}
                >
                  Suspend
                </Button>
              </Space>
            </div>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>Change Role</Title>
              <Space>
                <Button
                  onClick={() => {
                    handleRoleChange(selectedAdmin.username, 'admin');
                    setIsModalVisible(false);
                  }}
                  disabled={selectedAdmin.role === 'admin'}
                >
                  Make Admin
                </Button>
                <Button
                  type="primary"
                  style={{ background: '#faad14', borderColor: '#faad14' }}
                  onClick={() => {
                    handleRoleChange(selectedAdmin.username, 'super_admin');
                    setIsModalVisible(false);
                  }}
                  disabled={selectedAdmin.role === 'super_admin'}
                >
                  Make Super Admin
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
