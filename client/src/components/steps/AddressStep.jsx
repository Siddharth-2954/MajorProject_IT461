import { Form, Input } from "antd";

export default function AddressStep() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Form.Item
        name="addressLine1"
        label="Address Line 1"
        rules={[{ required: true, message: "Address Line 1 is required" }]}
      >
        <Input placeholder="House no, Street name" />
      </Form.Item>

      <Form.Item name="addressLine2" label="Address Line 2">
        <Input placeholder="Apartment, landmark (optional)" />
      </Form.Item>

      <Form.Item
        name="city"
        label="City"
        rules={[{ required: true, message: "City is required" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="state"
        label="State"
        rules={[{ required: true, message: "State is required" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="pincode"
        label="Pincode"
        rules={[
          { required: true, message: "Pincode is required" },
          { pattern: /^[0-9]{6}$/, message: "Enter valid 6-digit pincode" },
        ]}
      >
        <Input maxLength={6} />
      </Form.Item>

      <Form.Item
        name="country"
        label="Country"
        rules={[{ required: true, message: "Country is required" }]}
      >
        <Input />
      </Form.Item>
    </div>
  );
}
