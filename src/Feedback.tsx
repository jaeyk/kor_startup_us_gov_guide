import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { feedbackUrl, subscribeUrl } from "./feedback-config"
import { firebaseEnabled } from "./firebase-config"

type Chapter = {
  number: string
  title: string
}

type FeedbackTarget = {
  chapter?: Chapter
  quote?: string
}

const maxQuoteLength = 500

const OpenFeedbackContext = createContext<
  ((target: FeedbackTarget) => void) | null
>(null)

// Hosts the feedback dialog that `FeedbackLink` opens.
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<FeedbackTarget | null>(null)

  return (
    <OpenFeedbackContext value={firebaseEnabled ? setTarget : null}>
      {children}
      {target && (
        <FeedbackDialog target={target} onClose={() => setTarget(null)} />
      )}
    </OpenFeedbackContext>
  )
}

// Opens the in-page feedback dialog when Firebase is configured, and links to
// the external form from `feedback-config.ts` otherwise.
export function FeedbackLink({
  chapter,
  quote,
  className,
  style,
  onMouseDown,
  children,
}: FeedbackTarget & {
  className?: string
  style?: CSSProperties
  onMouseDown?: (event: MouseEvent) => void
  children: ReactNode
}) {
  const openFeedback = useContext(OpenFeedbackContext)

  if (!openFeedback) {
    return (
      <a
        className={className}
        style={style}
        href={feedbackUrl(chapter, quote)}
        target="_blank"
        rel="noreferrer"
        onMouseDown={onMouseDown}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onMouseDown={onMouseDown}
      onClick={() => openFeedback({ chapter, quote })}
    >
      {children}
    </button>
  )
}

type FirebaseModule = typeof import("./firebase")
type User = import("./firebase").User

type Status =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signing-in" }
  | { kind: "submitting" }
  | { kind: "sent" }
  | { kind: "error"; message: string }

function FeedbackDialog({
  target,
  onClose,
}: {
  target: FeedbackTarget
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [firebase, setFirebase] = useState<FirebaseModule | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>({ kind: "loading" })
  const [wantToKnow, setWantToKnow] = useState("")
  const [why, setWhy] = useState("")

  const { chapter } = target
  const quote = target.quote?.trim().slice(0, maxQuoteLength) ?? ""
  const chapterLabel = chapter
    ? `${Number(chapter.number)}장. ${chapter.title}`
    : "소책자 전체"
  const scope = chapter ? "이 장에서" : "이 소책자에서"

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    import("./firebase")
      .then((module) => {
        if (cancelled) return
        setFirebase(module)
        unsubscribe = module.watchUser((nextUser) => {
          setUser(nextUser)
          setStatus((current) =>
            current.kind === "loading" ? { kind: "ready" } : current,
          )
        })
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({
            kind: "error",
            message: "의견 양식을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          })
        }
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const signIn = async () => {
    if (!firebase) return
    setStatus({ kind: "signing-in" })
    try {
      await firebase.signInWithGoogle()
      setStatus({ kind: "ready" })
    } catch (error) {
      const code = (error as { code?: string }).code ?? ""
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setStatus({ kind: "ready" })
        return
      }
      setStatus({
        kind: "error",
        message:
          code === "auth/popup-blocked"
            ? "브라우저가 로그인 창을 막았습니다. 팝업을 허용한 뒤 다시 시도해주세요."
            : "Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
      })
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!firebase || !user || !wantToKnow.trim()) return
    setStatus({ kind: "submitting" })
    try {
      await firebase.submitFeedback(user, {
        chapterNumber: chapter ? Number(chapter.number) : 0,
        chapterTitle: chapter?.title.slice(0, 200) ?? "",
        quote,
        wantToKnow: wantToKnow.trim().slice(0, 5000),
        why: why.trim().slice(0, 5000),
      })
      setStatus({ kind: "sent" })
    } catch {
      setStatus({
        kind: "error",
        message: "의견을 보내지 못했습니다. 잠시 후 다시 시도해주세요.",
      })
    }
  }

  const busy =
    status.kind === "loading" ||
    status.kind === "signing-in" ||
    status.kind === "submitting"

  return (
    <dialog
      ref={dialogRef}
      className="feedback-dialog"
      aria-labelledby="feedback-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop closes the dialog.
        if (event.target === dialogRef.current) dialogRef.current.close()
      }}
    >
      <div className="feedback-dialog-body">
        <button
          type="button"
          className="feedback-dialog-close"
          aria-label="닫기"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>

        <p className="feedback-dialog-target">{chapterLabel}</p>
        <h2 id="feedback-dialog-title">의견 남기기</h2>

        {quote && (
          <blockquote className="feedback-dialog-quote">{quote}</blockquote>
        )}

        {status.kind === "sent" ? (
          <div className="feedback-dialog-done">
            <p>의견을 보내주셔서 고맙습니다. 책을 고쳐 쓸 때 참고하겠습니다.</p>
            <div className="feedback-actions">
              <button
                type="button"
                className="button"
                onClick={() => dialogRef.current?.close()}
              >
                닫기
              </button>
            </div>
          </div>
        ) : !user ? (
          <div>
            <p>
              의견을 보내려면 Google 계정으로 로그인해주세요. 로그인한 계정의
              이름과 이메일 주소가 의견과 함께 저자에게 전달됩니다.
            </p>
            <div className="feedback-actions">
              <button
                type="button"
                className="button"
                onClick={signIn}
                disabled={busy || !firebase}
              >
                {status.kind === "signing-in"
                  ? "로그인하는 중…"
                  : "Google로 로그인"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="feedback-want">
              {scope} 꼭 알고 싶은 내용은 무엇인가요?
            </label>
            <textarea
              id="feedback-want"
              required
              rows={4}
              maxLength={5000}
              value={wantToKnow}
              onChange={(event) => setWantToKnow(event.target.value)}
            />

            <label htmlFor="feedback-why">왜 그 내용을 알고 싶은가요?</label>
            <textarea
              id="feedback-why"
              rows={3}
              maxLength={5000}
              value={why}
              onChange={(event) => setWhy(event.target.value)}
            />

            <div className="feedback-actions">
              <button
                type="submit"
                className="button"
                disabled={busy || !wantToKnow.trim()}
              >
                {status.kind === "submitting" ? "보내는 중…" : "의견 보내기"}
              </button>
              <span className="feedback-dialog-account">
                {user.email}{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => firebase?.signOut()}
                  disabled={busy}
                >
                  로그아웃
                </button>
              </span>
            </div>
          </form>
        )}

        {status.kind === "error" && (
          <p className="feedback-dialog-error" role="alert">
            {status.message}
          </p>
        )}
      </div>
    </dialog>
  )
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
          ? "독자의 의견이 책을 만듭니다."
          : "이 책은 독자 의견을 받아 계속 고쳐 쓰고 있습니다. 두 가지를 알려주세요."}
      </p>
      <ol>
        <li>이 장에서 꼭 알고 싶은 내용은 무엇인가요?</li>
        <li>왜 그 내용을 알고 싶은가요?</li>
      </ol>
      <div className="feedback-actions">
        <FeedbackLink className="button" chapter={chapter}>
          알고 싶은 내용 알려주기
        </FeedbackLink>
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
    <FeedbackLink
      className="selection-feedback"
      style={{ top: selection.top, left: selection.left }}
      chapter={chapter}
      quote={selection.text}
      // Keep the selection alive while the button is pressed.
      onMouseDown={(event) => event.preventDefault()}
    >
      이 부분에 의견 남기기
    </FeedbackLink>
  )
}
