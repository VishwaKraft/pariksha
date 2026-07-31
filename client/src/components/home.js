import React, { useEffect, useState } from "react";
import { withRouter, Link } from "react-router-dom";
import { authenticate, isAuthenticated, signin } from "../helper/Auth";
import { toast } from "react-toastify";
import GoogleLogin from "react-google-login";
import { Modal } from "react-bootstrap";
import { CircularProgress } from "@material-ui/core";

function Home(props) {
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [show, setShow] = useState(false);

  const { email, password, error, loading } = values;

  useEffect(() => {
    async function getAuthStatus() {
      const token = await isAuthenticated();
      if (!!token) props.history.push("/student/dashboard");
    }
    getAuthStatus();
  }, [props.history]);

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setValues({ ...values, error: "Please enter both email and password." });
      return;
    }
    setValues({ ...values, error: false, loading: true });
    signin({ email, password })
      .then((data) => {
        if (!data) {
           setValues({ ...values, error: "Network error. Make sure you are using HTTP (not HTTPS) to avoid mixed content.", loading: false });
           return;
        }
        if (data.success === false) {
          setValues({ ...values, error: data.error.message || data.error, loading: false });
        } else {
          authenticate(data.data, () => {
            toast.success("Welcome back!");
            props.history.push("/student/dashboard");
          });
        }
      })
      .catch((err) => setValues({ ...values, error: "An unexpected error occurred.", loading: false }));
  };

  const handleGoogleLogin = async (googleData) => {
    try {
      const res = await fetch(
        process.env.REACT_APP_API_URL + "/api/v1/auth/google",
        {
          method: "POST",
          body: JSON.stringify({ token: googleData.tokenId }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        toast.error(data.error || "Authentication failed");
        return;
      }
      authenticate(data.data, () => {
        toast.success("Welcome back!");
        props.history.push("/student/dashboard");
      });
    } catch {
      toast.error("Authentication error occurred!");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #0f0c29;
        }

        /* ── Left panel ── */
        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 80px;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,80,220,0.25) 0%, transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(80,180,220,0.18) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 50px;
          padding: 8px 18px;
          margin-bottom: 48px;
        }
        .brand-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #86efac;
          box-shadow: 0 0 8px #86efac;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .brand-badge span {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px;
        }

        .left-headline {
          font-size: clamp(32px, 3.5vw, 52px);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 20px;
          z-index: 1;
        }
        .left-headline span {
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-sub {
          font-size: 16px; font-weight: 400;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 56px;
          z-index: 1;
        }

        .feature-list { z-index: 1; width: 100%; max-width: 380px; }
        .feature-item {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .fi-purple { background: rgba(167,139,250,0.18); }
        .fi-blue   { background: rgba(96,165,250,0.18); }
        .fi-green  { background: rgba(134,239,172,0.18); }
        .feature-item p {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        /* ── Right panel ── */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
        }

        .form-eyebrow {
          font-size: 12px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .form-title {
          font-size: 28px; font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }
        .form-subtitle {
          font-size: 14px; color: #6b7280;
          margin-bottom: 36px;
        }

        .field-group { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 13px; font-weight: 600;
          color: #374151;
          margin-bottom: 7px;
        }
        .field-wrapper {
          position: relative;
        }
        .field-input {
          width: 100%;
          padding: 13px 44px 13px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px; font-weight: 400;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }
        .field-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .field-input.has-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .field-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af; font-size: 16px;
          cursor: pointer; user-select: none;
          transition: color 0.2s;
        }
        .field-icon:hover { color: #7c3aed; }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #b91c1c;
          display: flex; align-items: center; gap: 8px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(124,58,237,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .divider hr {
          flex: 1; border: none;
          border-top: 1.5px solid #f3f4f6;
        }
        .divider span {
          font-size: 12px; font-weight: 500;
          color: #9ca3af; white-space: nowrap;
        }

        .google-btn-wrapper { width: 100%; }
        .google-btn-wrapper > div { width: 100% !important; }
        .google-btn-wrapper > div > div { width: 100% !important; border-radius: 12px !important; }

        .footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 12px; color: #9ca3af;
        }
        .footer-note a { color: #7c3aed; text-decoration: none; font-weight: 600; }

        /* Floating orbs animation */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: drift 8s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0, 0); }
          to   { transform: translate(20px, 30px); }
        }
        .orb-1 { width: 220px; height: 220px; background: rgba(167,139,250,0.2); top: 15%; left: 10%; }
        .orb-2 { width: 160px; height: 160px; background: rgba(96,165,250,0.2); bottom: 20%; right: 15%; animation-delay: -4s; }
        .orb-3 { width: 100px; height: 100px; background: rgba(134,239,172,0.15); top: 55%; left: 40%; animation-delay: -2s; }

        @media (max-width: 860px) {
          .login-left { display: none; }
          .login-right { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          <div className="brand-badge">
            <span className="brand-dot" />
            <span>Live Proctored Exams</span>
          </div>

          <h1 className="left-headline">
            The smarter way to<br />
            <span>assess talent</span>
          </h1>

          <p className="left-sub">
            HU-Pariksha delivers secure, AI-monitored online exams with real-time
            webcam proctoring and instant results.
          </p>

          <div className="feature-list">
            {[
              { icon: "🎥", cls: "fi-purple", text: "Live webcam monitoring for every test session" },
              { icon: "⚡", cls: "fi-blue",   text: "Instant results and detailed performance reports" },
              { icon: "🔒", cls: "fi-green",  text: "Anti-tab-switch detection & integrity checks" },
            ].map(({ icon, cls, text }) => (
              <div className="feature-item" key={text}>
                <div className={`feature-icon ${cls}`}>{icon}</div>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <p className="form-eyebrow">Student Portal</p>
          <h2 className="form-title">Welcome back 👋</h2>
          <p className="form-subtitle">Sign in to access your exams and results.</p>

          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="login-email">Email address</label>
              <div className="field-wrapper">
                <input
                  id="login-email"
                  type="email"
                  className={`field-input${error ? " has-error" : ""}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                />
                <span className="field-icon">✉️</span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="login-pass">Password</label>
              <div className="field-wrapper">
                <input
                  id="login-pass"
                  type={showPass ? "text" : "password"}
                  className={`field-input${error ? " has-error" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                />
                <span
                  className="field-icon"
                  onClick={() => setShowPass(s => !s)}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
              id="login-submit"
            >
              {loading
                ? <><CircularProgress size={18} style={{ color: "#fff" }} /> Signing in…</>
                : "Sign in →"}
            </button>
          </form>

          <div className="divider">
            <hr /><span>or continue with</span><hr />
          </div>

          <div className="google-btn-wrapper">
            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              buttonText="Sign in with Google"
              onSuccess={handleGoogleLogin}
              onFailure={handleGoogleLogin}
              cookiePolicy="single_host_origin"
              theme="light"
              style={{ width: "100%", borderRadius: "12px" }}
            />
          </div>

          <div className="footer-note">
            Admin?&nbsp;
            <Link to="/admin">Sign in to admin panel →</Link>
          </div>
        </div>
      </div>

      {/* Error modal (legacy) */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign-in Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error}</Modal.Body>
      </Modal>
    </>
  );
}

export default withRouter(Home);