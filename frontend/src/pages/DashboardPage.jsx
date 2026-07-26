import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { analyticsAPI, postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

const DashboardPage = ({ onOpenCreateModal }) => {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        postsAPI.getPosts()
      ]);
      setStats(statsRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(id);
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.status === activeFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-dark-border bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-dark-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> AI Automated Social Engine
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Welcome back to <span className="gradient-text">PostPulse</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Manage multi-platform Facebook Pages and Instagram Business accounts, generate AI copy, and schedule automated post publishing.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="gradient-btn px-6 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-500/30 relative z-10"
        >
          <Plus className="w-5 h-5" />
          <span>Create & Schedule Post</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Posts</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stats?.total_posts || 0}</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +12% this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Scheduled Queue</p>
            <h3 className="text-3xl font-bold text-indigo-300 mt-1">{stats?.scheduled_posts || 0}</h3>
            <span className="text-[11px] text-indigo-400 font-medium mt-1">Auto-Publish Active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Published Posts</p>
            <h3 className="text-3xl font-bold text-emerald-300 mt-1">{stats?.published_posts || 0}</h3>
            <span className="text-[11px] text-emerald-400 font-medium mt-1">Meta Graph Confirmed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Connected Accounts</p>
            <h3 className="text-3xl font-bold text-purple-300 mt-1">{stats?.connected_accounts || 0}</h3>
            <span className="text-[11px] text-purple-400 font-medium mt-1">FB Pages & Instagram</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Share2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Post Feed Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Social Posts Stream</h2>
            <p className="text-xs text-gray-400">Monitor your draft, scheduled, and published social content.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-dark-card p-1 rounded-xl border border-dark-border">
            {['all', 'scheduled', 'published', 'draft'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Post Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading PostPulse stream...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-200">No posts in this view yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Create your first social media post or use the AI Content Studio to generate high-converting copy!
            </p>
            <button
              onClick={onOpenCreateModal}
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
