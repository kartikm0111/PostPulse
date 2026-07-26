import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Plus, 
  Facebook, 
  Instagram, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Check 
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
      ? 'PostPulse Tech Page (Mock)' 
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
    if (!accountName || !accountId) {
      alert('Please fill in account name and ID');
      return;
    }

    try {
      await accountsAPI.connect({
        platform: platform,
        account_name: accountName,
        account_id: accountId,
        access_token: accessToken || `mock_token_${Date.now()}`,
        is_mock: !accessToken
      });
      setShowConnectModal(false);
      setAccountName('');
      setAccountId('');
      setAccessToken('');
      fetchAccounts();
    } catch (err) {
      console.error('Failed to connect account:', err);
    }
  };

  const handleDisconnect = async (id) => {
    if (confirm('Disconnect this account?')) {
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
            Connect and manage multiple Facebook Pages & Instagram Business Profiles from one central dashboard.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleQuickConnectMock('facebook')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Quick FB Demo Account
          </button>
          <button
            onClick={() => handleQuickConnectMock('instagram')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-pink-300 bg-pink-600/20 border border-pink-500/30 hover:bg-pink-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Quick IG Demo Account
          </button>
        </div>
      </div>

      {/* Account List Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Linked Accounts ({accounts.length})</h3>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading connected accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-dark-border text-center space-y-4">
            <Share2 className="w-12 h-12 text-indigo-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No accounts linked yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Click the Quick Demo buttons above to connect instant mock Facebook and Instagram accounts!
            </p>
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
                        <p className="text-[11px] text-gray-400">ID: {acc.account_id}</p>
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

                  <div className="space-y-2 text-xs text-gray-400 mb-6">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Sync
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="text-indigo-300 font-semibold">{acc.is_mock ? 'Mock Sandbox' : 'Live Meta Graph'}</span>
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
    </div>
  );
};

export default AccountsPage;
