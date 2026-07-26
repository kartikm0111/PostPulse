import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  Wand2, 
  Tag, 
  Image as ImageIcon, 
  Facebook, 
  Instagram, 
  Sliders 
} from 'lucide-react';
import { aiAPI } from '../services/api';

const AIStudioPage = ({ onOpenScheduleWithContent }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('instagram');
  const [cta, setCta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const tones = [
    { id: 'professional', label: 'Professional & Authoritative' },
    { id: 'casual', label: 'Casual & Friendly' },
    { id: 'punchy', label: 'Punchy & Bold' },
    { id: 'viral', label: 'Viral & Hook-Driven' },
    { id: 'educational', label: 'Educational & Insights' },
    { id: 'sales', label: 'High-Converting Sales' },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a topic or concept for your post.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiAPI.generate({
        topic: topic,
        tone: tone,
        target_platform: platform,
        include_hashtags: true,
        include_emojis: true,
        call_to_action: cta || null
      });
      setResult(res.data);
    } catch (err) {
      console.error('AI Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-dark-border bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-dark-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            AI Content Studio & Copywriter
          </h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Generate high-engaging social copy, platform-tailored variations (Facebook vs Instagram), hashtag clusters, and image prompts in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-dark-border space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" /> Studio Controls
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Topic or Product Announcement
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., Launching our new summer SaaS feature with 50% discount for early adopters..."
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Content Tone Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Brand Tone & Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50"
              >
                {tones.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Target Primary Platform */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Primary Target Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    platform === 'instagram'
                      ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-dark-bg text-gray-400 border-dark-border'
                  }`}
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('facebook')}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    platform === 'facebook'
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                      : 'bg-dark-bg text-gray-400 border-dark-border'
                  }`}
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </button>
              </div>
            </div>

            {/* Custom CTA */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Custom Call-to-Action (Optional)
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="E.g., Click the link in bio to claim discount!"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              <Wand2 className="w-4 h-4" />
              {loading ? 'AI Crafting Copy...' : 'Generate Social Post'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Output Studio Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Output Studio Canvas</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Enter your post topic on the left and click "Generate Social Post" to craft optimized copy, platform variants, and hashtags.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Generated Text Box */}
              <div className="glass-panel p-6 rounded-2xl border border-dark-border relative space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border pb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Primary Generated Copy
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(result.generated_text)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 border border-dark-border flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => onOpenScheduleWithContent(result.generated_text)}
                      className="gradient-btn px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Schedule Now
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line bg-dark-bg/60 p-4 rounded-xl border border-dark-border">
                  {result.generated_text}
                </p>
              </div>

              {/* Platform Variant Adaptations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-dark-border">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                    <Facebook className="w-4 h-4" /> Facebook Page Variant
                  </h4>
                  <p className="text-xs text-gray-300 line-clamp-6 leading-relaxed whitespace-pre-line bg-dark-bg/40 p-3 rounded-xl border border-dark-border">
                    {result.facebook_variant}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-dark-border">
                  <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5 mb-2">
                    <Instagram className="w-4 h-4" /> Instagram Bio & Caption Variant
                  </h4>
                  <p className="text-xs text-gray-300 line-clamp-6 leading-relaxed whitespace-pre-line bg-dark-bg/40 p-3 rounded-xl border border-dark-border">
                    {result.instagram_variant}
                  </p>
                </div>
              </div>

              {/* Hashtag Cluster & AI Image Prompt */}
              <div className="glass-card p-5 rounded-2xl border border-dark-border space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Tag className="w-4 h-4 text-purple-400" /> Recommended Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggested_hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-border">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-400" /> Recommended AI Image Prompt
                  </h4>
                  <p className="text-xs text-gray-400 italic bg-dark-bg/60 p-3 rounded-xl border border-dark-border">
                    "{result.ai_image_prompt}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudioPage;
