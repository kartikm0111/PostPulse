import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

const PostCard = ({ post, onDelete }) => {
  const getStatusBadge = () => {
    switch (post.status) {
      case 'published':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Published
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Scheduled
          </span>
        );
      case 'publishing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            Draft
          </span>
        );
    }
  };

  const formattedDate = post.scheduled_at
    ? format(new Date(post.scheduled_at), 'MMM d, yyyy • h:mm a')
    : format(new Date(post.created_at), 'MMM d, yyyy');

  return (
    <div className="glass-card p-5 rounded-2xl border border-dark-border hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white ring-2 ring-[#0B0F19]">
                <Facebook className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white ring-2 ring-[#0B0F19]">
                <Instagram className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">Meta Auto-Publish</span>
          </div>

          {getStatusBadge()}
        </div>

        {/* Post Copy Content */}
        <p className="text-gray-200 text-sm line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Media Thumbnail if present */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4 rounded-xl overflow-hidden max-h-40 border border-dark-border">
            <img src={post.media_urls[0]} alt="Post Media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Hashtag Badges */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.hashtags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-[11px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>{post.status === 'published' ? 'Published' : 'Scheduled'}: {formattedDate}</span>
        </div>

        <button
          onClick={() => onDelete(post.id)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Delete Post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
