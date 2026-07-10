import React, { useEffect, useRef } from "react";

export default function CyberCanvasBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Handle resize relative to parent container
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    
    resize();
    window.addEventListener("resize", resize);

    const columns = 20;
    const rows = 14;
    let count = 0;

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamically fetch current theme accent color from document root
      const rootStyle = getComputedStyle(document.documentElement);
      const accentColor = rootStyle.getPropertyValue("--theme-accent").trim() || "#8B5CF6";

      count += 0.015;

      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.65; // Position the wave slightly lower for better background distribution
      const fov = 350;

      for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
          // Calculate mesh coordinates
          const gridX = (x - columns / 2) * 58;
          const gridY = (y - rows / 2) * 44;
          
          // Undulating double wave sine height calculation
          const waveZ = Math.sin(x * 0.4 + count) * 42 + Math.cos(y * 0.35 + count) * 32;

          // 3D rotation projection around X axis (perspective tilt down)
          const angleX = 0.95; 
          const rotatedY = gridY * Math.cos(angleX) - waveZ * Math.sin(angleX);
          const rotatedZ = gridY * Math.sin(angleX) + waveZ * Math.cos(angleX) + 260; // depth offset

          // Perspective transformation scaling factor
          const scale = fov / (fov + rotatedZ);
          const screenX = centerX + gridX * scale;
          const screenY = centerY + rotatedY * scale;

          if (scale > 0) {
            const alpha = Math.max(0.01, Math.min(0.24, scale * 0.38));
            ctx.fillStyle = accentColor;
            ctx.globalAlpha = alpha;

            // Draw glowing 3D node
            ctx.beginPath();
            ctx.arc(screenX, screenY, scale * 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Draw link to the right neighbor node
            if (x < columns - 1) {
              const nextGridX = (x + 1 - columns / 2) * 58;
              const nextWaveZ = Math.sin((x + 1) * 0.4 + count) * 42 + Math.cos(y * 0.35 + count) * 32;
              const nextRotatedY = gridY * Math.cos(angleX) - nextWaveZ * Math.sin(angleX);
              const nextRotatedZ = gridY * Math.sin(angleX) + nextWaveZ * Math.cos(angleX) + 260;
              const nextScale = fov / (fov + nextRotatedZ);
              const nextScreenX = centerX + nextGridX * nextScale;
              const nextScreenY = centerY + nextRotatedY * nextScale;

              ctx.strokeStyle = accentColor;
              ctx.globalAlpha = alpha * 0.45;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(screenX, screenY);
              ctx.lineTo(nextScreenX, nextScreenY);
              ctx.stroke();
            }

            // Draw link to the bottom neighbor node
            if (y < rows - 1) {
              const nextGridY = (y + 1 - rows / 2) * 44;
              const nextWaveZ = Math.sin(x * 0.4 + count) * 42 + Math.cos((y + 1) * 0.35 + count) * 32;
              const nextRotatedY = nextGridY * Math.cos(angleX) - nextWaveZ * Math.sin(angleX);
              const nextRotatedZ = nextGridY * Math.sin(angleX) + nextWaveZ * Math.cos(angleX) + 260;
              const nextScale = fov / (fov + nextRotatedZ);
              const nextScreenX = centerX + gridX * nextScale;
              const nextScreenY = centerY + nextRotatedY * nextScale;

              ctx.strokeStyle = accentColor;
              ctx.globalAlpha = alpha * 0.45;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(screenX, screenY);
              ctx.lineTo(nextScreenX, nextScreenY);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        mixBlendMode: "screen",
      }}
    />
  );
}
