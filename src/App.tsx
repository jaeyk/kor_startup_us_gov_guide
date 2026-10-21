import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import chapterDates from "virtual:chapter-dates"
import { chapters, parts } from "./content"
import updates from "./content/updates.md?raw"
import { ChapterFeedback, SelectionFeedback } from "./Feedback"
import { feedbackUrl, subscribeUrl } from "./feedback-config"

const markdownFiles = import.meta.glob("./content/chapters/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>

// A chapter is a draft until its file has something beyond the title line.
function isDraft(file: string) {
  const source = markdownFiles[`./content/chapters/${file}`] ?? ""
  return source.replace(/^#\s.*$/m, "").trim() === ""
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  return `${year}년 ${month}월 ${day}일`
}

function getSlug() {
  return window.location.hash.replace(/^#\//, "")
}

// Slugs like "part-1" or "author" point at sections of the index page.
function scrollToSlug(slug: string) {
  const section = slug ? document.getElementById(slug) : null
  if (section) {
    section.scrollIntoView()
  } else {
    window.scrollTo(0, 0)
  }
}

function SiteMenu({ activePart }: { activePart?: string }) {
  return (
    <header className="header">
      <nav className="menu" aria-label="메뉴">
        <a href="#/">처음</a>
        {parts.map((part) => (
          <a
            key={part.id}
            href={`#/${part.id}`}
            aria-current={part.label === activePart ? "true" : undefined}
          >
            {part.menu}
          </a>
        ))}
        <a href="#/updates">업데이트</a>
        <a href="#/author">저자</a>
      </nav>
    </header>
  )
}

export default function App() {
  const [slug, setSlug] = useState(getSlug)
  const chapterIndex = chapters.findIndex((chapter) => chapter.slug === slug)
  const chapter = chapters[chapterIndex]
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleHashChange = () => setSlug(getSlug())

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    scrollToSlug(slug)
  }, [slug])

  if (chapter) {
    const source = markdownFiles[`./content/chapters/${chapter.file}`]
    const previous = chapters[chapterIndex - 1]
    const next = chapters[chapterIndex + 1]
    const updatedOn = chapterDates[chapter.file]
    const draft = isDraft(chapter.file)

    return (
      <div className="site">
        <SiteMenu activePart={chapter.part} />

        <main className="reader">
          <div className="chapter-context">
            <a href="#/">목차</a>
            <span>/</span>
            <span>{chapter.part}</span>
            <span className="chapter-position">
              {chapter.number} / {String(chapters.length).padStart(2, "0")}
            </span>
          </div>

          <article className="markdown" ref={articleRef}>
            <Markdown>{source}</Markdown>
          </article>
          {!draft && (
            <SelectionFeedback articleRef={articleRef} chapter={chapter} />
          )}

          {!draft && updatedOn && (
            <p className="updated-on">마지막 수정: {formatDate(updatedOn)}</p>
          )}

          <ChapterFeedback chapter={chapter} draft={draft} />

          <nav className="chapter-navigation" aria-label="이전 및 다음 장">
            {previous ? (
              <a href={`#/${previous.slug}`}>
                <small>이전 장</small>
                <span>{previous.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="next" href={`#/${next.slug}`}>
                <small>다음 장</small>
                <span>{next.title}</span>
              </a>
            ) : (
              <a className="next" href="#/">
                <small>읽기 완료</small>
                <span>목차로 돌아가기</span>
              </a>
            )}
          </nav>
        </main>
      </div>
    )
  }

  return (
    <div className="site">
      <SiteMenu />

      <main className="index">
        <section className="intro">
          <div className="intro-text">
            <p className="kicker">An open writing project</p>
            <h1>
              스타트업을 위한
              <br />
              미국 정부 가이드
            </h1>
            <p className="description">
              미국 정부와 조달 시장을 이해하고, 기술 스타트업이 새로운 가치와 사업 기회를
              만드는 데 필요한 지식을 정리합니다.
            </p>
            <div className="call-for-input">
              <p className="call-for-input-title">
                이 소책자(A4 20장 예상)는 독자와 함께 씁니다
              </p>
              <p>
                지금은 각 장의 제목만 공개되어 있습니다. 각 장에서{" "}
                <strong>꼭 알고 싶은 내용</strong>과{" "}
                <strong>왜 그 내용을 알고 싶은지</strong> 알려주세요. 보내주신
                의견을 적극적으로 참조하겠습니다.
              </p>
              <div className="feedback-actions">
                <a
                  className="button"
                  href={feedbackUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  알고 싶은 내용 알려주기
                </a>
                <a href="#/part-1">목차에서 장 골라 의견 남기기</a>
              </div>
            </div>
          </div>

          <aside className="author" id="author">
            <div className="author-label">저자</div>
            <h2>
              <a href="https://jaeyk.github.io/">김재연</a>
            </h2>
            <p className="author-role">
              미국 노스캐롤라이나대 채플힐(UNC Chapel Hill) 정책학과 교수
            </p>
            <p>
              학계로 돌아오기 전에는 미국의 대표적 시빅 테크 단체인{" "}
              <a href="https://codeforamerica.org/">
                코드 포 아메리카(Code for America)
              </a>
              에서 데이터 과학자로 일하며 미국 정부와 협력하여 복지 정책의 접근성을 개선하는 일을 했습니다. 현재는 미국 대학 교수로서 시빅 테크, 행정 부담, 공공 조달, 인공지능 정책에 관련된 연구를 진행 중입니다.{" "}
              <a href="https://jaeyk.github.io/pof-lab/">
                사람, 조직, 미래 랩(People, Organizations, Futures Lab)
              </a>의 설립자이자 디렉터입니다. 한국어 책으로는{" "}
              <a href="https://wethedata.vercel.app/">
                《우리에게는 다른 데이터가 필요하다》
              </a>
              (세종서적, 2023)를 출판했습니다. UC 버클리로 박사 유학을 오기 전에는 한국의 스타트업에서 전략 매니저로 일했습니다.
            </p>
            <ul className="author-links">
              <li>
                <a href="https://jaeyk.github.io/" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
                  </svg>
                  개인 홈페이지
                </a>
              </li>
              <li>
                <a
                  href="https://jaeyk.github.io/pof-lab/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 3h6M10 3v6.5L4.5 19A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2L14 9.5V3M7.5 15h9" />
                  </svg>
                  랩 홈페이지
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/jae-yeon-kim-694764229/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="filled">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </aside>
        </section>

        <section className="table-of-contents">
          <div className="toc-label">목차</div>
          <div>
            {parts.map((part) => (
              <section className="part" id={part.id} key={part.label}>
                <div className="part-title">
                  <span>{part.label}</span>
                  <h2>{part.title}</h2>
                </div>
                <ol>
                  {chapters
                    .filter((chapter) => chapter.part === part.label)
                    .map((chapter) => (
                      <li key={chapter.slug}>
                        <a href={`#/${chapter.slug}`}>
                          <span>{chapter.number}</span>
                          <strong>
                            {chapter.title}
                            {isDraft(chapter.file) && (
                              <em className="toc-status">의견 받는 중</em>
                            )}
                          </strong>
                          <span aria-hidden="true">→</span>
                        </a>
                      </li>
                    ))}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="updates" id="updates">
          <div className="toc-label">업데이트</div>
          <div>
            <div className="markdown updates-list">
              <Markdown>{updates}</Markdown>
            </div>
            <div className="feedback-actions">
              <a
                className="button"
                href={feedbackUrl()}
                target="_blank"
                rel="noreferrer"
              >
                전체에 대한 의견 남기기
              </a>
              {subscribeUrl && (
                <a href={subscribeUrl} target="_blank" rel="noreferrer">
                  업데이트 소식 받기
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>Copyright © 2026 Jae Yeon Kim. All Rights Reserved.</span>
      </footer>
    </div>
  )
}
