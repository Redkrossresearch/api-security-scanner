import React, { useEffect, useRef } from "react";

export default function CyberCanvasBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas dimensions
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse interactive coordinates
    const mouse = { x: null, y: null, targetX: null, targetY: null };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.targetX = null;
      mouse.targetY = null;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    // Particle nodes definition
    const particleCount = 75;
    const particles = [];
    const hexCodes = ["01", "00", "0xFA", "SEC", "API", "JWT", "AUTH"];

    // Initialize 3D cloud particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        text: Math.random() > 0.75 ? hexCodes[Math.floor(Math.random() * hexCodes.length)] : null,
      });
    }

    let angleY = 0;
    let angleX = 0.5; // Fixed perspective tilt
    const fov = 350;

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fetch dynamic theme colors
      const rootStyle = getComputedStyle(document.documentElement);
      const accentColor = rootStyle.getPropertyValue("--theme-accent").trim() || "#8B5CF6";

      // Interpolate mouse coordinates smoothly
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.1;
          mouse.y += (mouse.targetY - mouse.y) * 0.1;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Slow rotation over time
      angleY += 0.0018;

      // Map particles
      const projected = [];

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Bounce boundaries in 3D box
        if (Math.abs(p.x) > 400) p.vx *= -1;
        if (Math.abs(p.y) > 300) p.vy *= -1;
        if (Math.abs(p.z) > 300) p.vz *= -1;

        // Apply mouse displacement / ripple effect
        let dispX = 0;
        let dispY = 0;
        let dispZ = 0;
        
        if (mouse.x !== null && mouse.y !== null) {
          // Temporarily project current particle to compare with mouse screen coords
          const cosY = Math.cos(angleY);
          const sinY = Math.sin(angleY);
          const cosX = Math.cos(angleX);
          const sinX = Math.sin(angleX);

          const rotX = p.x * cosY - p.z * sinY;
          const rotZ = p.x * sinY + p.z * cosY;
          const rotY = p.y * cosX - rotZ * sinX;
          const projZ = p.y * sinX + rotZ * cosX + 400;

          const scale = fov / (fov + projZ);
          const screenX = centerX + rotX * scale;
          const screenY = centerY + rotY * scale;

          const dx = mouse.x - screenX;
          const dy = mouse.y - screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const force = (130 - dist) * 0.18;
            dispX = -dx * force * 0.2;
            dispY = -dy * force * 0.2;
            dispZ = -force * 0.5;
          }
        }

        // Apply rotation
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        // Apply offset from displacement
        const posX = p.x + dispX;
        const posY = p.y + dispY;
        const posZ = p.z + dispZ;

        const rotX = posX * cosY - posZ * sinY;
        const rotZ = posX * sinY + posZ * cosY;
        const rotY = posY * cosX - rotZ * sinX;
        const projectedZ = posY * sinX + rotZ * cosX + 420; // Perspective depth offset

        const scale = fov / (fov + projectedZ);
        const screenX = centerX + rotX * scale;
        const screenY = centerY + rotY * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z: projectedZ,
          scale: scale,
          text: p.text,
          orig: p,
        });
      });

      // Draw connections (lines) between near particles in 3D space
      ctx.lineWidth = 0.85;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 800) continue; // Skip if too far behind

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          // Calculate 3D distance between original coordinates
          const dx = p1.orig.x - p2.orig.x;
          const dy = p1.orig.y - p2.orig.y;
          const dz = p1.orig.z - p2.orig.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < 140) {
            // Calculate opacity based on distance and depth
            const edgeAlpha = (1.0 - dist3D / 140) * 0.16 * p1.scale;
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = edgeAlpha;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes and binary indicators
      projected.forEach((p) => {
        const alpha = Math.max(0.02, Math.min(0.35, p.scale * 0.45));
        ctx.globalAlpha = alpha;

        if (p.text) {
          // Draw floating security tokens/data
          ctx.font = `${Math.round(p.scale * 11)}px 'Courier New', monospace`;
          ctx.fillStyle = accentColor;
          ctx.fillText(p.text, p.x + 6, p.y + 3);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.scale * 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw standard network node
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.scale * 3.8, 0, Math.PI * 2);
          ctx.fill();

          // Outer glowing ring for closer particles
          if (p.scale > 0.8) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.strokeStyle = accentColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.scale * 8, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // Draw horizontal cybernetic scanning gird lines in background perspective
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const gridY = centerY + (i - 2) * 110;
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(canvas.width, gridY);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
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
