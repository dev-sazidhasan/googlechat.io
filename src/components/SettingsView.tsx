import { Camera, Shield, LogOut } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { logOut } from "../lib/firebase";

export default function SettingsView() {
  const { user, settings, updateSettings } = useApp();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <section className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-md">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary text-4xl font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <button className="absolute bottom-1 right-1 bg-primary text-on-primary p-2.5 rounded-full shadow-lg active:scale-90 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{user?.displayName}</h2>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[10px] font-bold">Administrator</span>
                <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold">Product Design</span>
              </div>
              <div className="pt-4 flex gap-3 justify-center md:justify-start">
                <button className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-md hover:bg-primary-container transition-all">Save Changes</button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 border border-outline text-primary rounded-xl text-sm font-bold hover:bg-surface-container-low transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* Local Storage Control */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Privacy</h3>
              </div>
              <div>
                <h4 className="text-lg font-bold">Local Caching</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-1">
                  Manage how your browser stores session metadata and temporary assets locally.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
              <span className="text-sm font-bold">Save History Locally</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.saveHistoryLocally}
                  onChange={(e) => updateSettings({ saveHistoryLocally: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
