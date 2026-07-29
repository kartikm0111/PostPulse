import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Smartphone, Facebook, Instagram, Image as ImageIcon } from 'lucide-react';

const ThreeDevicePreviewer = ({ content, mediaUrl, platform = 'instagram' }) => {
  const canvasRef = useRef(null);
  const [rotY, setRotY] = useState(-15);
  const [rotX, setRotX] = useState(10);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    setRotY((prev) => prev + deltaX * 0.5);
    setRotX((prev) => Math.max(-30, Math.min(30, prev - deltaY * 0.5)));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Control Instruction Banner */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4 cursor-grab">
        <RotateCw className="w-3.5 h-3.5 animate-spin-slow text-purple-400" />
        <span>Drag to rotate 3D Smartphone Device in 360° space</span>
      </div>

      {/* 3D Spatial Device Wrapper */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          perspective: '1000px',
          cursor: isDragging.current ? 'grabbing' : 'grab',
        }}
        className="relative py-6 select-none"
      >
        <div
          style={{
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="w-[280px] h-[540px] bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[42px] p-3 border-4 border-gray-700 shadow-2xl shadow-indigo-500/20 relative"
        >
          {/* Smartphone Hardware Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-800 mr-2"></div>
            <div className="w-2 h-2 rounded-full bg-blue-900/40"></div>
          </div>

          {/* Device Screen Content */}
          <div className="w-full h-full bg-[#0B0F19] rounded-[32px] overflow-hidden flex flex-col pt-7 px-3 text-xs text-gray-200 border border-gray-800">
            {/* Social Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-800/80 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  PP
                </div>
                <div>
                  <h5 className="font-bold text-[11px] leading-tight text-white">
                    {platform === 'facebook' ? 'PostPulse Page' : 'postpulse_official'}
                  </h5>
                  <p className="text-[9px] text-gray-400">Sponsored • 3D Preview</p>
                </div>
              </div>
              {platform === 'facebook' ? (
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
              )}
            </div>

            {/* Post Copy */}
            <p className="text-[11px] text-gray-200 leading-snug line-clamp-3 mb-2 font-normal">
              {content || 'Your generated post caption will project onto 3D hardware in real-time...'}
            </p>

            {/* Post Media Container */}
            {mediaUrl ? (
              <div className="w-full h-44 rounded-xl overflow-hidden mb-2 border border-gray-800">
                <img src={mediaUrl} alt="3D Media Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-44 rounded-xl bg-gray-900/60 border border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-500 mb-2">
                <ImageIcon className="w-6 h-6 mb-1 text-gray-600" />
                <span className="text-[10px]">3D Image Screen Projection</span>
              </div>
            )}

            {/* Social Bar */}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400 mt-auto pb-2">
              <span>❤️ 1,248</span>
              <span>💬 84 Comments</span>
              <span>🔄 32 Shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDevicePreviewer;
