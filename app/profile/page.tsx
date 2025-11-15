"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { Camera, Lock, Mail, MapPin, Save, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DotBackground } from "../components/ui/grid-background";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  timezone: string;
  preferences: any;
  created_at: string;
}

export default function ProfilePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
      setBio(data.bio || "");
      setTimezone(data.timezone);
      setAvatarUrl(data.avatar || "");
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, bio, timezone }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      const data = await res.json();
      setProfile(data.user);
      setMessage({ type: "success", text: "Profile berhasil diperbarui!" });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok!" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.current_password?.[0] || "Failed to update password");
      }

      setMessage({ type: "success", text: "Password berhasil diubah!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateAvatar = async () => {
    if (!token || !avatarUrl.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/profile/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (!res.ok) throw new Error("Failed to update avatar");

      const data = await res.json();
      setProfile(prev => prev ? { ...prev, avatar: data.avatar } : null);
      setMessage({ type: "success", text: "Avatar berhasil diperbarui!" });
      setAvatarUrl("");

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat profil...</p>
      </div>
    );
  }

  return (
    <DotBackground>
      <div className="mx-auto max-w-4xl px-4 py-6 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Profil Saya</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Kelola informasi dan pengaturan akun Anda
          </p>
        </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <p className="text-slate-500 text-sm">{profile?.email}</p>
            <p className="text-slate-400 text-xs mt-1">
              Bergabung sejak {new Date(profile?.created_at || "").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Avatar URL Input */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            URL Avatar
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="input flex-1 text-sm"
            />
            <button
              onClick={updateAvatar}
              disabled={saving || !avatarUrl.trim()}
              className="btn btn-primary whitespace-nowrap"
            >
              Update
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Gunakan URL gambar dari internet (misalnya dari Gravatar atau UI Avatars)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <UserIcon className="w-4 h-4 inline mr-2" />
            Informasi Profil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === "password"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Ubah Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={updateProfile} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input w-full min-h-[100px] resize-none"
                placeholder="Ceritakan sedikit tentang diri Anda..."
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">{bio.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input w-full"
              >
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
                <option value="Asia/Singapore">Singapore</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] opacity-50 group-hover:opacity-75 transition-opacity" />
                <Save className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={updatePassword} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Saat Ini
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full"
                minLength={8}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                minLength={8}
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {saving ? "Mengubah..." : "Ubah Password"}
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </DotBackground>
  );
}
