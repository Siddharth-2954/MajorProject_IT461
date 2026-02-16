import { Steps, Form, Button, message } from "antd";
import { useState } from "react";
import {
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  LaptopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PersonalStep from "./steps/PersonalStep";
import AddressStep from "./steps/AddressStep";
import EducationStep from "./steps/EducationStep";
import ExperienceStep from "./steps/ExperienceStep";
import Captcha from "./steps/Captcha";

const steps = [
  {
    title: "Personal",
    fields: ["firstName", "lastName", "email", "mobile", "password", "confirmPassword", "dob"],
    content: <PersonalStep />,
    icon: <UserOutlined />,
  },
  {
    title: "Address",
    fields: ["registrationId", "addressLine1", "addressLine2", "city", "state", "pincode", "country"],
    content: <AddressStep />,
    icon: <HomeOutlined />,
  },
  {
    title: "Education",
    fields: ["qualification"],
    content: <EducationStep />,
    icon: <BookOutlined />,
  },
  {
    title: "Experience",
    fields: ["experience", "company", "mobile"],
    content: <ExperienceStep />,
    hasCaptcha: true,
    icon: <LaptopOutlined />,
  },
];

export default function StepForm() {
  const [current, setCurrent] = useState(0);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const next = async () => {
    try {
      await form.validateFields(steps[current].fields);
      setCurrent(current + 1);
    } catch {
      message.error("Please complete required fields");
    }
  };

  const submit = async () => {
    try {
      await form.validateFields();

      if (!captchaValid) {
        message.error("Please solve the captcha");
        return;
      }

      const allData = form.getFieldsValue(true);

      // send to server
      try {
        console.log('Submitting form data:', allData);
        const res = await fetch('http://localhost:8000/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(allData),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          message.success('Form submitted successfully 🎉');
          form.resetFields();
          navigate('/');
        } else {
          message.error(json.error || 'Submission failed');
        }
      } catch (err) {
        console.error('submit error', err);
        message.error('Server error');
      }
    } catch {
      message.error("Fix validation errors");
    }
  };


  return (
    <div className="container">

    <Form form={form} layout="vertical">

      {/* Steps with icons */}
      <Steps
        current={current}
        className="mb-6"
        items={steps.map((step) => ({
          key: step.title,
          title: step.title,
          icon: step.icon,
        }))}
        />

      {/* Step Content */}
      <div className="bg-white p-6 rounded shadow">
        {steps[current].content}
        {steps[current].hasCaptcha && <Captcha onValidate={setCaptchaValid} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-2 mt-6">

        <Button onClick={() => navigate("/")}>Back to Home</Button>

        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>Previous</Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={submit}>
            Submit
          </Button>
        )}
      </div>
    </Form>
        </div>
  );
}