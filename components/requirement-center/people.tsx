import type React from "react";

export interface Producer {
  name: string;
  alias: string;
  group: "美宣-平面" | "美宣-AI" | "美宣-2D" | "美宣-3D" | "程序";
  status: "在职" | "离职";
}

export const PRODUCERS: Producer[] = [
  { name: "宋子仪", alias: "szy", group: "美宣-平面", status: "在职" },
  { name: "吕远林", alias: "lyl", group: "美宣-平面", status: "在职" },
  { name: "王金瑞", alias: "wjr", group: "美宣-平面", status: "在职" },
  { name: "王春华", alias: "wch", group: "美宣-平面", status: "离职" },
  { name: "李珊姗", alias: "lss", group: "美宣-平面", status: "离职" },
  { name: "宋爽", alias: "ss", group: "美宣-AI", status: "离职" },
  { name: "曲冬丽", alias: "qdl", group: "美宣-2D", status: "在职" },
  { name: "张欢", alias: "zh", group: "美宣-2D", status: "在职" },
  { name: "郭峰", alias: "gf", group: "美宣-2D", status: "在职" },
  { name: "王佳鸿", alias: "wjh", group: "美宣-2D", status: "在职" },
  { name: "吴楠", alias: "wn", group: "美宣-2D", status: "在职" },
  { name: "周进易", alias: "zjy", group: "美宣-2D", status: "离职" },
  { name: "邓莉", alias: "dl", group: "美宣-2D", status: "离职" },
  { name: "蒋天宇", alias: "jty", group: "美宣-2D", status: "离职" },
  { name: "张雨学", alias: "zyx", group: "美宣-2D", status: "离职" },
  { name: "张澳", alias: "za", group: "美宣-2D", status: "离职" },
  { name: "朱奇杰", alias: "zqj", group: "美宣-2D", status: "离职" },
  { name: "刘洋", alias: "ly", group: "美宣-3D", status: "在职" },
  { name: "孙崇洋", alias: "scy", group: "美宣-3D", status: "在职" },
  { name: "张永进", alias: "zyj", group: "美宣-3D", status: "在职" },
  { name: "李嘉鑫", alias: "ljx", group: "程序", status: "在职" },
  { name: "肖环宇", alias: "xhy", group: "程序", status: "在职" },
];

export const CREATIVE_PEOPLE = ["唐欣怡", "吉意煊", "马嘉良"];

const PERSON_AVATAR_URLS: Record<string, string> = {
  "唐欣怡": "/avatars/tang-xinyi.png",
  "吉意煊": "/avatars/ji-yixuan.png",
  "马嘉良": "/avatars/ma-jialiang.png",
  "张欢": "/avatars/zhang-huan.png",
  "何思乔": "/avatars/he-siqiao.png",
};

export const getPersonAvatarUrl = (name?: string) => {
  const normalizedName = name || "unknown";
  return (
    PERSON_AVATAR_URLS[normalizedName] ||
    `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(normalizedName)}`
  );
};

export const PersonBadge: React.FC<{
  name?: string;
  size?: "xs" | "sm" | "md";
  muted?: boolean;
  className?: string;
}> = ({ name, size = "sm", muted = false, className = "" }) => {
  const displayName = name || "未指派";
  const sizeClass =
    size === "xs" ? "h-5 w-5" : size === "md" ? "h-8 w-8" : "h-6 w-6";
  const textClass =
    size === "xs" ? "text-[10px]" : size === "md" ? "text-sm" : "text-xs";

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <img
        src={getPersonAvatarUrl(displayName)}
        alt={displayName}
        className={`${sizeClass} shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover`}
        referrerPolicy="no-referrer"
      />
      <span
        className={`truncate font-extrabold ${
          muted ? "text-slate-500" : "text-slate-705"
        } ${textClass}`}
        title={displayName}
      >
        {displayName}
      </span>
    </span>
  );
};

export const PersonAvatarStack: React.FC<{
  people?: string[];
  size?: "sm" | "md";
  maxVisible?: number;
  className?: string;
}> = ({ people = [], size = "sm", maxVisible = 4, className = "" }) => {
  const names = people.filter(Boolean);
  const visibleNames = names.slice(0, maxVisible);
  const sizeClass = size === "md" ? "h-8 w-8" : "h-7 w-7";

  if (names.length === 0) {
    return <span className={`text-[10px] font-black text-slate-300 ${className}`}>-</span>;
  }

  if (names.length === 1) {
    return (
      <span className={`group/person relative inline-flex min-w-0 items-center justify-center gap-1.5 ${className}`}>
        <img
          src={getPersonAvatarUrl(names[0])}
          alt={names[0]}
          className={`${sizeClass} shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover shadow-3xs`}
          referrerPolicy="no-referrer"
        />
        <span className="max-w-[56px] truncate text-[10px] font-extrabold text-slate-600">
          {names[0]}
        </span>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-[260] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-xl group-hover/person:block">
          {names[0]}
        </span>
      </span>
    );
  }

  return (
    <div className={`group/person relative flex items-center -space-x-2 ${className}`}>
      {visibleNames.map((name) => (
        <img
          key={name}
          src={getPersonAvatarUrl(name)}
          alt={name}
          className={`${sizeClass} rounded-full border-2 border-white bg-slate-50 object-cover shadow-3xs`}
          referrerPolicy="no-referrer"
        />
      ))}
      {names.length > visibleNames.length && (
        <span
          className={`${sizeClass} inline-flex items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-black text-slate-500 shadow-3xs`}
        >
          +{names.length - visibleNames.length}
        </span>
      )}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-[260] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-xl group-hover/person:block">
        {names.join("、")}
      </span>
    </div>
  );
};
