import { useEffect, useState } from 'react';
import { X, User, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '~/auth/AuthProvider';
import axiosInstance from '~/lib/axios';
import { toast } from 'react-toastify';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const { user, setUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState({
    username: user?.username,
    email: user?.email,
    timezone: user?.timezone,
    notificationPrefs: user?.notificationPrefs,
  })

  useEffect(() => {
    setUserData({
      username: user?.username,
      email: user?.email,
      timezone: user?.timezone,
      notificationPrefs: user?.notificationPrefs,
    })
  }, [user])
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserData({ ...userData, [e.target.name]: e.target.value })
    console.log("UserData", userData)
  }
  async function handleSave() {
    try {
      setIsSaving(true)
      const {data} = await axiosInstance.put('/auth/profile', {
        username: userData.username,
        email: userData.email,
        notificationPrefs: userData.notificationPrefs,
      })
      toast.success("User data saved successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setUser(data.user)
      onClose()
    } catch (error) {
      console.error("Error saving user data", error)
      toast.error("Error saving user data", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsSaving(false)
    }

  }
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Account Settings</h2>
            <p className="text-neutral-400 text-sm mt-1">Manage your account preferences and notification settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'profile'
              ? 'text-white bg-neutral-800'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'notifications'
              ? 'text-white bg-neutral-800'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
          >
            Notifications
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' ? (
            <ProfileTab userData={userData} handleChange={handleChange} handleSave={handleSave} />
          ) : (
            <NotificationsTab userData={userData} handleChange={handleChange} handleSave={handleSave} setUserData={setUserData}/>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-neutral-800">
          <button onClick={handleSave} disabled={isSaving} className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ userData, handleChange, handleSave }: { userData: any, handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void, handleSave: () => Promise<void> }) {
  console.log("UserData", userData)
  return (
    <div className="space-y-6">
      {/* Profile Information Header */}
      <div className="flex items-center gap-3 mb-6">
        <User className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={userData.username}
            onChange={handleChange}
            name="username"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            type="email"
            value={userData.email}
            onChange={handleChange}
            name="email"
            placeholder="Enter email"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>


    </div>
  );
}

function NotificationsTab({ userData, handleChange, handleSave, setUserData }: { userData: any, handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void, handleSave: () => Promise<void>, setUserData: (data: any) => void }) {
  const [emailEnabled, setEmailEnabled] = useState(userData.notificationPrefs.emailNotifications);

  return (
    <div className="space-y-6">
      {/* Notifications Header */}
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Notifications Settings</h3>
      </div>

      {/* Email Notifications Section */}
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-green-500" />
          <h4 className="text-white font-semibold">Email Notifications</h4>
        </div>

        {/* Enable Email Alerts Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-medium">Enable Email Alerts</p>
            <p className="text-neutral-400 text-sm">Receive detailed reports and summaries</p>
          </div>
          <button
            onClick={() => {
              setUserData({ ...userData, notificationPrefs: { ...userData.notificationPrefs, emailNotifications: !userData.notificationPrefs.emailNotifications } })
            }}

            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userData.notificationPrefs.emailNotifications ? 'bg-green-600' : 'bg-neutral-600'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userData.notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email address
          </label>
          <input
            type="email"
            placeholder="user@example.com"
            value={userData.notificationPrefs.notificationEmail}
            onChange={handleChange}
            name="notificationEmail"
            className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
    </div>
  );
}