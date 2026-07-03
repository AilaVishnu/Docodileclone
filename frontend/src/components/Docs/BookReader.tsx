import React, { useState, useEffect } from "react";
import { BookletCover } from "./BookletCover";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { Croc } from "../Chat/Croc";
import { colors, fonts } from "../../styles/theme";
import type { Booklet, BookletPage } from "../../pages/Docs/docsContent";

/**
 * BookReader — opens a Docs booklet in a modal: the cover swings open in 3D
 * (it's the first leaf) and flows into a page-flip book. Turn pages by clicking
 * a page, the ‹ › icons, or the arrow keys; a dot bar tracks progress; Esc /
 * backdrop / the close button dismiss it.
 *
 * Sized natively at S× (not via CSS `transform: scale`, which rasterises and
 * blurs the text/art) so every page renders crisp.
 */
const ink = colors.neutral900;
const clay = colors.primary700;
const cream = colors.primary100;
const serif = fonts.family.secondary;
const white = colors.neutral100;
const S = 1.5; // book scale — applied to real dimensions + type, so it stays sharp

const pad: React.CSSProperties = { padding: `${40 * S}px ${38 * S}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%" };

function StepPage({ kicker, title, body }: BookletPage) {
  return (
    <div style={pad}>
      <div style={{ fontSize: 12 * S, letterSpacing: 1.3, textTransform: "uppercase", color: clay, fontWeight: 700, marginBottom: 12 * S }}>{kicker}</div>
      <div style={{ fontFamily: serif, fontSize: 27 * S, fontWeight: 600, color: ink, marginBottom: 16 * S, lineHeight: 1.12 }}>{title}</div>
      <div style={{ fontSize: 16 * S, lineHeight: 1.65, color: colors.neutral700 }}>{body}</div>
    </div>
  );
}

function TitlePage({ book }: { book: Booklet }) {
  const meta = book.pages?.length ? `${book.pages.length} steps · 2 min read` : "A short read";
  return (
    <div style={pad}>
      <div style={{ fontSize: 12 * S, letterSpacing: 1.5, textTransform: "uppercase", color: clay, fontWeight: 700 }}>A Docodile guide</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 34 * S, fontWeight: 600, color: ink, lineHeight: 1.1 }}>{book.title}</div>
        {book.summary && <div style={{ marginTop: 16 * S, fontSize: 16 * S, color: colors.neutral600, lineHeight: 1.55 }}>{book.summary}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * S, color: colors.neutral500, fontSize: 14 * S }}><Croc size={30 * S} /> {meta}</div>
    </div>
  );
}

const ComingSoon = (
  <div style={{ ...pad, alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 * S }}>
    <Croc size={60 * S} />
    <div style={{ fontFamily: serif, fontSize: 22 * S, fontWeight: 600, color: ink }}>Still being written</div>
    <div style={{ fontSize: 15 * S, color: colors.neutral600, maxWidth: 240 * S, lineHeight: 1.5 }}>This guide is on the way. Ask Croc in the meantime.</div>
  </div>
);
const EndPage = (
  <div style={{ ...pad, alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 * S }}>
    <Croc size={66 * S} />
    <div style={{ fontFamily: serif, fontSize: 24 * S, fontWeight: 600, color: ink }}>That’s it!</div>
    <div style={{ fontSize: 15 * S, color: colors.neutral600, maxWidth: 240 * S, lineHeight: 1.5 }}>Ask Croc anytime if you get stuck.</div>
  </div>
);
const Blank = <div style={{ ...pad, background: cream }} />;

export function BookReader({ book, onClose }: { book: Booklet; onClose: () => void }) {
  const PW = 300 * S, PH = 402 * S;
  const [flipped, setFlipped] = useState(0);

  // Inside faces, in reading order, then split into leaves. Leaf 0's front is
  // the cover, so opening the cover is the first page-turn.
  const faces: React.ReactNode[] = [<TitlePage key="t" book={book} />];
  if (book.pages?.length) book.pages.forEach((p, i) => faces.push(<StepPage key={`p${i}`} {...p} />));
  else faces.push(<React.Fragment key="cs">{ComingSoon}</React.Fragment>);
  faces.push(<React.Fragment key="end">{EndPage}</React.Fragment>);

  const cover = <BookletCover title={book.title} kicker={book.kicker} bg={book.bg} fg={book.fg} accent={book.accent} art={book.art} width={PW} />;
  const leaves: [React.ReactNode, React.ReactNode][] = [[cover, faces[0]]];
  for (let i = 1; i < faces.length; i += 2) leaves.push([faces[i], faces[i + 1] ?? Blank]);
  const N = leaves.length;
  const closed = flipped === 0;
  const turn = (dir: 1 | -1) => setFlipped((f) => Math.min(N, Math.max(0, f + dir)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setFlipped((f) => Math.min(N, f + 1)); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setFlipped((f) => Math.max(0, f - 1)); }
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [N, onClose]);

  const faceBase: React.CSSProperties = { position: "absolute", inset: 0, background: cream, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", overflow: "hidden", pointerEvents: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(58, 33, 14, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9500 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={book.title}>
      <style>{`@keyframes bookIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, animation: "bookIn .3s ease" }}>
        <IconButton ariaLabel="Close" onClick={onClose} color={white} style={{ position: "absolute", top: -48, right: -2 }} />

        <div style={{ perspective: 4500 }}>
          <div style={{ position: "relative", width: PW * 2, height: PH, transformStyle: "preserve-3d", transform: closed ? `translateX(${-PW / 2}px)` : "none", transition: "transform .9s cubic-bezier(.2,.7,.2,1)" }}>
            {!closed && <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, background: colors.primary200, borderRadius: "12px 3px 3px 12px" }} />}
            {!closed && <div style={{ position: "absolute", left: PW, top: 0, width: PW, height: PH, background: colors.primary200, borderRadius: "3px 12px 12px 3px" }} />}

            {leaves.map(([front, back], i) => {
              const isFlipped = i < flipped;
              return (
                <div key={i} style={{ position: "absolute", left: PW, top: 0, width: PW, height: PH, transformStyle: "preserve-3d", transformOrigin: "left center", transform: isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)", transition: "transform .9s cubic-bezier(.2,.7,.2,1)", zIndex: isFlipped ? i : N - i }}>
                  <div style={{ ...faceBase, borderRadius: "3px 12px 12px 3px", boxShadow: "inset 9px 0 20px rgba(0,0,0,0.05)" }}>{front}</div>
                  <div style={{ ...faceBase, borderRadius: "12px 3px 3px 12px", transform: "rotateY(180deg)", boxShadow: "inset -9px 0 20px rgba(0,0,0,0.05)" }}>{back}</div>
                </div>
              );
            })}

            {!closed && <div style={{ position: "absolute", left: PW - 1, top: 10, width: 2, height: PH - 20, background: "rgba(0,0,0,0.08)", zIndex: 40, pointerEvents: "none" }} />}

            {flipped > 1 && <div onClick={() => turn(-1)} style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, zIndex: 60, cursor: "pointer" }} aria-label="Previous page" role="button" />}
            {flipped < N && <div onClick={() => turn(1)} style={{ position: "absolute", left: closed ? 0 : PW, top: 0, width: closed ? PW * 2 : PW, height: PH, zIndex: 60, cursor: "pointer" }} aria-label="Next page" role="button" />}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconButton ariaLabel="Previous page" onClick={() => turn(-1)} disabled={flipped === 0} color={white}>
            <Icon name="chevron-left" tone="inherit" size={22} />
          </IconButton>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {Array.from({ length: N + 1 }).map((_, i) => (
              <span key={i} style={{ width: i === flipped ? 20 : 7, height: 7, borderRadius: 999, background: white, opacity: i === flipped ? 0.95 : 0.4, transition: "width .25s, opacity .25s" }} />
            ))}
          </div>
          <IconButton ariaLabel="Next page" onClick={() => turn(1)} disabled={flipped === N} color={white}>
            <Icon name="chevron-right" tone="inherit" size={22} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
