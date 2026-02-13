import React from "react";
import { Typography } from "antd";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import months from "../data/suggestAnswer";

const { Title } = Typography;

export default function SuggestAnswerHome() {
  const navigate = useNavigate();

  const openPdf = (title) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text("Suggested answer content for " + title, 14, 30);

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
            Suggested Answers
          </Title>
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-10 px-6">
        {months.map((m) => (
          <div key={m.id} className="mb-6">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/suggested-answers/${m.id}`);
              }}
              className="text-lg text-blue-600 underline"
            >
              {m.month}
            </a>
          </div>
        ))}
      </section>
    </>
  );
}
