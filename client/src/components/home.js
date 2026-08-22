import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { authenticate, isAuthenticated, signin } from "../helper/Auth";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { Modal } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

function Home() {
  const router = useRouter();
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
      if (!!token) {
        const redirectUrl = router.query.redirect;
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/student/dashboard");
        }
      }
    }
    getAuthStatus();
  }, [router]);

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
            const redirectUrl = router.query.redirect;
            if (redirectUrl) {
              router.push(redirectUrl);
            } else {
              router.push("/student/dashboard");
            }
          });
        }
      })
      .catch((err) => setValues({ ...values, error: "An unexpected error occurred.", loading: false }));
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/google",
        {
          method: "POST",
          body: JSON.stringify({ token: credentialResponse.credential }),
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
        const redirectUrl = router.query.redirect;
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/student/dashboard");
        }
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
          background: #ffffff;
        }

        /* ── Left panel ── */
        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 80px;
          background: #000000;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 4px;
          padding: 8px 18px;
          margin-bottom: 48px;
          z-index: 1;
        }
        .brand-dot {
          width: 8px; height: 8px;
          background: #000000;
        }
        .brand-badge span {
          font-size: 13px; font-weight: 700;
          color: #000000;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .left-headline {
          font-size: clamp(32px, 3.5vw, 52px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 20px;
          z-index: 1;
          text-align: center;
        }
        .left-headline span {
          color: #cccccc;
          text-decoration: underline;
          text-decoration-color: #ffffff;
        }

        .left-sub {
          font-size: 16px; font-weight: 400;
          color: #aaaaaa;
          line-height: 1.7;
          max-width: 420px;
          margin-bottom: 56px;
          z-index: 1;
          text-align: center;
        }

        .feature-list { z-index: 1; width: 100%; max-width: 420px; }
        .feature-item {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
          background: #111111;
          padding: 16px;
          border-radius: 4px;
          border: 1px solid #333333;
          transition: border-color 0.2s;
        }
        .feature-item:hover {
          border-color: #666666;
        }
        .feature-icon {
          width: 40px; height: 40px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          background: #ffffff;
          color: #000000;
        }
        .feature-item p {
          font-size: 14px; font-weight: 500;
          color: #dddddd;
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
          font-size: 12px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #000000;
          margin-bottom: 10px;
        }
        .form-title {
          font-size: 28px; font-weight: 800;
          color: #000000;
          margin-bottom: 8px;
        }
        .form-subtitle {
          font-size: 14px; color: #555555;
          margin-bottom: 36px;
        }

        .field-group { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 13px; font-weight: 600;
          color: #000000;
          margin-bottom: 7px;
        }
        .field-wrapper {
          position: relative;
        }
        .field-input {
          width: 100%;
          padding: 13px 44px 13px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px; font-weight: 500;
          color: #000000;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }
        .field-input:focus {
          border-color: #000000;
        }
        .field-input.has-error {
          border-color: #000000;
          background: #f9f9f9;
        }
        .field-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #000000; font-size: 16px;
          cursor: pointer; user-select: none;
        }

        .error-banner {
          background: #000000;
          border: 2px solid #000000;
          border-radius: 4px;
          padding: 11px 14px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #ffffff;
          display: flex; align-items: center; gap: 8px;
          font-weight: 500;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: 2px solid #000000;
          border-radius: 4px;
          background: #000000;
          color: #ffffff;
          font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.3px;
          margin-bottom: 20px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #ffffff;
          color: #000000;
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .divider hr {
          flex: 1; border: none;
          border-top: 2px solid #e0e0e0;
        }
        .divider span {
          font-size: 12px; font-weight: 600;
          color: #000000; white-space: nowrap;
          text-transform: uppercase;
        }

        .footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 12px; color: #555555;
        }
        .footer-note a { color: #000000; text-decoration: none; font-weight: 700; border-bottom: 1px solid #000000; }
        .footer-note a:hover { color: #555555; border-color: #555555; }

        @media (max-width: 860px) {
          .login-left { display: none; }
          .login-right { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-left">
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
              { icon: "💻", text: "Live webcam monitoring for every test session" },
              { icon: "⚡", text: "Instant results and detailed performance reports" },
              { icon: "🔒", text: "Anti-tab-switch detection & integrity checks" },
            ].map(({ icon, text }) => (
              <div className="feature-item" key={text}>
                <div className="feature-icon">{icon}</div>
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

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
            width="100%"
          />

          <div className="footer-note">
            Admin?&nbsp;
            <NextLink href="/admin">Sign in to admin panel →</NextLink>
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

export default Home;