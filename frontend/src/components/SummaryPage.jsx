import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

const SummaryPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Hamburger Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 1000,
            color: "#620D8FFF",
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar Navigation */}
      {isSidebarOpen && (
        <div
          style={{
            width: "180px",
            backgroundColor: "#f4f4f4",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100%",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <h3>Navigation</h3>
            <NavLink
              to="/summary/users"
              style={({ isActive }) => ({
                display: "block",
                marginBottom: "1rem",
                textDecoration: "none",
                color: "black",
                fontWeight: isActive ? "bold" : "normal",
              })}
              onClick={() => setIsSidebarOpen(false)}
            >
              Users
            </NavLink>
            <NavLink
              to="/summary/content"
              style={({ isActive }) => ({
                display: "block",
                textDecoration: "none",
                color: "black",
                fontWeight: isActive ? "bold" : "normal",
              })}
              onClick={() => setIsSidebarOpen(false)}
            >
              Content
            </NavLink>
          </div>

          {/* Logout Button at Bottom */}
          <button
            onClick={handleLogout}
            style={{
              marginBottom: "3rem",
              padding: "10px 15px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              marginTop: "absolute",
              width: "100%",
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Main Section */}
      <div
        style={{
          flex: 1,
          padding: "2rem",
          marginLeft: isSidebarOpen ? "180px" : "0",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SummaryPage;
