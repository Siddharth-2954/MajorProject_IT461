import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Button, Typography } from "antd";
import months from "../../data/suggestAnswer";
import jsPDF from "jspdf";

const { Title } = Typography;

export default function SuggestAnswerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const month = months.find((m) => m.id === id);

  const openPdf = (paper) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(paper.title || paper.id, 14, 20);
    doc.setFontSize(12);
    doc.text(`Suggested answer for ${paper.title}`, 14, 30);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (!month) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        <Title level={3}>Month not found</Title>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

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
            {month.month}
          </Title>
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-10 px-6">
        <Card title={`Suggested answers for ${month.month}`} bordered>
          <List
            dataSource={month.papers}
            renderItem={(paper) => (
              <List.Item>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div>
                    <strong>{paper.id}</strong>
                    <div>{paper.title}</div>
                  </div>
                  <div>
                    <Button type="primary" onClick={() => openPdf(paper)}>
                      Open PDF
                    </Button>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>
        </Card>
      </section>
    </>
  );
}
