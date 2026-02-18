import React, { useState, useEffect } from "react";
import { Table, Select, Input, Button, Typography, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import scheduleData from "../../data/scheduleData";
const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Title } = Typography;
const { Option } = Select;

export default function LVC() {
  const navigate = useNavigate();

  const [subjectFilter, setSubjectFilter] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadAdmins() {
      try {
        const res = await fetch(API_BASE + '/auth/admins');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && Array.isArray(json.admins)) {
          setAdmins(json.admins.map(a => a.displayName || a.username));
        }
      } catch (e) {
        // ignore
      }
    }
    loadAdmins();
    return () => { mounted = false; };
  }, []);

  // Map scheduleData to use registered admin names as speakers (cycle if fewer admins)
  const mappedData = scheduleData.map(item => {
    if (admins && admins.length > 0) {
      const idx = (item.key - 1) % admins.length;
      return { ...item, speaker: admins[idx] };
    }
    return item;
  });

  // Filtered data based on dropdowns/search
  const filteredData = mappedData.filter((item) => {
    const matchesSubject = subjectFilter
      ? item.subject === subjectFilter
      : true;
    const matchesSpeaker = speakerFilter
      ? item.speaker === speakerFilter
      : true;
    const matchesSearch = searchText
      ? item.topic.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesSubject && matchesSpeaker && matchesSearch;
  });

  // Columns for table with sorting
  const columns = [
    {
      title: "#",
      dataIndex: "key",
      sorter: (a, b) => a.key - b.key,
      width: 50,
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      sorter: (a, b) => a.subject.localeCompare(b.subject),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      sorter: (a, b) => a.topic.localeCompare(b.topic),
    },
    {
      title: "Speaker",
      dataIndex: "speaker",
      sorter: (a, b) => a.speaker.localeCompare(b.speaker),
    },
    {
      title: "Timing",
      dataIndex: "timing",
      sorter: (a, b) => a.timing.localeCompare(b.timing),
      render: (text, record) => {
        // derive session label from start time
        const m = String(text || "").match(/^(\d{1,2}):(\d{2})\s*([APMapm]{2})/);
        let label = "";
        if (m) {
          let hh = parseInt(m[1], 10);
          const mm = parseInt(m[2], 10);
          const ampm = m[3].toUpperCase();
          if (ampm === "PM" && hh !== 12) hh += 12;
          if (ampm === "AM" && hh === 12) hh = 0;
          // determine session: morning (0-11), afternoon (12-15), evening (16+)
          if (hh < 12) label = "Morning";
          else if (hh >= 12 && hh < 16) label = "Afternoon";
          else label = "Evening";
        }
        return text + (label ? ` (${label})` : "");
      },
    },
  ];

  // Download table as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["#", "Date", "Subject", "Topic", "Speaker", "Timing"];
    const tableRows = [];

    filteredData.forEach((item) => {
      // compute same label for PDF export
      const timingText = (() => {
        const t = item.timing || "";
        const m = String(t).match(/^(\d{1,2}):(\d{2})\s*([APMapm]{2})/);
        if (!m) return t;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (ampm === "PM" && hh !== 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
        let label = "";
        if (hh < 12) label = "Morning";
        else if (hh >= 12 && hh < 16) label = "Afternoon";
        else label = "Evening";
        return t + (label ? ` (${label})` : "");
      })();

      const rowData = [
        item.key,
        item.date,
        item.subject,
        item.topic,
        item.speaker,
        timingText,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.text("Schedule Table", 14, 15);
    doc.save("schedule.pdf");
  };

  return (
    <>
      {/* Title Section */}
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            Schedule
          </Title>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto py-10 px-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Select
              placeholder="Select Subject"
              value={subjectFilter || undefined}
              onChange={(val) => setSubjectFilter(val)}
              style={{ width: "100%" }}
            >
              {[...new Set(scheduleData.map((item) => item.subject))].map(
                (subj) => (
                  <Option key={subj} value={subj}>
                    {subj}
                  </Option>
                ),
              )}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Select Speaker"
              value={speakerFilter || undefined}
              onChange={(val) => setSpeakerFilter(val)}
              style={{ width: "100%" }}
            >
              {(admins && admins.length > 0 ? admins : [...new Set(scheduleData.map((item) => item.speaker))]).map(
                (spk) => (
                  <Option key={spk} value={spk}>
                    {spk}
                  </Option>
                ),
              )}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search by topic"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

          <Button type="primary" onClick={downloadPDF} className="mb-4">
            Download Schedule
          </Button>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </div>
      </section>
    </>
  );
}