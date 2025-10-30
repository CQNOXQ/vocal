export interface FlipperConfig {
  node: HTMLElement;
  frontText?: string;
  backText?: string;
  duration?: number;
}

export class Flipper {
  private config: Required<FlipperConfig>;
  private nodeClass = {
    flip: "flip",
    front: "digital front",
    back: "digital back",
  };
  private frontNode: HTMLElement;
  private backNode: HTMLElement;
  private isFlipping: boolean = false;

  constructor(config: FlipperConfig) {
    // 默认配置
    this.config = {
      node: config.node,
      frontText: config.frontText || "number0",
      backText: config.backText || "number1",
      duration: config.duration || 600,
    };

    // 定位前后两个牌的DOM节点
    this.frontNode = this.config.node.querySelector(
      ".front"
    ) as HTMLElement;
    this.backNode = this.config.node.querySelector(".back") as HTMLElement;

    // 初始化
    this._init();
  }

  // 初始化
  private _init(): void {
    // 设置初始牌面字符
    this._setFront(this.config.frontText);
    this._setBack(this.config.backText);
  }

  // 设置前牌文字
  private _setFront(className: string): void {
    this.frontNode.setAttribute(
      "class",
      `${this.nodeClass.front} ${className}`
    );
  }

  // 设置后牌文字
  private _setBack(className: string): void {
    this.backNode.setAttribute(
      "class",
      `${this.nodeClass.back} ${className}`
    );
  }

  // 翻牌内部方法
  private _flip(type: "down" | "up", front: string, back: string): boolean {
    // 如果处于翻转中，则不执行
    if (this.isFlipping) {
      return false;
    }

    // 设置翻转状态为true
    this.isFlipping = true;

    // 设置前牌文字
    this._setFront(front);

    // 设置后牌文字
    this._setBack(back);

    // 根据传递过来的type设置翻转方向
    let flipClass = this.nodeClass.flip;
    if (type === "down") {
      flipClass += " down";
    } else {
      flipClass += " up";
    }

    // 添加翻转方向和执行动画的class，执行翻转动画
    this.config.node.setAttribute("class", `${flipClass} go`);

    // 根据设置的动画时间，在动画结束后，还原class并更新前牌文字
    setTimeout(() => {
      // 还原class
      this.config.node.setAttribute("class", flipClass);

      // 设置翻转状态为false
      this.isFlipping = false;

      // 将前牌文字设置为当前新的数字，后牌因为被前牌挡住了，就不用设置了。
      this._setFront(back);
    }, this.config.duration);

    return true;
  }

  // 下翻牌
  flipDown(front: string, back: string): boolean {
    return this._flip("down", front, back);
  }

  // 上翻牌
  flipUp(front: string, back: string): boolean {
    return this._flip("up", front, back);
  }
}

// 日期时间格式化函数
export function formatDate(date: Date, dateFormat: string): string {
  // 单独格式化年份，根据y的字符数量输出年份
  const yearMatch = dateFormat.match(/(y+)/);
  if (yearMatch) {
    const yearStr = (date.getFullYear() + "").substr(4 - yearMatch[1].length);
    dateFormat = dateFormat.replace(yearMatch[0], yearStr);
  }

  // 格式化月、日、时、分、秒
  const o: Record<string, number> = {
    "m+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "i+": date.getMinutes(),
    "s+": date.getSeconds(),
  };

  for (const k in o) {
    const match = dateFormat.match(new RegExp(`(${k})`));
    if (match) {
      // 取出对应的值
      const str = o[k] + "";
      /* 根据设置的格式，输出对应的字符
       * 例如: 早上8时，hh => 08，h => 8
       * 但是，当数字>=10时，无论格式为一位还是多位，不做截取，这是与年份格式化不一致的地方
       * 例如: 下午15时，hh => 15, h => 15
       */
      const replacement =
        match[1].length === 1 ? str : padLeftZero(str);
      dateFormat = dateFormat.replace(match[0], replacement);
    }
  }

  return dateFormat;
}

// 日期时间补零
function padLeftZero(str: string): string {
  return ("00" + str).substr(str.length);
}

