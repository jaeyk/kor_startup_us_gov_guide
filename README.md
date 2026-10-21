# 스타트업을 위한 미국 정부 가이드

각 장을 Markdown으로 집필하고 웹에서 읽을 수 있는 문서 프로젝트입니다.

## 원고 작성

원고 파일은 `src/content/chapters/`에 있습니다.

```text
src/content/chapters/
├── 01-90-thousand-governments.md
├── 02-largest-technology-buyer.md
└── ...
```

각 파일의 제목과 본문을 일반 Markdown 문법으로 작성하면 웹 화면에 자동으로 반영됩니다.

## 목차 수정

장 제목, 순서, URL 또는 파일명을 변경하려면 `src/content.ts`를 수정합니다. `file` 값은 `src/content/chapters/` 안의 실제 파일명과 같아야 합니다.

## 업데이트 기록

`src/content/updates.md`에 목록 형식으로 적으면 메인 페이지의 "업데이트" 섹션에 나타납니다. 최신 항목을 맨 위에 적습니다. 각 장의 "마지막 수정" 날짜는 git 기록에서 자동으로 계산됩니다.

## 독자 피드백

각 장의 "알고 싶은 내용 알려주기" 버튼과 본문 문장을 선택하면 나타나는 버튼은 `src/feedback-config.ts`의 `feedbackForm` 설정을 따릅니다.

- `{ type: "github" }`: GitHub 이슈로 의견을 받습니다. 독자에게 GitHub 계정이 필요합니다.
- `{ type: "google", url, chapterField, quoteField }`: 구글 폼으로 받습니다. 폼에 "장"과 "선택한 문장" 단답형 질문을 만든 뒤, "미리 채워진 링크 가져오기"로 각 질문의 `entry.` 번호를 확인해 넣습니다.
- `{ type: "tally", url }`: Tally로 받습니다. 양식에 `chapter`, `quote` 이름의 숨은 필드가 있어야 합니다.

`subscribeUrl`에 구독 양식 링크를 넣으면 "업데이트 소식 받기" 링크가 나타납니다.

장 파일에 제목(`# ...`)만 있으면 "의견 받는 중" 상태로 표시됩니다. 본문을 쓰기 시작하면 자동으로 일반 장으로 바뀝니다.

## 미리보기와 배포

```bash
./preview_site.sh                    # 배포될 모습을 로컬에서 확인
./update_site.sh "3장 사례 추가"      # 커밋하고 푸시하면 GitHub Pages에 배포
```

## 로컬 실행

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
pnpm build
```
