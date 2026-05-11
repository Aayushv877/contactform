import { useState, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const API_URL = import.meta?.env?.VITE_API_URL ?? "https://your-api-gateway-url.amazonaws.com/prod/contact";
const MAX_MESSAGE = 500;

// ── Utility ────────────────────────────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Toast Component ────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div style={styles.toastContainer}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...styles.toast,
            ...(t.type === "success" ? styles.toastSuccess : styles.toastError),
          }}
        >
          <span style={styles.toastIcon}>{t.type === "success" ? "✓" : "✕"}</span>
          <span style={styles.toastMsg}>{t.message}</span>
          <button style={styles.toastClose} onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// ── useToast Hook ──────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4500);
  };
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, add, remove };
}

// ── InputField Component ───────────────────────────────────────────────────
function InputField({ label, id, error, children, counter }) {
  return (
    <div style={styles.fieldGroup}>
      <div style={styles.labelRow}>
        <label htmlFor={id} style={styles.label}>{label}</label>
        {counter}
      </div>
      {children}
      {error && (
        <span style={styles.errorMsg} role="alert">
          <span style={styles.errorDot}>●</span> {error}
        </span>
      )}
    </div>
  );
}

// ── Main ContactForm ───────────────────────────────────────────────────────
export default function ContactForm() {
  const [dark, setDark] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [touched, setTouched] = useState({});
  const { toasts, add: addToast, remove: removeToast } = useToast();
  const submitBtnRef = useRef(null);

  // live validation on touched fields
  useEffect(() => {
    if (Object.keys(touched).length) setErrors(validate(form));
  }, [form, touched]);

  const validate = ({ name, email, message }) => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "At least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";
    if (!message.trim()) e.message = "Message is required";
    else if (message.trim().length < 10) e.message = "At least 10 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_MESSAGE) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

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

  const t = dark ? themes.dark : themes.light;
  const isLoading = status === "loading";
  const msgLen = form.message.length;

  return (
    <div style={{ ...styles.page, background: t.pageBg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(110%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Dark mode toggle */}
      <button
        style={{ ...styles.themeToggle, background: t.toggleBg, color: t.toggleText, border: `1px solid ${t.border}` }}
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {dark ? "☀ Light" : "☾ Dark"}
      </button>

      {/* Card */}
      <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}`, boxShadow: t.shadow, animation: "fadeUp .6s ease both" }}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={{ ...styles.dot, background: "#ef4444" }} />
          <div style={{ ...styles.dot, background: "#f59e0b" }} />
          <div style={{ ...styles.dot, background: "#22c55e" }} />
        </div>

        <div style={styles.cardBody}>
          <p style={{ ...styles.eyebrow, color: t.accent }}>— Get in touch</p>
          <h1 style={{ ...styles.heading, color: t.heading }}>Send a Message</h1>
          <p style={{ ...styles.subheading, color: t.muted }}>
            Fill out the form below and we'll respond within 24 hours.
          </p>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>
            {/* Name */}
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
                  border: `1.5px solid ${touched.name && errors.name ? "#ef4444" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            {/* Email */}
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
                  border: `1.5px solid ${touched.email && errors.email ? "#ef4444" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            {/* Message */}
            <InputField
              label="Message"
              id="message"
              error={touched.message && errors.message}
              counter={
                <span style={{ ...styles.counter, color: msgLen >= MAX_MESSAGE * 0.9 ? "#ef4444" : t.muted }}>
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
                  border: `1.5px solid ${touched.message && errors.message ? "#ef4444" : t.border}`,
                  color: t.text,
                }}
              />
            </InputField>

            {/* Submit */}
            <button
              ref={submitBtnRef}
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitBtn,
                background: status === "success" ? "#22c55e" : status === "error" ? "#ef4444" : t.accent,
                opacity: isLoading ? 0.8 : 1,
                transform: isLoading ? "scale(0.98)" : "scale(1)",
              }}
            >
              {isLoading && <span style={styles.spinner} />}
              {status === "idle" && "Send Message →"}
              {status === "loading" && "Sending…"}
              {status === "success" && "✓ Sent!"}
              {status === "error" && "✕ Failed — Retry"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ ...styles.footerNote, color: t.muted }}>
        🔒 Your information is encrypted and never shared.
      </p>
    </div>
  );
}

// ── Themes ────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    pageBg: "#0d0f12",
    cardBg: "rgba(20,24,31,0.92)",
    border: "#1f2633",
    text: "#e8eaf0",
    heading: "#ffffff",
    muted: "#5a6478",
    accent: "#6ee7b7",
    inputBg: "rgba(255,255,255,0.04)",
    toggleBg: "rgba(255,255,255,0.06)",
    toggleText: "#9aa5b4",
    shadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
  },
  light: {
    pageBg: "#f0f4f8",
    cardBg: "#ffffff",
    border: "#e2e8f0",
    text: "#1a202c",
    heading: "#0f172a",
    muted: "#94a3b8",
    accent: "#0ea5e9",
    inputBg: "#f8fafc",
    toggleBg: "#e2e8f0",
    toggleText: "#475569",
    shadow: "0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
  },
};

// ── Styles ────────────────────────────────────────────────────────────────
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
    padding: "0.45rem 1rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.03em",
    transition: "all 0.2s",
    zIndex: 50,
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "16px",
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    transition: "box-shadow 0.3s, background 0.3s",
  },
  cardHeader: {
    display: "flex",
    gap: "6px",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  dot: { width: 12, height: 12, borderRadius: "50%" },
  cardBody: { padding: "2.25rem 2.5rem 2.5rem" },
  eyebrow: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1.9rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    marginBottom: "0.5rem",
  },
  subheading: {
    fontSize: "0.88rem",
    lineHeight: 1.6,
    marginBottom: "2rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em" },
  counter: { fontSize: "0.72rem", fontFamily: "monospace", transition: "color 0.2s" },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.92rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    lineHeight: 1.5,
  },
  textarea: { resize: "vertical", minHeight: "120px" },
  errorMsg: {
    fontSize: "0.75rem",
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  errorDot: { fontSize: "0.5rem" },
  submitBtn: {
    width: "100%",
    padding: "0.875rem",
    borderRadius: "8px",
    border: "none",
    color: "#000",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.03em",
    transition: "background 0.3s, transform 0.15s, opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2.5px solid rgba(0,0,0,0.2)",
    borderTopColor: "#000",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footerNote: {
    fontSize: "0.75rem",
    marginTop: "1.25rem",
    letterSpacing: "0.01em",
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
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: 500,
    animation: "slideIn 0.35s cubic-bezier(.22,1,.36,1) both",
    backdropFilter: "blur(12px)",
  },
  toastSuccess: { background: "rgba(20,83,45,0.95)", color: "#86efac", border: "1px solid #166534" },
  toastError: { background: "rgba(127,29,29,0.95)", color: "#fca5a5", border: "1px solid #991b1b" },
  toastIcon: { fontSize: "0.9rem", fontWeight: 700 },
  toastMsg: { flex: 1, lineHeight: 1.4 },
  toastClose: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: "1.1rem",
    lineHeight: 1,
    opacity: 0.7,
    padding: "0 0.2rem",
  },
};
