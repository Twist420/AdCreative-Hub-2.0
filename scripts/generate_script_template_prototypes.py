from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "script-template-prototypes"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1800, 1120
FONT_PATH = "/System/Library/Fonts/STHeiti Light.ttc"
FONT_BOLD_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD_PATH if bold else FONT_PATH, size)


COLORS = {
    "bg": "#f8fafc",
    "white": "#ffffff",
    "slate950": "#020617",
    "slate900": "#0f172a",
    "slate800": "#1e293b",
    "slate700": "#334155",
    "slate600": "#475569",
    "slate500": "#64748b",
    "slate400": "#94a3b8",
    "slate300": "#cbd5e1",
    "slate200": "#e2e8f0",
    "slate150": "#edf2f7",
    "slate100": "#f1f5f9",
    "indigo": "#4f46e5",
    "indigo50": "#eef2ff",
    "emerald": "#059669",
    "emerald50": "#ecfdf5",
    "amber": "#d97706",
    "amber50": "#fffbeb",
    "rose": "#e11d48",
    "rose50": "#fff1f2",
    "sky": "#0284c7",
    "sky50": "#f0f9ff",
}


def new_canvas(title, subtitle, active):
    img = Image.new("RGB", (W, H), COLORS["bg"])
    d = ImageDraw.Draw(img)
    d.text((48, 36), "AdPulse Pro / 需求脚本原型", fill=COLORS["slate500"], font=font(18))
    d.text((48, 68), title, fill=COLORS["slate900"], font=font(36, True))
    d.text((48, 116), subtitle, fill=COLORS["slate500"], font=font(20))
    d.line((48, 158, W - 48, 158), fill=COLORS["slate200"], width=2)
    tabs = ["相同A段", "相同B段", "多引用组合", "自由模板"]
    x = 48
    for tab in tabs:
        tw = 150 if tab != "多引用组合" else 180
        fill = COLORS["slate900"] if tab == active else COLORS["white"]
        outline = COLORS["slate900"] if tab == active else COLORS["slate200"]
        text_color = COLORS["white"] if tab == active else COLORS["slate600"]
        d.rounded_rectangle((x, 178, x + tw, 226), radius=18, fill=fill, outline=outline, width=2)
        d.text((x + 28, 191), tab, fill=text_color, font=font(20, True))
        x += tw + 16
    return img, d


def rounded(d, box, radius=18, fill="#ffffff", outline="#e2e8f0", width=2):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def label(d, xy, text, fill=COLORS["slate400"]):
    d.text(xy, text, fill=fill, font=font(16, True))


def body(d, xy, text, fill=COLORS["slate600"], size=18):
    d.text(xy, text, fill=fill, font=font(size))


def title(d, xy, text, fill=COLORS["slate900"], size=24):
    d.text(xy, text, fill=fill, font=font(size, True))


def pill(d, x, y, text, fill, color, w=None):
    width = w or max(80, len(text) * 18 + 32)
    d.rounded_rectangle((x, y, x + width, y + 34), radius=14, fill=fill)
    d.text((x + 16, y + 7), text, fill=color, font=font(16, True))
    return width


def small_input(d, box, text, placeholder=False):
    rounded(d, box, 14, COLORS["slate100"], COLORS["slate200"], 2)
    d.text((box[0] + 18, box[1] + 14), text, fill=COLORS["slate400"] if placeholder else COLORS["slate800"], font=font(18, True))


def asset_chip(d, x, y, text, color="indigo"):
    if color == "emerald":
        return pill(d, x, y, text, COLORS["emerald50"], COLORS["emerald"], None)
    if color == "amber":
        return pill(d, x, y, text, COLORS["amber50"], COLORS["amber"], None)
    return pill(d, x, y, text, COLORS["indigo50"], COLORS["indigo"], None)


def upload_box(d, box, main, sub):
    rounded(d, box, 24, "#fbfdff", "#bfdbfe", 3)
    cx = (box[0] + box[2]) // 2
    cy = (box[1] + box[3]) // 2
    d.text((cx - 72, cy - 24), main, fill=COLORS["slate400"], font=font(22, True))
    d.text((cx - 88, cy + 10), sub, fill=COLORS["slate300"], font=font(16, True))
    d.rounded_rectangle((cx - 56, cy + 48, cx + 56, cy + 90), radius=20, fill=COLORS["slate900"])
    d.text((cx - 28, cy + 59), "+ 上传", fill=COLORS["white"], font=font(18, True))


def version_card(d, box, version, name, goal, refs, copy=False, compact=False):
    rounded(d, box, 22, COLORS["white"], COLORS["slate200"], 2)
    x1, y1, x2, y2 = box
    pill(d, x1 + 18, y1 + 16, f"v{version}", COLORS["indigo"], COLORS["white"], 56)
    title(d, (x1 + 88, y1 + 18), name, size=20)
    d.text((x1 + 18, y1 + 62), "验证目标", fill=COLORS["slate400"], font=font(14, True))
    body(d, (x1 + 18, y1 + 86), goal, size=17)
    d.text((x1 + 18, y1 + 124), "资产引用", fill=COLORS["slate400"], font=font(14, True))
    rx = x1 + 18
    for i, ref in enumerate(refs[:3]):
        rx += asset_chip(d, rx, y1 + 148 + (i // 2) * 42, ref, "indigo" if i != 2 else "emerald") + 10
        if rx > x2 - 160:
            rx = x1 + 18
    if not compact:
        d.text((x1 + 18, y1 + 238), "参考附件", fill=COLORS["slate400"], font=font(14, True))
        asset_chip(d, x1 + 18, y1 + 262, "参考录屏", "amber")
        asset_chip(d, x1 + 130, y1 + 262, "竞品截图", "amber")
        d.text((x1 + 18, y1 + 316), "当前版本描述", fill=COLORS["slate400"], font=font(14, True))
        rounded(d, (x1 + 18, y1 + 342, x2 - 18, y2 - 28), 16, COLORS["slate100"], COLORS["slate200"], 1)
        body(d, (x1 + 36, y1 + 360), "补充该版本差异、画面表现、制作注意事项...", COLORS["slate400"], 16)
    if copy:
        d.text((x1 + 18, y2 - 92), "大字报文案", fill=COLORS["rose"], font=font(14, True))
        rounded(d, (x1 + 18, y2 - 66, x2 - 18, y2 - 22), 14, COLORS["rose50"], "#fecdd3", 1)
        body(d, (x1 + 34, y2 - 56), "输入文案，支持 AI 翻译 / 校验 / 润色", COLORS["rose"], 16)


def draw_same_a():
    img, d = new_canvas("方案A：相同A段视频需求", "新做统一A段，所有小版本同时展开；每个版本引用不同已有B段/CTA。", "相同A段")
    rounded(d, (48, 256, 1752, 514), 28, COLORS["white"], COLORS["slate200"], 2)
    title(d, (78, 286), "共享新做 A 段", size=26)
    body(d, (78, 326), "适合：新做片头 / A段，批量接之前跑得不错的已有片段。共享模块只填一次，减少重复。", size=19)
    upload_box(d, (78, 370, 460, 488), "上传A段预览", "NEW SEGMENT PREVIEW")
    small_input(d, (500, 370, 860, 424), "A段名称：冰雪仙子神秘空投")
    small_input(d, (500, 438, 860, 488), "时长：0-5s")
    rounded(d, (900, 370, 1470, 488), 18, COLORS["slate100"], COLORS["slate200"], 1)
    body(d, (924, 392), "详细描述新做A段：画面、节奏、转场、口播、禁用内容...", COLORS["slate500"], 18)
    asset_chip(d, 1500, 378, "参考录屏", "amber")
    asset_chip(d, 1500, 426, "竞品截图", "amber")

    title(d, (48, 552), "所有小版本：各自填写名称、目标、B段引用、附件、描述", size=24)
    xs = [48, 478, 908, 1338]
    for i, x in enumerate(xs, 1):
        version_card(
            d,
            (x, 596, x + 394, 1048),
            f"0{i}",
            f"{3679+i} 接高转化玩法段",
            "验证新A段接老B段的吸量和CVR",
            ["玩法段-塔防合成", "CTA-宝箱十连抽"],
            copy=False
        )
    img.save(OUT / "01_same_a_board.png")


def draw_same_b():
    img, d = new_canvas("方案A：相同B段视频需求", "新做统一B段，所有小版本同时展开；每个版本引用不同已有A段。", "相同B段")
    rounded(d, (48, 256, 1752, 514), 28, COLORS["white"], COLORS["slate200"], 2)
    title(d, (78, 286), "共享新做 B 段", size=26)
    body(d, (78, 326), "适合：统一后段卖点 / CTA / 大字报承接，批量测试不同A段入口。", size=19)
    upload_box(d, (78, 370, 460, 488), "上传B段预览", "NEW ENDING PREVIEW")
    small_input(d, (500, 370, 860, 424), "B段名称：爆奖CTA大字报")
    small_input(d, (500, 438, 860, 488), "时长：13-16s")
    rounded(d, (900, 370, 1470, 488), 18, COLORS["slate100"], COLORS["slate200"], 1)
    body(d, (924, 392), "详细描述新做B段：转化卖点、CTA、文案节奏、平台限制...", COLORS["slate500"], 18)
    asset_chip(d, 1500, 378, "口播音频", "amber")
    asset_chip(d, 1500, 426, "翻译表", "amber")

    title(d, (48, 552), "所有小版本：各自填写名称、目标、A段引用、附件、描述", size=24)
    xs = [48, 478, 908, 1338]
    for i, x in enumerate(xs, 1):
        version_card(
            d,
            (x, 596, x + 394, 1048),
            f"0{i}",
            f"{3686+i} 不同A段入口",
            "验证不同A段接统一B段的转化效率",
            ["AI前贴-冰雪", "真人前贴-爆奖"],
            copy=True
        )
    img.save(OUT / "02_same_b_board.png")


def draw_matrix():
    img, d = new_canvas("方案B：多引用组合视频需求", "版本很多、主要复用资产库排列组合时，用矩阵表格一次性录入和检查。", "多引用组合")
    rounded(d, (48, 256, 1752, 408), 28, COLORS["white"], COLORS["slate200"], 2)
    title(d, (78, 286), "候选资产池", size=26)
    pools = [("A段候选池", ["AI冰雪仙子", "真人爆奖反应", "漫画突袭"]), ("中间段候选池", ["塔防合成", "三消连爆", "经营升级"]), ("B段/大字报池", ["震颤提词", "爆奖通知", "下载CTA"])]
    px = 78
    for pool, items in pools:
        rounded(d, (px, 330, px + 500, 382), 18, COLORS["slate100"], COLORS["slate200"], 1)
        d.text((px + 20, 346), pool, fill=COLORS["slate800"], font=font(18, True))
        ix = px + 150
        for item in items:
            ix += asset_chip(d, ix, 339, item, "indigo") + 8
        px += 540

    rounded(d, (48, 450, 1752, 1018), 28, COLORS["white"], COLORS["slate200"], 2)
    title(d, (78, 480), "版本组合矩阵", size=26)
    headers = ["版本", "小版本名称", "验证目标", "A段", "中间段", "B段/大字报", "CTA", "附件", "描述/检查"]
    widths = [90, 220, 260, 180, 180, 200, 150, 140, 250]
    x = 78
    y = 536
    d.rounded_rectangle((78, y, 1722, y + 48), radius=16, fill=COLORS["slate100"])
    for h, w in zip(headers, widths):
        d.text((x + 12, y + 14), h, fill=COLORS["slate500"], font=font(16, True))
        x += w
    rows = [
        ["v01", "剧情A+玩法1+B1", "验证剧情入口", "AI冰雪仙子", "塔防合成", "震颤提词", "宝箱CTA", "录屏", "缺文案校验"],
        ["v02", "真人A+玩法2+B2", "验证真人入口", "真人爆奖反应", "三消连爆", "爆奖通知", "下载CTA", "截图", "完整"],
        ["v03", "漫画A+玩法3+B1", "验证漫画入口", "漫画突袭", "经营升级", "震颤提词", "宝箱CTA", "录屏", "缺描述"],
        ["v04", "AI A+玩法2+B3", "验证中段差异", "AI冰雪仙子", "三消连爆", "下载CTA", "下载CTA", "翻译表", "完整"],
        ["v05", "真人A+玩法1+B3", "验证B段差异", "真人爆奖反应", "塔防合成", "下载CTA", "宝箱CTA", "录屏", "完整"],
    ]
    y += 58
    for r, row in enumerate(rows):
        fill = COLORS["white"] if r % 2 == 0 else "#fbfdff"
        d.rectangle((78, y - 4, 1722, y + 58), fill=fill)
        x = 78
        for i, (value, w) in enumerate(zip(row, widths)):
            if i == 0:
                pill(d, x + 12, y + 8, value, COLORS["indigo"], COLORS["white"], 56)
            elif i in [3, 4, 5, 6]:
                asset_chip(d, x + 8, y + 8, value, "indigo" if i != 5 else "amber")
            elif i == 8:
                color = "emerald" if value == "完整" else "rose"
                asset_chip(d, x + 8, y + 8, value, color)
            else:
                d.text((x + 12, y + 18), value, fill=COLORS["slate700"], font=font(17, True if i == 1 else False))
            x += w
        d.line((78, y + 62, 1722, y + 62), fill=COLORS["slate100"], width=2)
        y += 76
    img.save(OUT / "03_multi_reference_matrix.png")


def draw_flexible():
    img, d = new_canvas("方案C迭代：自由模板视频需求", "自由模板保留版本总览，但所有版本仍在右侧完整展开，适合结构不固定的复杂需求。", "自由模板")
    rounded(d, (48, 256, 350, 1046), 28, COLORS["white"], COLORS["slate200"], 2)
    title(d, (78, 286), "版本完成度", size=24)
    navs = [("v01", "90%", "缺文案校验"), ("v02", "70%", "缺附件"), ("v03", "55%", "缺资产引用"), ("v04", "100%", "完整")]
    y = 342
    for v, pct, note in navs:
        rounded(d, (78, y, 320, y + 92), 18, COLORS["indigo50"] if pct == "90%" else COLORS["white"], COLORS["slate200"], 2)
        pill(d, 98, y + 18, v, COLORS["indigo"], COLORS["white"], 58)
        d.text((170, y + 19), pct, fill=COLORS["slate900"], font=font(24, True))
        d.text((98, y + 58), note, fill=COLORS["slate500"], font=font(16, True))
        y += 112

    x1 = 390
    title(d, (x1, 256), "所有小版本完整展开", size=26)
    version_y = 304
    for idx in range(3):
        rounded(d, (x1, version_y, 1752, version_y + 230), 26, COLORS["white"], COLORS["slate200"], 2)
        pill(d, x1 + 28, version_y + 26, f"v0{idx+1}", COLORS["indigo"], COLORS["white"], 62)
        small_input(d, (x1 + 110, version_y + 20, x1 + 510, version_y + 74), f"版本名称：自由结构测试 {idx+1}")
        small_input(d, (x1 + 530, version_y + 20, x1 + 980, version_y + 74), "验证目标：验证不同叙事顺序")
        asset_chip(d, x1 + 1000, version_y + 30, "参考录屏", "amber")
        asset_chip(d, x1 + 1120, version_y + 30, "玩法录屏", "amber")
        timeline_x = x1 + 28
        timeline_y = version_y + 104
        segs = [("片头", "0-3s", "新做"), ("剧情承接", "3-8s", "引用"), ("玩法展示", "8-15s", "引用"), ("CTA", "15-18s", "描述")]
        for s, (name, duration, mode) in enumerate(segs):
            sx = timeline_x + s * 320
            rounded(d, (sx, timeline_y, sx + 284, timeline_y + 92), 18, COLORS["slate100"], COLORS["slate200"], 1)
            d.text((sx + 18, timeline_y + 16), name, fill=COLORS["slate900"], font=font(18, True))
            d.text((sx + 18, timeline_y + 44), duration, fill=COLORS["slate500"], font=font(16, True))
            asset_chip(d, sx + 128, timeline_y + 34, mode, "emerald" if mode == "引用" else "amber")
            if s < len(segs) - 1:
                d.text((sx + 292, timeline_y + 32), "→", fill=COLORS["slate300"], font=font(30, True))
        version_y += 250
    img.save(OUT / "04_flexible_expanded.png")


if __name__ == "__main__":
    draw_same_a()
    draw_same_b()
    draw_matrix()
    draw_flexible()
    print(OUT)
