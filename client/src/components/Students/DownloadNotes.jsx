import React, { useMemo, useState, useEffect, useContext } from 'react';
import { List, Button, Typography, Card, Table, Row, Col, Space, Tag, Select, Input, Badge, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import { SUBJECTS } from '../../data/notesData';
import { AuthContext } from '../../AuthContext';

const { Title, Text } = Typography;

const defaultBg = 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80';
const API_BASE = 'http://localhost:8000';

export default function DownloadNotes() {
	const [selectedSubject, setSelectedSubject] = useState('All');
	const [typeFilter, setTypeFilter] = useState(null);
	const [speakerFilter, setSpeakerFilter] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');

	const [materials, setMaterials] = useState([]);

	const { user } = useContext(AuthContext);
	const currentUserName = user ? (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : null;

	const speakers = useMemo(() => Array.from(new Set(materials.map(s => s.speaker))), [materials]);
	const types = useMemo(() => Array.from(new Set(materials.map(s => s.type))), [materials]);
	const subjectCounts = useMemo(() => {
		const m = {};
		materials.forEach(n => {
			const subject = n.subject || 'General';
			// Match subject case-insensitively to SUBJECTS array
			const matchedSubject = SUBJECTS.find(s => s.toLowerCase() === subject.toLowerCase()) || subject;
			m[matchedSubject] = (m[matchedSubject] || 0) + 1;
		});
		return m;
	}, [materials]);

	const navigate = useNavigate();

	const [showFeedbackModal, setShowFeedbackModal] = useState(false);

	// auto-show feedback modal shortly after user visits this page
	useEffect(() => {
		const t = setTimeout(() => setShowFeedbackModal(true), 2500);
		return () => clearTimeout(t);
	}, []);

	// fetch materials from admin endpoint
	useEffect(() => {
		let mounted = true;
		async function load() {
				try {
					const res = await fetch(API_BASE + '/study-materials');
					if (res.ok) {
						const json = await res.json();
					// map server materials to table shape
					const mapped = (json || []).map(m => ({
						id: m.id || m._id,
						title: m.topic || m.fileName || 'Untitled',
						topic: m.topic || m.fileName || 'Untitled',
						speaker: m.uploaderName || 'Admin',
						date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
						type: m.category || (m.fileType || 'PDF'),
						href: m.fileUrl ? (m.fileUrl.startsWith('http') ? m.fileUrl : API_BASE + m.fileUrl) : (m.fileName ? (API_BASE + '/uploads/study-materials/' + encodeURIComponent(m.fileName)) : ''),
						subject: m.subject || 'General'
					}));
						if (mounted) setMaterials(mapped);
				} else {
					if (mounted) setMaterials([]);
				}
			} catch (e) {
				console.error(e);
				if (mounted) setMaterials([]);
			}
		}
		load();
		return () => { mounted = false; };
	}, []);

	const filtered = useMemo(() => {
		let data = materials;
		if (selectedSubject && selectedSubject !== 'All') {
			// Case-insensitive subject filtering
			data = data.filter((n) => {
				const subject = n.subject || 'General';
				return subject.toLowerCase() === selectedSubject.toLowerCase();
			});
		}
		if (typeFilter) data = data.filter((n) => n.type === typeFilter);
		if (speakerFilter) data = data.filter((n) => n.speaker === speakerFilter);
		if (searchQuery && searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			data = data.filter(n => (n.title + ' ' + n.topic + ' ' + n.subject).toLowerCase().includes(q));
		}
		return data;
	}, [selectedSubject, typeFilter, speakerFilter, searchQuery, materials]);

	const columns = [
		{ title: 'Title', dataIndex: 'title', key: 'title' },
		{ title: 'Topic', dataIndex: 'topic', key: 'topic' },
		{ title: 'Speaker', dataIndex: 'speaker', key: 'speaker' },
		{ title: 'Date', dataIndex: 'date', key: 'date' },
		{ title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
		{
			title: 'Download',
			key: 'download',
			render: (_text, record) => {
				const isAssignment = record.type && record.type.toLowerCase().includes('assignment');
				if (isAssignment) {
					return (
						<Button type="primary" icon={<DownloadOutlined />} onClick={() => setShowFeedbackModal(true)}>
							Download
						</Button>
					);
				}
				return <Button type="primary" icon={<DownloadOutlined />} href={record.href} />;
			},
		},
	];

	const heroStyle = {
		height: '180px',
		backgroundImage: `url(${defaultBg})`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: 'white',
		position: 'relative',
		marginBottom: 24,
        width: '100%',
	};

	const overlayStyle = {
		position: 'absolute',
		inset: 0,
		background: 'rgba(0,0,0,0.45)',
	};

	return (
		<div style={{ maxWidth: '100%', margin: '0 auto'}}>
			<header style={heroStyle}>
				<div style={overlayStyle} />
				<div style={{  zIndex: 2, textAlign: 'center' }}>
					<Title style={{ color: 'white', margin: 0 }}>Download Notes</Title>
					<Text style={{ color: '#e6e6e6' }}>Choose a subject to filter notes</Text>
				</div>
			</header>

			<Card size="small" style={{ marginBottom: 16, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: 12 }}>
				<Row gutter={50} align="stretch">
					<Col xs={24} sm={8} md={6} lg={6}>
						<Select placeholder="Filter by type" allowClear style={{ width: '100%' }} value={typeFilter} onChange={setTypeFilter}>
							{types.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
						</Select>
					</Col>
					<Col xs={24} sm={8} md={6} lg={6}>
						<Select placeholder="Filter by speaker" allowClear style={{ width: '100%' }} value={speakerFilter} onChange={setSpeakerFilter}>
							{speakers.map(sp => <Select.Option key={sp} value={sp}>{sp}</Select.Option>)}
						</Select>
					</Col>
					<Col xs={24} sm={8} md={12} lg={12}>
						<Input.Search placeholder="Search title / topic / subject" allowClear enterButton onSearch={setSearchQuery} onChange={e => setSearchQuery(e.target.value)} />
					</Col>
				</Row>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8} lg={6}>
					<Card title="Subjects" headStyle={{ fontSize: 14 }} bodyStyle={{ padding: 12 }} style={{ position: 'sticky', top: 88 }}>
						<Space direction="vertical" style={{ width: '100%' }}>
							{SUBJECTS.map((s) => (
								<Button
									key={s}
									type={selectedSubject === s ? 'primary' : 'default'}
									onClick={() => setSelectedSubject((prev) => (prev === s ? 'All' : s))}
									style={{
										textAlign: 'left',
										width: '100%',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '10px 12px'
									}}
								>
									<span>{s}</span>
									<Badge count={subjectCounts[s] || 0} />
								</Button>
							))}
						</Space>
					</Card>
				</Col>

				<Col xs={24} md={16} lg={18}>
					<Card bodyStyle={{ padding: 12 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
							<Title level={4} style={{ margin: 0 }}>{selectedSubject === 'All' ? 'All Notes' : `${selectedSubject} Notes`}</Title>
							<Text type="secondary">Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}</Text>
						</div>

						<Table
							dataSource={filtered}
							columns={columns}
							rowKey="id"
							pagination={{ pageSize: 8 }}
							size="middle"
							bordered
							locale={{ emptyText: <Text type="secondary">No notes found</Text> }}
						/>
					</Card>
				</Col>
			</Row>

			{/* Feedback modal shown when assignment downloads clicked */}
			<Modal
				open={showFeedbackModal}
				onCancel={() => setShowFeedbackModal(false)}
				footer={null}
			>
				<p>Dear students, please share your feedback on previous live session. Your input help us improve and enhance your learning expereience. thank you!</p>
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
					<Button onClick={() => setShowFeedbackModal(false)} style={{ borderRadius: 6, padding: '6px 14px' }}>
						Close
					</Button>
					<Button
						type="primary"
						onClick={() => { setShowFeedbackModal(false); navigate('/lvc-feedback'); }}
						style={{ borderRadius: 6, padding: '6px 14px' }}
					>
						Feedback
					</Button>
				</div>
			</Modal>
		</div>
	);
}
