import React from "react";
import { Table, Button, Typography, Space } from "antd";
import jsPDF from "jspdf";

const { Title } = Typography;

export default function ModelTest() {
	const openPdf = (record) => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text(record.paper || "Test Paper", 14, 20);
		doc.setFontSize(12);
		doc.text("Test content", 14, 30);

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
				<Space direction="vertical">
					<div>{text}</div>
					<Button type="primary" onClick={() => openPdf(record)}>
						Click Here
					</Button>
				</Space>
			),
		},
	];

	const data = [
		{
			key: "1",
			paper: "Paper 1",
		},
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
						Model Test Paper
					</Title>
				</div>
			</section>

			<section className="max-w-4xl mx-auto py-10 px-6">
				<Table columns={columns} dataSource={data} pagination={false} bordered />
			</section>
		</>
	);
}
