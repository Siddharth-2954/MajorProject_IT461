import React from "react";
import { UserOutlined, VideoCameraOutlined, PlayCircleOutlined, MessageOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const defaultBg =
	"https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80";

export default function StudentHome({ id }) {
	const navigate = useNavigate();
	const bg = defaultBg;

	const heroStyle = {
		height: "220px",
		backgroundImage: `url(${bg})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "white",
		position: "relative",
	};

	const overlayStyle = {
		position: "absolute",
		inset: 0,
		background: "rgba(0,0,0,0.45)",
	};

	const contentStyle = {
		position: "relative",
		textAlign: "center",
		zIndex: 2,
	};

	const welcomeStyle = {
		margin: 0,
		fontSize: "3rem",
		fontWeight: 600,
		fontFamily:
			"Poppins, Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
		WebkitFontSmoothing: "antialiased",
		MozOsxFontSmoothing: "grayscale",
		letterSpacing: "0.2px",
	};

	const adminRowStyle = {
		margin: "0.25rem 0",
		fontSize: "1.1rem",
		fontWeight: 600,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		fontFamily:
			"Poppins, Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
		WebkitFontSmoothing: "antialiased",
		MozOsxFontSmoothing: "grayscale",
	};

	const sectionStyle = {
		padding: "2.5rem 1rem",
		maxWidth: 980,
		margin: "0 auto",
	};

	const cardStyle = {
		cursor: "pointer",
		borderRadius: 8,
		boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
		padding: "0.75rem 0.75rem",
		minHeight: "60px",
		textAlign: "center",
		fontFamily: welcomeStyle.fontFamily,
	};

	return (
		<div>
			<header style={heroStyle}>
				<div style={overlayStyle} />
				<div style={contentStyle}>
					<h1 style={welcomeStyle}>Welcome</h1>
					<h2 style={adminRowStyle}>
						<UserOutlined style={{ fontSize: 18 }} />
						<span>Admin</span>
						<span style={{ marginLeft: 12, fontFamily: welcomeStyle.fontFamily }}>
							ID: {id ?? "123456"}
						</span>
					</h2>
				</div>
			</header>

			<section style={sectionStyle} aria-labelledby="top-features">
				<h3 id="top-features" style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center", gap: 8, fontSize: "1rem", fontWeight: 600 }}>
					Explore Top features
				</h3>
				<div style={{ maxWidth: 900, margin: "0 auto 1rem", padding: "0 0.1rem", display: "grid", gap: "3.2rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
					<Card style={cardStyle} onClick={() => navigate('/lvc_feedback')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							<div style={{ color: '#059669', fontSize: 28 }}>
								<MessageOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>LVC Feedback</strong>
								<div style={{ color: '#666' }}>Give feedback on live virtual classes</div>
							</div>
						</div>
					</Card>

					<Card style={cardStyle} onClick={() => navigate('/lvrc_feedback')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							<div style={{ color: '#059669', fontSize: 28 }}>
								<MessageOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>LVRC Feedback</strong>
								<div style={{ color: '#666' }}>Give feedback on recorded classes</div>
							</div>
						</div>
					</Card>

					<Card style={cardStyle} onClick={() => navigate('/events/lvc')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							
							<div style={{ color: '#e11d48', fontSize: 28 }}>
								<VideoCameraOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>Live Virtual Classes Schedule</strong>
								<div style={{ color: '#666' }}>View upcoming live class schedule</div>
							</div>
						</div>
					</Card>

					<Card style={cardStyle} onClick={() => navigate('/events/lvrc')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							
							<div style={{ color: '#2563eb', fontSize: 28 }}>
								<VideoCameraOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>Live Virtual Revisionary Classes Schedule</strong>
								<div style={{ color: '#666' }}>View recorded revision class schedule</div>
							</div>
						</div>
					</Card>

					<Card style={cardStyle} onClick={() => navigate('/live_classes')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							
							<div style={{ color: '#e11d48', fontSize: 28 }}>
								<VideoCameraOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>Join Live Virtual Class Zoom</strong>
								<div style={{ color: '#666' }}>Join upcoming live class via Zoom</div>
							</div>
						</div>
					</Card>
				</div>
				
				<div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
					<div style={{ padding: "1rem", border: "1px solid #e6e6e6", borderRadius: 8 }}>
						<strong>Live Classes</strong>
						<div>Attend interactive live sessions with instructors.</div>
					</div>
					<div style={{ padding: "1rem", border: "1px solid #e6e6e6", borderRadius: 8 }}>
						<strong>Study Materials</strong>
						<div>Downloadable notes and guided study paths.</div>
					</div>
					<div style={{ padding: "1rem", border: "1px solid #e6e6e6", borderRadius: 8 }}>
						<strong>Mock Tests</strong>
						<div>Practice full-length mock exams with analytics.</div>
					</div>
				</div>
			</section>
		</div>
	);
}