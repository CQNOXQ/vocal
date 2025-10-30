import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";

export const Settings: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [gradientTheme, setGradientTheme] = useState<string>('default');
  const [flipClockTheme, setFlipClockTheme] = useState<string>('classic');
  const [globalTheme, setGlobalTheme] = useState<string>('default');
  const [inviteCode, setInviteCode] = useState<string>("");

  useEffect(() => {
    loadBackgroundImage();
    loadGradientTheme();
    loadFlipClockTheme();
    loadGlobalTheme();
  }, []);

  const DEFAULT_BACKGROUND_IMAGE = '/default-bg.jpg';

  const GRADIENT_THEMES = {
    default: { name: '默认', classes: 'from-blue-500 via-purple-500 to-pink-500' },
    ocean: { name: '海洋', classes: 'from-blue-400 via-cyan-400 to-teal-500' },
    sunset: { name: '日落', classes: 'from-orange-400 via-red-400 to-pink-500' },
    forest: { name: '森林', classes: 'from-green-500 via-emerald-500 to-teal-500' },
    night: { name: '夜空', classes: 'from-indigo-900 via-purple-900 to-pink-800' },
    warm: { name: '温暖', classes: 'from-yellow-400 via-orange-500 to-red-500' },
    bubu: { name: '一二布布', classes: 'from-orange-50 via-pink-100 to-amber-100' },
  };

  const loadGradientTheme = () => {
    const savedTheme = localStorage.getItem('clock_gradient_theme');
    if (savedTheme && GRADIENT_THEMES[savedTheme as keyof typeof GRADIENT_THEMES]) {
      setGradientTheme(savedTheme);
    }
  };

  const loadFlipClockTheme = () => {
    const savedTheme = localStorage.getItem('flip_clock_theme');
    if (savedTheme) {
      setFlipClockTheme(savedTheme);
    }
  };

  const loadGlobalTheme = () => {
    const savedTheme = localStorage.getItem('global_theme');
    if (savedTheme) {
      setGlobalTheme(savedTheme);
    }
  };

  const handleGlobalThemeChange = (theme: string) => {
    setGlobalTheme(theme);
    localStorage.setItem('global_theme', theme);
    alert("全局主题已保存！刷新页面即可看到效果。");
  };

  const handleGradientThemeChange = (theme: string) => {
    setGradientTheme(theme);
    localStorage.setItem('clock_gradient_theme', theme);
    alert("渐变主题已保存！刷新主页即可看到效果。");
  };

  const handleFlipClockThemeChange = (theme: string) => {
    setFlipClockTheme(theme);
    localStorage.setItem('flip_clock_theme', theme);
    alert("翻牌时钟主题已保存！刷新主页即可看到效果。");
  };

  const loadBackgroundImage = () => {
    const savedImage = localStorage.getItem('dashboard_background_image');
    if (savedImage) {
      setBackgroundImage(savedImage);
    } else {
      // 如果没有用户上传的图片，使用默认图片
      setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        localStorage.setItem('dashboard_background_image', result);
        alert("图片设置成功！刷新主页即可看到效果。");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
    localStorage.removeItem('dashboard_background_image');
    alert("已恢复默认设置！刷新主页即可看到效果。");
  };

  const handleGenerateInviteCode = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8080"}/api/auth/invite-codes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ expiresInDays: "30" }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.code);
        alert(`邀请码已生成：${data.code}\n有效期至：${new Date(data.expiresAt).toLocaleString('zh-CN')}`);
      } else {
        const err = await res.json().catch(() => ({ error: "生成失败" }));
        alert(err.error || "生成邀请码失败");
      }
    } catch (err) {
      alert("网络错误，请检查后端是否运行");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">设置</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">生成邀请码</h2>
        <p className="text-sm text-gray-600 mb-4">生成新的注册邀请码，分享给朋友使用</p>
        
        {inviteCode && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">邀请码：</p>
            <p className="text-2xl font-bold text-blue-700 font-mono">{inviteCode}</p>
          </div>
        )}
        
        <button
          onClick={handleGenerateInviteCode}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          生成邀请码
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">我的桌面</h2>
        <p className="text-sm text-gray-600 mb-4">上传一张图片来装饰你的主页</p>
        
        {backgroundImage && (
          <div className="mb-4">
            <img
              src={backgroundImage}
              alt="当前背景"
              className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="cursor-pointer flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            上传新图片
          </label>
          
          {backgroundImage && (
            <button
              onClick={handleResetImage}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              恢复默认
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">全局主题</h2>
        <p className="text-sm text-gray-600 mb-4">一键切换整体主题风格（包含所有组件）</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleGlobalThemeChange('default')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              globalTheme === 'default'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            <span className="relative z-10 text-white text-sm font-medium drop-shadow-lg">默认主题</span>
          </button>
          <button
            onClick={() => handleGlobalThemeChange('bubu')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              globalTheme === 'bubu'
                ? 'border-orange-300 ring-2 ring-orange-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-100 to-amber-100" />
            <span className="relative z-10 text-amber-900 text-sm font-bold drop-shadow-lg">🐼 一二布布</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">时钟渐变主题</h2>
        <p className="text-sm text-gray-600 mb-4">选择主页时钟区域的渐变主题</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(GRADIENT_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleGradientThemeChange(key)}
              className={`relative overflow-hidden rounded-lg h-16 border-2 transition-all ${
                gradientTheme === key
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${theme.classes}`} />
              <span className={`relative z-10 text-sm drop-shadow-lg ${
                key === 'bubu' ? 'text-amber-900 font-bold' : 'text-white font-medium'
              }`}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">翻牌时钟主题</h2>
        <p className="text-sm text-gray-600 mb-4">选择时钟卡片的颜色主题</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => handleFlipClockThemeChange('classic')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              flipClockTheme === 'classic'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-black" />
            <span className="relative z-10 text-white text-sm font-medium drop-shadow-lg">经典黑色</span>
          </button>
          <button
            onClick={() => handleFlipClockThemeChange('neon')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              flipClockTheme === 'neon'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-indigo-950" />
            <span className="relative z-10 text-green-400 text-sm font-medium drop-shadow-lg font-mono">霓虹绿</span>
          </button>
          <button
            onClick={() => handleFlipClockThemeChange('blue')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              flipClockTheme === 'blue'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-blue-900" />
            <span className="relative z-10 text-blue-300 text-sm font-medium drop-shadow-lg">蓝色</span>
          </button>
          <button
            onClick={() => handleFlipClockThemeChange('purple')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              flipClockTheme === 'purple'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-purple-950" />
            <span className="relative z-10 text-pink-300 text-sm font-medium drop-shadow-lg">紫粉</span>
          </button>
          <button
            onClick={() => handleFlipClockThemeChange('bubu')}
            className={`relative overflow-hidden rounded-lg h-20 border-2 transition-all ${
              flipClockTheme === 'bubu'
                ? 'border-orange-300 ring-2 ring-orange-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute inset-0 bg-amber-100" />
            <span className="relative z-10 text-amber-900 text-sm font-bold drop-shadow-lg">🐼 一二布布</span>
          </button>
        </div>
      </div>
    </div>
  );
};






