/**
 * DownloadsPage.jsx (Sprint 80 — Download Center UI)
 * Centralized dashboard page listing all generated scan reports, OpenAPI specs, and PDF/Word exports.
 */
import { useState } from "react";
import { Download, FileText, Code2, ShieldCheck, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DownloadsPage() {
  const [downloads] = useState([
    { id: "1", name: "API_Security_Audit_Report.pdf", format: "PDF", size: "2.4 MB", date: "Today, 14:30", type: "pdf" },
    { id: "2", name: "OpenAPI_Vulnerability_Inventory.json", format: "JSON", size: "480 KB", date: "Today, 12:15", type: "code" },
    { id: "3", name: "Executive_Security_Summary.docx", format: "DOCX", size: "1.8 MB", date: "Yesterday", type: "doc" },
    { id: "4", name: "Vulnerabilities_CVSS_Export.csv", format: "CSV", size: "120 KB", date: "July 21, 2026", type: "csv" },
  ]);

  const handleDownload = (item) => {
    toast.success(`Downloading ${item.name}...`);
    const blob = new Blob([`Security Export Content for ${item.name}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", color: "#FFFFFF" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
            <Download color="#38BDF8" size={24} />
            <span>Download Center & File Management</span>
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>
            Access and download all generated security audit reports, OpenAPI specs, and AI threat exports.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {downloads.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#071126", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center",
              justify: "space-between", gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)",
                padding: "10px", borderRadius: "10px", color: "#38BDF8",
              }}>
                {item.type === "pdf" && <FileText size={20} />}
                {item.type === "code" && <Code2 size={20} />}
                {item.type === "doc" && <ShieldCheck size={20} />}
                {item.type === "csv" && <FileSpreadsheet size={20} />}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>{item.name}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                  {item.format} • {item.size} • Created {item.date}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(item)}
              style={{
                background: "linear-gradient(135deg,#7C3AED,#EC4899)", border: "none",
                color: "#FFFFFF", padding: "8px 18px", borderRadius: "8px",
                fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex",
                alignItems: "center", gap: "6px", marginLeft: "auto",
              }}
            >
              <Download size={14} />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
