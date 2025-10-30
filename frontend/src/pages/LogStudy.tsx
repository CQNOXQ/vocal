import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { FlipClock } from "../components/FlipClock";

interface Subject {
  id: number;
  name: string;
  colorHex?: string;
  studyType?: string;
}

export const LogStudy: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    note: "",
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isStudying, setIsStudying] = useState(false);
  const [showCountInput, setShowCountInput] = useState(false); // 用于单词模式计时后显示数量输入
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gradientTheme, setGradientTheme] = useState<string>('default');
  const [flipClockTheme, setFlipClockTheme] = useState<string>('classic');
  const [globalTheme, setGlobalTheme] = useState<string>('default');

  const GRADIENT_THEMES: Record<string, string> = {
    default: 'from-blue-500 via-purple-500 to-pink-500',
    ocean: 'from-blue-400 via-cyan-400 to-teal-500',
    sunset: 'from-orange-400 via-red-400 to-pink-500',
    forest: 'from-green-500 via-emerald-500 to-teal-500',
    night: 'from-indigo-900 via-purple-900 to-pink-800',
    warm: 'from-yellow-400 via-orange-500 to-red-500',
    bubu: 'from-orange-50 via-pink-100 to-amber-100',
  };

  useEffect(() => {
    loadSubjects();
    loadGradientTheme();
    loadFlipClockTheme();
    loadGlobalTheme();
  }, []);

  const loadFlipClockTheme = () => {
    const savedTheme = localStorage.getItem('flip_clock_theme');
    if (savedTheme) {
      setFlipClockTheme(savedTheme);
    }
  };

  const loadGradientTheme = () => {
    const savedTheme = localStorage.getItem('clock_gradient_theme');
    if (savedTheme && GRADIENT_THEMES[savedTheme]) {
      setGradientTheme(savedTheme);
    }
  };

  const loadGlobalTheme = () => {
    const savedTheme = localStorage.getItem('global_theme');
    if (savedTheme) {
      setGlobalTheme(savedTheme);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStudying && studyStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - studyStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStudying, studyStartTime]);

  // 监听 localStorage 变化，动态更新主题
  useEffect(() => {
    const handleStorageChange = () => {
      loadGradientTheme();
      loadGlobalTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    // 定期检查（因为同窗口内的 localStorage 变化不会触发 storage 事件）
    const checkInterval = setInterval(() => {
      loadGradientTheme();
      loadGlobalTheme();
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);

      // 恢复本地计时（如果存在）
      const timerActive = localStorage.getItem('study_timer_active');
      const startIso = localStorage.getItem('study_timer_start');
      const savedSubjectId = localStorage.getItem('study_timer_subject_id');
      if (timerActive === '1' && startIso) {
        // 解析持久化的开始时间（系统时间）
        const start = new Date(startIso);
        console.log("恢复计时器 - 开始时间（系统时间）:", start.toISOString());
        
        setStudyStartTime(start);
        setIsStudying(true);
        setFormData((prev) => ({ ...prev, startTime: start.toISOString() }));
        
        // 恢复已选科目
        if (savedSubjectId) {
          const sIdNum = parseInt(savedSubjectId, 10);
          const found = res.data.find((s: any) => s.id === sIdNum);
          if (found) setSelectedSubject(found);
        }
        
        // 立即计算一次已用时（基于当前系统时间）
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        console.log("已用时:", elapsed, "秒");
        setElapsedSeconds(elapsed);
      }
    } catch (err) {
      console.error("加载科目失败", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    resetForm();
  };

  const startStudy = () => {
    const now = new Date();
    // 获取系统本地时间，使用系统时区
    const nowISO = now.toISOString();
    console.log("开始计时 - 本地时间:", now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log("开始计时 - ISO时间:", nowISO);
    console.log("系统时区偏移:", now.getTimezoneOffset(), "分钟");
    
    setStudyStartTime(now);
    setIsStudying(true);
    setFormData((prev) => ({
      ...prev,
      startTime: nowISO,
    }));

    // 持久化到本地，防止切换页面丢失（保存ISO时间）
    localStorage.setItem('study_timer_active', '1');
    localStorage.setItem('study_timer_start', nowISO);
    if (selectedSubject) {
      localStorage.setItem('study_timer_subject_id', String(selectedSubject.id));
      localStorage.setItem('study_timer_subject_type', selectedSubject.studyType || '');
    }
  };

  const stopStudy = async () => {
    if (studyStartTime) {
      const now = new Date(); // 使用系统时间
      console.log("结束计时 - 系统时间:", now.toISOString());
      console.log("开始时间:", studyStartTime.toISOString());
      console.log("持续时长:", Math.floor((now.getTime() - studyStartTime.getTime()) / 1000), "秒");
      
      setFormData((prev) => ({
        ...prev,
        endTime: now.toISOString(),
      }));
    }
    setIsStudying(false);
    // 清理本地持久化状态
    localStorage.removeItem('study_timer_active');
    localStorage.removeItem('study_timer_start');
    localStorage.removeItem('study_timer_subject_id');
    localStorage.removeItem('study_timer_subject_type');
    
    // 如果是单词模式，显示数量输入界面
    if (selectedSubject?.studyType === "WORDS") {
      setShowCountInput(true);
    } else {
      // 如果是时长模式，直接保存记录
      if (selectedSubject && studyStartTime) {
        const now = new Date(); // 使用系统时间
        const startTimeISO = studyStartTime.toISOString();
        const endTimeISO = now.toISOString();
        
        console.log("保存记录 - 开始时间:", startTimeISO, "结束时间:", endTimeISO);
        
        try {
          await api.post("/study-sessions", {
            subjectId: selectedSubject.id,
            startTime: startTimeISO,
            endTime: endTimeISO,
            note: formData.note || '',
          });
          alert("学习记录已保存");
          resetForm();
          setSelectedSubject(null);
        } catch (err) {
          console.error("保存失败", err);
          alert("保存失败");
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: "",
      endTime: "",
      note: "",
      count: 0,
    });
    setIsStudying(false);
    setShowCountInput(false);
    setStudyStartTime(null);
    setElapsedSeconds(0);
    // 防止残留
    localStorage.removeItem('study_timer_active');
    localStorage.removeItem('study_timer_start');
    localStorage.removeItem('study_timer_subject_id');
    localStorage.removeItem('study_timer_subject_type');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmitCount = async () => {
    if (!selectedSubject) {
      alert("请选择科目");
      return;
    }

    if (!formData.count || formData.count <= 0) {
      alert("请输入背词数量");
      return;
    }

    try {
      // 使用 OffsetDateTime 格式，和学习记录保持一致
      const now = new Date();
      
      console.log("保存背词记录（计时器） - 开始时间:", studyStartTime?.toISOString());
      console.log("保存背词记录（计时器） - 结束时间:", now.toISOString());
      
      await api.post("/word-logs", {
        subjectId: selectedSubject.id,
        date: now.toISOString(),
        count: formData.count,
        note: formData.note,
        startTime: studyStartTime?.toISOString(), // 计时器的开始时间
        endTime: now.toISOString(), // 计时器的结束时间
      });
      alert("背词记录已保存");
      resetForm();
      setSelectedSubject(null);
    } catch (err) {
      console.error("保存失败", err);
      alert("保存失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) {
      alert("请选择科目");
      return;
    }

    try {
      if (selectedSubject.studyType === "WORDS") {
        // 背词逻辑 - 使用 OffsetDateTime 格式
        await api.post("/word-logs", {
          subjectId: selectedSubject.id,
          date: new Date().toISOString(),
          count: formData.count,
          note: formData.note,
        });
        alert("背词记录已保存");
      } else {
        // 学习时长逻辑
        // 将 datetime-local 格式转换为 ISO 8601 格式
        const startTimeISO = formData.startTime ? new Date(formData.startTime).toISOString() : "";
        const endTimeISO = formData.endTime ? new Date(formData.endTime).toISOString() : "";
        
        await api.post("/study-sessions", {
          subjectId: selectedSubject.id,
          startTime: startTimeISO,
          endTime: endTimeISO,
          note: formData.note,
        });
        alert("学习记录已保存");
      }
      resetForm();
      setSelectedSubject(null);
    } catch (err) {
      console.error("保存失败", err);
      alert("保存失败");
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  // 判断是否使用一二布布主题
  const isBubu = globalTheme === 'bubu';
  
  // 决定实际使用的渐变和翻牌时钟主题
  const activeGradientTheme = isBubu ? 'bubu' : gradientTheme;
  const activeFlipClockTheme = isBubu ? 'bubu' : flipClockTheme;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className={`bg-gradient-to-r ${GRADIENT_THEMES[activeGradientTheme]} rounded-2xl p-8 shadow-2xl`}>
        <FlipClock theme={activeFlipClockTheme} />
      </div>

      <div className={`rounded-2xl p-6 shadow-xl ${
        isBubu 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' 
          : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          isBubu ? 'text-amber-800' : 'text-gray-900'
        }`}>记录学习</h2>
        
        {/* 选择科目 */}
        {!selectedSubject ? (
          <div className="space-y-4">
            <label className={`block text-sm font-medium mb-2 ${
              isBubu ? 'text-amber-800' : 'text-gray-700'
            }`}>
              选择科目
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className={`p-4 border-2 rounded-xl transition flex items-center space-x-2 ${
                    isBubu
                      ? 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.colorHex || "#3b82f6" }}
                  />
                  <div className="text-left">
                    <div className={`font-medium ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>{subject.name}</div>
                    <div className={`text-xs ${isBubu ? 'text-amber-600' : 'text-gray-500'}`}>
                      {subject.studyType === "WORDS" ? "单词" : "时长"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 当前选择的科目 */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              isBubu ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: selectedSubject.colorHex || "#3b82f6" }}
                />
                <div>
                  <div className={`font-medium ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>{selectedSubject.name}</div>
                  <div className={`text-sm ${isBubu ? 'text-amber-600' : 'text-gray-500'}`}>
                    {selectedSubject.studyType === "WORDS" ? "单词模式" : "时长模式"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setSelectedSubject(null);
                }}
                className={`text-sm ${isBubu ? 'text-amber-700 hover:text-amber-900' : 'text-gray-600 hover:text-gray-800'}`}
              >
                重新选择
              </button>
            </div>

            {/* 单词模式表单 */}
            {selectedSubject.studyType === "WORDS" && (
              <>
                {isStudying && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-green-500 animate-pulse">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-6">背词中...</div>
                      <div className="mb-8">
                        <div className="text-6xl font-mono font-bold text-green-600 mb-4">
                          {formatTime(elapsedSeconds)}
                        </div>
                      </div>
                      <button
                        onClick={stopStudy}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-lg font-semibold shadow-lg"
                      >
                        结束背词
                      </button>
                    </div>
                  </div>
                )}

                {showCountInput && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200">
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        本次背词时长: {formatTime(elapsedSeconds)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          本次背词数量
                        </label>
                        <input
                          type="number"
                          value={formData.count || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, count: parseInt(e.target.value) || 0 })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="输入背词数量"
                          required
                          min="1"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          我学到了什么（可选，最多500字）
                        </label>
                        <textarea
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows={3}
                          placeholder="今天学到了什么呢..."
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {formData.note.length}/500
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitCount}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold shadow-lg"
                        >
                          保存记录
                        </button>
                        <button
                          onClick={() => {
                            setShowCountInput(false);
                            setElapsedSeconds(0);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl transition text-lg font-semibold"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!isStudying && !showCountInput && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        背词数量
                      </label>
                      <input
                        type="number"
                        value={formData.count || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, count: parseInt(e.target.value) || 0 })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="输入背词数量"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        我学到了什么（可选，最多500字）
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="今天学到了什么呢..."
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.note.length}/500
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={startStudy}
                        type="button"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold shadow-lg"
                      >
                        开始计时背词
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold shadow-lg"
                      >
                        直接记录
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* 时长模式表单 */}
            {selectedSubject.studyType === "MINUTES" && (
              <>
                {isStudying && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-blue-500 animate-pulse">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-6">学习中...</div>
                      <div className="mb-8">
                        <div className="text-6xl font-mono font-bold text-blue-600 mb-4">
                          {formatTime(elapsedSeconds)}
                        </div>
                      </div>
                      <button
                        onClick={stopStudy}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition text-lg font-semibold shadow-lg"
                      >
                        结束学习
                      </button>
                    </div>
                  </div>
                )}

                {!isStudying && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          开始时间
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({ ...formData, startTime: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          结束时间
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({ ...formData, endTime: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        我学到了什么（可选，最多500字）
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="今天学到了什么呢..."
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.note.length}/500
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={startStudy}
                        type="button"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold shadow-lg"
                      >
                        开始计时学习
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition text-lg font-semibold shadow-lg"
                      >
                        手动记录
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
