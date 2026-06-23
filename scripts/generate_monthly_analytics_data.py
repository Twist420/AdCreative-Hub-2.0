import hashlib
import json
import re
from pathlib import Path

import pandas as pd


SOURCE = Path("/Users/fourteen/Downloads/回收数据_2026-05-18_2026-06-16 (1).xlsx")
OUTPUT = Path("/Users/fourteen/Documents/广告需求平台/services/monthlyAnalyticsData.ts")

CHANNELS = ["Applovin", "Google", "Facebook", "Adjoe", "Moloco", "Unity"]
THUMBNAILS = [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
]


def number(value):
    if pd.isna(value):
        return 0
    if isinstance(value, str):
        cleaned = value.replace("$", "").replace(",", "").replace("%", "").strip()
        if cleaned in {"", "-", "—"}:
            return 0
        try:
            return float(cleaned)
        except ValueError:
            return 0
    return float(value)


def text(value):
    return "" if pd.isna(value) else str(value).strip()


def stable_int(value):
    return int(hashlib.md5(value.encode("utf-8")).hexdigest()[:8], 16)


def infer_platform(campaign):
    return "iOS" if "ios" in campaign.lower() else "Android"


def infer_language(campaign, set_name):
    source = f"{campaign} {set_name}".lower()
    for key, value in [("de", "DE"), ("jp", "JA"), ("ja", "JA"), ("kr", "KO"), ("ko", "KO")]:
        if re.search(rf"(^|[_\-/\s]){key}($|[_\-/\s])", source):
            return value
    return "EN"


def infer_material_type(set_name):
    lowered = set_name.lower()
    if "sw" in lowered or "playable" in lowered:
        return "playable"
    if "大字报" in set_name or "image" in lowered or "banner" in lowered:
        return "image"
    return "video"


def infer_direction(set_name):
    if "大字报" in set_name:
        return "大字报"
    if "3d" in set_name.lower() or "3D" in set_name:
        return "3D玩法"
    if "剧情" in set_name or "动画" in set_name:
        return "原始玩法"
    return "其他玩法"


def infer_material_id(set_name, index):
    match = re.search(r"cp\s*([0-9]{3,5})(?:[-_]?([0-9]{1,2}))?", set_name, re.I)
    if match:
        cp = match.group(1)
        variant = match.group(2) or str((index % 9) + 1)
        return f"cp{cp}-{int(variant):02d}"
    return f"cp{3000 + stable_int(set_name) % 900}-{(index % 9) + 1:02d}"


def infer_channel(campaign, set_name):
    source = f"{campaign} {set_name}".lower()
    if "google" in source or "uac" in source:
        return "Google"
    if "facebook" in source or "meta" in source or re.fullmatch(r"\d+", campaign.strip()):
        return "Facebook"
    if "unity" in source:
        return "Unity"
    if "moloco" in source:
        return "Moloco"
    if "adjoe" in source:
        return "Adjoe"
    if "applovin" in source or "panthia" in source or source.startswith("m_a"):
        return "Applovin"
    return CHANNELS[stable_int(campaign + set_name) % len(CHANNELS)]


def main():
    df = pd.read_excel(SOURCE)
    rows = []
    for index, row in df.iterrows():
        set_name = text(row.get("Creative Set")) or f"Creative Set {index + 1}"
        campaign = text(row.get("Campaign Name")) or "Unknown Campaign"
        material_id = infer_material_id(set_name, index)
        launch_time = text(row.get("投放时间"))[:10]
        rows.append(
            {
                "id": f"source_{index + 1:04d}",
                "creativeSet": set_name,
                "campaignName": campaign,
                "launchTime": launch_time,
                "channel": infer_channel(campaign, set_name),
                "platform": infer_platform(campaign),
                "language": infer_language(campaign, set_name),
                "materialType": infer_material_type(set_name),
                "direction": infer_direction(set_name),
                "materialId": material_id,
                "materialName": f"{material_id}-{set_name}",
                "contentId": f"content_{material_id.replace('-', '_')}",
                "thumbnail": THUMBNAILS[index % len(THUMBNAILS)],
                "size": ["1080x1920", "1920x1080", "1080x1080"][index % 3],
                "owner": ["唐欣怡", "吉意煊", "马嘉良", "王杰华"][index % 4],
                "designer": ["王杰华", "唐欣怡", "李思晨", "周明"][index % 4],
                "impressions": int(number(row.get("展示"))),
                "clicks": int(number(row.get("点击"))),
                "ctr": number(row.get("CTR")),
                "installs": int(number(row.get("新增用户数"))),
                "cvr": number(row.get("CVR")),
                "spend": number(row.get("花费")),
                "cpi": number(row.get("CPI")),
                "cpm": number(row.get("CPM")),
                "ir": number(row.get("IR")),
                "d7PaidUsers": int(number(row.get("D7付费用户数"))),
                "d7PayRate": number(row.get("D7付费率")),
                "d7Cpa": number(row.get("D7 CPP/CPA")),
                "d0Roi": number(row.get("D0 roi")),
                "d7Roas": number(row.get("D7 roas")),
                "d7IapRev": number(row.get("D7 iap_rev")),
                "d7IapRoas": number(row.get("D7 iap_roas")),
                "d7Ret": number(row.get("D7 ret")),
                "d7Arppu": number(row.get("D7 ARPPU")),
            }
        )

    OUTPUT.write_text(
        "// Auto-generated from 回收数据_2026-05-18_2026-06-16 (1).xlsx.\n"
        "// 广告花费数据_2026-05-18_2026-06-16.xlsx was empty, so spend rows derive from this recovery source.\n\n"
        "export interface MonthlyAnalyticsRow {\n"
        "  id: string;\n"
        "  creativeSet: string;\n"
        "  campaignName: string;\n"
        "  launchTime: string;\n"
        "  channel: string;\n"
        "  platform: 'Android' | 'iOS';\n"
        "  language: 'EN' | 'JA' | 'KO' | 'DE';\n"
        "  materialType: 'video' | 'playable' | 'image';\n"
        "  direction: '大字报' | '原始玩法' | '3D玩法' | '其他玩法';\n"
        "  materialId: string;\n"
        "  materialName: string;\n"
        "  contentId: string;\n"
        "  thumbnail: string;\n"
        "  size: '1080x1920' | '1920x1080' | '1080x1080';\n"
        "  owner: string;\n"
        "  designer: string;\n"
        "  impressions: number;\n"
        "  clicks: number;\n"
        "  ctr: number;\n"
        "  installs: number;\n"
        "  cvr: number;\n"
        "  spend: number;\n"
        "  cpi: number;\n"
        "  cpm: number;\n"
        "  ir: number;\n"
        "  d7PaidUsers: number;\n"
        "  d7PayRate: number;\n"
        "  d7Cpa: number;\n"
        "  d0Roi: number;\n"
        "  d7Roas: number;\n"
        "  d7IapRev: number;\n"
        "  d7IapRoas: number;\n"
        "  d7Ret: number;\n"
        "  d7Arppu: number;\n"
        "}\n\n"
        f"export const MONTHLY_ANALYTICS_ROWS: MonthlyAnalyticsRow[] = {json.dumps(rows, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(rows)} rows to {OUTPUT}")


if __name__ == "__main__":
    main()
