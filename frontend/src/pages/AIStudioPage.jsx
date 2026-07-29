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
  Sliders, 
  BookOpen, 
  RefreshCw, 
  Plus 
} from 'lucide-react';
import { aiAPI } from '../services/api';

const AIStudioPage = ({ onOpenScheduleWithContent }) => {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'brand_rag' | 'evergreen'
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('instagram');
  const [cta, setCta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // RAG State
  const [ragTitle, setRagTitle] = useState('');
  const [ragContent, setRagContent] = useState('');
  const [ragList, setRagList] = useState([
    { id: '1', title: 'Campus Hackathon Voice Guidelines', content: 'Use energetic dev phrasing, highlight prize pools ($10k+), and include #BuildInPublic hashtag.' },
    { id: '2', title: 'SaaS Launch Positioning Rules', content: 'Focus on automation efficiency, time saved per week, and professional AI features.' }
  ]);

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

  const handleAddRAGDoc = (e) => {
    e.preventDefault();
    if (!ragTitle || !ragContent) return;
    setRagList([...ragList, { id: String(Date.now()), title: ragTitle, content: ragContent }]);
    setRagTitle('');
    setRagContent('');
    alert('Brand Voice RAG guideline added to Knowledge Base!');
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
            <Sparkles className="w-3.5 h-3.5" /> Brand Voice RAG & AI Copy Studio
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            AI Content Studio & Brand RAG
          </h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Train the AI on your unique brand voice, guidelines, and viral exemplars. Auto-generate tailored social copy and recycle top posts.
          </p>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex bg-dark-card p-1 rounded-xl border border-dark-border">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'generator' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" /> AI Generator
          </button>
          <button
            onClick={() => setActiveTab('brand_rag')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'brand_rag' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Brand RAG Engine
          </button>
          <button
            onClick={() => setActiveTab('evergreen')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'evergreen' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Evergreen Recycler
          </button>
        </div>
      </div>

      {activeTab === 'brand_rag' ? (
        /* Brand Voice RAG Knowledge Base View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
              <BookOpen className="w-4 h-4 text-purple-400" /> Add Brand Guidelines or Exemplars
            </h3>
            <form onSubmit={handleAddRAGDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                  Guideline / Brand Title
                </label>
                <input
                  type="text"
                  required
                  value={ragTitle}
                  onChange={(e) => setRagTitle(e.target.value)}
                  placeholder="E.g., Campus Event Tone Rules"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                  Brand Phrasing / Vocabulary / Past Viral Copy
                </label>
                <textarea
                  rows={5}
                  required
                  value={ragContent}
                  onChange={(e) => setRagContent(e.target.value)}
                  placeholder="Paste your past high-performing captions, brand tone rules, or required hashtags..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="w-full gradient-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add to RAG Knowledge Store
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-dark-border pb-3">
              Active Brand Voice Guidelines ({ragList.length})
            </h3>
            <div className="space-y-4">
              {ragList.map((doc) => (
                <div key={doc.id} className="glass-card p-5 rounded-2xl border border-dark-border">
                  <h4 className="text-sm font-bold text-purple-300 mb-1">{doc.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed bg-dark-bg/60 p-3 rounded-xl border border-dark-border">
                    {doc.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'evergreen' ? (
        /* Evergreen AI Recycler View */
        <div className="glass-panel p-8 rounded-2xl border border-dark-border text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-7 h-7 animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold text-white">Automated Evergreen AI Content Recycler</h3>
          <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
            PostPulse automatically analyzes your top 10% performing posts via Meta Graph API Insights and re-skins them 60–90 days later with fresh AI wording and visual graphics.
          </p>
          <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border text-left text-xs text-indigo-300">
            <span className="font-bold block mb-1">🤖 Scheduled Auto-Recycle Candidate:</span>
            "🚀 Re-skinning top post from 60 days ago: Modernized hackathon promo ready for next cohort launch."
          </div>
        </div>
      ) : (
        /* AI Generator View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-dark-border space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" /> Studio Controls
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Topic or Product Announcement
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., Launching our new summer SaaS feature with 50% discount..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Brand Tone & Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none"
                >
                  {tones.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {loading ? 'AI Crafting Copy...' : 'Generate Social Post'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {!result ? (
              <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Output Studio Canvas</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Enter your post topic on the left and click "Generate Social Post" to craft optimized copy.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStudioPage;
