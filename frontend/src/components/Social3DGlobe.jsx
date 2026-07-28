import React, { useEffect, useRef } from 'react';

const Social3DGlobe = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Canvas sizing
    const width = (canvas.width = canvas.parentElement.clientWidth || 600);
    const height = (canvas.height = 220);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 80;

    // Create 3D particle nodes orbiting sphere
    const numNodes = 36;
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      const theta = Math.acos(-1 + (2 * i) / numNodes);
      const phi = Math.sqrt(numNodes * Math.PI) * theta;

      nodes.push({
        x: radius * Math.cos(phi) * Math.sin(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(theta),
        baseRadius: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#6366f1' : i % 3 === 0 ? '#ec4899' : '#a855f7',
      });
    }

    let angleX = 0.005;
    let angleY = 0.008;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint spatial orbital rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sort nodes by Z depth for 3D perspective
      nodes.sort((a, b) => b.z - a.z);

      nodes.forEach((node) => {
        // Rotate 3D points
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        // Y-axis rotation
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;

        // X-axis rotation
        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        node.x = x1;
        node.y = y1;
        node.z = z2;

        // 3D Perspective scale factor
        const perspective = 300 / (300 + node.z);
        const screenX = centerX + node.x * perspective;
        const screenY = centerY + node.y * perspective;
        const nodeRadius = node.baseRadius * perspective;
        const alpha = Math.max(0.2, (node.z + radius) / (2 * radius));

        // Draw particle node
        ctx.beginPath();
        ctx.arc(screenX, screenY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Connect near nodes with spatial neon beams
        nodes.forEach((other) => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dz = node.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 45) {
            const otherX = centerX + other.x * perspective;
            const otherY = centerY + other.y * perspective;

            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = node.color;
            ctx.globalAlpha = (1 - dist / 45) * 0.25;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full relative h-[220px] rounded-2xl overflow-hidden glass-panel border border-indigo-500/20 flex items-center justify-between px-8 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-dark-card">
      <div className="z-10 max-w-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Spatial 3D Node Mesh
        </span>
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          Multi-Platform Spatial Engine
        </h3>
        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
          Real-time 3D telemetry tracking active Facebook Page & Instagram Graph API publishing channels.
        </p>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default Social3DGlobe;
