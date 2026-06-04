from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ui-style-guide-visual.pdf"

PAGE_W, PAGE_H = landscape(A4)


def hex_color(value: str):
    return colors.HexColor(value)


SLATE_950 = hex_color("#020617")
SLATE_900 = hex_color("#0f172a")
SLATE_800 = hex_color("#1e293b")
SLATE_700 = hex_color("#334155")
SLATE_600 = hex_color("#475569")
SLATE_500 = hex_color("#64748b")
SLATE_400 = hex_color("#94a3b8")
SLATE_300 = hex_color("#cbd5e1")
SLATE_200 = hex_color("#e2e8f0")
SLATE_100 = hex_color("#f1f5f9")
SLATE_50 = hex_color("#f8fafc")
WHITE = colors.white
PRIMARY = hex_color("#4f46e5")
INDIGO_50 = hex_color("#eef2ff")
EMERALD = hex_color("#059669")
EMERALD_50 = hex_color("#ecfdf5")
AMBER = hex_color("#d97706")
AMBER_50 = hex_color("#fffbeb")
ROSE = hex_color("#e11d48")
ROSE_50 = hex_color("#fff1f2")
SKY = hex_color("#0284c7")
SKY_50 = hex_color("#f0f9ff")
PURPLE = hex_color("#7e22ce")
PURPLE_50 = hex_color("#faf5ff")


pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
FONT = "STSong-Light"

styles = getSampleStyleSheet()
BODY = ParagraphStyle(
    "BodyCN",
    parent=styles["BodyText"],
    fontName=FONT,
    fontSize=8.8,
    leading=13,
    textColor=SLATE_600,
    alignment=TA_LEFT,
)


def rounded(c, x, y, w, h, r=8, fill=WHITE, stroke=SLATE_200, sw=1):
    c.setLineWidth(sw)
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke else 0, fill=1)


def text(c, value, x, y, size=10, color=SLATE_800, weight="regular"):
    c.setFillColor(color)
    c.setFont(FONT, size)
    c.drawString(x, y, value)


def center_text(c, value, x, y, w, size=10, color=SLATE_800):
    c.setFillColor(color)
    c.setFont(FONT, size)
    c.drawCentredString(x + w / 2, y, value)


def para(c, value, x, y, w, h, style=BODY):
    p = Paragraph(value, style)
    p.wrapOn(c, w, h)
    p.drawOn(c, x, y)


def pill(c, label, x, y, fill, color, border=None, w=None):
    width = w or max(42, len(label) * 6 + 18)
    rounded(c, x, y, width, 18, 9, fill, border or fill, 0.8)
    center_text(c, label, x, y + 5.2, width, 7.5, color)
    return width


def page_header(c, title, subtitle, page_num):
    c.setFillColor(SLATE_50)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    text(c, "AdPulse Pro UI Style Guide", 32, PAGE_H - 30, 8.5, SLATE_500)
    text(c, title, 32, PAGE_H - 58, 20, SLATE_900)
    text(c, subtitle, 32, PAGE_H - 76, 8.8, SLATE_500)
    c.setStrokeColor(SLATE_200)
    c.line(32, PAGE_H - 90, PAGE_W - 32, PAGE_H - 90)
    text(c, f"{page_num}", PAGE_W - 38, 24, 8, SLATE_400)


def draw_top_nav(c, x, y, w):
    rounded(c, x, y, w, 44, 0, SLATE_900, SLATE_900, 0)
    rounded(c, x + 16, y + 12, 20, 20, 6, PRIMARY, PRIMARY, 0)
    text(c, "AdPulse Pro", x + 44, y + 15, 12, WHITE)
    items = ["需求中心", "资产库", "迭代记录", "数据分析", "标签管理"]
    cur_x = x + 135
    for index, item in enumerate(items):
        active = index == 0
        if active:
            c.setFillColor(colors.Color(1, 1, 1, alpha=0.06))
            c.rect(cur_x - 10, y, 66, 44, fill=1, stroke=0)
            c.setFillColor(PRIMARY)
            c.rect(cur_x - 10, y, 66, 2, fill=1, stroke=0)
        text(c, item, cur_x, y + 16, 8.5, WHITE if active else SLATE_400)
        cur_x += 76
    rounded(c, x + w - 110, y + 11, 24, 24, 12, SLATE_700, SLATE_700, 0)
    text(c, "何思乔", x + w - 76, y + 21, 7, WHITE)
    text(c, "Super User", x + w - 76, y + 11, 5.8, SLATE_400)


def draw_sidebar(c, x, y, h):
    rounded(c, x, y, 110, h, 0, WHITE, SLATE_200, 0.8)
    text(c, "需求管理中心", x + 12, y + h - 28, 7, SLATE_400)
    items = ["协同看板", "创意排期", "需求大表", "素材上传"]
    cur_y = y + h - 56
    for index, item in enumerate(items):
        active = index == 0
        rounded(c, x + 10, cur_y, 88, 24, 6, SLATE_900 if active else WHITE, SLATE_900 if active else WHITE, 0)
        text(c, item, x + 24, cur_y + 8, 7.5, WHITE if active else SLATE_500)
        cur_y -= 30


def draw_ui_shell(c, x, y, w, h):
    rounded(c, x, y, w, h, 8, SLATE_50, SLATE_200, 0.8)
    draw_top_nav(c, x, y + h - 44, w)
    draw_sidebar(c, x, y, h - 44)
    main_x = x + 122
    main_y = y + 16
    main_w = w - 138
    main_h = h - 72
    rounded(c, main_x, main_y + main_h - 42, main_w, 38, 8, WHITE, SLATE_100, 0.8)
    text(c, "在当前周期搜索需求或方向...", main_x + 16, main_y + main_h - 27, 8, SLATE_400)
    pill(c, "筛选", main_x + main_w - 94, main_y + main_h - 33, SLATE_100, SLATE_600, SLATE_200, 42)
    pill(c, "新增", main_x + main_w - 48, main_y + main_h - 33, PRIMARY, WHITE, PRIMARY, 42)
    col_w = (main_w - 20) / 3
    for i, title in enumerate(["本周高优先级", "制作中", "待验收"]):
        cx = main_x + i * (col_w + 10)
        rounded(c, cx, main_y, col_w, main_h - 54, 8, WHITE, SLATE_200, 0.8)
        text(c, title, cx + 12, main_y + main_h - 72, 8.2, SLATE_800)
        for j in range(3):
            card_y = main_y + main_h - 108 - j * 54
            rounded(c, cx + 10, card_y, col_w - 20, 42, 7, SLATE_50 if j == 1 else WHITE, SLATE_100, 0.6)
            text(c, f"CP-{3377+i*3+j}-0{j+1}", cx + 18, card_y + 26, 7.2, SLATE_400)
            text(c, ["3D玩法方向", "原始玩法方向", "大字报测试"][j], cx + 18, card_y + 13, 8.3, SLATE_800)
            pill(c, ["High", "Mid", "Done"][j], cx + col_w - 62, card_y + 12, [ROSE_50, AMBER_50, EMERALD_50][j], [ROSE, AMBER, EMERALD][j], None, 38)


def draw_color_block(c, name, hexv, x, y, w, h, color, text_color=None):
    rounded(c, x, y, w, h, 8, color, color, 0)
    tc = text_color or (WHITE if color in [SLATE_900, SLATE_800, PRIMARY, EMERALD, AMBER, ROSE, SKY, PURPLE] else SLATE_800)
    text(c, name, x + 10, y + h - 18, 8.5, tc)
    text(c, hexv, x + 10, y + 10, 7.2, tc)


def draw_component_card(c, x, y, w, title, accent=PRIMARY):
    rounded(c, x, y, w, 104, 8, WHITE, SLATE_200, 0.8)
    c.setFillColor(accent)
    c.roundRect(x + 14, y + 76, 4, 18, 2, fill=1, stroke=0)
    text(c, title, x + 26, y + 82, 9.5, SLATE_900)
    text(c, "业务后台卡片：白底、细边框、轻阴影、信息密度高", x + 14, y + 62, 7.5, SLATE_500)
    text(c, "本周需求", x + 14, y + 38, 7, SLATE_400)
    text(c, "42", x + 14, y + 17, 18, SLATE_900)
    pill(c, "+12%", x + w - 62, y + 22, EMERALD_50, EMERALD, None, 44)


def draw_table(c, x, y, w):
    rounded(c, x, y, w, 132, 8, WHITE, SLATE_200, 0.8)
    text(c, "表格示例", x + 14, y + 108, 9.5, SLATE_900)
    headers = ["素材", "负责人", "状态", "优先级", "操作"]
    widths = [120, 70, 74, 66, 58]
    cur_x = x + 14
    c.setFillColor(SLATE_50)
    c.roundRect(x + 12, y + 78, w - 24, 22, 6, fill=1, stroke=0)
    for h, cw in zip(headers, widths):
        text(c, h, cur_x + 6, y + 85, 7, SLATE_400)
        cur_x += cw
    rows = [("3D冰雪仙子神秘空投", "唐欣怡", "制作中", "High", "查看"), ("塔防合成升级展示", "吉意煊", "待验收", "Mid", "查看"), ("经典震颤大字报", "马嘉良", "已完成", "Low", "查看")]
    row_y = y + 54
    for idx, row in enumerate(rows):
        if idx == 1:
            c.setFillColor(SLATE_50)
            c.rect(x + 12, row_y - 4, w - 24, 22, fill=1, stroke=0)
        cur_x = x + 14
        for col, cw in zip(row, widths):
            color = SLATE_800 if cur_x == x + 14 else SLATE_500
            if col == "High":
                pill(c, col, cur_x + 4, row_y - 2, ROSE_50, ROSE, None, 42)
            elif col == "Mid":
                pill(c, col, cur_x + 4, row_y - 2, AMBER_50, AMBER, None, 42)
            elif col == "Low":
                pill(c, col, cur_x + 4, row_y - 2, SLATE_100, SLATE_500, None, 42)
            elif col in ["制作中", "待验收", "已完成"]:
                fill = AMBER_50 if col == "制作中" else SKY_50 if col == "待验收" else EMERALD_50
                colr = AMBER if col == "制作中" else SKY if col == "待验收" else EMERALD
                pill(c, col, cur_x + 4, row_y - 2, fill, colr, None, 46)
            else:
                text(c, col, cur_x + 6, row_y + 4, 7.2, color)
            cur_x += cw
        c.setStrokeColor(SLATE_100)
        c.line(x + 14, row_y - 10, x + w - 14, row_y - 10)
        row_y -= 24


def page_one(c):
    page_header(c, "01 风格总览", "深色顶栏 + 浅灰工作区 + 白色业务组件，是当前平台的核心视觉骨架。", 1)
    draw_ui_shell(c, 32, 110, PAGE_W - 64, 330)
    para(
        c,
        "整体方向：偏广告投放运营后台，不做营销式首页。界面应支持高频筛选、看板跟进、数据对比和素材管理。视觉语言克制，重点通过状态色、激活态、表格密度和清晰层级传达业务状态。",
        36,
        54,
        PAGE_W - 72,
        44,
    )


def page_two(c):
    page_header(c, "02 色彩与层级", "主色负责关键动作；slate 负责结构和文字；状态色只表达业务状态。", 2)
    y = PAGE_H - 150
    color_blocks = [
        ("Primary", "#4f46e5", PRIMARY),
        ("Slate 900", "#0f172a", SLATE_900),
        ("Slate 50", "#f8fafc", SLATE_50),
        ("White", "#ffffff", WHITE),
        ("Emerald", "#059669", EMERALD),
        ("Amber", "#d97706", AMBER),
        ("Rose", "#e11d48", ROSE),
        ("Sky", "#0284c7", SKY),
        ("Purple", "#7e22ce", PURPLE),
    ]
    x = 32
    for i, (name, hexv, col) in enumerate(color_blocks):
        draw_color_block(c, name, hexv, x + (i % 3) * 178, y - (i // 3) * 76, 156, 56, col, SLATE_800 if name in ["Slate 50", "White"] else None)
    draw_component_card(c, 584, PAGE_H - 210, 230, "核心指标卡", PRIMARY)
    draw_component_card(c, 584, PAGE_H - 330, 230, "风险提示卡", ROSE)
    rounded(c, 32, 84, 782, 100, 8, WHITE, SLATE_200, 0.8)
    text(c, "色彩使用判断", 48, 154, 11, SLATE_900)
    para(
        c,
        "1. 页面大面积背景保持 slate-50，不引入彩色底。<br/>2. 导航和激活态优先使用 slate-900 与 primary。<br/>3. emerald / amber / rose 只用于推荐、进行中、失败等状态。<br/>4. 后续应逐步收敛非标准 Tailwind 色阶，例如 text-slate-705、bg-indigo-550。",
        48,
        98,
        720,
        48,
    )


def page_three(c):
    page_header(c, "03 字体、按钮与状态", "小字号、高字重、短标签，是当前后台界面的主要阅读节奏。", 3)
    rounded(c, 32, 280, 360, 156, 8, WHITE, SLATE_200, 0.8)
    text(c, "字体层级", 48, 404, 11, SLATE_900)
    text(c, "页面标题 / 模块标题", 48, 374, 20, SLATE_900)
    text(c, "卡片标题 / 工具栏标题", 48, 348, 12, SLATE_800)
    text(c, "表格正文 / 操作文本 / 筛选项", 48, 326, 9, SLATE_600)
    text(c, "状态标签 / 辅助说明 / 英文小标题", 48, 306, 7.2, SLATE_400)
    text(c, "CP-3377-01 / REQ-20260601", 220, 306, 8, SLATE_700)
    rounded(c, 418, 280, 396, 156, 8, WHITE, SLATE_200, 0.8)
    text(c, "按钮与标签", 434, 404, 11, SLATE_900)
    pill(c, "新增需求", 434, 366, PRIMARY, WHITE, PRIMARY, 70)
    pill(c, "保存配置", 512, 366, SLATE_900, WHITE, SLATE_900, 70)
    rounded(c, 590, 362, 70, 22, 8, WHITE, SLATE_200, 0.8)
    center_text(c, "取消", 590, 369, 70, 8, SLATE_600)
    pill(c, "上传成功", 434, 326, EMERALD_50, EMERALD, None, 66)
    pill(c, "制作中", 506, 326, AMBER_50, AMBER, None, 58)
    pill(c, "上传失败", 570, 326, ROSE_50, ROSE, None, 66)
    pill(c, "待验收", 642, 326, SKY_50, SKY, None, 58)
    text(c, "按钮优先简短；图标按钮用于设置、删除、更多、查看等高频操作。", 434, 302, 8, SLATE_500)
    draw_table(c, 32, 92, 500)
    rounded(c, 556, 92, 258, 132, 8, WHITE, SLATE_200, 0.8)
    text(c, "交互状态", 572, 194, 10.5, SLATE_900)
    para(
        c,
        "必须保留 hover、active、disabled、loading、success、failure、empty state。动效保持短促克制，弹窗可使用轻微 fade / zoom，避免夸张动效。",
        572,
        130,
        218,
        58,
    )


def page_four(c):
    page_header(c, "04 组件应用边界", "新增页面优先复用现有后台组件，不另起一套视觉语言。", 4)
    draw_ui_shell(c, 32, 236, 380, 210)
    rounded(c, 438, 236, 376, 210, 8, WHITE, SLATE_200, 0.8)
    text(c, "后续新增组件检查清单", 456, 408, 12, SLATE_900)
    para(
        c,
        "新增页面必须继续使用浅灰工作区、白色卡片、细边框、短标签和 lucide 图标。操作优先放在工具栏、行 hover、弹窗底部。不要新增大面积彩色主题，不做营销页式 hero，不使用装饰性背景图或渐变球。",
        456,
        342,
        330,
        58,
    )
    checks = [
        ("结构", "顶栏、侧栏、主内容区是否保持一致"),
        ("密度", "表格、看板、筛选是否适合高频操作"),
        ("状态", "业务状态是否用 emerald / amber / rose / sky 表达"),
        ("控件", "按钮、输入框、弹窗是否沿用圆角和边框"),
        ("验证", "涉及界面改动后必须浏览器检查"),
    ]
    y = 302
    for label, desc in checks:
        pill(c, label, 456, y, INDIGO_50, PRIMARY, None, 42)
        text(c, desc, 508, y + 5.5, 8, SLATE_600)
        y -= 32
    rounded(c, 32, 86, PAGE_W - 64, 116, 8, SLATE_900, SLATE_900, 0)
    text(c, "建议确认项", 52, 160, 13, WHITE)
    para(
        c,
        "<font color='white'>1. 是否确认长期使用“深色顶栏 + 浅灰工作区 + 白色卡片”的主风格？<br/>2. 是否确认后续逐步收敛非标准 Tailwind 色阶，改用标准 slate / indigo 色阶？<br/>3. 是否确认新增 UI 页面不得转向营销页、渐变装饰或低密度展示风格？</font>",
        52,
        104,
        PAGE_W - 104,
        48,
    )


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for page in [page_one, page_two, page_three, page_four]:
        page(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
