import {
  Bell,
  HelpCircle,
  Moon,
  Search,
  ChevronDown,
} from "lucide-react";

export default function TopNavbar() {
  return (
    <div
      style={{
        height: "72px",
        background: "#081225",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
    >
      {/* Left */}

      <h2
        style={{
          color: "#FFFFFF",
          margin: 0,
          fontSize: "30px",
          fontWeight: 600,
        }}
      >
        Dashboard
      </h2>

      {/* Center Search */}

      <div
        style={{
          width: "420px",
          height: "44px",
          background: "#0D1B33",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 16px",
        }}
      >
        <Search
          size={18}
          color="#94A3B8"
        />

        <input
          placeholder="Search anything..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#FFFFFF",
            fontSize: "14px",
          }}
        />

        <span
          style={{
            color: "#94A3B8",
            fontSize: "12px",
          }}
        >
          ⌘ K
        </span>
      </div>

      {/* Right */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          color: "#FFFFFF",
        }}
      >
        <Bell size={20} />

        <HelpCircle size={20} />

        <Moon size={20} />

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg,#F97316,#EA580C)",
          }}
        />

        <div>
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Atharv
          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "12px",
            }}
          >
            Admin
          </div>
        </div>

        <ChevronDown size={18} />
      </div>
    </div>
  );
}