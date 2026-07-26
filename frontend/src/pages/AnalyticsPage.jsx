import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  Zap 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { analyticsAPI } from '../services/api';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    }
  };

  const volumeData = [
    { day: 'Mon', scheduled: 4, published: 6 },
    { day: 'Tue', scheduled: 3, published: 8 },
    { day: 'Wed', scheduled: 7, published: 5 },
    { day: 'Thu', scheduled: 5, published: 9 },
    { day: 'Fri', scheduled: 8, published: 12 },
    { day: 'Sat', scheduled: 2, published: 4 },
    { day: 'Sun', scheduled: 4, published: 3 },
  ];

  const platformDistribution = [
    { name: 'Facebook Pages', value: 65, color: '#3b82f6' },
    { name: 'Instagram Profiles', value: 35, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Performance Analytics & Audit
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Social Media Insights
          </h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Track multi-platform engagement trends, publishing velocity, and success audit logs.
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Publishing Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Weekly Publishing Velocity
            </h3>
            <span className="text-xs text-gray-400 font-medium">Scheduled vs Published</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="published" fill="#6366f1" radius={[4, 4, 0, 0]} name="Published" />
                <Bar dataKey="scheduled" fill="#a855f7" radius={[4, 4, 0, 0]} name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share Donut Chart (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-dark-border space-y-4 flex flex-col justify-between">
          <div className="border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" /> Platform Share
            </h3>
            <p className="text-xs text-gray-400">Distribution across connected social networks</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-dark-border">
            {platformDistribution.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                  {p.name}
                </span>
                <span className="font-bold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
