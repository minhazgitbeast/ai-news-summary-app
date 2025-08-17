import { useState, useEffect } from "react";
import axios from "axios";

const ContentManagement = () => {
  const token = localStorage.getItem("token");

  // Use backend URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Summaries display
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(8);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    limit: 10,
  });

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState({ title: "", body: "" });

  // Modal for adding content
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState({ content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Search by summary ID only
  const [searchSummaryId, setSearchSummaryId] = useState("");
  const [searchedSummary, setSearchedSummary] = useState(null);
  const [searchSummaryError, setSearchSummaryError] = useState("");

  // Fetch summaries with pagination
  const fetchContents = async (page = 1, limit = cardsPerPage) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/summary?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      if (data && Array.isArray(data.summaries)) {
        // New paginated format
        setContents(data.summaries);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalCount: data.pagination?.totalCount || data.summaries.length,
          hasNextPage: data.pagination?.hasNextPage ?? false,
          hasPrevPage: data.pagination?.hasPrevPage ?? false,
          nextPage: data.pagination?.nextPage ?? null,
          prevPage: data.pagination?.prevPage ?? null,
          limit: data.pagination?.limit || limit,
        });
        setCurrentPage(data.pagination?.currentPage || 1);
      } else if (Array.isArray(data)) {
        // Fallback for old format (no pagination object)
        setContents(data);
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(data.length / limit) || 1,
          totalCount: data.length,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          limit,
        });
      } else {
        // Unexpected format
        setError("Unexpected data format from server");
        setContents([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          limit,
        });
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to fetch content");
      setContents([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        limit: cardsPerPage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents(currentPage);
  }, [currentPage]);

  // Auto-detect if input is URL
  const isURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Generate & save summary
  const handleGenerateSummary = async (e) => {
    e.preventDefault();
    if (!newContent.content.trim()) {
      setSubmitError("Please enter content to summarize");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const body = isURL(newContent.content)
        ? { url: newContent.content, save: true }
        : { text: newContent.content, save: true };

      const response = await axios.post(`${API_URL}/api/openai`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const summarizedText = response.data?.summary || "";
      setNewContent({ content: summarizedText });

      fetchContents(currentPage);
      alert("Content summarized and saved successfully!");
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setSubmitError(
        err.response?.data?.message || "Failed to generate summary"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewContent({ content: "" });
    setSubmitError("");
  };

  // Pagination logic
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete summary
  const handleDelete = async (summaryId) => {
    if (!window.confirm("Are you sure you want to delete this summary?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/summary/delete/${summaryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContents(currentPage);
      if (searchedSummary && searchedSummary._id === summaryId)
        setSearchedSummary(null);
    } catch (err) {
      console.error("Failed to delete summary:", err);
      alert("Failed to delete summary");
    }
  };

  // Edit summary
  const startEdit = (summary) => {
    setEditingId(summary._id);
    setEditedContent({
      title: summary.title || "Untitled",
      body: summary.summary || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedContent({ title: "", body: "" });
  };

  const handleSave = async (summaryId) => {
    try {
      await axios.put(`${API_URL}/api/summary/${summaryId}`, editedContent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      setEditedContent({ title: "", body: "" });
      fetchContents(currentPage);
      if (searchedSummary && searchedSummary._id === summaryId) {
        setSearchedSummary({ ...searchedSummary, ...editedContent });
      }
    } catch (err) {
      console.error("Failed to update summary:", err);
      alert("Failed to update summary");
    }
  };

  // Search by summary ID only
  const handleSearchBySummaryId = async (e) => {
    e.preventDefault();
    if (!searchSummaryId.trim()) {
      setSearchSummaryError("Summary ID is required");
      setSearchedSummary(null);
      return;
    }

    setSearchSummaryError("");
    setSearchedSummary(null);

    try {
      const res = await axios.get(
        `${API_URL}/api/summary/id/${searchSummaryId.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchedSummary(res.data);
    } catch (err) {
      console.error("Search by summary ID failed:", err);
      setSearchSummaryError("Failed to fetch summary with given ID");
    }
  };

  const getTitle = (item) => item.title || "Untitled";

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (totalPages <= 1) return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginTop: "3rem",
          marginBottom: "2rem",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          flexWrap: "wrap",
        }}
      >
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "12px 16px",
            background:
              currentPage === 1
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: currentPage === 1 ? "#94a3b8" : "white",
            border: "none",
            borderRadius: "12px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow:
              currentPage === 1
                ? "none"
                : "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }
          }}
        >
          ⬅️ Previous
        </button>

        {/* Page numbers */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={{
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              1
            </button>
            {startPage > 2 && (
              <span style={{ color: "#94a3b8", fontSize: "18px" }}>⋯</span>
            )}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            style={{
              padding: "12px 16px",
              background:
                currentPage === number
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(255, 255, 255, 0.1)",
              color: currentPage === number ? "white" : "#e2e8f0",
              border:
                currentPage === number
                  ? "none"
                  : "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: currentPage === number ? "700" : "600",
              transition: "all 0.3s ease",
              boxShadow:
                currentPage === number
                  ? "0 4px 15px rgba(102, 126, 234, 0.3)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== number) {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== number) {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span style={{ color: "#94a3b8", fontSize: "18px" }}>⋯</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              style={{
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "12px 16px",
            background:
              currentPage === totalPages
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: currentPage === totalPages ? "#94a3b8" : "white",
            border: "none",
            borderRadius: "12px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow:
              currentPage === totalPages
                ? "none"
                : "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }
          }}
        >
          Next ➡️
        </button>
      </div>
    );
  };

  // Helper: render summary card
  const renderSummaryCard = (item) => (
    <div
      key={item._id}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        padding: "25px",
        marginBottom: "20px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-8px) scale(1.02)";
        e.target.style.boxShadow =
          "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(102, 126, 234, 0.3)";
        e.target.style.border = "1px solid rgba(102, 126, 234, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0) scale(1)";
        e.target.style.boxShadow =
          "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)";
        e.target.style.border = "1px solid rgba(255, 255, 255, 0.15)";
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          
          @media (max-width: 768px) {
            .cards-grid {
              grid-template-columns: 1fr !important;
            }
            
            .search-form {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            
            .search-input {
              min-width: auto !important;
            }
            
            .pagination-container {
              gap: 8px !important;
              padding: 1rem !important;
            }
            
            .pagination-btn {
              padding: 10px 12px !important;
              font-size: 12px !important;
            }
            
            .card-meta {
              flex-direction: column !important;
              gap: 8px !important;
              align-items: flex-start !important;
            }
            
            .card-actions {
              flex-direction: column !important;
              gap: 8px !important;
            }
            
            .action-btn {
              width: 100% !important;
              justify-content: center !important;
            }
          }

          @media (max-width: 480px) {
            .main-container {
              padding: 10px !important;
            }
            
            .section-container {
              padding: 1rem !important;
            }
            
            .modal-content {
              padding: 1rem !important;
              margin: 10px !important;
            }
            
            .summary-card {
              padding: 15px !important;
            }
          }
        `}
      </style>
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      ></div>
      {/* Animated background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          borderRadius: "20px 20px 0 0",
        }}
      ></div>
      {editingId === item._id ? (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#2c3e50",
              }}
            >
              Title:
            </label>
            <input
              type="text"
              value={editedContent.title}
              placeholder="Title"
              onChange={(e) =>
                setEditedContent({ ...editedContent, title: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#2c3e50",
              }}
            >
              Summary:
            </label>
            <textarea
              value={editedContent.body}
              placeholder="Summary content"
              onChange={(e) =>
                setEditedContent({ ...editedContent, body: e.target.value })
              }
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleSave(item._id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              style={{
                padding: "8px 16px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#ffffff",
                fontSize: "1.3em",
                margin: "0 0 0.75rem 0",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 20px rgba(102, 126, 234, 0.3)",
              }}
            >
              ✨ {getTitle(item)}
            </h3>
            <div
              style={{
                fontSize: "0.9em",
                color: "#94a3b8",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span>👤 {item.userName || "Unknown User"}</span>
              <span style={{ color: "#667eea" }}>•</span>
              <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p
              style={{
                lineHeight: "1.7",
                color: "#e2e8f0",
                margin: "0",
                fontSize: "15px",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              🤖 {item.summary}
            </p>
          </div>

          {item.keywords && item.keywords.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                {item.keywords.slice(0, 5).map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                      color: "#e2e8f0",
                      padding: "6px 12px",
                      borderRadius: "15px",
                      fontSize: "0.8em",
                      fontWeight: "600",
                      border: "1px solid rgba(102, 126, 234, 0.3)",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    🔑 {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "15px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => startEdit(item)}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.3)";
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
        padding: "20px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}
      </style>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
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
            pointerEvents: "none",
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
            pointerEvents: "none",
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
            position: "relative",
            zIndex: 1,
          }}
        >
          <span style={{ marginRight: "10px" }}>🤖</span>
          AI Content Hub
          <span style={{ marginLeft: "10px" }}>⚡</span>
        </h2>

        {/* Search by Summary ID */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <form onSubmit={handleSearchBySummaryId}>
            <div
              className="search-form"
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <label
                style={{
                  color: "#e2e8f0",
                  fontWeight: "500",
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                🎯 Search by Summary ID:
              </label>
              <input
                type="text"
                value={searchSummaryId}
                onChange={(e) => setSearchSummaryId(e.target.value)}
                placeholder="Enter Summary ID"
                className="search-input"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "14px",
                  minWidth: "300px",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #667eea";
                  e.target.style.boxShadow =
                    "0 0 20px rgba(102, 126, 234, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 15px rgba(102, 126, 234, 0.3)";
                }}
              >
                🎯 Find
              </button>
            </div>
            {searchSummaryError && (
              <p
                style={{
                  color: "#ef4444",
                  marginTop: "0.75rem",
                  fontSize: "14px",
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  textAlign: "center",
                }}
              >
                ⚠️ {searchSummaryError}
              </p>
            )}
          </form>
        </div>

        {/* Show searched summary by Summary ID */}
        {searchedSummary && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3
              style={{
                color: "#ffffff",
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textAlign: "center",
              }}
            >
              🎯 Summary ID: {searchSummaryId}
            </h3>
            <div
              className="cards-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px",
                width: "100%",
              }}
            >
              {renderSummaryCard(searchedSummary)}
            </div>
          </div>
        )}

        {/* Default: logged-in user's summaries with pagination */}

        {!searchedSummary && (
          <>
            {/* Add Content Button */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: "16px 32px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow =
                    "0 8px 25px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 15px rgba(16, 185, 129, 0.3)";
                }}
              >
                ➕ Add New Content
              </button>
              <p
                style={{
                  color: "#94a3b8",
                  marginTop: "1rem",
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                Add content and let AI generate a summary for you
              </p>
            </div>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                  color: "#e2e8f0",
                  fontSize: "1.2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid rgba(102, 126, 234, 0.3)",
                      borderTop: "3px solid #667eea",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  Loading AI summaries...
                </div>
              </div>
            ) : error ? (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  color: "#ef4444",
                  textAlign: "center",
                }}
              >
                ⚠️ {error}
              </div>
            ) : contents.length === 0 ? (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "3rem",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  🤖
                </div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  No content found
                </h3>
                <p style={{ fontSize: "1rem", opacity: 0.8 }}>
                  Start creating AI-powered summaries to see them here!
                </p>
              </div>
            ) : (
              <>
                {/* Summary info */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px",
                    padding: "1rem 1.5rem",
                    marginBottom: "2rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    gap: "2rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    📊 Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} summaries
                  </span>
                  <span>
                    📄 Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>

                {/* Cards grid */}
                <div
                  className="cards-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "20px",
                    width: "100%",
                    marginBottom: "2rem",
                  }}
                >
                  {contents.map(renderSummaryCard)}
                </div>

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={paginate}
                />
              </>
            )}
          </>
        )}

        {/* Add Content Modal */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <div
              className="modal-content"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                borderRadius: "20px",
                padding: "2rem",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                position: "relative",
              }}
            >
              <button
                onClick={closeAddModal}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#e2e8f0",
                  transition: "all 0.3s ease",
                }}
              >
                ✕
              </button>
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "1.8rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ➕ Add New Content
              </h2>
              <form onSubmit={handleGenerateSummary}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#e2e8f0",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  📄 Content *
                </label>
                <textarea
                  value={newContent.content}
                  onChange={(e) =>
                    setNewContent({ ...newContent, content: e.target.value })
                  }
                  placeholder="Enter your content here. AI will generate a summary and save it for you."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    fontSize: "14px",
                    resize: "vertical",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  required
                />
                {submitError && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "1rem",
                      color: "#ef4444",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    ⚠️ {submitError}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeAddModal}
                    style={{
                      padding: "12px 24px",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#e2e8f0",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "12px 24px",
                      background: isSubmitting
                        ? "rgba(16, 185, 129, 0.5)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: isSubmitting
                        ? "none"
                        : "0 4px 15px rgba(16, 185, 129, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                        Generating & Saving...
                      </>
                    ) : (
                      <>🤖 Generate & Save</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ContentManagement;
