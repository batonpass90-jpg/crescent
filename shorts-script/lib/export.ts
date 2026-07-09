import type { GeneratedScript, ProductResearch } from "@/lib/types";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function buildMarkdown(
  productName: string,
  research: ProductResearch,
  script: GeneratedScript
): string {
  const lines: string[] = [];
  lines.push(`# ${productName} 쇼츠 대본`);
  lines.push("");
  lines.push(`## 후킹 문장 (0~3초)`);
  lines.push(script.hook_line);
  lines.push("");
  lines.push(`## 상품 분석 요약`);
  lines.push(`- 해결하는 문제: ${research.problem_solved || "확인 안 됨"}`);
  lines.push(`- 핵심 셀링포인트: ${research.selling_points.join(", ") || "확인 안 됨"}`);
  lines.push(`- 후기 반복 키워드: ${research.review_keywords.join(", ") || "확인 안 됨"}`);
  if (research.verified_numbers.length > 0) {
    lines.push(`- 검증된 숫자: ${research.verified_numbers.map((n) => `${n.label} ${n.value}`).join(", ")}`);
  }
  if (research.insufficient_data) {
    lines.push(`- ⚠️ 검증 가능한 정보가 부족했습니다. 발행 전 직접 확인해 주세요.`);
  }
  lines.push("");
  lines.push(`## 대본`);
  lines.push("");
  lines.push(`| 컷 번호 | 타임코드 | 화면 설명 | 자막/나레이션 | 비고 |`);
  lines.push(`|---|---|---|---|---|`);
  for (const row of script.script_rows) {
    lines.push(
      `| ${row.cut_no} | ${row.timecode} | ${row.visual.replace(/\|/g, "/")} | ${row.caption.replace(/\|/g, "/")} | ${row.note.replace(/\|/g, "/")} |`
    );
  }
  lines.push("");
  lines.push(`## 예상 러닝타임 / BGM`);
  lines.push(`- 예상 러닝타임: 약 ${formatTime(script.estimated_runtime_sec)}`);
  lines.push(`- 배경음/템포 메모: ${script.bgm_note}`);
  lines.push("");
  lines.push(`> 이 대본은 자동 생성되었습니다. 발행 전 반드시 사람이 최종 검수해 주세요.`);

  return lines.join("\n");
}

export function buildPlainText(
  productName: string,
  research: ProductResearch,
  script: GeneratedScript
): string {
  const lines: string[] = [];
  lines.push(`[${productName} 쇼츠 대본]`);
  lines.push("");
  lines.push(`후킹 문장 (0~3초): ${script.hook_line}`);
  lines.push("");
  lines.push(`상품 분석 요약`);
  lines.push(`- 해결하는 문제: ${research.problem_solved || "확인 안 됨"}`);
  lines.push(`- 핵심 셀링포인트: ${research.selling_points.join(", ") || "확인 안 됨"}`);
  lines.push(`- 후기 반복 키워드: ${research.review_keywords.join(", ") || "확인 안 됨"}`);
  if (research.verified_numbers.length > 0) {
    lines.push(`- 검증된 숫자: ${research.verified_numbers.map((n) => `${n.label} ${n.value}`).join(", ")}`);
  }
  lines.push("");
  lines.push(`대본`);
  for (const row of script.script_rows) {
    lines.push(`${row.cut_no}. [${row.timecode}] ${row.caption}`);
    lines.push(`   화면: ${row.visual}`);
    if (row.note) lines.push(`   비고: ${row.note}`);
  }
  lines.push("");
  lines.push(`예상 러닝타임: 약 ${formatTime(script.estimated_runtime_sec)}`);
  lines.push(`배경음/템포 메모: ${script.bgm_note}`);

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
