import React, { useEffect, useState } from "react";
import { UserOutlined, VideoCameraOutlined, PlayCircleOutlined, MessageOutlined, DownloadOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const defaultBg =
	"https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80";

const API_BASE = 'http://localhost:8000';

export default function StudentHome({ id }) {
	const [user, setUser] = useState(null);
	const [announcements, setAnnouncements] = useState([]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetch(API_BASE + '/students/me', { credentials: 'include' });
				if (res.ok) {
					const json = await res.json();
					if (json && json.authenticated && json.user) setUser(json.user);
				}
			} catch (e) {
				// ignore
			}
		};
		fetchUser();

		const fetchAnnouncements = async () => {
			try {
				const res = await fetch(API_BASE + '/announcements');
				if (res.ok) {
					const json = await res.json();
					if (json && json.success && json.announcements) {
						// Map server announcements to display format
						const mapped = json.announcements.map(a => {
							// Format date properly - server returns 'ts' field
							let formattedDate = '';
							const dateField = a.ts || a.created_at;
							if (dateField) {
								try {
									formattedDate = new Date(dateField).toLocaleDateString('en-GB', {
										day: '2-digit',
										month: 'short',
										year: 'numeric'
									});
								} catch (e) {
									formattedDate = 'N/A';
								}
							}
							
							// Get author name from admin info or author field
							let authorName = 'Admin';
							if (a.admin && (a.admin.firstName || a.admin.lastName)) {
								authorName = `${a.admin.firstName || ''} ${a.admin.lastName || ''}`.trim();
							} else if (a.author && !a.author.includes('@') && a.author.length < 20) {
								authorName = a.author;
							}
							
							return {
								id: a.id,
								title: a.title || 'Untitled',
								body: a.body || '',
								date: formattedDate,
								author: authorName,
								type: a.type || 'lms',
								attachment_url: a.attachment_url || null,
							};
						});
						setAnnouncements(mapped);
					}
				}
			} catch (e) {
				console.error('Failed to fetch announcements:', e);
			}
		};
		fetchAnnouncements();
	}, []);
	const navigate = useNavigate();
	const bg = defaultBg;

	const getAnnouncementRoute = (a) => {
		if (a.type === 'exam') return '/announcements/exam';
		return '/announcements/lms';
	};

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
		maxWidth: '80%',
		margin: "0 auto",
	};

	const cardStyle = {
		cursor: "pointer",
		borderRadius: 8,
		boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
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
						<span>{user?.firstName ?? 'Admin'}</span>
						<span style={{ marginLeft: 12, fontFamily: welcomeStyle.fontFamily }}>
							ID: {user?.registrationId ?? id ?? 'NA'}
						</span>
					</h2>
				</div>
			</header>

			<section style={sectionStyle} aria-labelledby="top-features">
				<h3 id="top-features" style={{width: '100%', marginBottom: "0.75rem", display: "flex", justifyContent: "center", gap: 2, fontSize: "1rem", fontWeight: 600 }}>
					Explore Top features
				</h3>
				<div style={{ maxWidth: '100%', margin: "0 auto 1rem", display: "grid", gap: "2.2rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
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

									<Card style={cardStyle} onClick={() => navigate('/download-notes')}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							<div style={{ color: '#0ea5a4', fontSize: 28 }}>
												<DownloadOutlined />
							</div>
							<div style={{ textAlign: 'left' }}>
								<strong style={{ fontSize: 16 }}>Download Notes/Assignments</strong>
								<div style={{ color: '#666' }}>Downloadable notes and resources</div>
							</div>
						</div>
					</Card>

									<Card style={cardStyle} onClick={() => navigate('/mcq-dashboard')}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
											<div style={{ color: '#f59e0b', fontSize: 28 }}>
												<PlayCircleOutlined />
											</div>
											<div style={{ textAlign: 'left' }}>
												<strong style={{ fontSize: 16 }}>MCQ Practice</strong>
												<div style={{ color: '#666' }}>Practice multiple-choice questions</div>
											</div>
										</div>
									</Card>
				</div>
				
				{/* Announcements: show latest admin posts in two columns */}
				<div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
					{/* Left: Latest announcement */}
					<div style={{ padding: '1rem', border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
						<strong style={{ display: 'block', marginBottom: 6 }}>Latest Announcements</strong>
						{/* render two latest items */}
						{announcements.slice(0, 2).map(a => (
							<div
								key={a.id}
								role="button"
								tabIndex={0}
								onClick={() => navigate(`${getAnnouncementRoute(a)}/${a.id}`)}
								onKeyDown={(e) => e.key === 'Enter' && navigate(`${getAnnouncementRoute(a)}/${a.id}`)}
								style={{ cursor: 'pointer', padding: 12, borderRadius: 6, border: '1px solid #f0f0f0', marginBottom: 10, background: '#fafafa' }}
							>
								<div style={{ fontWeight: 600, color: '#0b5cff', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'break-word' }}>{a.title}</div>
								<div style={{ color: '#666', fontSize: 13, margin: '6px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>{a.body}</div>
								<div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.date}</div>
							</div>
						))}
					</div>

					{/* Right: All recent announcements in condensed list */}
					<div style={{ padding: '1rem', border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
						<strong style={{ display: 'block', marginBottom: 6 }}>All Recent Announcements</strong>
						<div style={{ display: 'grid', gap: 8, maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
							{announcements.map(a => (
								<div
									key={a.id}
									role="button"
									tabIndex={0}
									onClick={() => navigate(`${getAnnouncementRoute(a)}/${a.id}`)}
									onKeyDown={(e) => e.key === 'Enter' && navigate(`${getAnnouncementRoute(a)}/${a.id}`)}
									style={{ cursor: 'pointer', padding: 10, borderRadius: 6, border: '1px solid #f5f5f5', minWidth: 0 }}
								>
									<div style={{ fontWeight: 600, color: '#0b5cff', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'break-word' }}>{a.title}</div>
									<div style={{ color: '#777', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.date}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}