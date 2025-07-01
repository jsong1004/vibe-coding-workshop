"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "구글 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">로그인</h2>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 rounded bg-white border border-gray-300 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          disabled={loading}
        >
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Google로 로그인
        </button>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">또는 이메일로 로그인</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">이메일</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">비밀번호</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        <div className="text-center text-sm mt-2">
          계정이 없으신가요? <a href="/signup" className="text-blue-600 hover:underline">회원가입</a>
        </div>
      </form>
    </div>
  );
} 