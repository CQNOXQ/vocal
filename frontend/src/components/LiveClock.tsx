import React, { useEffect, useState } from "react";

export const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const dateStr = time.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="text-center">
      <div className="mb-2">
        <span className="text-blue-600 font-semibold">{dateStr}</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {hours}
        </div>
        <div className="text-6xl font-bold text-gray-400 animate-pulse">:</div>
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          {minutes}
        </div>
        <div className="text-6xl font-bold text-gray-400 animate-pulse">:</div>
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          {seconds}
        </div>
      </div>
    </div>
  );
};







