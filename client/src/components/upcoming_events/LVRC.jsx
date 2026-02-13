import React, { useState } from "react";
import { Table, Select, Input, Button, Typography, Row, Col } from "antd";
import scheduleData from "../../data/scheduleData";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Title } = Typography;
const { Option } = Select;

export default function LVRC() {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredData = scheduleData.filter((item) => {
    const matchesSubject = subjectFilter ? item.subject === subjectFilter : true;
    const matchesSpeaker = speakerFilter ? item.speaker === speakerFilter : true;
    const matchesSearch = searchText ? item.topic.toLowerCase().includes(searchText.toLowerCase()) : true;
    return matchesSubject && matchesSpeaker && matchesSearch;
  });

  const columns = [
    { title: "#", dataIndex: "key", sorter: (a, b) => a.key - b.key, width: 50 },
    { title: "Date", dataIndex: "date", sorter: (a, b) => new Date(a.date) - new Date(b.date) },
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
              {[...new Set(scheduleData.map((item) => item.subject))].map((subj) => (
                <Option key={subj} value={subj}>{subj}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select placeholder="Select Speaker" value={speakerFilter || undefined} onChange={(val) => setSpeakerFilter(val)} style={{ width: "100%" }}>
              {[...new Set(scheduleData.map((item) => item.speaker))].map((spk) => (
                <Option key={spk} value={spk}>{spk}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Input placeholder="Search by topic" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </Col>
        </Row>

          <Button type="primary" onClick={downloadPDF} className="mb-4">Download Schedule</Button>

          <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} bordered />
        </div>
      </section>
    </>
  );
}
