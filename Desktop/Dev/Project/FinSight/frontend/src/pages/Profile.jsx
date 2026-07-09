import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [nameMsg, setNameMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handleName = async (e) => {
    e.preventDefault();
    setNameMsg('');
    setNameSaving(true);
    try {
      await authAPI.updateProfile({ name: nameForm.name });
      setNameMsg('Name updated successfully.');
    } catch (err) {
      setNameMsg(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setNameSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.newPassword !== pwForm.confirm) return setPwMsg('New passwords do not match.');
    setPwSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Password changed successfully.');
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-3">
        <h2 className="font-semibold text-lg">Account Info</h2>
        <p className="text-sm text-gray-500">Email: <span className="text-gray-800">{user?.email}</span></p>
        <form onSubmit={handleName} className="space-y-3 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
            />
          </div>
          {nameMsg && (
            <p className={`text-sm ${nameMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{nameMsg}</p>
          )}
          <button type="submit" disabled={nameSaving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
            {nameSaving ? 'Saving...' : 'Update Name'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-3">
        <h2 className="font-semibold text-lg">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          {['currentPassword', 'newPassword', 'confirm'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={pwForm[field]}
                onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
              />
            </div>
          ))}
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={pwSaving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
            {pwSaving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-lg mb-3">Danger Zone</h2>
        <button onClick={logout}
          className="border border-red-400 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
