import { useEffect, useState, type RefObject } from "react"
import { feedbackUrl, subscribeUrl } from "./feedback-config"

type Chapter = {
  number: string
  title: string
}

export function ChapterFeedback({
  chapter,
  draft,
}: {
  chapter: Chapter
  draft: boolean
}) {
  return (
    <section className="chapter-feedback" aria-labelledby="chapter-feedback-title">
      <h2 id="chapter-feedback-title">
        {draft
          ? "이 장에 어떤 내용이 들어가면 좋을까요?"
          : "이 장에 대한 의견을 들려주세요"}
      </h2>
      <p>
        {draft
          ? "이 장은 아직 쓰지 않았습니다. 독자 의견을 바탕으로 이 장에 들어갈 내용을 정하려고 합니다. 두 가지를 알려주세요."
          : "이 책은 독자 의견을 받아 계속 고쳐 쓰고 있습니다. 두 가지를 알려주세요."}
      </p>
      <ol>
        <li>이 장에서 꼭 알고 싶은 내용은 무엇인가요?</li>
        <li>왜 그 내용을 알고 싶은가요?</li>
      </ol>
      <div className="feedback-actions">
        <a
          className="button"
          href={feedbackUrl(chapter)}
          target="_blank"
          rel="noreferrer"
        >
          알고 싶은 내용 알려주기
        </a>
        {subscribeUrl && (
          <a href={subscribeUrl} target="_blank" rel="noreferrer">
            업데이트 소식 받기
          </a>
        )}
      </div>
      {!draft && (
        <p className="feedback-tip">
          본문에서 문장을 선택하면 그 부분에 대해 바로 의견을 남길 수 있습니다.
        </p>
      )}
    </section>
  )
}

type Selection = {
  text: string
  top: number
  left: number
}

// Shows a floating "comment on this" button under text selected in `articleRef`.
export function SelectionFeedback({
  articleRef,
  chapter,
}: {
  articleRef: RefObject<HTMLElement | null>
  chapter: Chapter
}) {
  const [selection, setSelection] = useState<Selection | null>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const current = window.getSelection()
      const article = articleRef.current
      const text = current?.toString().trim() ?? ""

      if (
        !current ||
        current.rangeCount === 0 ||
        !text ||
        !article?.contains(current.anchorNode) ||
        !article.contains(current.focusNode)
      ) {
        setSelection(null)
        return
      }

      const rect = current.getRangeAt(0).getBoundingClientRect()
      setSelection({
        text,
        top: rect.bottom + window.scrollY + 10,
        left: Math.min(
          Math.max(rect.left + rect.width / 2 + window.scrollX, 110),
          document.documentElement.clientWidth - 110,
        ),
      })
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange)
  }, [articleRef])

  if (!selection) return null

  return (
    <a
      className="selection-feedback"
      style={{ top: selection.top, left: selection.left }}
      href={feedbackUrl(chapter, selection.text)}
      target="_blank"
      rel="noreferrer"
      // Keep the selection alive while the button is pressed.
      onMouseDown={(event) => event.preventDefault()}
    >
      이 부분에 의견 남기기
    </a>
  )
}
