import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Calendar, 
  Image as ImageIcon, 
  Facebook, 
  Instagram, 
  Check, 
  Eye, 
  Smartphone, 
  Palette, 
  Split 
} from 'lucide-react';
import { accountsAPI, postsAPI, aiAPI } from '../services/api';
import ThreeDevicePreviewer from './ThreeDevicePreviewer';
import VisualCanvasEngine from './VisualCanvasEngine';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialAIContent = null }) => {
  const [content, setContent] = useState('');
  const [variantB, setVariantB] = useState('');
  const [useABTesting, setUseABTesting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isPublishNow, setIsPublishNow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'canvas'
  const [previewMode, setPreviewMode] = useState('3d'); // '3d' | '2d'
  const [previewPlatform, setPreviewPlatform] = useState('instagram');

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      const defaultSchedule = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setScheduledDate(defaultSchedule);

      if (initialAIContent) {
        setContent(initialAIContent);
      }
    }
  }, [isOpen, initialAIContent]);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.list();
      setAccounts(res.data);
      if (res.data.length > 0) {
        setSelectedAccounts(res.data.map(a => a.id));
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const toggleAccount = (id) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(a => a != id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const handleGenerateAI = async () => {
    if (!content.trim()) {
      alert('Please enter a topic in the copy box first!');
      return;
    }
    setIsAILoading(true);
    try {
      const res = await aiAPI.generate({
        topic: content,
        tone: 'professional',
        target_platform: previewPlatform
      });
      setContent(res.data.generated_text);
      setVariantB(res.data.facebook_variant);
      if (!mediaUrl && res.data.ai_image_prompt) {
        setMediaUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800');
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Post content cannot be empty');
      return;
    }
    if (selectedAccounts.length === 0) {
      alert('Please select at least one social media account');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        content: content,
        account_ids: selectedAccounts,
        media_urls: mediaUrl ? [mediaUrl] : [],
        scheduled_at: isPublishNow ? null : new Date(scheduledDate).toISOString(),
        hashtags: []
      };

      await postsAPI.createPost(payload, isPublishNow);
      onPostCreated();
      onClose();
      setContent('');
      setMediaUrl('');
    } catch (err) {
      console.error('Failed to save post:', err);
      alert(err.response?.data?.detail || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-5xl rounded-2xl border border-dark-border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left Column: Post Composer & Visual Canvas Tab */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dark-border overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    activeTab === 'editor'
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 shadow'
                      : 'text-gray-400 border-dark-border hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Post Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('canvas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    activeTab === 'canvas'
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500/40 shadow'
                      : 'text-gray-400 border-dark-border hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-400" /> Visual Canvas
                </button>
              </div>

              <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'canvas' ? (
              <VisualCanvasEngine
                onSelectGraphic={(dataUrl) => {
                  setMediaUrl(dataUrl);
                  setActiveTab('editor');
                }}
              />
            ) : (
              <div>
                {/* Target Accounts Switcher */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    Target Accounts ({selectedAccounts.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map((acc) => {
                      const isSelected = selectedAccounts.includes(acc.id);
                      return (
                        <button
                          type="button"
                          key={acc.id}
                          onClick={() => toggleAccount(acc.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-sm'
                              : 'bg-white/5 text-gray-400 border-dark-border opacity-60'
                          }`}
                        >
                          {acc.platform === 'facebook' ? (
                            <Facebook className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          )}
                          <span>{acc.account_name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Post Text */}
                <div className="mb-4 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Variant A (Primary Caption)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUseABTesting(!useABTesting)}
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                          useABTesting ? 'bg-purple-600/30 text-purple-300 border-purple-500/40' : 'text-gray-400 border-dark-border'
                        }`}
                      >
                        <Split className="w-3.5 h-3.5" /> A/B Hook Testing
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isAILoading}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        {isAILoading ? 'AI Magic...' : 'AI Enhance Copy'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your primary post copy or prompt topic..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                {/* A/B Testing Secondary Variant */}
                {useABTesting && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-purple-400 mb-1.5 uppercase tracking-wider">
                      Variant B (Alternative Hook)
                    </label>
                    <textarea
                      rows={3}
                      value={variantB}
                      onChange={(e) => setVariantB(e.target.value)}
                      placeholder="Write alternative hook variation B to test real-time engagement..."
                      className="w-full bg-dark-bg border border-purple-500/30 rounded-xl p-3 text-sm text-gray-200 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Media Image URL */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                  />
                </div>

                {/* Publishing Mode */}
                <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Publishing Strategy
                    </span>
                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-dark-border">
                      <button
                        type="button"
                        onClick={() => setIsPublishNow(false)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          !isPublishNow ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                        }`}
                      >
                        Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPublishNow(true)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          isPublishNow ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                        }`}
                      >
                        Publish Now
                      </button>
                    </div>
                  </div>

                  {!isPublishNow && (
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-dark-border rounded-lg px-3 py-2 text-xs text-indigo-300 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 border border-dark-border hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              {isPublishNow ? (
                <>
                  <Send className="w-4 h-4" /> Publish Instantly
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Schedule Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive 3D Smartphone Device Mockup Preview */}
        <div className="w-full md:w-1/2 p-6 bg-dark-bg/60 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2 border-b border-dark-border pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-400" /> Interactive 3D Device Previewer
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('facebook')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    previewPlatform === 'facebook'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" /> FB Page
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('instagram')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    previewPlatform === 'instagram'
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" /> IG Feed
                </button>
              </div>
            </div>

            {/* Interactive 3D Smartphone Device Canvas */}
            <ThreeDevicePreviewer
              content={content}
              mediaUrl={mediaUrl}
              platform={previewPlatform}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePostModal;
