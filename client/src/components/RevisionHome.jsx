import React from "react";
import { Row, Col, Card, Typography, List, Button } from "antd";
import { useNavigate } from "react-router-dom";
import revisionTests from "../data/revisionTest";
import jsPDF from "jspdf";

const { Title } = Typography;

export default function RevisionHome() {
	const navigate = useNavigate();
	const openPdf = (paper) => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text(paper.title || paper.id, 14, 20);
		doc.setFontSize(12);
		doc.text(`This is a revision paper (${paper.id}).`, 14, 30);

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
						Revision Tests
					</Title>
				</div>
			</section>

			<section className="max-w-6xl mx-auto py-9 px-6">
				<Row gutter={[16, 16]}>
					{revisionTests.map((month) => (
						<Col xs={24} sm={12} md={8} lg={6} key={month.id}>
							<Card
								hoverable
								style={{ cursor: "pointer" }}
								headStyle={{ borderBottom: "none" }}
								bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}
								onClick={() => navigate(`/revision-tests/${month.id}`)}
							>
								<div style={{ textAlign: "center", fontWeight: 600 }}>{month.id}</div>
							</Card>
						</Col>
					))}
				</Row>
			</section>
		</>
	);
}