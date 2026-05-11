import { useRef, useState } from "react";

const API_URL = import.meta?.env?.VITE_API_URL ?? "https://your-api-gateway-url.amazonaws.com/prod/contact";
const MAX_MESSAGE = 500;

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function validate({ name, email, message }) {
  const e = {};
  if (!name.trim()) e.name = "Name is required";
  else if (name.trim().length < 2) e.name = "At least 2 characters";
  if (!email.trim()) e.email = "Email is required";
  else if (!validateEmail(email)) e.email = "Enter a valid email address";
  if (!message.trim()) e.message = "Message is required";
  else if (message.trim().length < 10) e.message = "At least 10 characters";
  return e;
}

function Toast({ toasts, removeToast }) {
  return (
    <div style={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            ...(toast.type === "success" ? styles.toastSuccess : styles.toastError),
          }}
        >
          <span style={styles.toastIcon}>{toast.type === "success" ? "OK" : "!"}</span>
          <span style={styles.toastMsg}>{toast.message}</span>
          <button style={styles.toastClose} onClick={() => removeToast(toast.id)}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const remove = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  const add = (message, type = "success") => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4500);
  };

  return { toasts, add, remove };
}

function InputField({ label, id, error, children, counter }) {
  return (
    <div style={styles.fieldGroup}>
      <div style={styles.labelRow}>
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>
        {counter}
      </div>
      {children}
      {error && (
        <span style={styles.errorMsg} role="alert">
          <span style={styles.errorDot}>*</span> {error}
        </span>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [dark, setDark] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState({});
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const t = dark ? themes.dark : themes.light;
  const isLoading = status === "loading";
  const msgLen = form.message.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_MESSAGE) return;

    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name]) {
      setErrors(validate(nextForm));
    }
  };

  const handleBlur = (e) => {
    const nextTouched = { ...touched, [e.target.name]: true };
    setTouched(nextTouched);
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);

    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      setStatus("success");
      addToast("Message sent! We'll get back to you soon.", "success");
      setForm({ name: "", email: "", message: "" });
      setTouched({});
      setErrors({});
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      addToast(err.message || "Something went wrong. Please try again.", "error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div style={{ ...styles.page, background: t.pageBg, color: t.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(110%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      <button
        style={{ ...styles.themeToggle, background: t.toggleBg, color: t.toggleText, border: `1px solid ${t.border}` }}
        onClick={() => setDark((value) => !value)}
        aria-label="Toggle color theme"
      >
        {dark ? "Light mode" : "Dark mode"}
      </button>

      <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}`, boxShadow: t.shadow, animation: "fadeUp .45s ease both" }}>
        <div style={{ ...styles.cardHeader, background: t.titleBg, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ ...styles.windowTitle, color: t.titleText }}>
            <span style={styles.windowIcon} />
            <span>Contact Form</span>
          </div>
          <div style={styles.windowControls} aria-hidden="true">
            <span style={{ ...styles.windowButton, color: t.titleText }}>-</span>
            <span style={{ ...styles.windowButton, color: t.titleText }}>□</span>
            <span style={{ ...styles.windowButton, ...styles.closeButton }}>x</span>
          </div>
        </div>

        <div style={styles.cardBody}>
          <p style={{ ...styles.eyebrow, color: t.accent }}>GET IN TOUCH</p>
          <h1 style={{ ...styles.heading, color: t.heading }}>Send a Message</h1>
          <p style={{ ...styles.subheading, color: t.muted }}>
            Fill out the form below and we'll respond within 24 hours.
          </p>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            <InputField label="Full Name" id="name" error={touched.name && errors.name}>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jane Doe"
                disabled={isLoading}
                style={{
                  ...styles.input,
                  background: t.inputBg,
                  border: `1px solid ${touched.name && errors.name ? "#dc2626" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            <InputField label="Email Address" id="email" error={touched.email && errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="jane@example.com"
                disabled={isLoading}
                style={{
                  ...styles.input,
                  background: t.inputBg,
                  border: `1px solid ${touched.email && errors.email ? "#dc2626" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            <InputField
              label="Message"
              id="message"
              error={touched.message && errors.message}
              counter={
                <span style={{ ...styles.counter, color: msgLen >= MAX_MESSAGE * 0.9 ? "#dc2626" : t.muted }}>
                  {msgLen}/{MAX_MESSAGE}
                </span>
              }
            >
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tell us about your project or inquiry..."
                disabled={isLoading}
                rows={5}
                style={{
                  ...styles.input,
                  ...styles.textarea,
                  background: t.inputBg,
                  border: `1px solid ${touched.message && errors.message ? "#dc2626" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitBtn,
                background: status === "success" ? "#16a34a" : status === "error" ? "#dc2626" : t.accent,
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading && <span style={styles.spinner} />}
              {status === "idle" && "Send Message ->"}
              {status === "loading" && "Sending..."}
              {status === "success" && "Sent!"}
              {status === "error" && "Failed - Retry"}
            </button>
          </form>
        </div>
      </div>

      <p style={{ ...styles.footerNote, color: t.muted }}>
        Secure submission. Your information is never shared.
      </p>
    </div>
  );
}

const themes = {
  dark: {
    pageBg: "#101317",
    cardBg: "#171b22",
    titleBg: "#202733",
    titleText: "#cbd5e1",
    border: "#2f3642",
    text: "#e7eaf0",
    heading: "#ffffff",
    muted: "#8792a5",
    accent: "#60a5fa",
    inputBg: "#20252e",
    toggleBg: "#202733",
    toggleText: "#c9d3e2",
    shadow: "0 22px 60px rgba(0,0,0,0.48)",
  },
  light: {
    pageBg: "#eef2f7",
    cardBg: "#ffffff",
    titleBg: "#f3f6fb",
    titleText: "#344054",
    border: "#cfd7e3",
    text: "#1f2937",
    heading: "#111827",
    muted: "#64748b",
    accent: "#2563eb",
    inputBg: "#f8fafc",
    toggleBg: "#ffffff",
    toggleText: "#344054",
    shadow: "0 18px 50px rgba(15,23,42,0.14)",
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    position: "relative",
    transition: "background 0.3s",
  },
  themeToggle: {
    position: "fixed",
    top: "1.25rem",
    right: "1.25rem",
    padding: "0.45rem 0.9rem",
    borderRadius: "4px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    zIndex: 50,
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "6px",
    overflow: "hidden",
    transition: "box-shadow 0.3s, background 0.3s",
  },
  cardHeader: {
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "14px",
  },
  windowTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  windowIcon: {
    width: 14,
    height: 14,
    borderRadius: "3px",
    background: "#2563eb",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.18)",
  },
  windowControls: {
    alignSelf: "stretch",
    display: "flex",
  },
  windowButton: {
    width: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: "1px solid rgba(148,163,184,0.18)",
    fontSize: "0.82rem",
    lineHeight: 1,
  },
  closeButton: {
    color: "#ef4444",
  },
  cardBody: {
    padding: "2.25rem 2.5rem 2.5rem",
  },
  eyebrow: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.55rem",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.12,
    marginBottom: "0.6rem",
  },
  subheading: {
    fontSize: "0.92rem",
    lineHeight: 1.6,
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
  },
  counter: {
    fontSize: "0.72rem",
    fontFamily: "ui-monospace, Consolas, monospace",
    transition: "color 0.2s",
  },
  input: {
    width: "100%",
    padding: "0.75rem 0.9rem",
    borderRadius: "4px",
    fontSize: "0.92rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    lineHeight: 1.5,
  },
  textarea: {
    resize: "vertical",
    minHeight: "120px",
  },
  errorMsg: {
    fontSize: "0.75rem",
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  errorDot: {
    fontSize: "0.8rem",
    lineHeight: 1,
  },
  submitBtn: {
    width: "100%",
    padding: "0.875rem",
    borderRadius: "4px",
    border: "none",
    color: "#ffffff",
    fontSize: "0.92rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.3s, opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2.5px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footerNote: {
    fontSize: "0.75rem",
    marginTop: "1.25rem",
  },
  toastContainer: {
    position: "fixed",
    top: "1.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    minWidth: "300px",
    maxWidth: "420px",
    width: "90vw",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.85rem 1rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: 500,
    animation: "slideIn 0.35s cubic-bezier(.22,1,.36,1) both",
  },
  toastSuccess: {
    background: "#dcfce7",
    color: "#14532d",
    border: "1px solid #86efac",
  },
  toastError: {
    background: "#fee2e2",
    color: "#7f1d1d",
    border: "1px solid #fca5a5",
  },
  toastIcon: {
    fontSize: "0.78rem",
    fontWeight: 800,
  },
  toastMsg: {
    flex: 1,
    lineHeight: 1.4,
  },
  toastClose: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: "1rem",
    lineHeight: 1,
    opacity: 0.75,
    padding: "0 0.2rem",
  },
};
