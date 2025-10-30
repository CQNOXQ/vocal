import React, { useEffect, useState, useRef } from "react";
import { Flipper, formatDate } from "../lib/Flipper";
import "./FlipClock.css";

interface FlipClockTheme {
  cardBg: string;
  textColor: string;
  borderColor: string;
  shadow: string;
}

const FLIP_CLOCK_THEMES: Record<string, FlipClockTheme> = {
  classic: {
    cardBg: '#000',
    textColor: '#fff',
    borderColor: '#000',
    shadow: '0 0 6px rgba(0, 0, 0, 0.5)'
  },
  neon: {
    cardBg: '#1a0033',
    textColor: '#00ff00',
    borderColor: '#00ff00',
    shadow: '0 0 10px rgba(0, 255, 0, 0.5)'
  },
  blue: {
    cardBg: '#003d66',
    textColor: '#4da6ff',
    borderColor: '#003d66',
    shadow: '0 0 8px rgba(77, 166, 255, 0.4)'
  },
  purple: {
    cardBg: '#330066',
    textColor: '#ff4dff',
    borderColor: '#330066',
    shadow: '0 0 10px rgba(255, 77, 255, 0.4)'
  },
  bubu: {
    cardBg: '#f5e6d3',
    textColor: '#8b4513',
    borderColor: '#e8d5c4',
    shadow: '0 0 10px rgba(139, 69, 19, 0.2), 0 2px 4px rgba(255, 255, 255, 0.3) inset'
  }
};

export const FlipClock: React.FC<{ theme?: string }> = ({ theme = 'classic' }) => {
  const [time, setTime] = useState(new Date());
  const clockRef = useRef<HTMLDivElement>(null);
  const flipObjsRef = useRef<Flipper[]>([]);
  const clockStyleRef = useRef<HTMLDivElement>(null);
  
  const currentTheme = FLIP_CLOCK_THEMES[theme] || FLIP_CLOCK_THEMES.classic;

  useEffect(() => {
    // 初始化翻牌对象
    if (clockRef.current) {
      const flips = clockRef.current.querySelectorAll(".flip");
      const now = new Date();
      const nowTimeStr = formatDate(now, "hhiiss");
      const nextTimeStr = formatDate(
        new Date(now.getTime() + 1000),
        "hhiiss"
      );

      flipObjsRef.current = Array.from(flips).map(
        (flip, i) =>
          new Flipper({
            node: flip as HTMLElement,
            frontText: `number${nowTimeStr[i]}`,
            backText: `number${nextTimeStr[i]}`,
          })
      );
    }

    // 定时器更新
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      if (clockRef.current && flipObjsRef.current.length > 0) {
        const nowTimeStr = formatDate(new Date(now.getTime() - 1000), "hhiiss");
        const nextTimeStr = formatDate(now, "hhiiss");

        // 将当前时间和下一秒时间逐位对比
        for (let i = 0; i < flipObjsRef.current.length; i++) {
          // 如果前后数字没有变化，则直接跳过，不翻牌
          if (nowTimeStr[i] === nextTimeStr[i]) {
            continue;
          }
          // 传递前后牌的数字，进行向下翻牌动画
          flipObjsRef.current[i].flipDown(
            `number${nowTimeStr[i]}`,
            `number${nextTimeStr[i]}`
          );
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 应用主题样式
    if (clockRef.current) {
      const container = clockRef.current.parentElement?.parentElement;
      if (container) {
        container.style.setProperty('--text-color', currentTheme.textColor);
      }
      
      const flips = clockRef.current.querySelectorAll(".flip");
      flips.forEach((flip) => {
        (flip as HTMLElement).style.setProperty('--card-bg', currentTheme.cardBg);
        (flip as HTMLElement).style.setProperty('--text-color', currentTheme.textColor);
        (flip as HTMLElement).style.setProperty('--border-color', currentTheme.borderColor);
        (flip as HTMLElement).style.setProperty('--shadow', currentTheme.shadow);
      });
    }
  }, [currentTheme]);

  const yearMonthDay = time.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = time.toLocaleDateString("zh-CN", {
    weekday: "long",
  });

  const isBubuTheme = theme === 'bubu';
  
  return (
    <div className="text-center">
      <div className="mb-8 opacity-95" style={{ color: isBubuTheme ? '#8b4513' : 'white' }}>
        <div className="text-xl md:text-2xl font-semibold rounded-font flex items-center justify-center gap-4">
          <span>{yearMonthDay}</span>
          <span className="text-lg md:text-xl font-medium opacity-90" style={{ letterSpacing: '2px' }}>
            {weekday}
          </span>
        </div>
      </div>
      <div className="clock" ref={clockRef}>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
        <em className="colon">:</em>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
        <em className="colon">:</em>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
        <div className="flip down">
          <div className="digital front number0"></div>
          <div className="digital back number1"></div>
        </div>
      </div>
    </div>
  );
};
