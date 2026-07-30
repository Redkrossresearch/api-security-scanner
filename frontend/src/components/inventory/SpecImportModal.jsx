import React, { useState } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SpecImportModal({ isOpen, onClose, onImportSuccess }) {
  const [targetHost, setTargetHost] = useState("https://api.target.com");
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      toast.error("Please provide valid OpenAPI JSON specification content.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Syncing OpenAPI specification with inventory...");
    try {
      const res = await api.post("/inventory/import", {
        specData: jsonText,
        targetHost,
      });

      if (res.data?.success) {
        toast.dismiss(toastId);
        toast.success(`Synced ${res.data.importedCount || 0} endpoints into API Inventory!`);
        if (onImportSuccess) onImportSuccess();
        onClose();
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || "Failed to import OpenAPI spec.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#090F1B",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          color: "#FFF",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#F97316" }}>
              Import OpenAPI / Swagger Spec
            </h3>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: "4px 0 0 0" }}>
              Upload your OpenAPI 3.0 or Postman Collection JSON to sync endpoints with inventory.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FFF",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Target Host Base URL
            </label>
            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              placeholder="https://api.target.com"
              style={{
                width: "100%",
                background: "#030712",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              OpenAPI JSON File / Content
            </label>
            <div
              style={{
                border: "2px dashed rgba(249, 115, 22, 0.3)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                background: "rgba(249, 115, 22, 0.02)",
                cursor: "pointer",
                marginBottom: "12px",
              }}
              onClick={() => document.getElementById("spec-file-input").click()}
            >
              <Upload size={28} color="#F97316" style={{ margin: "0 auto 8px auto" }} />
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#E2E8F0" }}>
                {fileName ? `Loaded: ${fileName}` : "Click or drag JSON file to upload"}
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                Supports OpenAPI 2.0, 3.0, 3.1 & Postman v2.1 JSON
              </div>
              <input
                id="spec-file-input"
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>

            <textarea
              rows={5}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Or paste OpenAPI JSON content directly here..."
              style={{
                width: "100%",
                background: "#030712",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#E2E8F0",
                fontSize: "12px",
                fontFamily: "monospace",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #F97316, #EA580C)",
                border: "none",
                color: "#FFF",
                padding: "10px 22px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 0 15px rgba(249, 115, 22, 0.3)",
              }}
            >
              {loading ? "Syncing..." : "Sync Specification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
