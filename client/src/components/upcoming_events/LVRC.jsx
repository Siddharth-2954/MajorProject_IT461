import React, { useState, useEffect } from "react";
import { Table, Select, Input, Button, Typography, Row, Col } from "antd";
import { useLocation } from "react-router-dom";
import scheduleData from "../../data/scheduleData";
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Title } = Typography;
const { Option } = Select;

export default function LVRC() {
  const location = useLocation();
  const [subjectFilter, setSubjectFilter] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [displayData, setDisplayData] = useState(scheduleData);
  const [loading, setLoading] = useState(false);

  const isSuperAdminRoute = location.pathname === '/super-admin/lvrc';
  const isEventsLvrcRoute = location.pathname === '/events/lvrc';
  const isDatabaseRoute = isSuperAdminRoute || isEventsLvrcRoute;

  // Load LVRC data from database if on database routes
  useEffect(() => {
    if (!isDatabaseRoute) {
      setDisplayData(scheduleData);
      return;
    }

    let mounted = true;
    async function loadLVRCData() {
      try {
        setLoading(true);
        setDisplayData([]); // Clear data before fetching
        // Use public endpoint for /events/lvrc, protected endpoint for /super-admin/lvrc
        const endpoint = isEventsLvrcRoute ? '/schedules/lvrc' : '/super-admin/lvrc-schedules';
        const res = await fetch(API_BASE + endpoint, {
          credentials: 'include'
        });
        const json = await res.json();
        console.log('LVRC API response:', json);
        
        if (mounted && json.success && Array.isArray(json.schedules)) {
          const transformed = json.schedules.map((item, idx) => ({
            key: idx + 1,
            date: item.scheduledDate,
            subject: item.subjectName || 'Unknown Subject',
            topic: item.title,
            speaker: item.instructorName || 'TBD',
            timing: `${item.startTime} - ${item.endTime}`,
          }));
          console.log('Transformed LVRC data:', transformed);
          setDisplayData(transformed);
        } else {
          console.log('No LVRC schedules found or invalid response');
          setDisplayData([]);
        }
      } catch (e) {
        console.error('Error loading LVRC data:', e);
        setDisplayData([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadLVRCData();
    return () => { mounted = false; };
  }, [isDatabaseRoute, isEventsLvrcRoute]);

  const filteredData = displayData.filter((item) => {
    const matchesSubject = subjectFilter ? item.subject === subjectFilter : true;
    const matchesSpeaker = speakerFilter ? item.speaker === speakerFilter : true;
    const matchesSearch = searchText ? item.topic.toLowerCase().includes(searchText.toLowerCase()) : true;
    return matchesSubject && matchesSpeaker && matchesSearch;
  });

  const columns = [
    { title: "#", dataIndex: "key", sorter: (a, b) => a.key - b.key, width: 50 },
    { title: "Date", dataIndex: "date", sorter: (a, b) => new Date(a.date) - new Date(b.date), render: (text) => String(text).split('T')[0] },
    { title: "Subject", dataIndex: "subject", sorter: (a, b) => a.subject.localeCompare(b.subject) },
    { title: "Topic", dataIndex: "topic", sorter: (a, b) => a.topic.localeCompare(b.topic) },
    { title: "Speaker", dataIndex: "speaker", sorter: (a, b) => a.speaker.localeCompare(b.speaker) },
    { title: "Timing", dataIndex: "timing", sorter: (a, b) => a.timing.localeCompare(b.timing) },
  ];

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["#", "Date", "Subject", "Topic", "Speaker", "Timing"];
    const tableRows = [];

    filteredData.forEach((item) => {
      const rowData = [item.key, item.date, item.subject, item.topic, item.speaker, item.timing];
      tableRows.push(rowData);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.text("LVRC Schedule", 14, 15);
    doc.save("lvrc-schedule.pdf");
  };

  return (
    <>
      <section
        className="w-full text-center"
        style={{
          backgroundImage: "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            LVRC Schedule
          </Title>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-10 px-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Select placeholder="Select Subject" value={subjectFilter || undefined} onChange={(val) => setSubjectFilter(val)} style={{ width: "100%" }}>
                {[...new Set(displayData.map((item) => item.subject))].map((subj) => (
                  <Option key={subj} value={subj}>{subj}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select placeholder="Select Speaker" value={speakerFilter || undefined} onChange={(val) => setSpeakerFilter(val)} style={{ width: "100%" }}>
                {[...new Set(displayData.map((item) => item.speaker))].map((spk) => (
                  <Option key={spk} value={spk}>{spk}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Input placeholder="Search by topic" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </Col>
          </Row>

          <Button type="primary" onClick={downloadPDF} className="mb-4" disabled={filteredData.length === 0}>Download Schedule</Button>

          <Table key={displayData.length} columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} loading={loading} bordered />
          
          {!loading && displayData.length === 0 && isSuperAdminRoute && (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              <p>No LVRC schedules created yet. Create an LVC to auto-generate LVRC schedules 36 hours later.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
