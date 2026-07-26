import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Facebook, 
  Instagram 
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { postsAPI } from '../services/api';

const CalendarPage = ({ onOpenCreateModal }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await postsAPI.getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts for calendar:', err);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getPostsForDay = (targetDay) => {
    return posts.filter(post => {
      const postDate = post.scheduled_at ? new Date(post.scheduled_at) : new Date(post.created_at);
      return isSameDay(postDate, targetDay);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-dark-border">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Visual Content Calendar
          </h2>
          <p className="text-xs text-gray-400">View and organize all your scheduled Meta Facebook & Instagram posts.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-dark-bg p-1 rounded-xl border border-dark-border">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white px-3">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Post
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden shadow-2xl">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-dark-border bg-dark-card/60 text-center py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-dark-border bg-dark-bg/40 min-h-[500px]">
          {days.map((dayItem, idx) => {
            const dayPosts = getPostsForDay(dayItem);
            const isCurrentMonth = isSameMonth(dayItem, currentMonth);
            const isToday = isSameDay(dayItem, new Date());

            return (
              <div
                key={idx}
                className={`p-2 min-h-[110px] flex flex-col justify-between transition-colors ${
                  !isCurrentMonth ? 'opacity-30 bg-black/20' : 'hover:bg-white/[0.02]'
                } ${isToday ? 'bg-indigo-950/20 ring-1 ring-indigo-500/40 inset-0' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'
                    }`}
                  >
                    {format(dayItem, 'd')}
                  </span>
                  <button
                    onClick={onOpenCreateModal}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-500 hover:text-indigo-300"
                    title="Add post for this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Posts List */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayPosts.map((p) => (
                    <div
                      key={p.id}
                      className={`p-1.5 rounded-lg text-[10px] border truncate flex items-center gap-1 ${
                        p.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}
                    >
                      {p.status === 'published' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                      )}
                      <span className="truncate">{p.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
