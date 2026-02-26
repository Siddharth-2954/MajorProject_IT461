import React, { useContext } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import WebinarHome from "./components/WebinarHome";
import WebinarList from "./components/Webinars/WebinarList";
import WebinarDetails from "./components/Webinars/WebinarDetails";
import WebinarListPdf from "./components/Webinars/WebinarListPdf";
import StepForm from "./components/StepForm";
import Home from "./components/Home";
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import StudyMaterialHome from "./components/StudyMaterialHome";
import StudyMaterialFoundation from "./components/StudyMaterials/StudyMaterialFoundation";
import StudyMaterialIntermediate from "./components/StudyMaterials/StudyMaterialIntermediate";
import StudyMaterialFinal from "./components/StudyMaterials/StudyMaterialFinal";
import StudyMaterialSelfPaced from "./components/StudyMaterials/StudyMaterialsSelfPaced";
import UpcomingEventHome from "./components/UpcomingEventHome";
import LVC from "./components/upcoming_events/LVC";
import LVRC from "./components/upcoming_events/LVRC";
import { Table, Card, Typography } from 'antd';
import AnnouncementsLMS from "./components/Announcements/AnnouncementsLMS";
import AnnouncementsExam from "./components/Announcements/AnnouncementsExam";
import AnnouncementDetail from "./components/Announcements/AnnouncementDetail";
import Mocktest from "./components/upcoming_events/mocktest";
import MocktestDetail from "./components/upcoming_events/MocktestDetail";
import Webinar from "./components/upcoming_events/Webinar";
import ModelTest from "./components/model_test_paper/ModelTest";
import QP from "./components/question_paper/QP";
import RevisionHome from "./components/RevisionHome";
import RevisionDetails from "./components/revision_paper/RevisionDetails";
import SuggestAnswerHome from "./components/SuggestAnswerHome";
import SuggestAnswerDetails from "./components/suggest_answer/SuggestAnswerDetails";
import MockTestHome from "./components/MockTestHome";
import Navbar from "./Navbar";
import ScrollTopButton from "./components/ScrollTopButton";
import About from "./components/About";
import Contact from "./components/Contact";
import StudentHome from "./components/Students/StudentHome";
import LVC_Feedback from "./components/Students/LVC_Feedback";
import ProtectedRoute from './ProtectedRoute';
import LVRC_Feedback from "./components/Students/LVRC_Feedback";
import LiveClasses from "./components/Students/LiveClasses";
import DownloadNotes from "./components/Students/DownloadNotes";
import MCQDashboard from "./components/Students/MCQDashboard";
import AdminHome from "./components/Admins/AdminHome";
import AdminLayout from "./components/Admins/AdminLayout";
import StudyMaterialViewer from "./components/StudyMaterialViewer";
import StudentsList from "./components/Admins/StudentsList";
import AdminLogin from "./components/Admins/AdminLogin";
import AdminProfile from "./components/Admins/AdminProfile";
import AdminSecuritySettings from "./components/Admins/AdminSecuritySettings";
import AccountActivity from "./components/Admins/AccountActivity";
import AdminAnnouncements from "./components/Admins/AdminAnnouncements";
import AdminAnnouncementsLMS from "./components/Admins/AdminAnnouncementsLMS";
import AdminAnnouncementsExam from "./components/Admins/AdminAnnouncementsExam";
import StudyMaterialsAdmin from "./components/Admins/StudyMaterialsAdmin";
import SuperAdminHome from "./components/SuperAdmin/SuperAdminHome";
import SubjectsAdmin from "./components/SuperAdmin/SubjectsAdmin";
import SubjectDetail from "./components/SuperAdmin/SubjectDetail";
import SubjectsListForMCQ from "./components/SuperAdmin/SubjectsListForMCQ";
import ChaptersForMCQ from "./components/SuperAdmin/ChaptersForMCQ";
import CreateMCQQuiz from "./components/SuperAdmin/CreateMCQQuiz";
import PreviousQuizzes from "./components/SuperAdmin/PreviousQuizzes";
import { SuperAdminRoute } from "./components/SuperAdmin/SuperAdminRoute";
import { AuthContext } from "./AuthContext";
import FeedbacksAdmin from "./components/SuperAdmin/FeedbacksAdmin";
import MCQQuizBuilder from "./components/SuperAdmin/MCQQuizBuilder";

const { Title } = Typography;


export default function App() {
  const location = useLocation();
  const { user, authLoading } = useContext(AuthContext);

  const isAdminUser = !!(
    user &&
    (user.isAdmin ||
      (user.registrationId && String(user.registrationId).startsWith("WRO")))
  );

  return (
    <>
      {/* Simple top navbar — render during auth loading to avoid flicker/hiding from stale localStorage */}
      <Navbar />
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Students Login page */}
        <Route
          path="/students-login"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 border border-gray-300 rounded-lg">
              {/* Centered card container for the form */}
              <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-2xl font-bold text-center mb-6">
                  Multi Step Form
                </h1>
                <StepForm />
              </div>
            </div>
          }
        />

        {/* Webinar Routes */}
        <Route path="/webinars" element={<WebinarHome />} />
        <Route path="/webinars/list" element={<WebinarList />} />
        <Route path="/webinars/pdf" element={<WebinarListPdf />} />
        <Route path="/webinars/:id" element={<WebinarDetails />} />

        {/* Study Material Routes */}
        <Route path="/study-materials" element={<StudyMaterialHome />} />
        <Route path="/study-materials/foundation" element={<StudyMaterialFoundation />} />
        <Route path="/study-materials/intermediate" element={<StudyMaterialIntermediate />} />
        <Route path="/study-materials/final" element={<StudyMaterialFinal />} />
        <Route path="/study-materials/self-paced" element={<StudyMaterialSelfPaced />} />
        {/* Viewer for individual uploaded PDFs (admin-protected) */}

        {/* Upcoming Event Routes */}
        <Route path="/events" element={<UpcomingEventHome />} />
        <Route path="/events/lvc" element={<LVC />} />
        <Route path="/events/lvrc" element={<LVRC />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/announcements/lms" element={<AnnouncementsLMS />} />
        <Route path="/announcements/exam" element={<AnnouncementsExam />} />
        <Route path="/announcements/lms/:id" element={<AnnouncementDetail />} />
        <Route path="/announcements/exam/:id" element={<AnnouncementDetail />} />
        <Route path="/events/mocktest" element={<Mocktest />} />
        <Route path="/events/mocktest/:id" element={<MocktestDetail />} />
        <Route path="/events/webinar" element={<Webinar />} />

        {/* Model Test Paper Routes */}
        <Route path="/model-test-papers" element={<ModelTest />} />

        {/* Question Paper Routes */}
        <Route path="/previous-papers" element={<QP />} />

        {/* Suggested Answers */}
        <Route path="/suggested-answers" element={<SuggestAnswerHome />} />
        <Route path="/suggested-answers/:id" element={<SuggestAnswerDetails />} />

        {/* Revision Test Routes */}
        <Route path="/revision-tests" element={<RevisionHome />} />
        <Route path="/revision-tests/:id" element={<RevisionDetails />} />

        {/* Suggested Answer Routes */}
        <Route path="/suggested-answers" element={<SuggestAnswerHome />} />

        {/* Mock Test Paper Routes */}
        <Route path="/mock-tests" element={<MockTestHome />} />
          
        {/* Students Routes */}
        <Route path="/home" element={<ProtectedRoute><StudentHome/></ProtectedRoute>} />
        <Route path="/lvc_feedback" element={<ProtectedRoute><LVC_Feedback/></ProtectedRoute>} />
        <Route path="/lvc-feedback" element={<ProtectedRoute><LVC_Feedback/></ProtectedRoute>} />
        <Route path="/lvrc_feedback" element={<ProtectedRoute><LVRC_Feedback/></ProtectedRoute>} />
        <Route path="/live_classes" element={<ProtectedRoute><LiveClasses/></ProtectedRoute>} />
        <Route path="/download-notes" element={<ProtectedRoute><DownloadNotes/></ProtectedRoute>} />
        <Route path="/mcq-dashboard" element={<ProtectedRoute><MCQDashboard/></ProtectedRoute>} />


        <Route path="/admin/!login" element={<AdminLogin/>} />
        
        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <SuperAdminRoute>
            <SuperAdminHome />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/lvc" element={
          <SuperAdminRoute>
            <LVC />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/lvrc" element={
          <SuperAdminRoute>
            <LVRC />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/subjects" element={
          <SuperAdminRoute>
            <SubjectsAdmin />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/subjects/:id" element={
          <SuperAdminRoute>
            <SubjectDetail />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/subjects-list" element={
          <SuperAdminRoute>
            <SubjectsListForMCQ />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/mcq/subjects/:id" element={
          <SuperAdminRoute>
            <ChaptersForMCQ />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/feedbacks" element={
          <SuperAdminRoute>
            <FeedbacksAdmin />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/prev-quiz" element={
          <SuperAdminRoute>
            <PreviousQuizzes />
          </SuperAdminRoute>
        } />
        <Route path="/super-admin/mcq/create/:subjectId/:chapterId" element={
          <SuperAdminRoute>
            <MCQQuizBuilder />
          </SuperAdminRoute>
        } />

        {/* Regular Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>
          <Route index element={<AdminHome/>} />
          <Route path="students-list" element={<StudentsList/>} />
          <Route path="announcements" element={<AdminAnnouncements/>} />
          <Route path="announcements/lms" element={<AdminAnnouncementsLMS/>} />
          <Route path="announcements/exam" element={<AdminAnnouncementsExam/>} />
          <Route path="profile" element={<AdminProfile/>} />
          <Route path="security-settings" element={<AdminSecuritySettings/>} />
          <Route path="profile/account-activity" element={<AccountActivity/>} />
          <Route path="study-materials" element={<StudyMaterialsAdmin/>} />
          <Route path="uploads/study-materials/:filename" element={<StudyMaterialViewer/>} />
        </Route>
      </Routes>

      <ScrollTopButton />

      <footer className="w-full bg-gray-300 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Follow Us */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Follow us:
            </span>

            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white text-gray-600 hover:bg-blue-600 hover:text-white transition"
            >
              <FacebookOutlined />
            </a>

            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white text-gray-600 hover:bg-sky-500 hover:text-white transition"
            >
              <TwitterOutlined />
            </a>

            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white text-gray-600 hover:bg-blue-700 hover:text-white transition"
            >
              <LinkedinOutlined />
            </a>
          </div>

          {/* Right: Copyright */}
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} LMS. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}