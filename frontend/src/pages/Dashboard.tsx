import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { FlipClock } from "../components/FlipClock";

interface Subject {
  id: number;
  name: string;
  colorHex?: string;
  studyType?: string;
  dailyTarget?: number;
  todayMinutes?: number;
  todayWords?: number;
}

export const Dashboard: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayWords, setTodayWords] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [gradientTheme, setGradientTheme] = useState<string>('default');
  const [flipClockTheme, setFlipClockTheme] = useState<string>('classic');
  const [globalTheme, setGlobalTheme] = useState<string>('default');
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(() => (localStorage.getItem('image_fit_mode') as 'cover' | 'contain') || 'cover');

  useEffect(() => {
    if (accessToken) {
      loadData();
      loadBackgroundImage();
      loadGradientTheme();
      loadFlipClockTheme();
      loadGlobalTheme();
    }
  }, [accessToken]);

  // 当全局主题改变时，如果没有自定义图片，切换默认背景
  useEffect(() => {
    const savedImage = localStorage.getItem('dashboard_background_image');
    if (!savedImage) {
      if (globalTheme === 'bubu') {
        setBackgroundImage(BUBU_BACKGROUND_IMAGE);
      } else {
        setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
      }
    }
  }, [globalTheme]);

  // 监听 localStorage 变化，动态更新主题（用于设置页面更改主题后实时更新）
  useEffect(() => {
    const handleStorageChange = () => {
      loadGradientTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const DEFAULT_BACKGROUND_IMAGE = '/default-bg.jpg';
  const BUBU_BACKGROUND_IMAGE = '/bubu-bg.jpg';

  const GRADIENT_THEMES: Record<string, string> = {
    default: 'from-blue-500 via-purple-500 to-pink-500',
    ocean: 'from-blue-400 via-cyan-400 to-teal-500',
    sunset: 'from-orange-400 via-red-400 to-pink-500',
    forest: 'from-green-500 via-emerald-500 to-teal-500',
    night: 'from-indigo-900 via-purple-900 to-pink-800',
    warm: 'from-yellow-400 via-orange-500 to-red-500',
    bubu: 'from-orange-50 via-pink-100 to-amber-100',
  };

  const loadBackgroundImage = () => {
    const savedImage = localStorage.getItem('dashboard_background_image');
    if (savedImage) {
      setBackgroundImage(savedImage);
    } else {
      // 如果没有用户上传的图片，根据全局主题选择默认图片
      const currentGlobalTheme = localStorage.getItem('global_theme');
      if (currentGlobalTheme === 'bubu') {
        setBackgroundImage(BUBU_BACKGROUND_IMAGE);
      } else {
        setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
      }
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        localStorage.setItem('dashboard_background_image', result);
        // 重置位置
        setImagePosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    // 根据当前全局主题选择默认图片
    if (globalTheme === 'bubu') {
      setBackgroundImage(BUBU_BACKGROUND_IMAGE);
    } else {
      setBackgroundImage(DEFAULT_BACKGROUND_IMAGE);
    }
    localStorage.removeItem('dashboard_background_image');
    setImagePosition({ x: 0, y: 0 });
  };

  const toggleFitMode = () => {
    const next = fitMode === 'cover' ? 'contain' : 'cover';
    setFitMode(next);
    localStorage.setItem('image_fit_mode', next);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (backgroundImage) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && backgroundImage) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [dayRes, , subjectsRes, studySessionsRes] = await Promise.all([
        api.get(`/study-sessions/days/${today}`),
        api.get("/analytics/daily", { params: { range: "30d" } }),
        api.get("/subjects"),
        api.get("/study-sessions", { params: { from: today, to: today } }),
      ]);

      setTodayMinutes(dayRes.data.totalMinutes || 0);

      // 计算每个科目今日的学习时长和单词数量
      const sessionsBySubject: Record<number, number> = {};
      studySessionsRes.data.forEach((session: any) => {
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
        sessionsBySubject[session.subjectId] = (sessionsBySubject[session.subjectId] || 0) + minutes;
      });

      const wordsRes = await api.get("/word-logs", {
        params: { from: today, to: today },
      });
      const wordsBySubject: Record<number, number> = {};
      
      // 计算背词记录中的时长（计时器学习的）
      wordsRes.data.forEach((wordLog: any) => {
        if (wordLog.subjectId) {
          wordsBySubject[wordLog.subjectId] = (wordsBySubject[wordLog.subjectId] || 0) + wordLog.count;
          
          // 如果有时间段，加入学习时长
          if (wordLog.startTime && wordLog.endTime) {
            const startTime = new Date(wordLog.startTime);
            const endTime = new Date(wordLog.endTime);
            const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
            sessionsBySubject[wordLog.subjectId] = (sessionsBySubject[wordLog.subjectId] || 0) + minutes;
          }
        }
      });
      setTodayWords(wordsRes.data.reduce((sum: number, w: any) => sum + w.count, 0));

      const subjectsWithProgress = subjectsRes.data.map((subject: Subject) => ({
        ...subject,
        todayMinutes: sessionsBySubject[subject.id] || 0,
        todayWords: wordsBySubject[subject.id] || 0,
      }));
      setSubjects(subjectsWithProgress);
      
      // 更新总时长（包含学习记录和背词记录中的时长）
      const totalMin = Object.values(sessionsBySubject).reduce((sum, min) => sum + min, 0);
      setTodayMinutes(totalMin);
    } catch (err) {
      console.error("加载数据失败", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  // 检查是否有单词类型的科目
  const hasWordSubjects = subjects.some(s => s.studyType === "WORDS");
  
  // 判断是否使用一二布布主题
  const isBubu = globalTheme === 'bubu';

  // 决定实际使用的渐变和翻牌时钟主题
  const activeGradientTheme = isBubu ? 'bubu' : gradientTheme;
  const activeFlipClockTheme = isBubu ? 'bubu' : flipClockTheme;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${GRADIENT_THEMES[activeGradientTheme]} rounded-2xl p-8 shadow-2xl`}>
        <FlipClock theme={activeFlipClockTheme} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl shadow-xl ${
          isBubu 
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' 
            : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center rounded-font ${
            isBubu ? 'text-amber-800' : 'text-gray-800'
          }`}>
            <span className="text-2xl mr-2">📚</span>
            今日学习
          </h2>
          <div className="space-y-4">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className={`text-sm ${isBubu ? 'text-amber-700' : 'text-gray-600'}`}>总学习时长</span>
                <span className={`text-sm font-medium font-bold ${
                  isBubu ? 'text-orange-600' : 'text-blue-600'
                }`}>{todayMinutes} 分钟</span>
              </div>
            </div>
            {hasWordSubjects && (
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-semibold ${isBubu ? 'text-amber-700' : 'text-gray-700'}`}>总背词数量</span>
                  <span className={`text-sm font-bold ${
                    isBubu ? 'text-pink-600' : 'text-green-600'
                  }`}>{todayWords} 个</span>
                </div>
              </div>
            )}
            
            {/* 科目进度 */}
            {subjects.filter(s => s.dailyTarget && s.dailyTarget > 0).length > 0 && (
              <div className={`pt-4 border-t ${isBubu ? 'border-orange-300' : 'border-blue-200'}`}>
                <h3 className={`text-base font-bold mb-3 rounded-font ${
                  isBubu ? 'text-amber-800' : 'text-gray-700'
                }`}>科目进度</h3>
                <div className="space-y-3">
                  {subjects.filter(s => s.dailyTarget && s.dailyTarget > 0).map((subject) => {
                    if (subject.studyType === "WORDS") {
                      const progress = subject.dailyTarget 
                        ? Math.min((subject.todayWords || 0) / subject.dailyTarget * 100, 100) 
                        : 0;
                      return (
                        <div key={subject.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.colorHex || "#3b82f6" }}
                              />
                              <span className={`text-sm font-medium rounded-font ${
                                isBubu ? 'text-amber-800' : 'text-gray-700'
                              }`}>{subject.name}</span>
                            </div>
                            <span className={`text-sm font-bold ${
                              isBubu ? 'text-pink-600' : 'text-green-600'
                            }`}>
                              {subject.todayWords || 0} / {subject.dailyTarget} 个
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress}%`,
                                backgroundColor: subject.colorHex || "#22c55e"
                              }}
                            />
                          </div>
                        </div>
                      );
                    } else {
                      const progress = subject.dailyTarget 
                        ? Math.min((subject.todayMinutes || 0) / subject.dailyTarget * 100, 100) 
                        : 0;
                      return (
                        <div key={subject.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: subject.colorHex || "#3b82f6" }}
                              />
                              <span className={`text-sm font-medium rounded-font ${
                                isBubu ? 'text-amber-800' : 'text-gray-700'
                              }`}>{subject.name}</span>
                            </div>
                            <span className={`text-sm font-bold ${
                              isBubu ? 'text-orange-600' : 'text-orange-600'
                            }`}>
                              {subject.todayMinutes || 0} / {subject.dailyTarget} 分钟
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress}%`,
                                backgroundColor: subject.colorHex || "#3b82f6"
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 relative overflow-hidden group aspect-[4/3]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={backgroundImage || DEFAULT_BACKGROUND_IMAGE}
            alt="背景图片"
            className={`absolute inset-0 w-full h-full ${
              isDragging ? '' : 'transition-opacity duration-300 group-hover:opacity-95'
            } ${
              backgroundImage ? (fitMode === 'cover' ? 'object-cover' : 'object-contain') : 'object-contain'
            }`}
            style={{ 
              opacity: 1,
              transform: backgroundImage ? `translate(${imagePosition.x}px, ${imagePosition.y}px)` : undefined,
              cursor: backgroundImage ? (isDragging ? 'grabbing' : 'grab') : undefined
            }}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h2 className="text-lg font-bold text-gray-800">我的桌面</h2>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <label className="cursor-pointer px-4 py-2 bg-purple-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-purple-600 transition text-sm shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              更换图片
            </label>
            <button
              onClick={handleResetImage}
              className="px-4 py-2 bg-gray-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-600 transition text-sm shadow-lg"
            >
              恢复默认
            </button>
            <button
              onClick={toggleFitMode}
              className="px-4 py-2 bg-amber-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-amber-600 transition text-sm shadow-lg"
            >
              {fitMode === 'cover' ? '适应(不裁剪)' : '填充(占满)'}
            </button>
          </div>
        </div>
      </div>

      {/* 快速操作已移除，以保持界面简洁 */}
    </div>
  );
};
