// Where reader feedback goes. Pick one `feedbackForm`:
//
// - GitHub issues (readers need a GitHub account):
//     { type: "github" }
// - Google Forms. Use "Get pre-filled link" to find question `entry.` ids.
//   The chapter (and the selected passage, unless `quoteField` is set) is
//   written at the top of `chapterField`, which can be an answer question:
//     { type: "google", url: "https://docs.google.com/forms/d/e/.../viewform",
//       chapterField: "entry.111", quoteField: "entry.222" }
// - Tally, with hidden fields named `chapter` and `quote`:
//     { type: "tally", url: "https://tally.so/r/abc123" }
type FeedbackForm =
  | { type: "github" }
  | { type: "google"; url: string; chapterField: string; quoteField?: string }
  | { type: "tally"; url: string }

export const feedbackForm: FeedbackForm = {
  type: "google",
  url: "https://docs.google.com/forms/d/e/1FAIpQLSc0Z17-jtqaNM7wM9RtzxSOdtWakZf8rF6uJfXJuC3jVpcgCA/viewform",
  // "꼭 알고 싶은 내용은 무엇인가요?"
  chapterField: "entry.911598272",
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
    let prefill = chapter ? `[${chapterLabel}]\n` : ""
    if (trimmedQuote && feedbackForm.quoteField) {
      params.set(feedbackForm.quoteField, trimmedQuote)
    } else if (trimmedQuote) {
      prefill += `선택한 문장: "${trimmedQuote}"\n`
    }
    if (prefill) params.set(feedbackForm.chapterField, `${prefill}\n`)
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
