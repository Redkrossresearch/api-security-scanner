import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WorkspaceLayout({
  sidebar,
  chatWorkspace,
  contextPanel,
  sidebarCollapsed,
  setSidebarCollapsed,
  contextPanelCollapsed,
  setContextPanelCollapsed,
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem("athx-copilot-sidebar-width") || "260", 10);
  });
  const [contextPanelWidth, setContextPanelWidth] = useState(() => {
    return parseInt(localStorage.getItem("athx-copilot-context-width") || "320", 10);
  });

  const layoutRef = useRef(null);
  const isResizingSidebar = useRef(false);
  const isResizingContext = useRef(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem("athx-copilot-sidebar-width", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem("athx-copilot-context-width", contextPanelWidth.toString());
  }, [contextPanelWidth]);

  // Dragging event handlers
  const handleMouseDownSidebar = (e) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseDownContext = (e) => {
    e.preventDefault();
    isResizingContext.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();

      if (isResizingSidebar.current) {
        // Calculate width relative to layout element left offset
        const newWidth = Math.max(160, Math.min(450, e.clientX - rect.left));
        setSidebarWidth(newWidth);
      }

      if (isResizingContext.current) {
        // Calculate width relative to layout element right offset
        const newWidth = Math.max(220, Math.min(500, rect.right - e.clientX));
        setContextPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingContext.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <style>{`
        .resize-handle {
          width: 4px;
          height: 100%;
          cursor: col-resize;
          background: transparent;
          transition: background-color 0.2s;
          position: relative;
          z-index: 50;
          flex-shrink: 0;
        }
        .resize-handle::after {
          content: '';
          position: absolute;
          left: 1px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: transparent;
          transition: background-color 0.2s;
        }
        .resize-handle:hover::after, .resize-handle:active::after {
          background: rgba(139, 92, 246, 0.4);
        }
        .collapse-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 38px;
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          z-index: 55;
          transition: all 0.2s;
        }
        .collapse-btn:hover {
          color: #FFF;
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.1);
        }
      `}</style>

      <div
        ref={layoutRef}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "transparent",
          position: "relative"
        }}
      >
        {/* Left Side: ChatSidebar */}
        <div
          style={{
            width: sidebarCollapsed ? "0px" : `${sidebarWidth}px`,
            minWidth: sidebarCollapsed ? "0px" : "160px",
            maxWidth: "450px",
            height: "100%",
            overflow: "hidden",
            flexShrink: 0,
            transition: isResizingSidebar.current ? "none" : "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative"
          }}
        >
          {sidebar}
        </div>

        {/* Sidebar resize divider / collapse handle */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDownSidebar}
          style={{ pointerEvents: sidebarCollapsed ? "none" : "auto" }}
        >
          <button
            className="collapse-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarCollapsed(!sidebarCollapsed);
            }}
            style={{
              left: sidebarCollapsed ? "2px" : "-8px"
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Center Pane: ChatWorkspace */}
        <div style={{
          flex: 1,
          height: "100%",
          minWidth: "200px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "rgba(3, 7, 18, 0.2)",
        }}>
          {chatWorkspace}
        </div>

        {/* Context panel resize divider / collapse handle */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDownContext}
          style={{ pointerEvents: contextPanelCollapsed ? "none" : "auto" }}
        >
          <button
            className="collapse-btn"
            onClick={(e) => {
              e.stopPropagation();
              setContextPanelCollapsed(!contextPanelCollapsed);
            }}
            style={{
              right: contextPanelCollapsed ? "2px" : "-8px"
            }}
            title={contextPanelCollapsed ? "Expand Context Drawer" : "Collapse Context Drawer"}
          >
            {contextPanelCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>

        {/* Right Side: ContextPanel */}
        <div
          style={{
            width: contextPanelCollapsed ? "0px" : `${contextPanelWidth}px`,
            minWidth: contextPanelCollapsed ? "0px" : "220px",
            maxWidth: "500px",
            height: "100%",
            overflow: "hidden",
            flexShrink: 0,
            transition: isResizingContext.current ? "none" : "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative"
          }}
        >
          {contextPanel}
        </div>
      </div>
    </>
  );
}
