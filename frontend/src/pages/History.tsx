import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Subject {
  id: number;
  name: string;
  colorHex?: string;
  studyType?: string;
}

interface StudySession {
  id: number;
  subjectId: number;
  startTime: string;
  endTime: string;
  note?: string;
}

interface WordLog {
  id: number;
  subjectId: number;
  date: string;
  count: number;
  note?: string;
  startTime?: string;
  endTime?: string;
}

interface MergedRecord {
  type: 'study' | 'word';
  id: number;
  subjectId: number;
  subjectName: string;
  colorHex: string;
  completedAt: Date;
  minutes?: number;
  count?: number;
  note?: string;
  startTime?: Date; // 学习开始时间
  endTime?: Date;   // 学习结束时间
  seconds?: number;
  remainingSeconds?: number;
}

export const History: React.FC = () => {
  const [, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<MergedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalTheme, setGlobalTheme] = useState<string>('default');
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadHistory();
    loadGlobalTheme();
  }, [fromDate, toDate]);

  // 监听 localStorage 变化，动态更新主题
  useEffect(() => {
    const handleStorageChange = () => {
      loadGlobalTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    // 定期检查（因为同窗口内的 localStorage 变化不会触发 storage 事件）
    const checkInterval = setInterval(loadGlobalTheme, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const loadGlobalTheme = () => {
    const savedTheme = localStorage.getItem('global_theme');
    if (savedTheme) {
      setGlobalTheme(savedTheme);
    }
  };

  const loadHistory = async () => {
    try {
      const [subjectsRes, sessionsRes, wordsRes] = await Promise.all([
        api.get("/subjects"),
        api.get("/study-sessions", { params: { from: fromDate, to: toDate } }),
        api.get("/word-logs", { params: { from: fromDate, to: toDate } }),
      ]);
      
      setSubjects(subjectsRes.data);
      
      // 创建科目映射
      const subjectMap = new Map<number, Subject>();
      subjectsRes.data.forEach((s: Subject) => {
        subjectMap.set(s.id, s);
      });
      
      // 合并记录
      const merged: MergedRecord[] = [];
      
      sessionsRes.data.forEach((s: StudySession) => {
        const subject = subjectMap.get(s.subjectId);
        if (subject) {
          const startTime = new Date(s.startTime);
          const endTime = new Date(s.endTime);
          const seconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          
          merged.push({
            type: 'study',
            id: s.id,
            subjectId: s.subjectId,
            subjectName: subject.name,
            colorHex: subject.colorHex || '#3b82f6',
            completedAt: endTime, // 使用结束时间作为完成时间
            minutes,
            seconds,
            remainingSeconds,
            note: s.note,
            startTime,  // 保存开始时间
            endTime,    // 保存结束时间
          });
        }
      });
      
      wordsRes.data.forEach((w: WordLog) => {
        if (!w.subjectId) {
          return;
        }
        const subject = subjectMap.get(w.subjectId);
        if (subject) {
          // 如果有时间段，计算时长
          let seconds = 0;
          let minutes = 0;
          let remainingSeconds = 0;
          let completedAt = new Date(w.date);
          
          if (w.startTime && w.endTime) {
            const startTime = new Date(w.startTime);
            const endTime = new Date(w.endTime);
            seconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
            minutes = Math.floor(seconds / 60);
            remainingSeconds = seconds % 60;
            completedAt = endTime;
          }
          
          merged.push({
            type: 'word',
            id: w.id,
            subjectId: w.subjectId,
            subjectName: subject.name,
            colorHex: subject.colorHex || '#22c55e',
            completedAt,
            count: w.count,
            note: w.note,
            startTime: w.startTime ? new Date(w.startTime) : undefined,
            endTime: w.endTime ? new Date(w.endTime) : undefined,
            minutes: minutes > 0 ? minutes : undefined,
            seconds: seconds > 0 ? seconds : undefined,
            remainingSeconds: remainingSeconds > 0 ? remainingSeconds : undefined,
          });
        }
      });
      
      // 按完成时间排序
      merged.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
      
      setRecords(merged);
    } catch (err) {
      console.error("加载历史失败", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  const isBubu = globalTheme === 'bubu';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>历史记录</h1>
        <div className="flex space-x-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={`border rounded-lg px-3 py-2 ${
              isBubu ? 'border-orange-300 bg-orange-50' : ''
            }`}
          />
          <span className={`self-center ${isBubu ? 'text-amber-700' : ''}`}>至</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={`border rounded-lg px-3 py-2 ${
              isBubu ? 'border-orange-300 bg-orange-50' : ''
            }`}
          />
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow ${
        isBubu ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' : 'bg-white'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>全部记录 ({records.length})</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {records.map((record) => (
            <div key={`${record.type}-${record.id}`} className={`border-b pb-3 ${
              isBubu ? 'border-orange-200' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: record.colorHex }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>{record.subjectName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isBubu ? 'bg-orange-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {record.type === 'study' ? '学习' : '背词'}
                      </span>
                    </div>
                    <div className={`text-sm mt-1 ${
                      isBubu ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {(record.type === 'study' || record.type === 'word') && record.startTime && record.endTime ? (
                        <span>
                          {record.startTime.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })} {record.startTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} - {record.endTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      ) : (
                        <span>{record.completedAt.toLocaleString("zh-CN")}</span>
                      )}
                    </div>
                    {record.note && (
                      <p className={`text-sm mt-2 ${isBubu ? 'text-amber-700' : 'text-gray-600'}`}>{record.note}</p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  {record.type === 'study' ? (
                    <span className={`font-bold ${isBubu ? 'text-orange-600' : 'text-blue-600'}`}>
                      {record.minutes}{record.remainingSeconds !== 0 && record.remainingSeconds !== undefined ? `分${record.remainingSeconds}秒` : '分钟'}
                    </span>
                  ) : (
                    <div className="text-right">
                      <div className={`font-bold ${isBubu ? 'text-pink-600' : 'text-green-600'}`}>{record.count} 个</div>
                      {record.minutes && record.minutes > 0 && (
                        <div className={`text-xs ${isBubu ? 'text-orange-600' : 'text-blue-600'}`}>
                          {record.minutes}{record.remainingSeconds !== 0 && record.remainingSeconds !== undefined ? `分${record.remainingSeconds}秒` : '分钟'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无记录</p>
          )}
        </div>
      </div>
    </div>
  );
};






