from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "ESG프로젝트_회의기록.pdf"


def register_fonts():
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Malgun", str(font_dir / "malgun.ttf")))
    pdfmetrics.registerFont(TTFont("Malgun-Bold", str(font_dir / "malgunbd.ttf")))


def paragraph(text, style):
    return Paragraph(str(text).replace("\n", "<br/>"), style)


def make_table(data, widths, header=True, body_size=7.7, leading=10.8):
    body_style = ParagraphStyle(
        "table-body",
        fontName="Malgun",
        fontSize=body_size,
        leading=leading,
        textColor=colors.HexColor("#222222"),
        alignment=TA_LEFT,
        wordWrap="CJK",
    )
    head_style = ParagraphStyle(
        "table-head",
        fontName="Malgun-Bold",
        fontSize=8.2,
        leading=10.5,
        textColor=colors.white,
        alignment=TA_CENTER,
        wordWrap="CJK",
    )
    rows = []
    for row_index, row in enumerate(data):
        rows.append([paragraph(cell, head_style if header and row_index == 0 else body_style) for cell in row])

    table = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    table_style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D8DEE8")),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        table_style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#274C77")))
    for row in range(1 if header else 0, len(data)):
        if row % 2 == 0:
            table_style.append(("BACKGROUND", (0, row), (-1, row), colors.HexColor("#F7F9FC")))
    table.setStyle(TableStyle(table_style))
    return table


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFont("Malgun-Bold", 8)
    canvas.setFillColor(colors.HexColor("#274C77"))
    canvas.drawString(18 * mm, height - 12 * mm, "ESG 프로젝트 회의 기록")
    canvas.setStrokeColor(colors.HexColor("#D8DEE8"))
    canvas.line(18 * mm, height - 15 * mm, width - 18 * mm, height - 15 * mm)
    canvas.setFont("Malgun", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawRightString(width - 18 * mm, 12 * mm, f"{doc.page} / ESG Project")
    canvas.restoreState()


def build_pdf():
    register_fonts()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "title",
        parent=styles["Title"],
        fontName="Malgun-Bold",
        fontSize=24,
        leading=32,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#17324D"),
        spaceAfter=12,
        wordWrap="CJK",
    )
    subtitle = ParagraphStyle(
        "subtitle",
        fontName="Malgun",
        fontSize=10.5,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4D5B68"),
        spaceAfter=18,
        wordWrap="CJK",
    )
    h1 = ParagraphStyle(
        "h1",
        fontName="Malgun-Bold",
        fontSize=15,
        leading=20,
        textColor=colors.HexColor("#17324D"),
        spaceBefore=12,
        spaceAfter=8,
        wordWrap="CJK",
    )
    body = ParagraphStyle(
        "body",
        fontName="Malgun",
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#263238"),
        spaceAfter=8,
        wordWrap="CJK",
    )
    small = ParagraphStyle(
        "small",
        fontName="Malgun",
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#5A6570"),
        wordWrap="CJK",
    )

    doc = BaseDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title="ESG 프로젝트 회의 기록",
        author="ESG 프로젝트 팀",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=header_footer)])

    story = []
    story.append(Spacer(1, 16 * mm))
    story.append(paragraph("ESG 프로젝트 회의 기록", title))
    story.append(
        paragraph(
            "기능명세서 기반 프로젝트 수정 및 구현 진행 회의록<br/>작성 기준 기간: 2026년 5월 10일 - 2026년 6월 10일",
            subtitle,
        )
    )

    summary_table = [
        ["항목", "내용"],
        ["프로젝트명", "ESG 프로젝트"],
        ["프로젝트 성격", "메뉴 탐색, 비교함, 후기, 게시판, 관리자 기능을 포함한 풀스택 웹 서비스"],
        ["주요 기능", "로그인/회원가입, 메인 대시보드, 메뉴 탐색, 메뉴 상세 MODAL, 비교하기, Choice, 게시판, Gram 후기, 관리자 페이지"],
        ["팀 구성", "한진호, 김경호, 차승준, 장지혁, 민지원"],
        ["완성일", "2026년 6월 10일"],
        ["작성 목적", "학원 제출용 프로젝트 수정 회의 내용, 담당 기능, 구현 완료 시점, 미구현 기능 대응 방안 기록"],
    ]
    story.append(make_table(summary_table, [34 * mm, 140 * mm], header=False, body_size=9, leading=14))
    story.append(Spacer(1, 7 * mm))
    story.append(
        paragraph(
            "본 문서는 ESG 프로젝트 기능명세서에 정리된 기능 범위를 바탕으로, 프로젝트 진행 중 회의에서 결정된 담당자와 구현 일정을 회의록 형식으로 재구성한 기록이다. "
            "프로젝트는 2026년 5월 10일 팀장 선임 및 총괄기획 완료를 시작으로 2026년 6월 10일 최종 완성되었다.",
            body,
        )
    )

    story.append(paragraph("1. 팀원 역할 및 담당 기능", h1))
    roles = [
        ["이름", "역할", "담당 기능", "완료 기준"],
        ["한진호", "팀장 / 게시판 / Choice", "총괄기획, 기능명세서 정리, Choice 페이지, 게시판 목록/상세/작성/수정/삭제, 댓글, Canva PPT 공동 작업", "05.10 총괄기획 완료, 06.04 게시판 완료, 06.10 발표자료 정리"],
        ["김경호", "인증 / 마이페이지", "일반 로그인, 회원가입, 아이디/비밀번호 찾기, 비회원 입장, 관리자 로그인, 마이페이지 대시보드, 내 정보 관리, 로그아웃", "05.20 로그인/회원가입 완료, 05.27 마이페이지 완료"],
        ["차승준", "메인 / 비교하기", "메인 사용자 대시보드, 오늘의 인기 메뉴 비교, 메뉴 비교 장바구니, zustand 상태 관리, 비교함 초기화, 선택 처리, 랜덤 추첨", "05.24 메인 완료, 06.01 비교하기 완료"],
        ["장지혁", "메뉴 탐색 / 후기", "인기 메뉴 랭킹, 사용자 랭킹, Eat 메뉴 탐색, 메뉴 상세 MODAL, Gram 후기 검색/목록/작성/상세/수정/삭제, 댓글/좋아요/신고", "05.31 메뉴 탐색 완료, 06.06 후기 기능 완료"],
        ["민지원", "관리자 / Master", "관리자 대시보드, 신고 현황, 회원 조회/관리, 신고/제보 처리, 메뉴 등록/수정, 알러지 정보, 관리자 계정 생성, 브랜드 관리, admin 관리", "06.07 관리자 기능 완료, 06.09 최종 검수"],
    ]
    story.append(make_table(roles, [20 * mm, 28 * mm, 84 * mm, 42 * mm], body_size=7.1, leading=9.9))

    story.append(PageBreak())
    story.append(paragraph("2. 회의 진행 기록", h1))
    meetings = [
        ["일자/시간", "회의 주제", "주요 결정 사항", "담당자", "후속 조치"],
        ["2026.05.10 10:00", "팀 구성 및 총괄기획", "한진호를 팀장으로 정하고 기능명세서 기준으로 MVP1/MVP2/MVP3 우선순위를 정리했다.", "한진호", "기능명세서 1차 작성"],
        ["2026.05.11 14:00", "프로젝트명 확정", "프로젝트명을 ESG 프로젝트로 정하고 메뉴 탐색, 비교함, 후기, 게시판, 관리자 기능을 핵심 범위로 확정했다.", "전체", "페이지별 기능 목록 확정"],
        ["2026.05.13 11:00", "담당 기능 배정", "김경호는 인증/마이페이지, 차승준은 메인/비교하기, 장지혁은 메뉴 탐색/후기, 한진호는 Choice/게시판, 민지원은 관리자 기능을 맡기로 했다.", "전체", "파트별 구현 시작"],
        ["2026.05.15 15:00", "로그인/회원가입 점검", "일반 로그인, 회원가입, 테스트 계정, 비회원 입장을 MVP1로 두고 아이디/비밀번호 찾기와 관리자 로그인은 MVP2로 진행했다.", "김경호", "인증 기능 구현"],
        ["2026.05.18 10:30", "메인/랭킹 화면 회의", "브랜드 수, 메뉴 수, 오늘 선택 수, 오늘 후기 수 대시보드와 인기 메뉴/사용자 랭킹 표시 기준을 최근 7일 기준으로 정했다.", "차승준, 장지혁", "메인 화면 구현"],
        ["2026.05.21 13:00", "메뉴 탐색 기능 회의", "Eat 페이지는 검색, 초기화, 카테고리/브랜드 탭, 인기순/가격/열량/단백질 정렬, 3x5 카드 목록을 제공하기로 했다.", "장지혁", "메뉴 탐색 구현"],
        ["2026.05.24 11:00", "비교함 기능 회의", "비회원은 최대 2개, 회원은 최대 3개까지 비교함에 담고, 추가/삭제/초기화/선택 처리와 랜덤 추첨을 차승준이 담당하기로 했다.", "차승준", "비교하기 페이지 구현"],
        ["2026.05.27 16:00", "Choice 및 게시판 회의", "Choice 페이지는 비교함 초기화와 감성형 이동 허브로 구성하고, 게시판은 목록/상세/작성/수정/삭제/댓글을 MVP1로 정했다.", "한진호", "Choice/게시판 구현"],
        ["2026.05.31 14:00", "후기 기능 중간 점검", "Gram 페이지는 후기 검색, 목록, 작성, 상세, 수정/삭제, 댓글, 좋아요, 신고까지 구현하고 일부 댓글/좋아요는 MVP2로 분리했다.", "장지혁", "후기 기능 보완"],
        ["2026.06.03 15:00", "관리자 페이지 회의", "관리자 대시보드, 신고/제보 처리, 회원 조회/관리, 메뉴 추가/수정, master용 관리자 계정/브랜드/admin 관리를 민지원이 맡기로 했다.", "민지원", "관리자 기능 구현"],
        ["2026.06.06 16:00", "미구현 기능 정리", "인트로 동영상 광고 및 브랜드 이동 광고기능은 미배정 MVP3라 최종 제출 범위에서 제외하고 추후 구현 과제로 남기기로 했다.", "전체", "미구현 기능 문서화"],
        ["2026.06.08 15:00", "최종 기능 검수", "로그인, 메인, 메뉴 탐색, 메뉴 상세 MODAL, 비교하기, Choice, 게시판, 후기, 관리자 페이지의 주요 흐름을 점검했다.", "전체", "최종 오류 수정"],
        ["2026.06.10 10:00", "프로젝트 완성 보고", "기능명세서 기준 구현 완료 기능과 미구현 MVP3 광고기능을 정리하고 Canva PPT까지 제출 가능한 상태로 마무리했다.", "전체", "프로젝트 완성"],
    ]
    story.append(make_table(meetings, [25 * mm, 31 * mm, 68 * mm, 22 * mm, 28 * mm], body_size=7.2, leading=10.1))

    story.append(PageBreak())
    story.append(paragraph("3. 기능별 구현 완료 기록", h1))
    implementation = [
        ["기능", "담당자", "진행 기간", "구현 완료일", "구현 내용"],
        ["총괄기획 / 기능명세서", "한진호", "05.10 - 05.12", "2026.05.12", "페이지 분류, 세부기능, 로그인 여부, 담당자, 진행 상황, MVP 우선순위를 정리했다."],
        ["로그인 / 회원가입 / 찾기", "김경호", "05.13 - 05.20", "2026.05.20", "일반 로그인, 회원가입, 테스트 계정, 아이디 찾기, 비밀번호 찾기, 비회원 입장을 구현했다."],
        ["관리자 로그인 / 로그아웃", "김경호", "05.18 - 05.22", "2026.05.22", "관리자 전용 로그인 페이지, 관리자 대시보드 이동, 로그아웃 확인 및 토큰 만료 처리를 구현했다."],
        ["마이페이지", "김경호", "05.22 - 05.27", "2026.05.27", "나의 활동내역, 최근 좋아요, 즐겨찾기, 신고/제보 내역, 가입정보와 프로필 변경을 구현했다."],
        ["메인 대시보드", "차승준", "05.16 - 05.24", "2026.05.24", "브랜드 수, 메뉴 수, 오늘 선택 수, 오늘 후기 수와 오늘의 인기 메뉴 비교 영역을 구현했다."],
        ["인기 메뉴/사용자 랭킹", "장지혁", "05.18 - 05.25", "2026.05.25", "최근 7일 기준 인기 메뉴 5개와 후기 작성이 많은 사용자 5명 랭킹을 구현했다."],
        ["메뉴 탐색 Eat", "장지혁", "05.21 - 05.31", "2026.05.31", "메뉴/브랜드 검색, 초기화, 카테고리/브랜드 탭, 정렬, 3x5 카드 목록, 다시 불러오기를 구현했다."],
        ["메뉴 상세 MODAL", "장지혁", "05.24 - 06.01", "2026.06.01", "메뉴 이미지, 영양/알러지 정보, 제보, 즐겨찾기, 비교함 담기, 후기 이동 흐름을 구현했다."],
        ["비교하기 / 랜덤 추첨", "차승준", "05.24 - 06.01", "2026.06.01", "비교함 배열 상태 관리, 메뉴 추가/삭제/초기화, 선택 처리, 랜덤 추첨 기능을 구현했다."],
        ["Choice 페이지", "한진호", "05.27 - 06.02", "2026.06.02", "비교함 초기화 후 메뉴 탐색/후기 목록으로 이동하는 인터랙션 허브와 감성형 문구를 구현했다."],
        ["게시판 페이지", "한진호", "05.28 - 06.04", "2026.06.04", "게시글 목록/검색/정렬, 상세보기, 작성/수정/삭제, 파일 업로드, 댓글 기능을 구현했다."],
        ["Gram 후기", "장지혁", "05.31 - 06.06", "2026.06.06", "후기 검색, 목록, 작성, 상세, 수정/삭제, 댓글, 좋아요, 신고 기능을 구현했다."],
        ["관리자 페이지", "민지원", "06.01 - 06.07", "2026.06.07", "관리자 대시보드, 신고 현황, 회원 조회/관리, 신고/제보 처리, 메뉴 추가/수정, 알러지 정보 관리를 구현했다."],
        ["Master 관리자", "민지원", "06.04 - 06.08", "2026.06.08", "관리자 계정 생성, 브랜드 등록/편집/삭제, admin 권한 조회/정지/해제 기능을 구현했다."],
        ["Canva PPT / 제출 준비", "공동 작업", "06.08 - 06.10", "2026.06.10", "발표 자료, 기능명세서, 회의록, 미구현 기능 정리 내용을 최종 제출본으로 묶었다."],
    ]
    story.append(make_table(implementation, [34 * mm, 24 * mm, 28 * mm, 28 * mm, 60 * mm], body_size=7.15, leading=10.0))

    story.append(PageBreak())
    story.append(paragraph("4. 미구현 또는 조정 기능 처리 방안", h1))
    pending = [
        ["구분", "내용", "회의 결정", "처리 상태"],
        ["인트로 광고기능", "동영상 광고와 보러가기 버튼 클릭 시 alert 확인 후 state를 전달해 메뉴 탐색 페이지에서 해당 브랜드 메뉴를 렌더링하는 기능이다.", "기능명세서상 담당자가 미배정이고 구현 순위가 MVP3이므로 6월 10일 최종 제출 범위에서는 제외하고 추후 고도화 기능으로 남겼다.", "미구현 / MVP3"],
        ["광고 브랜드 이동", "광고 클릭 후 특정 브랜드 필터가 적용된 Eat 페이지로 이동하는 흐름은 구현 시 전역 상태와 라우팅 정리가 추가로 필요했다.", "핵심 MVP1 기능인 로그인, 메뉴 탐색, 비교하기, 게시판, 후기, 관리자 기능 완성도를 우선했다.", "추후 개발"],
        ["일부 MVP2 상호작용", "후기 댓글, 좋아요, 신고, 관리자 처리 메시지 등은 기능별 세부 조건이 많아 최종 검수 때 반복 확인이 필요했다.", "기능 자체는 구현 완료로 정리하되, 발표 시연은 안정적인 대표 흐름 위주로 진행하기로 했다.", "구현 완료 / 검수 대상"],
        ["운영 데이터", "인기 메뉴, 사용자 랭킹, 오늘 선택 수, 오늘 후기 수는 실제 사용량에 따라 값이 달라진다.", "제출 시에는 테스트 데이터를 기준으로 시연하고, 운영 데이터 누적 후 정렬 정확도를 추가 점검하기로 했다.", "운영 후 보완"],
    ]
    story.append(make_table(pending, [30 * mm, 54 * mm, 68 * mm, 22 * mm], body_size=7.55, leading=10.5))

    story.append(paragraph("5. 최종 정리", h1))
    story.append(
        paragraph(
            "ESG 프로젝트는 2026년 5월 10일 한진호 팀장의 총괄기획을 시작으로, 5월 11일 프로젝트명을 확정하고 5월 13일부터 기능명세서 기준으로 담당 기능을 나누어 구현을 진행했다. "
            "김경호는 인증과 마이페이지, 차승준은 메인과 비교하기, 장지혁은 메뉴 탐색과 후기, 한진호는 Choice와 게시판, 민지원은 관리자 페이지를 담당했다.",
            body,
        )
    )
    story.append(
        paragraph(
            "최종 제출 기준 핵심 기능은 로그인/회원가입, 마이페이지, 메인 대시보드, 메뉴 탐색, 메뉴 상세 MODAL, 비교하기, Choice 페이지, 게시판, Gram 후기, 관리자 및 master 관리자 기능, Canva PPT까지 포함한다. "
            "미배정 MVP3 항목인 인트로 광고기능은 발표 안정성과 제출 범위를 기준으로 추후 개선 과제로 남겼다.",
            body,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(paragraph("작성일: 2026년 6월 10일<br/>작성 주제: ESG 프로젝트 수정 및 구현 회의 기록", small))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT_PATH)
