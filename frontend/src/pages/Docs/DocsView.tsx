import React, { useState } from "react";
import { DocsShelf } from "../../components/Docs/DocsShelf";
import { BookletCover } from "../../components/Docs/BookletCover";
import { BookReader } from "../../components/Docs/BookReader";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import { colors, fonts } from "../../styles/theme";
import { DOCS_SHELVES, Booklet } from "./docsContent";

/**
 * Docs — the clinic guides library. Renders inside the app shell's <main>
 * (the SideNav + TopNav chrome is provided by the page host), so it only owns
 * the page header, the shelves/search controls and the booklet shelves.
 */
export function DocsView() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"Shelves" | "All booklets">("Shelves");
  const [openBook, setOpenBook] = useState<Booklet | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: fonts.family.primary }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, lineHeight: fonts.lineHeight.h4, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>
          Docs
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: fonts.size.s, color: colors.neutral600, maxWidth: 560 }}>
          Short booklets and how-tos for running your clinic in Docodile.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", background: colors.neutral100, border: `1px solid ${colors.neutral200}`, borderRadius: 999, padding: 3 }}>
          {(["Shelves", "All booklets"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 16px", fontSize: 13, fontFamily: fonts.family.primary, fontWeight: view === v ? fonts.weight.medium : fonts.weight.regular, color: view === v ? colors.neutral900 : colors.neutral600, background: view === v ? colors.primary200 : "transparent" }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ width: 320, maxWidth: "100%" }}>
          <Field
            variant="pill"
            fill="outline"
            type="search"
            value={q}
            onChange={setQ}
            placeholder="Search the docs"
            iconLeft={<Icon name="search" tone="muted" />}
            ariaLabel="Search the docs"
          />
        </div>
      </div>

      {DOCS_SHELVES.map((shelf) => (
        <DocsShelf key={shelf.title} title={shelf.title} onFull={() => {}}>
          {shelf.books.map((b) => (
            <BookletCover key={b.title} {...b} onClick={() => setOpenBook(b)} />
          ))}
        </DocsShelf>
      ))}

      {openBook && <BookReader book={openBook} onClose={() => setOpenBook(null)} />}
    </div>
  );
}
