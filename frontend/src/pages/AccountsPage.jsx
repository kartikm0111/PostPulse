import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Plus, 
  Facebook, 
  Instagram, 
  Trash2, 
  ShieldCheck, 
  Check, 
  X,
  ExternalLink,
  Key,
  Globe,
  Info
} from 'lucide-react';
import { accountsAPI } from '../services/api';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [platform, setPlatform] = useState('facebook');
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.list();
      setAccounts(res.data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickConnectMock = async (targetPlatform) => {
    const mockName = targetPlatform === 'facebook' 
      ? 'PostPulse Demo Page (Mock)' 
      : 'postpulse_official_ig';
    const mockAccId = targetPlatform === 'facebook' ? 'fb_page_991823' : 'ig_biz_881723';
    
    try {
      await accountsAPI.connect({
        platform: targetPlatform,
        account_name: mockName,
        account_id: mockAccId,
        access_token: `mock_token_${Date.now()}`,
        is_mock: true
      });
      fetchAccounts();
    } catch (err) {
      console.error('Failed to connect mock account:', err);
    }
  };

  const handleCustomConnect = async (e) => {
    e.preventDefault();
    if (!accountId.trim()) {
      alert('Please enter your Facebook Page ID or Instagram Business Account ID.');
      return;
    }
    if (!accessToken.trim()) {
      alert('Please enter your Meta Page/User Access Token.');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountsAPI.connect({
        platform: platform,
        account_name: accountName.trim() || `${platform === 'facebook' ? 'Facebook Page' : 'Instagram Profile'} (${accountId.trim()})`,
        account_id: accountId.trim(),
        access_token: accessToken.trim(),
        is_mock: false
      });
      setShowConnectModal(false);
      setAccountName('');
      setAccountId('');
      setAccessToken('');
      fetchAccounts();
    } catch (err) {
      console.error('Failed to connect live account:', err);
      alert(err.response?.data?.detail || 'Failed to connect Meta account. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (id) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      try {
        await accountsAPI.disconnect(id);
        fetchAccounts();
      } catch (err) {
        console.error('Failed to disconnect account:', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Meta Graph API v19.0+ Integration
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Social Media Accounts Hub
          </h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Connect your live Facebook Pages and Instagram Business Accounts, or use instant mock accounts for evaluation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowConnectModal(true)}
            className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" /> Connect Live Meta Account
          </button>

          <button
            onClick={() => handleQuickConnectMock('facebook')}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 flex items-center gap-1.5"
          >
            <Facebook className="w-3.5 h-3.5" /> + FB Demo Account
          </button>
          <button
            onClick={() => handleQuickConnectMock('instagram')}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-pink-300 bg-pink-600/20 border border-pink-500/30 hover:bg-pink-600/30 flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5" /> + IG Demo Account
          </button>
        </div>
      </div>

      {/* Account List Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Connected Social Accounts ({accounts.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading connected accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-4">
            <Share2 className="w-12 h-12 text-indigo-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No accounts linked yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Click <strong>"Connect Live Meta Account"</strong> to attach your official Facebook Page or Instagram Profile, or use quick demo buttons!
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Connect Live Meta Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div key={acc.id} className="glass-card p-6 rounded-2xl border border-dark-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.profile_picture || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                        alt={acc.account_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{acc.account_name}</h4>
                        <p className="text-[11px] text-gray-400 font-mono">ID: {acc.account_id}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 border border-dark-border">
                      {acc.platform === 'facebook' ? (
                        <Facebook className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Instagram className="w-5 h-5 text-pink-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-400 mb-6 bg-dark-bg/50 p-3 rounded-xl border border-dark-border">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Engine:</span>
                      {acc.is_mock ? (
                        <span className="text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          Mock Sandbox
                        </span>
                      ) : (
                        <span className="text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Live Meta Graph
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDisconnect(acc.id)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect Account
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Live Meta Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-dark-border shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Connect Real Meta Account</h3>
                  <p className="text-xs text-gray-400">Facebook Page or Instagram Business Profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomConnect} className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Select Social Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatform('facebook')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      platform === 'facebook'
                        ? 'bg-blue-600/25 text-blue-200 border-blue-500/50 shadow'
                        : 'bg-dark-bg text-gray-400 border-dark-border'
                    }`}
                  >
                    <Facebook className="w-4 h-4 text-blue-400" /> Facebook Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('instagram')}
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      platform === 'instagram'
                        ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-pink-200 border-pink-500/50 shadow'
                        : 'bg-dark-bg text-gray-400 border-dark-border'
                    }`}
                  >
                    <Instagram className="w-4 h-4 text-pink-400" /> Instagram Business
                  </button>
                </div>
              </div>

              {/* Account / Page ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {platform === 'facebook' ? 'Facebook Page ID' : 'Instagram Business Account ID'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder={platform === 'facebook' ? 'E.g., 102938475610293' : 'E.g., 17841400000000000'}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>

              {/* Optional Account Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Account Name / Label (Optional)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="E.g., My Official Brand Page"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-gray-200 focus:outline-none"
                />
              </div>

              {/* Access Token Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Meta Graph API Access Token <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Paste your Page Access Token or User Access Token (EAA...)"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-indigo-300 focus:outline-none font-mono resize-none"
                />
              </div>

              {/* Helpful Meta Access Guide */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-gray-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                  <Info className="w-4 h-4" /> How to get a Meta Access Token:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
                  <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">Meta Graph API Explorer <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Select your Meta App and add permissions: <code className="bg-black/40 px-1 py-0.5 rounded text-indigo-300">pages_manage_posts</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-indigo-300">instagram_basic</code></li>
                  <li>Click <strong>Generate Access Token</strong> and copy the token into the field above.</li>
                </ol>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-dark-border hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gradient-btn py-2.5 rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'Connecting...' : 'Connect Live Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
