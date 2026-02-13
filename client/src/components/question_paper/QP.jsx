import React from "react";
import { Typography } from "antd";
import jsPDF from "jspdf";

const { Title } = Typography;

const months = [
  {
    month: "January 2026",
    papers: [
      { id: "jan-1", title: "Paper A - January 2026" },
      { id: "jan-2", title: "Paper B - January 2026" },
    ],
  },
  {
    month: "February 2025",
    papers: [
      { id: "feb-1", title: "Paper A - February 2025" },
      { id: "feb-2", title: "Paper B - February 2025" },
    ],
  },
  {
    month: "March 2025",
    papers: [
      { id: "mar-1", title: "Paper A - March 2025" },
      { id: "mar-2", title: "Paper B - March 2025" },
    ],
  },
];

export default function QP() {
  const openPdf = (title) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text("This is a test PDF for " + title, 14, 30);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
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
            Question Papers
          </Title>
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-10 px-6">
        {months.map((m) => (
          <div key={m.month} className="mb-8">
            <h3 className="text-xl font-semibold mb-2">{m.month}</h3>
            <ul className="list-disc pl-6">
              {m.papers.map((p) => (
                <li key={p.id} className="mb-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openPdf(p.title);
                    }}
                    className="text-blue-600 underline"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
