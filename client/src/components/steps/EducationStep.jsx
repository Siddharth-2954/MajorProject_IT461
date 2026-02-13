import { Form, Input, Select } from "antd";

const { Option } = Select;

export default function EducationStep() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Highest Qualification */}
      <Form.Item
        name="qualification"
        label="Highest Qualification"
        rules={[
          { required: true, message: "Qualification is required" },
        ]}
      >
        <Select placeholder="Select qualification">
          <Option value="highschool">High School</Option>
          <Option value="diploma">Diploma</Option>
          <Option value="bachelor">Bachelor's</Option>
          <Option value="master">Master's</Option>
          <Option value="phd">PhD</Option>
        </Select>
      </Form.Item>

      {/* Field of Study */}
      <Form.Item
        name="fieldOfStudy"
        label="Field of Study"
        rules={[
          { required: true, message: "Field of study is required" },
        ]}
      >
        <Input placeholder="Computer Science, Commerce, etc." />
      </Form.Item>

      {/* University / College */}
      <Form.Item
        name="institution"
        label="University / College"
        rules={[
          { required: true, message: "Institution name is required" },
        ]}
      >
        <Input />
      </Form.Item>

      {/* Year of Passing */}
      <Form.Item
        name="yearOfPassing"
        label="Year of Passing"
        rules={[
          { required: true, message: "Year of passing is required" },
          {
            pattern: /^(19|20)\d{2}$/,
            message: "Enter a valid year",
          },
        ]}
      >
        <Input maxLength={4} />
      </Form.Item>

      {/* Grade / Percentage */}
      <Form.Item
        name="grade"
        label="Grade / Percentage"
        rules={[
          { required: true, message: "Grade or percentage is required" },
        ]}
      >
        <Input placeholder="e.g. 8.5 CGPA / 75%" />
      </Form.Item>
    </div>
  );
}
