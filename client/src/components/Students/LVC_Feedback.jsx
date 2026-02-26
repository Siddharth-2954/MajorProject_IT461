import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  DatePicker,
  Select,
  Spin,
  message,
  Input,
  Rate,
  Radio,
  Button,
} from "antd";
const { Option } = Select;
import dayjs from "dayjs";
import { AuthContext } from "../../AuthContext";

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

const defaultBg = 
  "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80";

export default function LVC_Feedback() {
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [basicFilled, setBasicFilled] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);

  useEffect(() => {
    // Fetch all LVC schedules
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const response = await fetch(`${API_BASE}/schedules/lvc`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.schedules) {
          setSchedules(data.schedules);
          // Extract unique dates
          const dates = [...new Set(data.schedules.map(s => s.scheduledDate))];
          setUniqueDates(dates.sort());
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
        message.error('Failed to load schedules');
      } finally {
        setLoadingSchedules(false);
      }
    };
    
    fetchSchedules();
  }, []);

  const styles = {
    hero: {
      height: 220,
      backgroundImage: `url(${defaultBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      position: "relative",
    },
    overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },
    content: { position: "relative", textAlign: "center", zIndex: 2 },
    title: { margin: 0, fontSize: "2rem", fontWeight: 700 },
    sectionWrap: { maxWidth: 1200, margin: "1.5rem auto", padding: "0 1rem" },
    mainCard: {
      borderRadius: 0,
      background: "#d9d9dc",
      padding: 16,
      width: "100%",
    },
    panelHeader: { fontSize: "1.1rem", color: "#1f3a5f", fontWeight: 700 },
  };

  // Helper function to extract hour from HH:mm:ss format
  function getHourFromTime(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10);
  }

  // Check if a schedule's start time matches the selected session
  function scheduleMatchesSession(schedule, session) {
    if (!session || !schedule.startTime) return false;
    const hour = getHourFromTime(schedule.startTime);
    
    if (session === 'morning') return hour >= 5 && hour < 12;
    if (session === 'afternoon') return hour >= 12 && hour < 17;
    if (session === 'evening') return hour >= 17 && hour < 24;
    return false;
  }

  // Get available sessions for a given date
  function getAvailableSessionsForDate(dateStr) {
    const dateSchedules = schedules.filter(s => s.scheduledDate === dateStr);
    const sessions = new Set();
    
    dateSchedules.forEach(schedule => {
      if (scheduleMatchesSession(schedule, 'morning')) sessions.add('morning');
      if (scheduleMatchesSession(schedule, 'afternoon')) sessions.add('afternoon');
      if (scheduleMatchesSession(schedule, 'evening')) sessions.add('evening');
    });
    
    return Array.from(sessions);
  }

  // Fetch event details based on selected date and session
  async function fetchEventDetails(dateStr, session) {
    // Filter schedules by date
    const dateSchedules = schedules.filter(s => s.scheduledDate === dateStr);
    
    if (!dateSchedules || dateSchedules.length === 0) {
      return null;
    }

    // Filter by session (matching startTime to session)
    let matched = null;
    if (session) {
      matched = dateSchedules.find(s => scheduleMatchesSession(s, session));
    }
    
    // If no match found for session, return first schedule of the day
    const schedule = matched || dateSchedules[0];
    
    return {
      paper: schedule.subjectName || 'Unknown Subject',
      speaker: schedule.instructorName || 'Unknown Instructor',
      topic: schedule.title || '',
    };
  }

  function onValuesChange(changedValues, allValues) {
    const lectureVal =
      allValues.lectureDate || form.getFieldValue("lectureDate");
    const sessionVal = allValues.session || form.getFieldValue("session");
    const hasDate = !!lectureVal;
    const hasSession = !!sessionVal;
    
    // Check if selected date has a lecture schedule
    let dateStr = "";
    let hasValidDate = false;
    if (hasDate) {
      try {
        dateStr =
          typeof lectureVal.format === "function"
            ? lectureVal.format("YYYY-MM-DD")
            : String(lectureVal);
        hasValidDate = uniqueDates.includes(dateStr);
      } catch (e) {
        dateStr = String(lectureVal);
      }
    }
    
    // If date changed, update available sessions
    if (changedValues.lectureDate && hasValidDate) {
      const sessions = getAvailableSessionsForDate(dateStr);
      setAvailableSessions(sessions);
      
      // Clear session if it's not available for the selected date
      if (sessionVal && !sessions.includes(sessionVal)) {
        form.setFieldsValue({ session: undefined, paper: "", speaker: "", topic: "" });
        setBasicFilled(false);
        return;
      }
    }
    
    setBasicFilled(hasDate && hasSession && hasValidDate);

    if (!hasDate || !hasValidDate) {
      form.setFieldsValue({ paper: "", speaker: "", topic: "" });
      return;
    }

    // clear while loading
    form.setFieldsValue({ paper: "", speaker: "", topic: "" });
    setLoadingEvent(true);
    fetchEventDetails(dateStr, sessionVal || undefined)
      .then((res) => {
        if (res)
          form.setFieldsValue({
            paper: res.paper,
            speaker: res.speaker,
            topic: res.topic,
          });
        else message.info("No event found for selected date and session");
      })
      .catch((err) => {
        console.error(err);
        message.error("Error loading event details");
      })
      .finally(() => setLoadingEvent(false));
  }

  function handleSubmit() {
    form
      .validateFields()
      .then(async (values) => {
        try {
          const lectureDate = values.lectureDate ? values.lectureDate.format("YYYY-MM-DD") : null;
          
          // Find the schedule ID for this date and session
          const dateSchedules = schedules.filter(s => s.scheduledDate === lectureDate);
          let scheduleId = null;
          if (dateSchedules.length > 0) {
            const matched = dateSchedules.find(s => scheduleMatchesSession(s, values.session));
            scheduleId = matched ? matched.id : dateSchedules[0].id;
          }

          if (!scheduleId) {
            message.error("No schedule found for this date/session. Please reselect the lecture.");
            return;
          }

          const derivedName =
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.fullName ||
            user?.name ||
            user?.registrationId ||
            "Unknown";

          const feedbackData = {
            scheduleId: scheduleId,
            scheduleType: "lvc",
            studentId: user?.registrationId || "unknown",
            studentName: derivedName,
            studentEmail: user?.email || "",
            lectureDate: lectureDate,
            session: values.session,
            subject: values.paper,
            instructor: values.speaker,
            topic: values.topic,
            quality: values.quality,
            aligned: values.aligned,
            explanation: values.explanation,
            pace: values.pace,
            interaction: values.interaction,
            timings: values.timings,
            av_quality: values.av_quality,
            technical_issues: values.technical_issues,
            feedback_ease: values.feedback_ease,
            escalation_awareness: values.escalation_awareness,
            escalation_experience: values.escalation_experience,
            feedback_valued: values.feedback_valued,
            material_provided: values.material_provided,
            material_quality: values.material_quality,
            material_aligned: values.material_aligned,
            material_suggestions: values.material_suggestions,
            language_clarity: values.language_clarity,
            language_preference: values.language_preference,
            language_suggestions: values.language_suggestions,
            liked_most: values.liked_most,
            could_improve: values.could_improve,
            other_comments: values.other_comments,
          };

          const response = await fetch(`${API_BASE}/feedbacks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(feedbackData),
          });

          if (!response.ok) {
            throw new Error("Failed to submit feedback");
          }

          message.success("Feedback submitted successfully. Thank you!");
          form.resetFields();
          setBasicFilled(false);
        } catch (err) {
          console.error("Error submitting feedback:", err);
          message.error(err.message || "Failed to submit feedback");
        }
      })
      .catch(() =>
        message.error("Please complete required fields before submitting."),
      );
  }

  return (
    <div className="lvc-feedback-root">
      

      <header style={styles.hero}>
        <div style={styles.overlay} />
        <div style={styles.content}>
          <h1 style={styles.title}>Feedback</h1>
        </div>
      </header>

      <section style={styles.sectionWrap}>
        <div style={styles.mainCard}>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={styles.panelHeader}>1. Basic information</span>
              {loadingEvent && <Spin size="small" />}
            </div>

            <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
              <div style={{ display: "flex", gap: 12 }}>
                <Form.Item
                  name="lectureDate"
                  label={
                    <span style={{ color: "#333", fontWeight: 600 }}>
                      Lecture Date
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a date" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const dateStr = value.format("YYYY-MM-DD");
                        if (!uniqueDates.includes(dateStr)) {
                          return Promise.reject(
                            new Error("This date does not have any lecture schedule. Please select a date with scheduled lectures.")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <DatePicker 
                    style={{ width: "100%" }}
                    loading={loadingSchedules}
                  />
                </Form.Item>

                <Form.Item
                  name="session"
                  label={
                    <span style={{ color: "#333", fontWeight: 600 }}>
                      Session
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a session" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const lectureVal = form.getFieldValue("lectureDate");
                        if (!lectureVal) return Promise.resolve();
                        
                        const dateStr = lectureVal.format("YYYY-MM-DD");
                        if (!availableSessions.includes(value)) {
                          return Promise.reject(
                            new Error("No event is scheduled in this time slot for the selected date.")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Select placeholder="Select session">
                    <Option value="morning">Morning</Option>
                    <Option value="afternoon">Afternoon</Option>
                    <Option value="evening">Evening</Option>
                  </Select>
                </Form.Item>
              </div>

              {basicFilled && (
                  <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Form.Item
                        name="paper"
                        label={
                          <span style={{ color: "#333", fontWeight: 600 }}>
                            Subject
                          </span>
                        }
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Auto-filled from schedule" readOnly />
                      </Form.Item>
                      <Form.Item
                        name="speaker"
                        label={
                          <span style={{ color: "#333", fontWeight: 600 }}>
                            Instructor
                          </span>
                        }
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Auto-filled from schedule" readOnly />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="topic"
                      label={
                        <span style={{ color: "#333", fontWeight: 600 }}>
                          Topic
                        </span>
                      }
                      style={{ marginTop: 12 }}
                    >
                      <Input placeholder="Auto-filled from schedule" readOnly />
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 6, display: "flex", gap: 12 }}>
                      <span style={styles.panelHeader}>
                        2. Class experience
                      </span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      How was the overall quality of the live class ?
                    </div>
                    <Form.Item name="quality" style={{ marginTop: 8 }}>
                      <Rate />
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Was the content relevant and aligned with syllabus ?
                    </div>
                    <Form.Item name="aligned" style={{ marginTop: 8}}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="yes">Yes</Radio>
                        <Radio value="somewhat">Somewhat</Radio>
                        <Radio value="no">No</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div>
                      How clear and effective was the faculty explanation?
                    </div>
                    <Form.Item name="explanation" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="clear">Clear</Radio>
                        <Radio value="neutral">Neutral</Radio>
                        <Radio value="somewhat_clear">Somewhat Clear</Radio>
                        <Radio value="unclear">Unclear</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div>
                      Was the pace of the class appropriate ?
                    </div>
                    <Form.Item name="pace" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="too_fast">Too Fast</Radio>
                        <Radio value="neutral">Neutral</Radio>
                        <Radio value="too_slow">Too Slow</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div>
                      How was the interaction and doubt solving during the class ?
                    </div>
                    <Form.Item name="interaction" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="very_good">Very Good</Radio>
                        <Radio value="good">Good</Radio>
                        <Radio value="neutral">Neutral</Radio>
                        <Radio value="poor">Poor</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div>
                      Were the class timings convenient for you ?
                    </div>
                    <Form.Item name="timings" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                      </Radio.Group>
                    </Form.Item>

                    
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span style={styles.panelHeader}>
                        3. Technical aspects
                      </span>
                    </div>
                    <div>
                      How was the audio / video quality during the class?
                    </div>
                    <Form.Item name="av_quality" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="excellent">Excellent</Radio>
                        <Radio value="good">Good</Radio>
                        <Radio value="neutral">Neutral</Radio>
                        <Radio value="poor">Poor</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Did you face any technical issues during the class?
                    </div>
                    <Form.Item name="technical_issues" style={{ marginTop: 8 }}>
                      <Input.TextArea
                        rows={3}
                        placeholder="Did you face any technical issues during the class?"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span style={styles.panelHeader}>
                        4. Feedback Handling and Escalation
                      </span>
                    </div>
                    <div>
                      Was it easy to share your feedback during or after the
                      class?
                    </div>
                    <Form.Item name="feedback_ease" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="very_easy">Very Easy</Radio>
                        <Radio value="easy">Easy</Radio>
                        <Radio value="neutral">Neutral</Radio>
                        <Radio value="difficult">Difficult</Radio>
                        <Radio value="very_difficult">Very Difficult</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Are you aware of the process to escalate issues to the
                      System?
                    </div>
                    <Form.Item
                      name="escalation_awareness"
                      style={{ marginTop: 8 }}
                    >
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Have you ever escalated an issue? If yes, was the
                      resolution satisfactory?
                    </div>
                    <Form.Item
                      name="escalation_experience"
                      style={{ marginTop: 8 }}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Have you ever escalated an issue? If yes, was the resolution satisfactory?"
                      />
                    </Form.Item>

                    <div>
                      Do you feel your feedback is valued and acted upon by the System?
                    </div>
                    <Form.Item name="feedback_valued" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="too_fast">Always</Radio>
                        <Radio value="neutral">Sometimes</Radio>
                        <Radio value="too_slow">Rarely</Radio>
                        <Radio value="never">Never</Radio>
                        <Radio value="Not Sure">Not Sure</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span style={styles.panelHeader}>
                        5. Reference material
                      </span>
                    </div>
                    <div>Was study material provided in the class?</div>
                    <Form.Item
                      name="material_provided"
                      style={{ marginTop: 8 }}
                    >
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      If yes, how would you rate the quality of the study
                      material?
                    </div>
                    <Form.Item name="material_quality" style={{ marginTop: 8 }}>
                      <Rate />
                    </Form.Item>

                    <div>
                      Was the material provided is easy to understand and alligned with the class?
                    </div>
                    <Form.Item name="material_aligned" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="too_fast">Strongly Agree</Radio>
                        <Radio value="neutral">Agree</Radio>
                        <Radio value="too_slow">Neutral</Radio>
                        <Radio value="never">Disagree</Radio>
                        <Radio value="Not Sure">Strongly Disagree</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Any suggestions to improve the reference material?
                    </div>
                    <Form.Item
                      name="material_suggestions"
                      style={{ marginTop: 8 }}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Any suggestions to improve the reference material?"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span style={styles.panelHeader}>
                        6. Language preference and accessibility
                      </span>
                    </div>
                    <div>Was the language used in classand reference material easy to understand? </div>
                    <Form.Item name="language_clarity" style={{ marginTop: 8 }}>
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="yes">Yes, English was cleasr and sufficient</Radio>
                        <Radio value="almost">Yes, local language support helped</Radio>
                        <Radio value="somewhat">Somewhat, I had difficulty understanding some parts</Radio>
                        <Radio value="no">No, I struggled with the language used</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>
                      Would you prefer future classes and materials to be in
                    </div>
                    <Form.Item
                      name="language_preference"
                      style={{ marginTop: 8 }}
                    >
                      <Radio.Group style={{display: "flex", flexDirection: "column", gap: 12}}>
                        <Radio value="english">English only</Radio>
                        <Radio value="local">Local language only</Radio>
                        <Radio value="bilingual">A mix of both languages</Radio>
                        <Radio value="no_preference">No preference</Radio>
                      </Radio.Group>
                    </Form.Item>


                    <div>Any suggestions for improving the language support or accessibility?</div>
                    <Form.Item
                      name="language_suggestions"
                      style={{ marginTop: 8 }}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Any suggestions for improving the language support or accessibility?"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span style={styles.panelHeader}>7. Suggestions</span>
                    </div>
                    <div>What did you like most about the class?</div>
                    <Form.Item name="liked_most" style={{ marginTop: 8 }}>
                      <Input.TextArea
                        rows={2}
                        placeholder="What did you like most about the class?"
                      />
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>What could be improved in future sessions?</div>
                    <Form.Item name="could_improve" style={{ marginTop: 8 }}>
                      <Input.TextArea
                        rows={2}
                        placeholder="What could be improved in future sessions?"
                      />
                    </Form.Item>

                    <div style={{ marginTop: 12 }}>Any other comments or suggestions</div>
                    <Form.Item name="other_comments" style={{ marginTop: 8 }}>
                      <Input.TextArea
                        rows={2}
                        placeholder="Any other comments or suggestions?"
                      />
                    </Form.Item>


                  </div>

                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      style={{
                        background: "linear-gradient(90deg,#165dff,#3ea0ff)",
                        border: "none",
                        padding: "10px 28px",
                        borderRadius: 6,
                        boxShadow: "0 6px 18px rgba(22,93,255,0.18)",
                      }}
                    >
                      Send Your Feedback
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}