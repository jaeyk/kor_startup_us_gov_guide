// Feedback inbox at `#/admin`. Firestore rules, not this page, decide who can
// read feedback: only users with a document at `admins/{uid}`.
import { useEffect, useState } from "react"
import { chapters } from "./content"
import {
  deleteFeedback,
  isAdmin,
  listFeedback,
  signInWithGoogle,
  signOut,
  watchUser,
  type StoredFeedback,
  type User,
} from "./firebase"

type Access = "loading" | "signed-out" | "not-admin" | "admin"

function chapterLabel(entry: StoredFeedback) {
  return entry.chapterNumber === 0
    ? "소책자 전체"
    : `${entry.chapterNumber}장. ${entry.chapterTitle}`
}

function formatDateTime(date: Date | null) {
  if (!date) return ""
  return date.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [access, setAccess] = useState<Access>("loading")
  const [entries, setEntries] = useState<StoredFeedback[] | null>(null)
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState("")

  useEffect(
    () =>
      watchUser(async (nextUser) => {
        setUser(nextUser)
        setEntries(null)
        setError("")
        if (!nextUser) {
          setAccess("signed-out")
          return
        }
        setAccess("loading")
        try {
          setAccess((await isAdmin(nextUser)) ? "admin" : "not-admin")
        } catch {
          setAccess("not-admin")
        }
      }),
    [],
  )

  const load = async () => {
    setError("")
    try {
      setEntries(await listFeedback())
    } catch {
      setError("의견을 불러오지 못했습니다.")
    }
  }

  useEffect(() => {
    if (access === "admin") load()
  }, [access])

  const signIn = async () => {
    setError("")
    try {
      await signInWithGoogle()
    } catch (signInError) {
      const code = (signInError as { code?: string }).code ?? ""
      if (code !== "auth/popup-closed-by-user") {
        setError("Google 로그인에 실패했습니다.")
      }
    }
  }

  const remove = async (entry: StoredFeedback) => {
    if (!window.confirm("이 의견을 삭제할까요? 되돌릴 수 없습니다.")) return
    try {
      await deleteFeedback(entry.id)
      setEntries((current) => current?.filter((item) => item.id !== entry.id) ?? null)
    } catch {
      setError("삭제하지 못했습니다.")
    }
  }

  const counts = new Map<number, number>()
  for (const entry of entries ?? []) {
    counts.set(entry.chapterNumber, (counts.get(entry.chapterNumber) ?? 0) + 1)
  }
  const visible =
    filter === "all"
      ? (entries ?? [])
      : (entries ?? []).filter((entry) => entry.chapterNumber === Number(filter))

  return (
    <main className="reader admin">
      <div className="chapter-context">
        <a href="#/">목차</a>
        <span>/</span>
        <span>독자 의견</span>
      </div>

      <h1>독자 의견</h1>

      {access === "loading" && <p>확인하는 중…</p>}

      {access === "signed-out" && (
        <div className="admin-panel">
          <p>관리자 계정으로 로그인해주세요.</p>
          <div className="feedback-actions">
            <button type="button" className="button" onClick={signIn}>
              Google로 로그인
            </button>
          </div>
        </div>
      )}

      {access === "not-admin" && user && (
        <div className="admin-panel">
          <p>
            <strong>{user.email}</strong> 계정에는 의견을 볼 권한이 없습니다.
          </p>
          <p>
            관리자로 등록하려면 Firebase 콘솔의 Firestore에서 <code>admins</code>{" "}
            컬렉션에 아래 UID를 문서 ID로 하는 문서를 만드세요.
          </p>
          <p className="admin-uid">
            <code>{user.uid}</code>
          </p>
          <div className="feedback-actions">
            <button type="button" className="link-button" onClick={() => signOut()}>
              다른 계정으로 로그인
            </button>
          </div>
        </div>
      )}

      {access === "admin" && (
        <>
          <div className="admin-toolbar">
            <label>
              <span>장</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">모두 ({entries?.length ?? 0})</option>
                <option value="0">소책자 전체 ({counts.get(0) ?? 0})</option>
                {chapters.map((chapter) => {
                  const number = Number(chapter.number)
                  return (
                    <option key={chapter.slug} value={number}>
                      {number}장. {chapter.title} ({counts.get(number) ?? 0})
                    </option>
                  )
                })}
              </select>
            </label>
            <button type="button" className="link-button" onClick={load}>
              새로고침
            </button>
            <span className="admin-account">
              {user?.email}{" "}
              <button type="button" className="link-button" onClick={() => signOut()}>
                로그아웃
              </button>
            </span>
          </div>

          {entries === null && !error && <p>불러오는 중…</p>}
          {entries !== null && visible.length === 0 && <p>아직 의견이 없습니다.</p>}

          <ol className="admin-list">
            {visible.map((entry) => (
              <li key={entry.id} className="admin-entry">
                <div className="admin-entry-meta">
                  <strong>{chapterLabel(entry)}</strong>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
                <p className="admin-entry-author">
                  {entry.name} <a href={`mailto:${entry.email}`}>{entry.email}</a>
                </p>
                {entry.quote && (
                  <blockquote className="feedback-dialog-quote">{entry.quote}</blockquote>
                )}
                <h3>꼭 알고 싶은 내용</h3>
                <p>{entry.wantToKnow}</p>
                {entry.why && (
                  <>
                    <h3>왜 알고 싶은가</h3>
                    <p>{entry.why}</p>
                  </>
                )}
                <div className="admin-entry-actions">
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => remove(entry)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {error && (
        <p className="feedback-dialog-error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
