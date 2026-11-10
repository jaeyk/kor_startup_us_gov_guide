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
- `{ type: "google", url, chapterField, chapterOptions, quoteField }`: 구글 폼으로 받습니다. "미리 채워진 링크 가져오기"로 각 질문의 `entry.` 번호를 확인해 넣습니다. `chapterField`는 장을 고르는 드롭다운 질문이고, `chapterOptions`에는 그 선택지를 전체, 1장, 2장 순서로 폼과 똑같이 적습니다. 폼의 선택지나 장을 바꾸면 여기도 함께 고쳐야 합니다. `quoteField`는 독자가 선택한 문장이 채워질 질문입니다.
- `{ type: "tally", url }`: Tally로 받습니다. 양식에 `chapter`, `quote` 이름의 숨은 필드가 있어야 합니다.

### Firebase로 의견 받기 (Google 로그인)

`src/firebase-config.ts`에 Firebase 설정을 넣으면 위 양식 대신 사이트 안의 의견 창이 열립니다. 독자는 Google 계정으로 로그인한 뒤 의견을 보내고, 의견은 Firestore의 `feedback` 컬렉션에 이름·이메일과 함께 저장됩니다. 설정이 비어 있으면 계속 `feedbackForm`을 사용합니다.

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만듭니다 (무료 Spark 요금제로 충분합니다).
2. **Authentication → 로그인 방법**에서 **Google**을 사용 설정합니다.
3. **Authentication → 설정 → 승인된 도메인**에 `jaeyk.github.io`를 추가합니다 (`localhost`는 기본으로 들어 있습니다).
4. **Firestore Database**를 만들고, **규칙** 탭에 `firestore.rules` 내용을 붙여넣어 게시합니다. 또는 `npx firebase-tools deploy --only firestore:rules --project <프로젝트 ID>`.
5. **프로젝트 설정 → 내 앱**에서 웹 앱을 추가하고, 표시되는 `apiKey`, `authDomain`, `projectId`, `appId`를 `src/firebase-config.ts`에 적습니다. 이 값은 비밀번호가 아니며 공개되어도 괜찮습니다. 접근 권한은 `firestore.rules`가 정합니다.

보내온 의견은 사이트의 `#/admin` 페이지(메뉴에는 나오지 않음)나 Firebase 콘솔의 **Firestore Database → 데이터 → feedback**에서 봅니다. `#/admin`은 관리자만 볼 수 있습니다. 관리자를 추가하려면:

1. `#/admin`에서 그 사람의 Google 계정으로 로그인하면 UID가 표시됩니다 (Authentication → 사용자 탭에서도 확인할 수 있습니다).
2. Firestore에서 `admins` 컬렉션에 그 UID를 문서 ID로 하는 문서를 만듭니다. 필드 내용은 상관없습니다 (예: `role: "admin"`).

관리자가 아닌 사람은 의견을 쓰기만 할 수 있고 읽거나 고칠 수 없습니다. 관리자는 읽고 삭제할 수 있습니다. 저장 항목을 바꾸면 `src/firebase.ts`와 `firestore.rules`를 함께 고쳐야 합니다.

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
