import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Subjects } from "./pages/Subjects";
import { LogStudy } from "./pages/LogStudy";
import { History } from "./pages/History";
import { Calendar } from "./pages/Calendar";
import { Settings } from "./pages/Settings";

const PublicHome = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">StudyTracker</h1>
      <p className="text-gray-600 mb-8">学习与背词追踪</p>
      <div className="space-x-4">
        <Link to="/auth/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          登录
        </Link>
        <Link to="/auth/register" className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
          注册
        </Link>
      </div>
    </div>
  </div>
);

const Login = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");
  
  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8080"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        navigate("/dashboard");
      } else {
        const err = await res.json().catch(() => ({ error: "登录失败" }));
        setError(err.error || "登录失败，请检查邮箱和密码");
      }
    } catch (err) {
      setError("网络错误，请检查后端是否运行");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
        <form onSubmit={onLogin} className="space-y-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="密码" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            登录
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          还没有账号？{" "}
          <Link to="/auth/register" className="text-blue-600 hover:underline">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>("");
  
  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const nickname = String(form.get("nickname"));
    const inviteCode = String(form.get("inviteCode"));
    
    // 前端邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("邮箱格式不正确");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8080"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname: nickname || undefined, inviteCode }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        navigate("/dashboard");
      } else {
        const err = await res.json().catch(() => ({ error: "注册失败" }));
        // 处理字段级错误（如邮箱格式错误）
        if (err.email) {
          setError(err.email);
        } else if (err.password) {
          setError(err.password);
        } else if (err.inviteCode) {
          setError(err.inviteCode);
        } else {
          setError(err.error || "注册失败");
        }
      }
    } catch (err) {
      setError("网络错误，请检查后端是否运行");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">注册</h2>
        <form onSubmit={onRegister} className="space-y-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="密码" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            name="nickname" 
            type="text" 
            placeholder="昵称（可选）" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <input 
            name="inviteCode" 
            type="text" 
            placeholder="邀请码" 
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            注册
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          已有账号？{" "}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

const Protected = () => {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/auth/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route element={<Protected />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log/study" element={<LogStudy />} />
          <Route path="/history" element={<History />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
