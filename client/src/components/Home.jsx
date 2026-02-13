import React, { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, Button, Row, Col, Typography, Space, Form, Input, message } from "antd";
import { VideoCameraOutlined, TeamOutlined, BookOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import { fetchAllCourses } from "../redux/courseSlice";
import { learningFeatures } from "../data/learningFeatures";

const { Title, Paragraph } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const featuredCourse = courses.length > 0 ? courses[0] : null;
  const additionalCourses = courses.slice(1, 7);

  const importantNews = [
    {
      id: 1,
      title: "Scholarship scheme for CA Students",
      dateTime: "2025-04-16, 11:39:41",
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      title: "New batch for Advanced Accounting starts soon",
      dateTime: "2025-05-01, 09:00:00",
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      title: "Exam preparation webinar for CA Inter",
      dateTime: "2025-05-20, 17:30:00",
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  const currentNews = importantNews[currentNewsIndex];

  const handlePrevNews = () => {
    setCurrentNewsIndex((prev) =>
      prev === 0 ? importantNews.length - 1 : prev - 1,
    );
  };

  const handleNextNews = () => {
    setCurrentNewsIndex((prev) =>
      prev === importantNews.length - 1 ? 0 : prev + 1,
    );
  };

  // Auto-slide between news items every 6 seconds
  useEffect(() => {
    if (importantNews.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentNewsIndex((prev) =>
        prev === importantNews.length - 1 ? 0 : prev + 1,
      );
    }, 6000);

    return () => clearInterval(intervalId);
    // We only depend on the number of items, which is static here.
  }, [importantNews.length]);

  // Animated stats counters (start when scrolled into view)
  const [counts, setCounts] = useState({
    videos: 0,
    students: 0,
    courses: 0,
    instructors: 0,
    visitors: 0,
  });

  const statsRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const targets = {
      videos: 320,
      students: 12450,
      courses: 85,
      instructors: 42,
      visitors: 250000,
    };

    const duration = 1400; // ms

    const runAnimation = () => {
      const start = performance.now();
      runningRef.current = true;
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const next = {};
        Object.keys(targets).forEach((k) => {
          next[k] = Math.floor(targets[k] * progress);
        });
        setCounts(next);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          runningRef.current = false;
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // reset and start animation when entering view
            setCounts({ videos: 0, students: 0, courses: 0, instructors: 0, visitors: 0 });
            if (!runningRef.current) runAnimation();
          } else {
            // reset when leaving view and cancel any running animation
            setCounts({ videos: 0, students: 0, courses: 0, instructors: 0, visitors: 0 });
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            runningRef.current = false;
          }
        });
      },
      { threshold: 0.15 },
    );

    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Feedback carousel data and logic
  const feedback = [
    {
      id: "f1",
      name: "Amit Sharma",
      photo: "https://randomuser.me/api/portraits/men/11.jpg",
      text: "Great course content and excellent explanations. Helped me clear concepts quickly.",
    },
    {
      id: "f2",
      name: "Priya Singh",
      photo: "https://randomuser.me/api/portraits/women/21.jpg",
      text: "The mock tests were very similar to the real exam. Highly recommended.",
    },
    {
      id: "f3",
      name: "Rahul Verma",
      photo: "https://randomuser.me/api/portraits/men/31.jpg",
      text: "Instructors are supportive and the doubt resolution is prompt.",
    },
    {
      id: "f4",
      name: "Neha Gupta",
      photo: "https://randomuser.me/api/portraits/women/41.jpg",
      text: "Well-structured lessons with clear examples. Loved the video lectures.",
    },
    {
      id: "f5",
      name: "Vikram Patel",
      photo: "https://randomuser.me/api/portraits/men/51.jpg",
      text: "Affordable and high-quality content. The practice paper helped a lot.",
    },
    {
      id: "f6",
      name: "Sara Khan",
      photo: "https://randomuser.me/api/portraits/women/61.jpg",
      text: "Loved the teaching style and speed. Concepts are very easy to follow.",
    },
  ];

  const [activeFeedback, setActiveFeedback] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeedback((prev) => (prev + 1) % feedback.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  // compute the slice of three cards to show with active in middle when possible
  const getSliceStart = (index) => {
    if (index <= 0) return 0;
    if (index >= feedback.length - 1) return Math.max(0, feedback.length - 3);
    return Math.max(0, Math.min(index - 1, feedback.length - 3));
  };

  const sliceStart = getSliceStart(activeFeedback);

  const [loginLoading, setLoginLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  async function handleLogin(values) {
    const payload = {
      id: values.loginNumber,
      email: values.email,
      dt: values.dob,
    };
    setLoginLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        message.success("Login successful");
        // update client auth state
        try { setUser(json.user); } catch (e) {}
        navigate('/home');
      } else {
        message.error(json.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      message.error('Server error');
    } finally {
      setLoginLoading(false);
    }
  }

  // Scroll to student login when URL hash requests it
  useEffect(() => {
    if (location && location.hash === '#student-login') {
      const el = document.getElementById('student-login');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
    }
  }, [location]);

  return (
    <div className="font-sans bg-gray-100 relative">
      {/* Hero Section */}
      <section className="relative bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-8 md:py-12 px-6 md:px-12 gap-6">
          {/* Left Content */}
          <div className="md:w-1/2">
            <Title level={2} className="text-white">
              {featuredCourse ? featuredCourse.title : "Loading..."}
            </Title>
            <Paragraph className="text-gray-200">
              {featuredCourse ? featuredCourse.description : "Please wait..."}
            </Paragraph>
            <Space>
              {featuredCourse && (
                <Link to={`/CourseDetails/${featuredCourse._id}`}>
                  <Button type="primary" size="large">
                    Start Course
                  </Button>
                </Link>
              )}
              <Link to="/courses">
                <Button type="default" size="large">
                  View All
                </Button>
              </Link>
            </Space>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 w-full">
            {featuredCourse && (
              <Card
                hoverable
                cover={
                  <img
                    alt={featuredCourse.title}
                    src={featuredCourse.thumbnail}
                    className="rounded-lg w-full max-h-60 md:max-h-80 object-cover"
                  />
                }
                bodyStyle={{ display: "none" }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Important News / Updates */}
      <section className="py-10 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Title
            level={3}
            className="!mb-0 flex items-center justify-between w-full"
          >
            <span className="font-bold text-gray-900">Important News</span>
          </Title>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={handlePrevNews}
            className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Previous update"
          >
            <span className="text-blue-600 text-lg font-semibold">&lt;</span>
          </button>
          <button
            type="button"
            onClick={handleNextNews}
            className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Next update"
          >
            <span className="text-blue-600 text-lg font-semibold">&gt;</span>
          </button>
        </div>

        <Row gutter={[24, 24]} className="relative">
          {/* Important News Card - vertical layout */}
          <Col xs={24} md={12} className="h-full">
            <div key={currentNews.id} className="news-card-animated h-full">
              <Card className="rounded-xl shadow-sm overflow-hidden h-100 flex flex-col min-h-[220px] md:min-h-[300px] w-full">
                <div className="flex flex-col gap-4 flex-1">
                  <img
                    src={currentNews.image}
                    alt={currentNews.title}
                    className="w-full h-48 md:h-64 object-cover"
                  />

                  <div className="flex flex-col justify-between flex-1 p-4">
                    <Paragraph className="font-semibold text-gray-800 text-base md:text-lg">
                      {currentNews.title}
                    </Paragraph>
                    <div className="mt-2 flex items-center text-xs md:text-sm text-gray-500 gap-2">
                      <span role="img" aria-label="calendar">
                        📅
                      </span>
                      <span>{currentNews.dateTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          {/* Simple Login Card */}
          <Col xs={24} md={12} className="h-full" id="student-login">
            <Card
              title="Student Login"
              className="w-full rounded-xl shadow-sm h-100 flex flex-col min-h-[220px] md:min-h-[300px]"
              bordered
            >
              <Form
                layout="vertical"
                onFinish={handleLogin}
                className="flex-1 flex flex-col"
              >
                <Form.Item
                  label="Login Number"
                  name="loginNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your login number",
                    },
                  ]}
                >
                  <Input placeholder="Enter login number" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your email",
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                  label="Date of Birth"
                  name="dob"
                  rules={[
                    {
                      required: true,
                      message: "Please select your date of birth",
                    },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>

                <Form.Item className="mt-auto">
                  <Button type="primary" htmlType="submit" block loading={loginLoading}>
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </section>

      {/* What we offer */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <Title level={2} className="text-center mb-10">
          What we offer
        </Title>

        <Row gutter={[24, 24]}>
          {learningFeatures.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.title}>
              <Link to={item.link}>
                <Card hoverable className="h-full text-center rounded-xl">
                  <div className="text-4xl mb-4">{item.icon}</div>

                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>

                  <p className="text-sm text-gray-500">{item.description}</p>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </section>

      {/* Stats panel */}
      <section className="py-8 px-0" ref={statsRef}>
        <div className="w-full">
            <div className="bg-blue-500 overflow-hidden">
              <div className="py-8 px-4 md:px-6 ">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 items-center text-center text-white">
                {/* Animated counters */}
                {[
                  { key: "videos", label: "Video Lectures", target: 320, icon: VideoCameraOutlined },
                  { key: "students", label: "Students Enrolled", target: 12450, icon: TeamOutlined },
                  { key: "courses", label: "Courses", target: 85, icon: BookOutlined },
                  { key: "instructors", label: "Instructors", target: 42, icon: UserOutlined },
                  { key: "visitors", label: "Visitors", target: 250000, icon: EyeOutlined },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.key}>
                      <div className="flex items-center justify-center mb-2">
                        <Icon className="text-2xl md:text-3xl" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold" aria-live="polite">
                        {(counts && counts[stat.key] ? counts[stat.key].toLocaleString() : "0") + "+"}
                      </div>
                      <div className="text-sm md:text-base opacity-90 mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback carousel */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Title level={3} className="text-center mb-6">
            Student Feedback
          </Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center mb-4">
            {feedback.slice(sliceStart, sliceStart + 3).map((f, idx) => (
                <div
                key={f.id}
                className={`max-w-sm w-full bg-white border rounded-lg p-4 shadow-sm cursor-pointer transform transition-transform duration-300 ${
                  sliceStart + idx === activeFeedback ? "scale-105 shadow-lg" : ""
                }`}
                onClick={() => setActiveFeedback(sliceStart + idx)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={f.photo} alt={f.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold">{f.name}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center">
            {feedback.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveFeedback(i)}
                className={`w-4 h-4 md:w-3 md:h-3 mx-1 rounded-full transition-colors ${
                  i === activeFeedback ? "bg-blue-600" : "bg-gray-300"
                } p-0.5`}
                aria-label={`Go to feedback ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
