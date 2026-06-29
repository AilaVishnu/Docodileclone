import React, { useState } from "react";
import { CSSProperties } from "react";
import { DocsShelf } from "../../components/Docs/DocsShelf";
import { BookletCover } from "../../components/Docs/BookletCover";
import { BookReader } from "../../components/Docs/BookReader";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { Tabs } from "../../components/Tabs";
import { Field } from "../../components/Field";
import { Icon } from "../../components/Icon";
import { spacing, fluidSpacing } from "../../styles/theme";
import { DOCS_SHELVES, Booklet } from "./docsContent";

/**
 * Docs — the clinic guides library. Uses the shared sticky `PageHeader`, with a
 * search field (left) and a Shelves / All-booklets `Tabs` toggle (right), over
 * the booklet shelves. Clicking a booklet opens it in the `BookReader`.
 */
export function DocsView() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"Shelves" | "All booklets">("Shelves");
  const [openBook, setOpenBook] = useState<Booklet | null>(null);

  return (
    <div style={styles.page}>
      <PageHeader title="Docs" />

      <div style={styles.content}>
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <div style={{ width: "100%", maxWidth: 360 }}>
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
          <div style={styles.toolbarRight}>
            <Tabs
              variant="block"
              inline
              items={[{ id: "Shelves", label: "Shelves" }, { id: "All booklets", label: "All booklets" }]}
              activeId={view}
              onSelect={(id) => setView(id as "Shelves" | "All booklets")}
            />
          </div>
        </div>

        <div style={styles.shelves}>
          {DOCS_SHELVES.map((shelf) => (
            <DocsShelf key={shelf.title} title={shelf.title} onFull={() => {}}>
              {shelf.books.map((b) => (
                <BookletCover key={b.title} {...b} onClick={() => setOpenBook(b)} />
              ))}
            </DocsShelf>
          ))}
        </div>
      </div>

      {openBook && <BookReader book={openBook} onClose={() => setOpenBook(null)} />}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  // Own full-bleed scroll container (no top padding) so the sticky PageHeader
  // bleeds to the very top — same pattern as the Pharmacy / Stats pages.
  page: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    padding: `0 ${fluidSpacing.outerX} ${fluidSpacing.outerY}`,
    overflowY: "auto",
    overflowX: "hidden",
    minWidth: 0,
  },
  content: {
    width: "100%",
    minWidth: 0,
    marginTop: "var(--main-gap, 24px)",
    display: "flex",
    flexDirection: "column",
    gap: spacing.l,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
    flex: 1,
    minWidth: 0,
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: spacing.m,
  },
  shelves: {
    display: "flex",
    flexDirection: "column",
  },
};
