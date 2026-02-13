import React from "react";
import { Button, Table, Typography } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { webinars } from "../../data/webinar";
import { useNavigate } from "react-router-dom";

export default function WebinarListPdf() {
  const navigate = useNavigate();


  const { Title } = Typography;

  // Table columns for Ant Design Table
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => viewPdf(record)}>
            View PDF
          </Button>
        </div>
      ),
    },
  ];

  // Generate PDF for a single webinar and download
  const downloadPdf = (webinar) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(webinar.title, 14, 22);

    doc.setFontSize(12);
    doc.text(`Date: ${webinar.date}`, 14, 32);
    doc.text(`Time: ${webinar.time}`, 14, 40);

    doc.text("Description:", 14, 50);
    doc.setFontSize(11);
    doc.text(webinar.description || "No description available", 14, 58, {
      maxWidth: 180,
    });

    doc.save(`${webinar.title}.pdf`);
  };

  // Generate PDF for a single webinar and view in new tab
  const viewPdf = (webinar) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(webinar.title, 14, 22);

    doc.setFontSize(12);
    doc.text(`Date: ${webinar.date}`, 14, 32);
    doc.text(`Time: ${webinar.time}`, 14, 40);

    doc.text("Description:", 14, 50);
    doc.setFontSize(11);
    doc.text(webinar.description || "No description available", 14, 58, {
      maxWidth: 180,
    });

    // Open PDF in a new browser tab
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");
  };

  return (
    <>
      <section
        className="w-full text-center "
        style={{
          backgroundImage:
            "url('https://w0.peakpx.com/wallpaper/602/116/HD-wallpaper-blue-unsplash-thumbnail.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className=" bg-black/50 py-10">
          <Title level={1} className="!text-white mb-0">
            Webinar List PDF
          </Title>
        </div>
      </section>
      

      <section className="max-w-6xl mx-auto px-6 py-12">
        <Table
          columns={columns}
          dataSource={webinars}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </section>
    </>
  );
}
