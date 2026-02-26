import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Modal,
  message,
  Spin,
  Empty,
  Rate,
  Descriptions,
  Space,
  Tabs,
  Input,
  Select,
  Statistic,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/charts";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

export default function FeedbacksAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scheduleType, setScheduleType] = useState("lvc");
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [stats, setStats] = useState({
    avgQuality: 0,
    totalFeedbacks: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    loadFeedbacks(scheduleType, pagination.current - 1);
    loadChartData(scheduleType);
  }, [scheduleType]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFeedbacks(scheduleType, pagination.current - 1);
      loadChartData(scheduleType);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [scheduleType, pagination.current]);

  const loadFeedbacks = async (type, offset) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/feedbacks?scheduleType=${type}&limit=${pagination.pageSize}&offset=${offset * pagination.pageSize}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load feedbacks");
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      setPagination({
        ...pagination,
        total: data.count,
        current: offset + 1,
      });

      if (!data.feedbacks || data.feedbacks.length === 0) {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Error loading feedbacks:", err);
      message.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (type) => {
    try {
      setChartLoading(true);
      const response = await fetch(
        `${API_BASE}/feedbacks?scheduleType=${type}&limit=10000&offset=0`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load feedback chart data");
      }

      const data = await response.json();
      const allFeedbacks = data.feedbacks || [];

      const grouped = allFeedbacks.reduce((acc, f) => {
        const key = f.lectureDate
          ? dayjs(f.lectureDate).format("YYYY-MM-DD")
          : "Unknown";
        if (!acc[key]) {
          acc[key] = { total: 0, count: 0 };
        }
        if (typeof f.quality === "number") {
          acc[key].total += f.quality;
          acc[key].count += 1;
        }
        return acc;
      }, {});

      const series = Object.keys(grouped)
        .sort()
        .map((date) => ({
          date,
          avgQuality:
            grouped[date].count > 0
              ? Number((grouped[date].total / grouped[date].count).toFixed(2))
              : 0,
        }));

      const overallAvg =
        allFeedbacks.length > 0
          ? allFeedbacks.reduce((sum, f) => sum + (f.quality || 0), 0) /
            allFeedbacks.length
          : 0;

      setChartData(series);
      setStats({
        avgQuality: overallAvg.toFixed(1),
        totalFeedbacks: allFeedbacks.length,
      });
    } catch (err) {
      console.error("Error loading chart data:", err);
      message.error("Failed to load feedback chart data");
    } finally {
      setChartLoading(false);
    }
  };

  const handleViewDetails = async (feedback) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`${API_BASE}/feedbacks/${feedback.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load feedback details");
      }

      const data = await response.json();
      setSelectedFeedback(data.feedback || feedback);
      setIsModalVisible(true);
    } catch (err) {
      console.error("Error loading feedback details:", err);
      message.error("Failed to load feedback details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Feedback",
      content: "Are you sure you want to delete this feedback?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE}/feedbacks/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to delete feedback");
          }

          message.success("Feedback deleted successfully");
          loadFeedbacks(scheduleType, pagination.current - 1);
        } catch (err) {
          console.error("Error deleting feedback:", err);
          message.error("Failed to delete feedback");
        }
      },
    });
  };

  const handleTableChange = (newPagination) => {
    loadFeedbacks(scheduleType, newPagination.current - 1);
  };

  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      f.studentEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      f.subject?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 150,
      render: (text) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 120,
    },
    {
      title: "Date",
      dataIndex: "lectureDate",
      key: "lectureDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      width: 100,
      render: (session) => {
        let color = "blue";
        if (session === "morning") color = "gold";
        else if (session === "afternoon") color = "cyan";
        else if (session === "evening") color = "magenta";
        return <Tag color={color}>{session || "N/A"}</Tag>;
      },
    },
    {
      title: "Quality Rating",
      dataIndex: "quality",
      key: "quality",
      width: 130,
      render: (quality) => (
        <Rate
          disabled
          value={quality}
          allowHalf
          style={{ color: "#faad14" }}
        />
      ),
    },
    {
      title: "Feedback",
      dataIndex: "liked_most",
      key: "liked_most",
      width: 200,
      render: (text) => (
        <Text ellipsis title={text} type="secondary">
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="View Details"
          />
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Delete Feedback"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        style={{ marginBottom: 24 }}
        bodyStyle={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <Row gutter={32}>
          <Col span={12}>
            <Title level={2} style={{ color: "white", marginBottom: "4px" }}>
              Feedback Management
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
              View and manage student feedbacks for lectures
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Row gutter={32}>
              <Col>
                <Statistic
                  title="Total Feedbacks"
                  value={stats.totalFeedbacks}
                  valueStyle={{ color: "white" }}
                  titleStyle={{ color: "rgba(255,255,255,0.8)" }}
                />
              </Col>
              <Col>
                <Statistic
                  title="Avg. Quality"
                  value={stats.avgQuality}
                  suffix="/ 5"
                  valueStyle={{ color: "white" }}
                  titleStyle={{ color: "rgba(255,255,255,0.8)" }}
                  precision={1}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Average Quality Trend
            </Title>
            <Text type="secondary">
              Real-time average quality based on all feedbacks
            </Text>
          </Col>
          <Col xs={24} md={16}>
            <Spin spinning={chartLoading}>
              {chartData.length === 0 ? (
                <Empty description="No data available" />
              ) : (
                <Line
                  data={chartData}
                  xField="date"
                  yField="avgQuality"
                  height={260}
                  smooth
                  point={{ size: 4, shape: "circle" }}
                  tooltip={{ showMarkers: true }}
                  yAxis={{ min: 0, max: 5 }}
                  color="#722ed1"
                />
              )}
            </Spin>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input.Search
              placeholder="Search by student name, email, or subject..."
              allowClear
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              prefix={<FilterOutlined />}
            />
          </Col>
          <Col span={12}>
            <Select
              value={scheduleType}
              onChange={setScheduleType}
              style={{ width: "100%" }}
              options={[
                { label: "LVC Feedbacks", value: "lvc" },
                { label: "LVRC Feedbacks", value: "lvrc" },
              ]}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          {filteredFeedbacks.length === 0 ? (
            <Empty description="No feedbacks found" />
          ) : (
            <Table
              dataSource={filteredFeedbacks}
              columns={columns}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Total ${total} feedbacks`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              bordered
              size="middle"
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={`Feedback Details - ${selectedFeedback?.studentName || "Student"}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="delete"
            danger
            onClick={() => {
              handleDelete(selectedFeedback?.id);
              setIsModalVisible(false);
            }}
          >
            Delete
          </Button>,
        ]}
        width={900}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : (
          selectedFeedback && (
            <Tabs>
            <TabPane tab="Basic Info" key="1">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Student Name">
                  {selectedFeedback.studentName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Student ID">
                  {selectedFeedback.studentId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedFeedback.studentEmail || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Schedule ID">
                  {selectedFeedback.scheduleId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Subject">
                  {selectedFeedback.subject || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Schedule Type">
                  <Tag>{selectedFeedback.scheduleType || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Instructor">
                  {selectedFeedback.instructor || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Submitted At">
                  {selectedFeedback.createdAt
                    ? dayjs(selectedFeedback.createdAt).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Lecture Date">
                  {selectedFeedback.lectureDate
                    ? dayjs(selectedFeedback.lectureDate).format("DD/MM/YYYY")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Session">
                  <Tag>{selectedFeedback.session || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Topic" span={2}>
                  {selectedFeedback.topic || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Class Experience" key="2">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Overall Quality">
                  <Rate
                    disabled
                    value={selectedFeedback.quality}
                    allowHalf
                    style={{ color: "#faad14" }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Content Relevance">
                  <Tag>{selectedFeedback.aligned || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Faculty Explanation">
                  <Tag>{selectedFeedback.explanation || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Pace">
                  <Tag>{selectedFeedback.pace || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Interaction & Doubt Solving">
                  <Tag>{selectedFeedback.interaction || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Class Timings">
                  <Tag>{selectedFeedback.timings || "N/A"}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Technical Aspects" key="3">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Audio/Video Quality">
                  <Tag>{selectedFeedback.av_quality || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Technical Issues">
                  <Text>{selectedFeedback.technical_issues || "None reported"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Feedback & Escalation" key="4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Feedback Ease">
                  <Tag>{selectedFeedback.feedback_ease || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Escalation Awareness">
                  <Tag>{selectedFeedback.escalation_awareness || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Escalation Experience">
                  <Text>{selectedFeedback.escalation_experience || "None"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Feedback Valued">
                  <Tag>{selectedFeedback.feedback_valued || "N/A"}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Study Material" key="5">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Material Provided">
                  <Tag>{selectedFeedback.material_provided || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Material Quality">
                  <Rate
                    disabled
                    value={selectedFeedback.material_quality}
                    allowHalf
                    style={{ color: "#faad14" }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Material Alignment" span={2}>
                  <Tag>{selectedFeedback.material_aligned || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Suggestions" span={2}>
                  <Text>{selectedFeedback.material_suggestions || "None"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Language & Accessibility" key="6">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Language Clarity">
                  <Tag>{selectedFeedback.language_clarity || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Language Preference">
                  <Tag>{selectedFeedback.language_preference || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Suggestions" span={2}>
                  <Text>{selectedFeedback.language_suggestions || "None"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="General Comments" key="7">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="What You Liked Most">
                  <Text>{selectedFeedback.liked_most || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="What Could Be Improved">
                  <Text>{selectedFeedback.could_improve || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Other Comments">
                  <Text>{selectedFeedback.other_comments || "N/A"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        )
        )}
      </Modal>
    </div>
  );
}