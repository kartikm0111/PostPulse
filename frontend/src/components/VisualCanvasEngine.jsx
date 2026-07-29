import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, Image as ImageIcon, Palette } from 'lucide-react';

const VisualCanvasEngine = ({ onSelectGraphic }) => {
  const canvasRef = useRef(null);
  const [headline, setHeadline] = useState('AI HACKATHON 2026');
  const [subtext, setSubtext] = useState('48 Hours of Code & $10,000 Prizes');
  const [badgeText, setBadgeText] = useState('CAMPUS FEATURE');
  const [theme, setTheme] = useState('neon'); // 'neon' | 'dark' | 'sunset'

  useEffect(() => {
    renderCanvas();
  }, [headline, subtext, badgeText, theme]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = (canvas.width = 600);
    const h = (canvas.height = 600);

    // Theme Background Gradients
    let grad;
    if (theme === 'neon') {
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.5, '#1E1B4B');
      grad.addColorStop(1, '#311042');
    } else if (theme === 'sunset') {
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#451225');
      grad.addColorStop(0.5, '#7C2D12');
      grad.addColorStop(1, '#18181B');
    } else {
      grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#090D16');
      grad.addColorStop(1, '#111827');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw Decorative Glowing Circles
    ctx.beginPath();
    ctx.arc(100, 100, 140, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'neon' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(234, 88, 12, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(500, 500, 180, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'neon' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(244, 63, 94, 0.2)';
    ctx.fill();

    // Border Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Draw Badge Box
    if (badgeText) {
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.roundRect(50, 60, 180, 36, 8);
      ctx.fill();

      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(badgeText.toUpperCase(), 65, 83);
    }

    // Draw Main Headline Text
    ctx.font = 'extrabold 36px Outfit, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    
    // Wrap headline
    const words = headline.split(' ');
    let line = '';
    let y = 220;

    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 500 && i > 0) {
        ctx.fillText(line, 50, y);
        line = words[i] + ' ';
        y += 48;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Draw Subtext Description
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(subtext, 50, y + 50);

    // Draw Footer Brand Watermark
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.fillStyle = '#818CF8';
    ctx.fillText('⚡ POSTPULSE AUTOMATED VISUAL CANVAS', 50, h - 50);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `postpulse-graphic-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleAttachToPost = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSelectGraphic) {
      onSelectGraphic(dataUrl);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-6">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" /> Automated Visual Graphic Engine
        </h3>
        <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          No Canva/Figma Needed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Controls Column (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
              Graphic Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
              Subtitle / Details
            </label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
              Badge Label
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
              Color Palette Theme
            </label>
            <div className="flex gap-2">
              {['neon', 'sunset', 'dark'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                    theme === t
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-dark-bg text-gray-400 border-dark-border'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-dark-border hover:bg-white/10 text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export PNG
            </button>
            <button
              type="button"
              onClick={handleAttachToPost}
              className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Attach to Post
            </button>
          </div>
        </div>

        {/* Canvas Preview Column (7 cols) */}
        <div className="md:col-span-7 flex items-center justify-center">
          <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-dark-border">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCanvasEngine;
