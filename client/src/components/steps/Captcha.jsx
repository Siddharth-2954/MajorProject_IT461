import { Form, Input, Button, Row, Col } from "antd";
import { useState } from "react";

function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Captcha({ onValidate }) {
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
    onValidate(e.target.value === captcha); // valid if input matches captcha
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setInput("");
    onValidate(false); // reset validation
  };

  return (
    <Form.Item label="Captcha">
      <Row gutter={8}>
        <Col>
          <div
            style={{
              padding: "6px 12px",
              background: "#f0f0f0",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "3px",
              userSelect: "none",
              display: "inline-block",
            }}
          >
            {captcha}
          </div>
        </Col>
        <Col>
          <Button onClick={refreshCaptcha}>Refresh</Button>
        </Col>
      </Row>

      <Input
        placeholder="Enter captcha here"
        value={input}
        onChange={handleChange}
        style={{ marginTop: "8px" }}
      />
    </Form.Item>
  );
}
