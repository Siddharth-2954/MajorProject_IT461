import { Form, Input } from "antd";

export default function PersonalStep() {
  return (
    <>
      <Form.Item
        name="firstName"
        label="First Name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}
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
