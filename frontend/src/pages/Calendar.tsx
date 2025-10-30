import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

interface DayDetail {
  minutes: number;
  words: number;
  sessions: any[];
  wordLogs: any[];
}

export const Calendar: React.FC = () => {
  const [monthData, setMonthData] = useState<Record<string, { minutes: number; words: number }>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());
  const [globalTheme, setGlobalTheme] = useState<string>('default');

  useEffect(() => {
    loadSubjects();
    loadMonthData();
    loadGlobalTheme();
  }, [currentMonth]);

  const loadGlobalTheme = () => {
    const savedTheme = localStorage.getItem('global_theme');
    if (savedTheme) {
      setGlobalTheme(savedTheme);
    }
  };

  // 监听 localStorage 变化，动态更新主题
  useEffect(() => {
    const handleStorageChange = () => {
      loadGlobalTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    const checkInterval = setInterval(loadGlobalTheme, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      const map = new Map();
      res.data.forEach((subject: any) => {
        map.set(subject.id, subject);
      });
      setSubjectsMap(map);
    } catch (err) {
      console.error("加载科目失败", err);
    }
  };

  const loadMonthData = async () => {
    const year = parseInt(currentMonth.split("-")[0]);
    const month = parseInt(currentMonth.split("-")[1]);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    try {
      const [sessionsRes, wordsRes] = await Promise.all([
        api.get("/study-sessions", {
          params: {
            from: firstDay.toISOString().split("T")[0],
            to: lastDay.toISOString().split("T")[0],
          },
        }),
        api.get("/word-logs", {
          params: {
            from: firstDay.toISOString().split("T")[0],
            to: lastDay.toISOString().split("T")[0],
          },
        }),
      ]);

      const data: Record<string, { minutes: number; words: number }> = {};
      
      sessionsRes.data.forEach((s: any) => {
        const date = s.startTime.split("T")[0];
        if (!data[date]) data[date] = { minutes: 0, words: 0 };
        // 计算学习时长（分钟）
        const startTime = new Date(s.startTime);
        const endTime = new Date(s.endTime);
        const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
        data[date].minutes += minutes;
      });

      wordsRes.data.forEach((w: any) => {
        const date = w.date;
        if (!data[date]) data[date] = { minutes: 0, words: 0 };
        data[date].words += w.count || 0;
        
        // 如果有时间段（计时器学习的），也加到总时长里
        if (w.startTime && w.endTime) {
          const startTime = new Date(w.startTime);
          const endTime = new Date(w.endTime);
          const minutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
          data[date].minutes += minutes;
        }
      });

      setMonthData(data);
    } catch (err) {
      console.error("加载日历数据失败", err);
    }
  };

  const getDaysInMonth = () => {
    const year = parseInt(currentMonth.split("-")[0]);
    const month = parseInt(currentMonth.split("-")[1]);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getIntensity = (minutes: number) => {
    // 只根据学习时长判断颜色深度
    if (minutes === 0) return "";
    if (minutes < 60) return "bg-green-100"; // 少：小于1小时
    if (minutes < 120) return "bg-green-400"; // 中：1-2小时
    if (minutes < 180) return "bg-green-600"; // 多：2-3小时
    if (minutes < 240) return "bg-blue-600"; // 很多：3-4小时
    return "bg-red-600"; // 学神：4小时以上
  };

  const loadDayDetail = async (date: string) => {
    try {
      const [sessionsRes, wordsRes] = await Promise.all([
        api.get("/study-sessions", {
          params: { from: date, to: date },
        }),
        api.get("/word-logs", {
          params: { from: date, to: date },
        }),
      ]);

      const sessions = sessionsRes.data || [];
      const wordLogs = wordsRes.data || [];
      const minutes = sessions.reduce((sum: number, s: any) => {
        const startTime = new Date(s.startTime);
        const endTime = new Date(s.endTime);
        const mins = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
        return sum + mins;
      }, 0);
      const words = wordLogs.reduce((sum: number, w: any) => sum + (w.count || 0), 0);
      
      // 加上背词记录中带时间段的时长
      const wordMinutes = wordLogs.reduce((sum: number, w: any) => {
        if (w.startTime && w.endTime) {
          const startTime = new Date(w.startTime);
          const endTime = new Date(w.endTime);
          const mins = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
          return sum + mins;
        }
        return sum;
      }, 0);

      setDayDetail({ minutes: minutes + wordMinutes, words, sessions, wordLogs });
      setShowModal(true);
    } catch (err) {
      console.error("加载日期详情失败", err);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    loadDayDetail(dateStr);
  };

  const days = getDaysInMonth();
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
  const isBubu = globalTheme === 'bubu';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>学习日历</h1>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className={`border rounded-lg px-3 py-2 ${
            isBubu ? 'border-orange-300 bg-orange-50' : ''
          }`}
        />
      </div>

      <div className={`p-6 rounded-lg shadow ${
        isBubu ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' : 'bg-white'
      }`}>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className={`text-center font-semibold py-2 ${
              isBubu ? 'text-amber-700' : 'text-gray-700'
            }`}>
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={idx} />;
            }
            const dateStr = `${currentMonth}-${String(day).padStart(2, "0")}`;
            const data = monthData[dateStr] || { minutes: 0, words: 0 };
            return (
              <div
                key={idx}
                onClick={() => handleDateClick(dateStr)}
                className={`p-2 rounded text-center text-sm cursor-pointer hover:opacity-80 transition ${getIntensity(data.minutes)} ${data.minutes > 0 || data.words > 0 ? 'text-white' : 'text-gray-900'}`}
              >
                <div className="font-bold">{day}</div>
                {data.minutes > 0 && data.words > 0 ? (
                  <div className="text-xs mt-1">{data.minutes}分 | {data.words}词</div>
                ) : data.minutes > 0 ? (
                  <div className="text-xs mt-1">{data.minutes}分</div>
                ) : data.words > 0 ? (
                  <div className="text-xs mt-1">{data.words}词</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className={`mt-4 flex items-center justify-center space-x-4 text-sm ${
          isBubu ? 'text-amber-700' : ''
        }`}>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2" />
            <span>少</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-400 rounded mr-2" />
            <span>中</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2" />
            <span>多</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2" />
            <span>很多</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded mr-2" />
            <span>学神</span>
          </div>
        </div>
      </div>

      {/* 日期详情模态框 */}
      {showModal && dayDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className={`rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
            isBubu ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>
                {selectedDate && new Date(selectedDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
              </h2>
              <button onClick={() => setShowModal(false)} className={`hover:opacity-70 text-2xl ${
                isBubu ? 'text-amber-700' : 'text-gray-500'
              }`}>&times;</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${
                isBubu ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50'
              }`}>
                <div className={`text-sm mb-1 ${isBubu ? 'text-amber-700' : 'text-gray-600'}`}>学习时长</div>
                <div className={`text-2xl font-bold ${isBubu ? 'text-orange-600' : 'text-blue-600'}`}>{dayDetail.minutes} 分钟</div>
              </div>
              <div className={`p-4 rounded-lg ${
                isBubu ? 'bg-pink-50 border border-pink-200' : 'bg-green-50'
              }`}>
                <div className={`text-sm mb-1 ${isBubu ? 'text-amber-700' : 'text-gray-600'}`}>背词数量</div>
                <div className={`text-2xl font-bold ${isBubu ? 'text-pink-600' : 'text-green-600'}`}>{dayDetail.words} 个</div>
              </div>
            </div>

            {dayDetail.sessions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">学习记录</h3>
                <div className="space-y-2">
                  {dayDetail.sessions.map((session: any, idx: number) => {
                    const startTime = new Date(session.startTime);
                    const endTime = new Date(session.endTime);
                    const mins = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
                    const subject = subjectsMap.get(session.subjectId);
                    return (
                      <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            {subject && (
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                                style={{ backgroundColor: subject.colorHex || "#3b82f6" }}
                              />
                            )}
                            <div>
                              {subject && (
                                <div className="font-semibold text-gray-900 mb-1">{subject.name}</div>
                              )}
                              <div className="text-sm text-gray-600">
                                {startTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} - 
                                {endTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                              </div>
                              {session.note && <div className="text-sm text-gray-700 mt-1">{session.note}</div>}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-blue-600">{mins} 分钟</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dayDetail.wordLogs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">背词记录</h3>
                <div className="space-y-2">
                  {dayDetail.wordLogs.map((log: any, idx: number) => {
                    const subject = subjectsMap.get(log.subjectId);
                    return (
                      <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            {subject && (
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                                style={{ backgroundColor: subject.colorHex || "#22c55e" }}
                              />
                            )}
                            <div>
                              {subject && (
                                <div className="font-semibold text-gray-900 mb-1">{subject.name}</div>
                              )}
                              {log.startTime && log.endTime && (
                                <div className="text-sm text-gray-600">
                                  {new Date(log.startTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} - 
                                  {new Date(log.endTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </div>
                              )}
                              {log.note && <div className="text-sm text-gray-700 mt-1">{log.note}</div>}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-green-600">{log.count} 个单词</div>
                            {log.startTime && log.endTime && (
                              <div className="text-xs text-blue-600 mt-1">
                                {Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000 / 60)} 分钟
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dayDetail.sessions.length === 0 && dayDetail.wordLogs.length === 0 && (
              <div className="text-center text-gray-500 py-8">当天暂无学习记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};






