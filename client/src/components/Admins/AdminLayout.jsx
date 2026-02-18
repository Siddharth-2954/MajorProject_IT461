import React, { useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar } from "antd";
import {
  BarChartOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../AuthContext";

const { Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Determine which menu item should be active based on the current path
  let selectedKey = "dashboard";
  if (location.pathname.startsWith("/admin/students-list")) selectedKey = "students";
  else if (location.pathname.startsWith("/admin/courses")) selectedKey = "courses";
  else if (location.pathname.startsWith("/admin/profile")) selectedKey = "profile";
  else if (location.pathname.startsWith("/admin/security-settings")) selectedKey = "profile";
  else if (location.pathname === "/admin" || location.pathname === "/admin/") selectedKey = "dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, margin: 16, color: "#fff", fontWeight: 600 }}>
          LMS Admin
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          
          <Menu.Item
            key="dashboard"
            icon={<BarChartOutlined />}
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="students"
            icon={<TeamOutlined />}
            onClick={() => navigate("/admin/students-list")}
          >
            Students
          </Menu.Item>
          <Menu.Item
            key="courses"
            icon={<BookOutlined />}
            onClick={() => navigate("/admin/courses")}
          >
            Courses
          </Menu.Item>
          <Menu.Item
            key="profile"
            icon={<UserOutlined />}
            onClick={() => navigate("/admin/profile")}
          >
            Profile
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
