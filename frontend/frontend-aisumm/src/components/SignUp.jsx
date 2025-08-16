import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Use backend URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/signup`, { name, email, password });

      navigate("/summary");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "50px",
          right: "50px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(88, 101, 242, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "pulse 4s ease-in-out infinite",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "50px",
          width: "150px",
          height: "150px",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "pulse 6s ease-in-out infinite reverse",
        }}
      ></div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(15px)",
          borderRadius: "25px",
          padding: "3rem",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "8px",
            color: "#667eea",
            fontWeight: "600",
            fontSize: "1rem",
            padding: "8px 16px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(102,126,234,0.15)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.15)")
          }
        >
          ← Back
        </button>
        {/* Animated top border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            borderRadius: "25px 25px 0 0",
          }}
        ></div>

        <h2
          style={{
            color: "#ffffff",
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "2rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 30px rgba(102, 126, 234, 0.3)",
          }}
        >
          <span style={{ marginRight: "10px" }}>🚀</span>
          Sign Up
          <span style={{ marginLeft: "10px" }}>✨</span>
        </h2>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1.5rem",
              color: "#ef4444",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#e2e8f0",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              👤 Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontSize: "14px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #667eea";
                e.target.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#e2e8f0",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              📧 Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontSize: "14px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #667eea";
                e.target.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#e2e8f0",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              🔒 Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontSize: "14px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #667eea";
                e.target.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              marginTop: "1rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            ✨ Create Account
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <a
            href="/signin"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#764ba2";
              e.target.style.textShadow = "0 0 10px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#667eea";
              e.target.style.textShadow = "none";
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
