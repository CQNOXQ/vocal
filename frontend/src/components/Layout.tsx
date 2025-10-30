import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [globalTheme, setGlobalTheme] = useState<string>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('global_theme');
    if (savedTheme) {
      setGlobalTheme(savedTheme);
    }
    
    // 监听 localStorage 变化
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('global_theme');
      if (currentTheme) {
        setGlobalTheme(currentTheme);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // 定期检查（因为同窗口内的 localStorage 变化不会触发 storage 事件）
    const checkInterval = setInterval(() => {
      const currentTheme = localStorage.getItem('global_theme');
      if (currentTheme && currentTheme !== globalTheme) {
        setGlobalTheme(currentTheme);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [globalTheme]);

  const isBubu = globalTheme === 'bubu';

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const navItems = [
    { path: "/dashboard", label: "主页" },
    { path: "/log/study", label: "记录学习" },
    { path: "/history", label: "历史记录" },
    { path: "/calendar", label: "日历" },
    { path: "/subjects", label: "科目管理" },
    { path: "/settings", label: "设置" },
  ];

  return (
    <div className={`min-h-screen ${isBubu ? 'bg-amber-50' : 'bg-gray-50'}`}>
      <nav className={`${isBubu ? 'bg-amber-100 border-orange-200' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 relative">
            <div className="absolute left-0">
              <Link to="/dashboard" className={`flex items-center px-3 py-2 text-xl font-bold ${
                isBubu ? 'text-amber-800' : 'text-blue-600'
              }`}>
                StudyTracker
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? isBubu ? "bg-amber-200 text-amber-900" : "bg-blue-100 text-blue-700"
                      : isBubu ? "text-amber-800 hover:bg-amber-100" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="absolute right-0">
              <button
                onClick={handleLogout}
                className={`px-4 py-2 text-sm rounded-md ${
                  isBubu ? 'text-amber-800 hover:bg-amber-200' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};






