import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Subject {
  id: number;
  name: string;
  colorHex?: string;
  archived: boolean;
  studyType?: string;
  dailyTarget?: number;
}

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [globalTheme, setGlobalTheme] = useState<string>('default');
  const [formData, setFormData] = useState({ 
    name: "", 
    colorHex: "#3b82f6", 
    studyType: "MINUTES",
    dailyTarget: 0 
  });

  useEffect(() => {
    loadSubjects();
    loadGlobalTheme();
  }, []);

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
      setSubjects(res.data);
    } catch (err) {
      console.error("加载科目失败", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", colorHex: "#3b82f6", studyType: "MINUTES", dailyTarget: 0 });
    setEditingSubject(null);
    setShowForm(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      colorHex: subject.colorHex || "#3b82f6",
      studyType: subject.studyType || "MINUTES",
      dailyTarget: subject.dailyTarget || 0
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        // 更新
        await api.patch(`/subjects/${editingSubject.id}`, formData);
      } else {
        // 创建
        await api.post("/subjects", formData);
      }
      resetForm();
      loadSubjects();
    } catch (err) {
      alert(editingSubject ? "更新科目失败" : "创建科目失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个科目吗？")) return;
    try {
      await api.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (err) {
      alert("删除失败");
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  const isBubu = globalTheme === 'bubu';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>科目管理与设置</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={`px-4 py-2 text-white rounded-lg transition ${
            isBubu ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          新建科目
        </button>
      </div>

      {showForm && (
        <div className={`p-6 rounded-lg shadow ${
          isBubu ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>{editingSubject ? "编辑科目" : "新建科目"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isBubu ? 'text-amber-800' : 'text-gray-700'}`}>科目名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  isBubu ? 'border-orange-300 bg-white' : ''
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isBubu ? 'text-amber-800' : 'text-gray-700'}`}>颜色</label>
              <input
                type="color"
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                className="h-10 w-20 rounded"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isBubu ? 'text-amber-800' : 'text-gray-700'}`}>
                学习类型
              </label>
              <select
                value={formData.studyType}
                onChange={(e) => setFormData({ ...formData, studyType: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  isBubu ? 'border-orange-300 bg-white' : ''
                }`}
              >
                <option value="MINUTES">学习时长（分钟）</option>
                <option value="WORDS">单词个数</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isBubu ? 'text-amber-800' : 'text-gray-700'}`}>
                每日目标 {formData.studyType === "MINUTES" ? "（分钟）" : "（个）"}
              </label>
              <input
                type="number"
                value={formData.dailyTarget}
                onChange={(e) => setFormData({ ...formData, dailyTarget: parseInt(e.target.value) || 0 })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  isBubu ? 'border-orange-300 bg-white' : ''
                }`}
                min="0"
                placeholder="0"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg transition ${
                  isBubu ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingSubject ? "更新" : "创建"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded-lg transition ${
                  isBubu ? 'bg-orange-200 text-amber-800 hover:bg-orange-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={`p-6 rounded-lg shadow hover:shadow-lg transition ${
              isBubu ? 'bg-gradient-to-br from-pink-50 to-orange-50 border border-orange-200' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: subject.colorHex || "#3b82f6" }}
                />
                <span className={`font-medium text-lg ${isBubu ? 'text-amber-800' : 'text-gray-900'}`}>{subject.name}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className={`hover:opacity-80 text-sm ${
                    isBubu ? 'text-orange-600' : 'text-blue-600'
                  }`}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
            <div className={`text-sm space-y-1 ${isBubu ? 'text-amber-700' : 'text-gray-600'}`}>
              <div>
                类型: {subject.studyType === "WORDS" ? "单词个数" : "学习时长"}
              </div>
              <div>
                每日目标: {subject.dailyTarget || 0} {subject.studyType === "WORDS" ? "个" : "分钟"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className={`text-center py-12 ${isBubu ? 'text-amber-600' : 'text-gray-500'}`}>
          <p>还没有科目，创建一个开始使用吧！</p>
        </div>
      )}
    </div>
  );
};
