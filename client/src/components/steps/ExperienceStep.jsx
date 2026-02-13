import { Form, Input } from "antd";

export default function ExperienceStep() {
  return (
    <>
      <Form.Item
        name="experience"
        label="Years of Experience"
        rules={[{ required: true, message: "Experience is required" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="company"
        label="Current Company"
        rules={[{ required: true, message: "Company name is required" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="mobile"
        label="Mobile Number"
        rules={[
          { required: true, message: "Mobile number is required" },
          { pattern: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
        ]}
      >
        <Input maxLength={10} />
      </Form.Item>
    </>
  );
}
