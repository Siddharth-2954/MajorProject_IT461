import React from "react";
import { Table, Button, Typography, Space } from "antd";
import jsPDF from "jspdf";

const { Title } = Typography;

export default function MockTestHome() {
	const openPdf = (record) => {
		// If a file field is provided, open the static PDF from assets
		if (record.file) {
			try {
				const assetUrl = new URL(`../assets/${record.file}`, import.meta.url).href;
				window.open(assetUrl, "_blank");
				return;
			} catch (err) {
				// fall through to fallback
				console.error("Could not open asset PDF:", err);
			}
		}

		// Fallback: generate a simple PDF on the fly
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text(record.paper || "Mock Test Paper", 14, 20);
		doc.setFontSize(12);
		doc.text("Mock test content for " + (record.paper || "Mock Test Paper"), 14, 30);

		const blob = doc.output("blob");
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank");
	};

	const columns = [
		{
			title: "Paper",
			dataIndex: "paper",
			key: "paper",
		},
		{
			title: "Details",
			dataIndex: "details",
			key: "details",
			render: (text, record) => (
				<Space size="middle" align="center" >
					<span>{text}</span>
					<Button type="primary" onClick={() => openPdf(record)}>
						Click Here
					</Button>
				</Space>
			),
		},
	];

	const data = [
		{ key: "1", paper: "Paper 1", details: "Mock test details for Paper 1", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "2", paper: "Paper 2", details: "Mock test details for Paper 2", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "3", paper: "Paper 3", details: "Mock test details for Paper 3", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "4", paper: "Paper 4", details: "Mock test details for Paper 4", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "5", paper: "Paper 5", details: "Mock test details for Paper 5", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "6", paper: "Paper 6", details: "Mock test details for Paper 6", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "7", paper: "Paper 7", details: "Mock test details for Paper 7", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
		{ key: "8", paper: "Paper 8", details: "Mock test details for Paper 8", file: "86583bos-aps1159-fnd-mtp-series-sep2025.pdf" },
	];

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
				<div className="bg-black/50 py-5">
					<Title level={1} className="!text-white mb-0">
						Mock Test Papers
					</Title>
				</div>
			</section>

			<section className="max-w-2xl mx-auto py-10 px-2">
				<Table columns={columns} dataSource={data} pagination={false} bordered />
			</section>
		</>
	);
}
