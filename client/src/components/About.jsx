import React from "react";
import { RocketOutlined, BookOutlined, TeamOutlined, ClockCircleOutlined, GlobalOutlined } from "@ant-design/icons";
import { Typography, Button } from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section
        className="w-full text-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(6,21,57,0.85), rgba(6,21,57,0.6)), url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="py-20">
          <Title level={1} className="!text-white mb-4">
            About Our Learning Platform
          </Title>
          <Paragraph className="!text-white max-w-3xl mx-auto">
            We are committed to creating a vibrant, modern and inclusive learning
            environment where learners can grow their knowledge, gain practical
            skills and connect with experienced educators. Our goal is to make
            high-quality education accessible, engaging and relevant for all
            learners — whether you're preparing for exams, upskilling for your
            career, or learning for curiosity.
          </Paragraph>
          <div className="mt-6">
            <Link to="/events">
              <Button type="primary" size="large">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <section className="mb-10">
          <Title level={2}>Our Mission</Title>
          <Paragraph className="text-lg">
            At the heart of our platform is a simple belief: learning should be
            flexible, focused and student-first. We blend well-structured
            curriculum, live interactive sessions, and a supportive community to
            deliver an experience that helps learners progress confidently and
            measurably.
          </Paragraph>
        </section>

        <section className="mb-10">
          <Title level={2}>What We Offer</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-6 border rounded-lg shadow-lg bg-white">
              <div className="text-3xl text-blue-600 mb-3">
                <RocketOutlined />
              </div>
              <h3 className="font-semibold text-lg">Practical Courses</h3>
              <p className="text-sm text-gray-600 mt-2">
                Hands-on lessons and structured modules designed to build real
                skills you can apply immediately.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-lg bg-white">
              <div className="text-3xl text-blue-600 mb-3">
                <BookOutlined />
              </div>
              <h3 className="font-semibold text-lg">Curated Content</h3>
              <p className="text-sm text-gray-600 mt-2">
                Carefully selected materials, concise notes, and summaries to
                complement live learning and self-study.
              </p>
            </div>

            <div className="p-6 border rounded-lg shadow-lg bg-white">
              <div className="text-3xl text-blue-600 mb-3">
                <TeamOutlined />
              </div>
              <h3 className="font-semibold text-lg">Expert Mentors</h3>
              <p className="text-sm text-gray-600 mt-2">
                Experienced instructors who guide, motivate and answer queries
                during live sessions and office hours.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <Title level={2}>Why Learners Choose Us</Title>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <ClockCircleOutlined className="text-blue-600 text-xl mt-1" />
              <div>
                <strong>Flexible schedules:</strong> Attend live sessions or
                access recordings at your convenience.
              </div>
            </li>

            <li className="flex items-start gap-3">
              <GlobalOutlined className="text-blue-600 text-xl mt-1" />
              <div>
                <strong>Global community:</strong> Learn alongside peers from
                varied backgrounds and share diverse perspectives.
              </div>
            </li>

            <li className="flex items-start gap-3">
              <RocketOutlined className="text-blue-600 text-xl mt-1" />
              <div>
                <strong>Outcome-focused:</strong> We prioritize clarity,
                assessment and practical projects to help you achieve goals.
              </div>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <Title level={2}>Our Commitments</Title>
          <Paragraph>
            - Provide transparent, well-structured courses that respect your
            time.{"\n"}
            - Maintain an approachable support system for learners and mentors.
            {"\n"}
            - Continuously improve content based on feedback and outcomes.
          </Paragraph>
        </section>

        <section className="py-8 text-center">
          <Title level={3}>Get Started</Title>
          <Paragraph className="max-w-2xl mx-auto">
            Explore our schedules, join live sessions, or start a self-paced
            module — we have something for every learner. Visit the events
            page to see upcoming live classes and webinars.
          </Paragraph>
        </section>
      </main>
    </div>
  );
}