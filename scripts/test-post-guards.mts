// admin 저장 안전장치 재현 테스트. 프레임워크 없이 assert만 사용.
// 실행: node --experimental-strip-types scripts/test-post-guards.mts
//
// "@/" alias는 standalone 스크립트에서 못 쓴다(build-search-index.mts와 동일 제약).
// post-guards.ts는 순수 함수뿐이라 상대 경로 import만으로 충분하다.
import assert from "node:assert/strict";

import {
  checkCreateSlugConflict,
  checkUpdateTarget,
  checkUpdateConflict,
} from "../src/lib/admin/post-guards.ts";
import { frontmatterSchema } from "../src/lib/frontmatter.ts";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

console.log("가드 A-1: 신규 저장 시 slug 충돌 차단");
{
  test("이미 존재하는 slug는 차단된다", () => {
    const error = checkCreateSlugConflict(true, "payment-booking-consistency");
    assert.ok(error, "차단 메시지가 있어야 함");
    assert.match(error!, /이미 존재하는 slug/);
  });
  test("존재하지 않는 slug는 통과한다", () => {
    assert.equal(checkCreateSlugConflict(false, "new-post"), null);
  });
}

console.log("가드 A-2: 편집 저장 대상이 편집 시작 글과 다르면 차단");
{
  test("사고 재현 — payment 편집 중 다른 파일로 저장 시도는 차단된다", () => {
    const error = checkUpdateTarget(
      "figure-cannot-be-descendant-of-p", // 실수/오염된 저장 대상
      "payment-booking-consistency", // 실제로 편집을 시작한 글
    );
    assert.ok(error, "차단 메시지가 있어야 함");
    assert.match(error!, /편집을 시작한 글/);
  });
  test("동일 slug로의 정상 저장은 통과한다", () => {
    assert.equal(
      checkUpdateTarget(
        "payment-booking-consistency",
        "payment-booking-consistency",
      ),
      null,
    );
  });
}

console.log(
  "가드 A-3: 대상 파일 title이 편집 시작 시점과 다르면 확인 없이 차단",
);
{
  test("title이 달라졌으면 차단된다(다른 글이거나 동시 편집)", () => {
    const error = checkUpdateConflict(
      "figure는 p의 하위가 될 수 없다", // 지금 저장 대상 파일의 실제 title
      "결제는 됐는데 예약이 안 됐다", // 이 편집 세션이 시작됐을 때의 title
      false,
    );
    assert.ok(error, "차단 메시지가 있어야 함");
    assert.match(error!, /제목.*다릅니다/);
  });
  test("title이 같으면 통과한다", () => {
    assert.equal(checkUpdateConflict("같은 제목", "같은 제목", false), null);
  });
  test("대상 파일이 없으면(신규 경로) 통과한다", () => {
    assert.equal(checkUpdateConflict(null, "아무 제목", false), null);
  });
  test("confirmOverwrite=true면 title이 달라도 통과한다", () => {
    assert.equal(checkUpdateConflict("다른 제목", "원래 제목", true), null);
  });
}

console.log("요구사항 C: category/draft/description 누락이 글을 삼키지 않는다");
{
  test("category 누락 → '미분류'로 기본값 처리, 파싱 자체는 성공", () => {
    const result = frontmatterSchema.parse({
      title: "t",
      description: "d",
      date: "2024-01-01",
      tags: ["x"],
    });
    assert.equal(result.category, "미분류");
    assert.equal(result.draft, false);
  });
  test("draft 누락 → false(공개)로 기본값 처리", () => {
    const result = frontmatterSchema.parse({
      title: "t",
      description: "d",
      date: "2024-01-01",
      category: "카테고리",
      tags: ["x"],
    });
    assert.equal(result.draft, false);
  });
  test("description 없고 구 필드명 summary만 있으면 흡수한다", () => {
    const result = frontmatterSchema.parse({
      title: "t",
      summary: "예전 요약",
      date: "2024-01-01",
      category: "카테고리",
      tags: ["x"],
    });
    assert.equal(result.description, "예전 요약");
  });
}

console.log(`\n${passed}개 테스트 통과`);
