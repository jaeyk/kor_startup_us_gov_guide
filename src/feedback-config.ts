// Where reader feedback goes. Pick one `feedbackForm`:
//
// - GitHub issues (readers need a GitHub account):
//     { type: "github" }
// - Google Forms. Use "Get pre-filled link" to find question `entry.` ids.
//   `chapterField` is a dropdown, pre-selected from `chapterOptions`: index 0
//   is the whole-book option and index N is chapter N. Each option must match
//   the form's wording exactly, or Google leaves the dropdown unselected.
//   A passage the reader selected is written into `quoteField`:
//     { type: "google", url: "https://docs.google.com/forms/d/e/.../viewform",
//       chapterField: "entry.111", chapterOptions: ["전체", "1. ..."],
//       quoteField: "entry.222" }
// - Tally, with hidden fields named `chapter` and `quote`:
//     { type: "tally", url: "https://tally.so/r/abc123" }
type FeedbackForm =
  | { type: "github" }
  | {
      type: "google"
      url: string
      chapterField: string
      chapterOptions: string[]
      quoteField: string
    }
  | { type: "tally"; url: string }

export const feedbackForm: FeedbackForm = {
  type: "google",
  url: "https://docs.google.com/forms/d/e/1FAIpQLSc0Z17-jtqaNM7wM9RtzxSOdtWakZf8rF6uJfXJuC3jVpcgCA/viewform",
  // "의견을 남기고 싶은 부분"
  chapterField: "entry.275239708",
  chapterOptions: [
    "소책자 전체",
    "1. 미국에는 9만 개의 정부가 있다",
    "2. 미국 정부는 전 세계에서 가장 거대한 기술 구매자다",
    '3. 미국 정부를 설명하는 키워드는 "파트너십"이다',
    "4. 연방 조달 시장과 주 정부 조달 시장은 무엇이 다른가",
    "5. 주 정부 조달 시장과 지방 정부 조달 시장은 어떻게 연결되는가",
    "6. 미국 조달 시장의 주요한 트렌드는 무엇이고, 이 트렌드는 누가 만드나",
    "7. 미국의 주요한 테크 벤더들은 어떻게 정부 테크에서 힘을 갖게 됐나",
    "8. 미국에는 하나의 인공지능 정책이 없다",
    "9. 인공지능이 미국 조달 시장을 바꾼 것, 바꾸지 못한 것",
    "10. 기회를 기다리지 말고, 만들라",
  ],
  // "꼭 알고 싶은 내용은 무엇인가요?"
  quoteField: "entry.911598272",
}

// Optional sign-up link for update notices (e.g. a Google Forms or newsletter
// page). The sign-up link is hidden while this is empty.
export const subscribeUrl = ""

const repository = "jaeyk/us_procurement_market_and_ai_policy"
const maxQuoteLength = 500

type FeedbackTarget = {
  number: string
  title: string
}

export function feedbackUrl(chapter?: FeedbackTarget, quote?: string) {
  const chapterName = chapter ? `${Number(chapter.number)}장` : "전체"
  const chapterLabel = chapter ? `${chapterName} ${chapter.title}` : chapterName
  const trimmedQuote = quote?.trim().slice(0, maxQuoteLength) ?? ""

  if (feedbackForm.type === "google") {
    const params = new URLSearchParams({ usp: "pp_url" })
    const option = feedbackForm.chapterOptions[chapter ? Number(chapter.number) : 0]
    if (option) params.set(feedbackForm.chapterField, option)
    if (trimmedQuote) {
      params.set(feedbackForm.quoteField, `선택한 문장: "${trimmedQuote}"\n\n`)
    }
    return `${feedbackForm.url}?${params}`
  }

  if (feedbackForm.type === "tally") {
    const params = new URLSearchParams({ chapter: chapterLabel })
    if (trimmedQuote) params.set("quote", trimmedQuote)
    return `${feedbackForm.url}?${params}`
  }

  const quoteBlock = trimmedQuote
    ? `### 의견을 남길 부분\n\n> ${trimmedQuote.replace(/\n+/g, "\n> ")}\n\n`
    : ""
  const body = `${quoteBlock}### 꼭 알고 싶은 내용

### 왜 그 내용을 알고 싶은가요?

`
  const params = new URLSearchParams({
    title: `[${chapterName}] 의견`,
    body,
    labels: "feedback",
  })
  return `https://github.com/${repository}/issues/new?${params}`
}
