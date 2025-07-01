"use client";
import Link from 'next/link';
import { useAuthUser } from '@/hooks/useAuthUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function NavBar() {
  const { user, loading } = useAuthUser();

  return (
    <nav className="w-full bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-blue-700 hover:text-blue-900">AI 아이디어 생성기</Link>
      </div>
      <div className="flex items-center gap-4">
        {!loading && !user && (
          <>
            <Link href="/login" className="text-gray-700 hover:text-blue-700 font-medium">로그인</Link>
            <Link href="/signup" className="text-gray-700 hover:text-blue-700 font-medium">회원가입</Link>
          </>
        )}
        {!loading && user && (
          <>
            <span className="text-blue-800 font-semibold">{user.displayName || user.email}</span>
            <button
              onClick={async () => { await signOut(auth); }}
              className="text-gray-600 hover:text-red-600 font-medium px-2 py-1 rounded transition"
            >
              로그아웃
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 