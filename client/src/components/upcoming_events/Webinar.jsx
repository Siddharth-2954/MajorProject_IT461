import React, { useState } from "react";
import { Table, Select, Input, Button, Typography, Row, Col } from "antd";
import { webinars } from "../../data/webinar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Title } = Typography;
const { Option } = Select;

export default function Webinar() {
  const [monthFilter, setMonthFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const monthOptions = [...new Set(webinars.map((w) => w.date.slice(0, 7)))];

  const filteredData = webinars
    .filter((item) => (monthFilter ? item.date.startsWith(monthFilter) : true))
    .filter((item) =>
      searchText ? item.title.toLowerCase().includes(searchText.toLowerCase()) : true,
    )
    .map((item) => ({ ...item, key: item.id }));

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      sorter: (a, b) => Number(a.id) - Number(b.id),
      width: 70,
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Time",
      dataIndex: "time",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
  ];

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Date", "Title", "Time", "Description"];
    const tableRows = [];

    filteredData.forEach((item) => {
      const rowData = [item.id, item.date, item.title, item.time, item.description];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.text("Webinars", 14, 15);
    doc.save("webinars.pdf");
  };

  return (
    <>
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
            Webinars
          </Title>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-10 px-6">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Select
              placeholder="Select Month"
              value={monthFilter || undefined}
              onChange={(val) => setMonthFilter(val)}
              style={{ width: "100%" }}
              allowClear
            >
              {monthOptions.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={16}>
            <Input
              placeholder="Search by title"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        <Button type="primary" onClick={downloadPDF} className="mb-4">
          Download Webinars
        </Button>

        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 6 }} bordered />
      </section>
    </>
  );
}