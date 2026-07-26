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
  Eye 
} from 'lucide-react';
import { accountsAPI, postsAPI, aiAPI } from '../services/api';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialAIContent = null }) => {
  const [content, setContent] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isPublishNow, setIsPublishNow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('facebook'); // 'facebook' | 'instagram'

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      // Default to 1 hour from now for scheduling date input
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
      alert('Please enter a topic or brief prompt in the post box first!');
      return;
    }
    setIsAILoading(true);
    try {
      const res = await aiAPI.generate({
        topic: content,
        tone: 'professional',
        target_platform: previewTab
      });
      setContent(res.data.generated_text);
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
      };

      await postsAPI.createPost(payload, isPublishNow);
      onPostCreated();
      onClose();
      // Reset form
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
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-dark-border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Column: Form Editor */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dark-border overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Schedule Social Post
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Accounts Switcher */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Publishing To Accounts ({selectedAccounts.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {accounts.length === 0 ? (
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    No accounts linked yet. Go to 'Accounts' tab to connect your FB Page or IG Profile.
                  </p>
                ) : (
                  accounts.map((acc) => {
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
                        {!acc.is_mock && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                            LIVE META
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Content Textarea with AI Magic Button */}
            <div className="mb-4 relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Post Copy</label>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isAILoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {isAILoading ? 'AI Magic...' : 'AI Enhance Copy'}
                </button>
              </div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to publish? Type a topic or write your post content here..."
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
              />
            </div>

            {/* Optional Media URL */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Image / Media URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Publish Mode: Now vs Scheduled Date */}
            <div className="p-3.5 rounded-xl bg-dark-bg border border-dark-border mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Publishing Mode
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
                <div>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-dark-border rounded-lg px-3 py-2 text-xs text-indigo-300 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">APScheduler auto-publishes when time arrives.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-dark-border hover:bg-white/5"
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

        {/* Right Column: Live Platform Mock Preview */}
        <div className="w-full md:w-1/2 p-6 bg-dark-bg/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400" /> Live Meta Mock Preview
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTab('facebook')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewTab === 'facebook'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" /> FB Page
                </button>
                <button
                  onClick={() => setPreviewTab('instagram')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    previewTab === 'instagram'
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </button>
              </div>
            </div>

            {/* Post Mock Card */}
            <div className="bg-[#111827] border border-dark-border rounded-2xl p-4 shadow-xl max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  PP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-100">
                    {previewTab === 'facebook' ? 'PostPulse Brand Page' : 'postpulse_official'}
                  </h4>
                  <p className="text-[10px] text-gray-400">Just now • Meta Graph API</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-3 whitespace-pre-line">
                {content || 'Your generated post copy will appear here in real-time...'}
              </p>

              {mediaUrl ? (
                <div className="rounded-xl overflow-hidden border border-dark-border mb-3 max-h-48">
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 rounded-xl bg-white/5 border border-dashed border-dark-border flex flex-col items-center justify-center text-gray-500 mb-3">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[11px]">Media Preview Area</span>
                </div>
              )}

              <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>👍 42 Likes</span>
                <span>💬 12 Comments</span>
                <span>🔄 8 Shares</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 text-center mt-4">
            Simulating official Meta Graph API v19.0 container layout rendering.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CreatePostModal;
