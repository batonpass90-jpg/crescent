# -*- coding: utf-8 -*-
"""CareOn 링크 정리 PDF 생성"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os, glob

# ===== 한글 폰트 등록 =====
font_candidates = [
    r"C:\Windows\Fonts\malgun.ttf",
    r"C:\Windows\Fonts\malgunbd.ttf",
    r"C:\Windows\Fonts\NanumGothic.ttf",
]
ko_font = None
for f in font_candidates:
    if os.path.exists(f):
        try:
            pdfmetrics.registerFont(TTFont("Korean", f))
            ko_font = "Korean"
            break
        except Exception:
            pass

if ko_font is None:
    raise RuntimeError("Korean font not found. Install Malgun or Nanum Gothic.")

# ===== 스타일 =====
styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName=ko_font,
                     fontSize=22, textColor=colors.HexColor("#0F1B2D"),
                     spaceAfter=10, leading=28, alignment=0)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName=ko_font,
                     fontSize=15, textColor=colors.HexColor("#0D9488"),
                     spaceBefore=18, spaceAfter=8, leading=20)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName=ko_font,
                     fontSize=12, textColor=colors.HexColor("#0F1B2D"),
                     spaceBefore=10, spaceAfter=4, leading=16)
P = ParagraphStyle("P", parent=styles["BodyText"], fontName=ko_font,
                    fontSize=10, leading=15, textColor=colors.HexColor("#374151"))
P_HERO = ParagraphStyle("PHero", parent=P, fontSize=12, leading=18,
                          textColor=colors.HexColor("#0F1B2D"))
P_TINY = ParagraphStyle("PTiny", parent=P, fontSize=8, leading=12,
                          textColor=colors.HexColor("#6b7280"))
P_LINK = ParagraphStyle("PLink", parent=P, fontSize=9,
                         textColor=colors.HexColor("#0D9488"),
                         fontName=ko_font)
P_CODE = ParagraphStyle("PCode", parent=P, fontName="Courier",
                          fontSize=9, leading=14,
                          textColor=colors.HexColor("#0F1B2D"),
                          backColor=colors.HexColor("#F8FAFC"),
                          borderPadding=(8, 8, 8, 8),
                          leftIndent=4, rightIndent=4)

# ===== 문서 =====
out_path = os.path.join(os.path.dirname(__file__), "CareOn-링크정리.pdf")
doc = SimpleDocTemplate(
    out_path, pagesize=A4,
    leftMargin=2.0 * cm, rightMargin=2.0 * cm,
    topMargin=1.6 * cm, bottomMargin=1.6 * cm,
    title="CareOn 링크 정리",
    author="CareOn",
)

story = []

# ===== 제목 =====
story.append(Paragraph("🔗 CareOn 링크 정리", H1))
story.append(Paragraph(
    "방문요양 통합 플랫폼 · 운영 시작 가능 상태 (2026-04-29 기준)",
    P_TINY))
story.append(Spacer(1, 6))
story.append(Paragraph("도메인: <b>crescentstudio.co.kr</b>", P))
story.append(Spacer(1, 14))

# ===== 영업·시연용 (강조) =====
story.append(Paragraph("🎬 영업·시연용 (이 링크 1개만 공유)", H2))

hero_table = Table(
    [[Paragraph(
        '<b>https://crescentstudio.co.kr/care-site-demo.html</b><br/>'
        '<font size="9" color="#6b7280">우측 하단 버튼으로 보호자 / 보호사 / 센터장 시점 자유 이동</font>',
        P_HERO)]],
    colWidths=[16.5 * cm], hAlign="LEFT")
hero_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDFA")),
    ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#0D9488")),
    ("LEFTPADDING", (0, 0), (-1, -1), 16),
    ("RIGHTPADDING", (0, 0), (-1, -1), 16),
    ("TOPPADDING", (0, 0), (-1, -1), 14),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
]))
story.append(hero_table)
story.append(Paragraph(
    "동일한 시점(2026-04-26 12:13, 박종철 어르신 케어 진행 중)으로 4가지 화면 통일",
    P_TINY))
story.append(Spacer(1, 14))

# ===== 헬퍼: 표 =====
def make_table(rows, col_widths):
    t = Table(rows, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0FDFA")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0D9488")),
        ("FONTNAME", (0, 0), (-1, 0), ko_font),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("FONTNAME", (0, 1), (-1, -1), ko_font),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t

# ===== 운영용 =====
story.append(Paragraph("🏥 운영용 (각 센터 슬러그 적용)", H2))
story.append(Paragraph(
    "각 센터 슬러그(예: <font face='Courier' size='9'>?c=sunshine</font>)를 URL 끝에 붙여 사용. 5개 센터 받으면 각자 슬러그 부여.",
    P))
story.append(Spacer(1, 6))

ops_data = [
    ["용도", "URL"],
    ["🌐 마케팅 사이트", "crescentstudio.co.kr/care-site.html?c=sunshine"],
    ["🔐 로그인/가입", "crescentstudio.co.kr/care-login.html?c=sunshine"],
    ["📊 센터장 대시보드", "crescentstudio.co.kr/care-admin.html"],
    ["👩‍⚕️ 보호사 앱", "crescentstudio.co.kr/care-worker.html"],
    ["👨‍👩‍👧 보호자 앱", "crescentstudio.co.kr/care-customer.html"],
    ["👑 슈퍼어드민", "crescentstudio.co.kr/care-superadmin.html"],
]
ops_rows = [[Paragraph(c, P) for c in r] for r in ops_data]
story.append(make_table(ops_rows, [4.5 * cm, 12.0 * cm]))
story.append(Spacer(1, 14))

# ===== 데모 =====
story.append(Paragraph("🎬 데모 (각 시점별 직접 진입)", H2))
demo_data = [
    ["시점", "URL", "설명"],
    ["🌐 센터 홈페이지 (허브)", "care-site-demo.html", "방문자 시점 — 영업 시 이거 1개만 공유"],
    ["📊 센터장", "care-admin-demo.html", "햇살요양센터 — 8건 중 3 완료"],
    ["👩‍⚕️ 보호사", "care-worker-demo.html", "김미영 보호사 — 박종철 댁 방문중"],
    ["👨‍👩‍👧 보호자", "care-customer-demo.html", "박지영(자녀) — 케어 실시간 확인"],
]
demo_rows = [[Paragraph(c, P) for c in r] for r in demo_data]
story.append(make_table(demo_rows, [3.0 * cm, 5.5 * cm, 8.0 * cm]))
story.append(Spacer(1, 14))

# ===== 영업 자료 =====
story.append(Paragraph("📚 영업 자료", H2))
sales_data = [
    ["용도", "URL"],
    ["👔 원장님 ROI 랜딩", "crescentstudio.co.kr/careon-client.html"],
    ["🧑‍💼 파트너 영업 키트", "crescentstudio.co.kr/careon-partner-recruit.html"],
    ["🌿 초기 파트너 모집", "crescentstudio.co.kr/careon-founding.html"],
    ["🖥️ 통합 데모 (3탭)", "crescentstudio.co.kr/demo-09-careon.html"],
    ["🏢 요양원 작업지시서", "crescentstudio.co.kr/demo-workorder-form.html"],
    ["🚗 방문요양 작업지시서", "crescentstudio.co.kr/demo-workorder-home.html"],
]
sales_rows = [[Paragraph(c, P) for c in r] for r in sales_data]
story.append(make_table(sales_rows, [4.5 * cm, 12.0 * cm]))
story.append(Spacer(1, 14))

# ===== 관리자 콘솔 =====
story.append(Paragraph("⚙️ 관리자 콘솔 (대표님 전용)", H2))
admin_data = [
    ["용도", "URL"],
    ["Supabase 대시보드", "supabase.com/dashboard/project/swsemxzgzcwwrhowuaqz"],
    ["GitHub Repo", "github.com/batonpass90-jpg/crescent"],
    ["Solapi 콘솔", "console.solapi.com"],
    ["토스페이먼츠 (가입 시)", "app.tosspayments.com"],
]
admin_rows = [[Paragraph(c, P) for c in r] for r in admin_data]
story.append(make_table(admin_rows, [4.5 * cm, 12.0 * cm]))

story.append(PageBreak())

# ===== 카톡 공유용 =====
story.append(Paragraph("📱 카톡 공유용 템플릿", H2))

story.append(Paragraph("A. 영업 대상에게 (첫 데모 공유)", H3))
share_a = """🏥 CareOn — 방문요양 통합 플랫폼

✅ 이 데모 한 페이지로 모든 화면 둘러보세요
👉 https://crescentstudio.co.kr/care-site-demo.html

마케팅 사이트 → 우측 하단 버튼 →
보호자/보호사/센터장 시점 자유 전환

문의: batonpass90@gmail.com"""
story.append(Paragraph(share_a.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 10))

story.append(Paragraph("B. 가입한 센터에게 (예: 햇살요양센터 = sunshine)", H3))
share_b = """[햇살요양센터 - CareOn]

🌐 입소 상담 페이지 (가족용):
https://crescentstudio.co.kr/care-site.html?c=sunshine

📊 센터장 대시보드:
https://crescentstudio.co.kr/care-admin.html

👩‍⚕️ 보호사 앱:
https://crescentstudio.co.kr/care-worker.html

👨‍👩‍👧 보호자 앱:
https://crescentstudio.co.kr/care-customer.html
(보호자 초대 시 SMS로 자동 발송됨)"""
story.append(Paragraph(share_b.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 10))

story.append(Paragraph("C. 보호자 신규 가입자에게 (자동 발송됨)", H3))
share_c = """[CareOn] 박종철 어르신 케어 초대

초대 코드: A8K3MP9R

아래 링크로 가입해주세요
👉 https://crescentstudio.co.kr/care-login.html?invite=A8K3MP9R

7일 내 가입해주세요"""
story.append(Paragraph(share_c.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 14))

# ===== 운영 흐름 다이어그램 =====
story.append(Paragraph("🔁 사용자 진입 흐름", H2))

story.append(Paragraph("신규 가족 → 어르신 케어 시작", H3))
flow1 = """care-site.html?c=sunshine
  ↓ "입소 상담 신청" 모달 → consultations INSERT
  ↓ 센터장 SMS 자동 알림 (Solapi)
  ↓ (오프라인) 센터장 전화 컨택
  ↓ care-admin → 수급자 등록 → "보호자 초대" 버튼
  ↓ 보호자에게 8자리 코드 SMS 발송
  ↓ care-login.html?invite=A8K3MP9R
  ↓ 자동 매칭 → care-customer.html"""
story.append(Paragraph(flow1.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 10))

story.append(Paragraph("신규 보호사 채용 (이메일 매칭)", H3))
flow2 = """센터장 → care-admin → 보호사 등록 (kim@example.com)
  ↓ workers.status='pending_signup'
  ↓ 보호사가 동일 이메일로 가입
  ↓ link_worker_account() RPC 자동 매칭
  ↓ workers.profile_id 연결, status='active'
  ↓ care-worker.html 자동 진입"""
story.append(Paragraph(flow2.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 10))

story.append(Paragraph("기존 사용자 → 본인 앱 직행", H3))
flow3 = """care-site → 보호자/보호사/센터장 카드 클릭
  ↓ /care-login.html?c=slug&role=guardian|worker|admin
  ↓ [세션 있음] → 즉시 본인 앱
  ↓ [세션 없음] → 안내 배너 + 로그인 폼"""
story.append(Paragraph(flow3.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 14))

# ===== 알림 정책 =====
story.append(Paragraph("🔔 알림 정책 (어르신당 하루 최대 2회)", H2))
story.append(Paragraph(
    "수시 알림으로 인한 보호자 알람 피로도를 줄이기 위해, 일일 종합 보고서로 통합:",
    P))
notif = """1. GPS 도착 알림 (보호사 체크인 시 1회) — 가족 안심용
2. 일일 종합 보고서 (저녁 19:00 KST 자동 발송) — 그날 케어 요약
   ✓ 체크리스트 완료율
   ✓ 담당 보호사
   ✓ 사진 첨부 여부
   ✓ 메모 발췌

폴백 채널: 웹푸시 → 알림톡 → SMS"""
story.append(Paragraph(notif.replace("\n", "<br/>"), P_CODE))
story.append(Spacer(1, 14))

# ===== 운영 인프라 =====
story.append(Paragraph("⚙️ 백엔드 인프라 상태", H2))
infra_data = [
    ["항목", "상태", "메모"],
    ["Supabase 스키마 v1~v9", "✅", "RLS + 멀티테넌트 격리 완비"],
    ["Storage care-photos 버킷", "✅", "Private + 보호자별 RLS"],
    ["Edge Functions 3종", "✅", "send-notification / confirm-payment / send-daily-report"],
    ["VAPID Web Push", "✅", "공개키/비밀키 등록 완료"],
    ["Solapi SMS", "✅", "발신번호 010-9032-9090 인증"],
    ["pg_cron 일일 보고서", "⚠️", "Extension 활성화 + cron job 등록 필요"],
    ["토스페이먼츠", "🔵", "테스트 키 (라이브 키 교체 시 즉시 작동)"],
]
infra_rows = [[Paragraph(c, P) for c in r] for r in infra_data]
story.append(make_table(infra_rows, [5.5 * cm, 1.5 * cm, 9.0 * cm]))
story.append(Spacer(1, 14))

# ===== 마무리 =====
story.append(Paragraph("🔗 관련 노션 페이지", H2))
story.append(Paragraph(
    '<b>🏥 CareOn 파일 정리</b> — 인프라 상태 / 운영 체크리스트 / 4앱 기능 점수 / 시장조사 종합 정리<br/>'
    '<font face="Courier" size="8" color="#0D9488">notion.so/344cd2b5066b80a292f8d1c2b4396527</font><br/><br/>'
    '<b>🔗 CareOn 링크 정리 (이 PDF 원본)</b><br/>'
    '<font face="Courier" size="8" color="#0D9488">notion.so/350cd2b5066b810c999fc864aaaddbd0</font>',
    P))

story.append(Spacer(1, 20))
story.append(Paragraph(
    'CareOn · 방문요양 통합 플랫폼 · Powered by Crescent Studio',
    P_TINY))

# ===== 빌드 =====
doc.build(story)
print(f"✅ PDF 생성 완료: {out_path}")
print(f"   파일 크기: {os.path.getsize(out_path):,} bytes")
