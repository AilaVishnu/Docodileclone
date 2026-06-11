// TEMP — /audit gallery · Category 7: Tables / lists
// Faithful static mocks of every table in the app. No shared <table> primitive
// exists; each surface re-derives th colour/weight, td padding, border, and card
// radius independently. We reproduce each one's REAL values as literals so the
// divergence is visible side by side. Delete with the AuditGallery folder.
import React from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { Section, Sub, Ctx, Note } from "./shared";

// ── tiny faithful-table renderer ────────────────────────────────────────────
// Pass the REAL th/td/card style objects (read from each source) + headers +
// 3 fake rows. Renders header + 3 body rows inside the card container.
type Cell = React.ReactNode;
type TableMockProps = {
  card: React.CSSProperties;
  table?: React.CSSProperties;
  th: React.CSSProperties;
  td: React.CSSProperties;
  tr?: React.CSSProperties;
  headers: { label: string; cellStyle?: React.CSSProperties }[];
  rows: { cells: Cell[]; cellStyles?: (React.CSSProperties | undefined)[] }[];
  minWidth?: number;
};
const TableMock = ({ card, table, th, td, tr, headers, rows, minWidth = 360 }: TableMockProps) => (
  <div style={{ ...card, width: "100%", maxWidth: 520, minWidth }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        fontFamily: fonts.family.primary,
        ...table,
      }}
    >
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ ...th, ...h.cellStyle }}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} style={tr}>
            {r.cells.map((c, ci) => (
              <td key={ci} style={{ ...td, ...(r.cellStyles?.[ci] ?? undefined) }}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── a status-pill glyph, used to illustrate the two parallel pill systems ────
const Pill = ({ label, bg, fg }: { label: string; bg: string; fg: string }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: radii.full,
      background: bg,
      color: fg,
      fontSize: fonts.control.xs,
      fontWeight: fonts.weight.medium,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

export function TablesCategory() {
  return (
    <Section id="tables" title="7 · Tables / lists" status="shipped">
      <Note>
        <b>SHIPPED.</b> The five tables now share ONE header look via{" "}
        <code>tableHeadCell</code> + <code>tableDivider</code> in <code>styles/tableStyles.ts</code>{" "}
        (soft-black <code>alphaBlack3</code> / weight 400 / thin <code>primary300</code> divider).
        The <b>Stats</b> overdue/dues table — the lone outlier at <code>neutral500</code> / weight
        500 — was brought into line. The two queue tables' <b>status pills were merged</b> into the
        single shared <code>StatusBadge</code> (it gained a <code>started</code> prop so the
        prescription queue still reads "Ongoing"). Card corners were <b>deliberately left as-is</b>{" "}
        per review (incl. the queue's intentional tab-tuck corner). No shared{" "}
        <code>&lt;DataTable&gt;</code> component was built — the look is unified at the style level,
        leaving each table's data / clicks / sorting / live timers untouched.
      </Note>
      <Note>
        <i>Before:</i> 6 independently-styled tables, no shared primitive; Stats drifted on header
        colour + weight; two parallel pill components; and <code>PatientFilesPage</code> still
        borrows <code>AppointmentQueue.styles</code> (an accidental coupling — left as a follow-up;
        it now inherits the shared header look transitively).
      </Note>

      {/* ─────────────────────────────────────────────────────────────────── */}
      <Sub
        title="The six tables, side by side"
        note="Each mock reproduces that table's REAL th colour/weight/padding, td padding, border colour, and card radius as literals (read from source). Compare the header rows and the card corners."
      >
        {/* TBL-queue — canonical candidate (richest) */}
        <Ctx
          id="TBL-queue"
          where="surface: AppointmentQueue · src: components/AppointmentQueue/AppointmentQueue.styles.ts:47-77"
          canonical
        >
          <TableMock
            card={{
              backgroundColor: colors.primary100,
              borderRadius: "0 24px 24px 24px",
              padding: "24px",
              overflow: "visible",
            }}
            table={{ tableLayout: "fixed" }}
            th={{
              padding: "12px 28px", // "12px var(--queue-cell-padx, 28px)"
              borderBottom: `1px solid ${colors.primary300}`,
              color: colors.alphaBlack3,
              fontWeight: 400,
              fontSize: fonts.size.m,
              lineHeight: "20px",
              letterSpacing: 0,
            }}
            tr={{ borderBottom: `1px solid ${colors.primary300}` }}
            td={{
              padding: "10px 28px",
              fontSize: fonts.size.m,
              color: colors.neutral900,
              verticalAlign: "middle",
              fontWeight: 400,
              whiteSpace: "nowrap",
            }}
            headers={[{ label: "#" }, { label: "Name" }, { label: "Status" }]}
            rows={[
              { cells: ["01", "Aisha Rahman", <Pill label="Waiting" bg={colors.yellowAlpha10} fg={colors.yellow200} />] },
              { cells: ["02", "Diego Marín", <Pill label="In room" bg={colors.greenAlpha10} fg={colors.green200} />] },
              { cells: ["03", "Mei-Ling Chen", <Pill label="Done" bg={colors.neutral150} fg={colors.neutral600} />] },
            ]}
          />
        </Ctx>

        {/* TBL-rx */}
        <Ctx
          id="TBL-rx"
          where="surface: PrescriptionQueue list · src: pages/PrescriptionPage/PrescriptionQueue.styles.ts:229-267"
        >
          <TableMock
            card={{
              backgroundColor: colors.primary100,
              borderRadius: radii.l, // 10
              padding: spacing.l,
              overflow: "auto",
            }}
            table={{ tableLayout: "fixed" }}
            th={{
              padding: "12px 0",
              borderBottom: `${strokes.xs} solid ${colors.primary300}`,
              color: colors.alphaBlack3,
              fontWeight: fonts.weight.regular,
              fontSize: fonts.size.m,
              lineHeight: fonts.lineHeight.m,
              fontFamily: fonts.family.primary,
              textAlign: "left",
              verticalAlign: "middle",
            }}
            tr={{ borderBottom: `${strokes.xs} solid ${colors.primary300}` }}
            td={{
              padding: "10px 0",
              fontSize: fonts.size.m,
              lineHeight: fonts.lineHeight.m,
              fontFamily: fonts.family.primary,
              color: colors.neutral900,
              verticalAlign: "middle",
              whiteSpace: "nowrap",
            }}
            headers={[{ label: "#" }, { label: "Patient" }, { label: "Status" }]}
            rows={[
              { cells: ["01", "Aisha Rahman", <Pill label="New" bg={colors.secondary100} fg={colors.secondary700} />] },
              { cells: ["02", "Diego Marín", <Pill label="Ready" bg={colors.greenAlpha10} fg={colors.green200} />] },
              { cells: ["03", "Mei-Ling Chen", <Pill label="Collected" bg={colors.neutral150} fg={colors.neutral600} />] },
            ]}
          />
        </Ctx>

        {/* TBL-pharmacy */}
        <Ctx
          id="TBL-pharmacy"
          where="surface: Pharmacy inventory · src: pages/Pharmacy/Pharmacy.styles.ts:150-194"
        >
          <TableMock
            card={{
              backgroundColor: colors.primary100,
              borderRadius: 24, // literal
              padding: spacing.xl,
              overflow: "hidden",
            }}
            table={{ fontSize: fonts.control.sm, color: colors.neutral900 }}
            th={{
              textAlign: "left",
              padding: `${spacing.s} ${spacing.m}`, // 12px 16px
              fontSize: fonts.control.xs,
              color: colors.alphaBlack3,
              fontWeight: fonts.weight.regular,
              whiteSpace: "nowrap",
              borderBottom: `${strokes.xs} solid ${colors.primary300}`,
            }}
            tr={{ borderBottom: `${strokes.xs} solid ${colors.primary300}` }}
            td={{ padding: `${spacing.s} ${spacing.m}`, whiteSpace: "nowrap" }}
            headers={[
              { label: "Drug" },
              { label: "In stock", cellStyle: { textAlign: "right" } },
              { label: "Price", cellStyle: { textAlign: "right" } },
            ]}
            rows={[
              {
                cells: ["Amoxicillin 500mg", "1,240", "$0.18"],
                cellStyles: [undefined, { textAlign: "right", fontVariantNumeric: "tabular-nums" }, { textAlign: "right", fontVariantNumeric: "tabular-nums" }],
              },
              {
                cells: ["Ibuprofen 200mg", "3,002", "$0.05"],
                cellStyles: [undefined, { textAlign: "right", fontVariantNumeric: "tabular-nums" }, { textAlign: "right", fontVariantNumeric: "tabular-nums" }],
              },
              {
                cells: ["Paracetamol 500mg", "880", "$0.04"],
                cellStyles: [undefined, { textAlign: "right", fontVariantNumeric: "tabular-nums" }, { textAlign: "right", fontVariantNumeric: "tabular-nums" }],
              },
            ]}
          />
        </Ctx>

        {/* TBL-archived */}
        <Ctx
          id="TBL-archived"
          where="surface: Settings ▸ Archived patients · src: pages/Settings/ArchivedPatients/ArchivedPatientsList.tsx:135-161"
        >
          <TableMock
            card={{
              backgroundColor: colors.primary100,
              borderRadius: radii["2xl"], // 16
              padding: spacing.xl,
              overflow: "hidden",
            }}
            table={{ fontSize: fonts.control.sm, color: colors.neutral900 }}
            th={{
              textAlign: "left",
              padding: `${spacing.s} ${spacing.m}`,
              fontSize: fonts.control.xs,
              fontWeight: fonts.weight.regular,
              color: colors.alphaBlack3,
              borderBottom: `1px solid ${colors.primary300}`,
              whiteSpace: "nowrap",
            }}
            td={{
              padding: `${spacing.s} ${spacing.m}`,
              borderBottom: `1px solid ${colors.primary300}`,
              whiteSpace: "nowrap",
            }}
            headers={[{ label: "Name" }, { label: "Archived" }, { label: "Reason" }]}
            rows={[
              { cells: ["Aisha Rahman", "2026-04-12", "Moved away"] },
              { cells: ["Diego Marín", "2026-03-02", "Duplicate"] },
              { cells: ["Mei-Ling Chen", "2026-01-19", "Deceased"] },
            ]}
          />
        </Ctx>

        {/* TBL-stats — THE OUTLIER */}
        <Ctx
          id="TBL-stats"
          where="surface: Stats ▸ overdue / dues · src: pages/Stats/StatsPage.tsx:1618-1620  ⚠ outlier"
        >
          <TableMock
            // Stats table has NO card container of its own in source — it sits on
            // a generic card. We give it a plain neutral surface to make the point
            // that it doesn't share the cream/radius language of the others.
            card={{
              backgroundColor: colors.neutral100,
              borderRadius: radii.m,
              padding: spacing.m,
              border: `${strokes.xs} solid ${colors.neutral200}`,
              overflow: "hidden",
            }}
            table={{ fontSize: fonts.size.s }}
            th={{
              textAlign: "left",
              padding: "8px",
              borderBottom: `${strokes.xs} solid ${colors.primary300}`,
              color: colors.neutral500, // ← everyone else uses alphaBlack3
              fontWeight: 500, // ← everyone else uses 400
              whiteSpace: "nowrap",
            }}
            td={{
              padding: "10px 8px",
              color: colors.neutral900,
              borderBottom: `${strokes.xs} solid ${colors.primary300}`,
              fontWeight: 400,
            }}
            headers={[{ label: "Patient" }, { label: "Due" }, { label: "Days late" }]}
            rows={[
              { cells: ["Aisha Rahman", "$120.00", "14"] },
              { cells: ["Diego Marín", "$48.50", "9"] },
              { cells: ["Mei-Ling Chen", "$210.00", "31"] },
            ]}
          />
        </Ctx>
      </Sub>

      {/* ─────────────────────────────────────────────────────────────────── */}
      <Sub
        title="Where the divergence lives"
        note="The same three knobs are set independently in five files."
      >
        <Ctx id="TBL-DIV" where="header colour · header weight · card radius — per source">
          <table
            style={{
              width: "100%",
              maxWidth: 640,
              borderCollapse: "collapse",
              fontFamily: fonts.family.primary,
              fontSize: fonts.size.s,
              color: colors.neutral900,
              background: colors.neutral100,
              borderRadius: radii.m,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                {["Table", "th colour", "th weight", "card radius"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: fonts.control.xs,
                      fontWeight: fonts.weight.medium,
                      color: colors.neutral500,
                      borderBottom: `${strokes.xs} solid ${colors.neutral200}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["TBL-queue", "alphaBlack3", "400", '"0 24px 24px 24px"'],
                ["TBL-rx", "alphaBlack3", "400", "radii.l = 10"],
                ["TBL-pharmacy", "alphaBlack3", "400", "24 (literal)"],
                ["TBL-archived", "alphaBlack3", "400", 'radii["2xl"] = 16'],
                ["TBL-stats", "neutral500 ⚠", "500 ⚠", "— (no own card)"],
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `${strokes.xs} solid ${colors.neutral150}` }}>
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                        fontFamily: ci === 0 ? "monospace" : undefined,
                        color: r[0] === "TBL-stats" && (ci === 1 || ci === 2) ? colors.red200 : colors.neutral900,
                        fontWeight: r[0] === "TBL-stats" && (ci === 1 || ci === 2) ? 600 : 400,
                      }}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Ctx>
        <Note>
          Header colour is <code>alphaBlack3</code> in four tables and <code>neutral500</code> in Stats;
          header weight is <code>400</code> in four and <code>500</code> in Stats. Card radius never
          repeats: <code>"0 24px 24px 24px"</code> / <code>24</code> / <code>16</code> / <code>10</code>.
        </Note>
      </Sub>

      {/* ─────────────────────────────────────────────────────────────────── */}
      <Sub
        title="Status pills — ✅ MERGED into one StatusBadge"
        note="The two queue tables used to ship two unrelated pill components. They now BOTH render the shared StatusBadge; the prescription queue passes a `started` prop so its IN_PROGRESS pill still reads 'Ongoing' on sage. The mocks below show the (already near-identical) before."
      >
        <Ctx id="TBL-PILLS" where="StatusBadge (AppointmentQueue) vs StatusPill (PrescriptionQueue)">
          <div style={{ display: "flex", gap: spacing.xl, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs, alignItems: "flex-start" }}>
              <span style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
                <code>StatusBadge</code> — components/AppointmentQueue/StatusBadge.tsx
              </span>
              <div style={{ display: "flex", gap: spacing.xs }}>
                <Pill label="Waiting" bg={colors.yellowAlpha10} fg={colors.yellow200} />
                <Pill label="In room" bg={colors.greenAlpha10} fg={colors.green200} />
                <Pill label="Done" bg={colors.neutral150} fg={colors.neutral600} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs, alignItems: "flex-start" }}>
              <span style={{ fontSize: fonts.size.xs, color: colors.neutral600 }}>
                <code>StatusPill</code> — pages/PrescriptionPage/PrescriptionQueue.tsx
              </span>
              <div style={{ display: "flex", gap: spacing.xs }}>
                <Pill label="New" bg={colors.secondary100} fg={colors.secondary700} />
                <Pill label="Ready" bg={colors.greenAlpha10} fg={colors.green200} />
                <Pill label="Collected" bg={colors.neutral150} fg={colors.neutral600} />
              </div>
            </div>
          </div>
        </Ctx>
        <Note>
          Accidental coupling: <code>pages/PatientFilesPage/PatientFilesPage.tsx:11</code> imports{" "}
          <code>AppointmentQueue.styles</code> as <code>queueStyles</code> and reuses its{" "}
          <code>tableContainer</code> / <code>th</code> / <code>tr</code> / <code>serialCell</code> — so a
          third page silently inherits the queue table's look through a styles import rather than a shared
          component.
        </Note>
      </Sub>

      {/* ─────────────────────────────────────────────────────────────────── */}
      <Sub
        title="✅ Canonical header look — shared tableHeadCell (LIVE)"
        note="Shipped: th colour + weight + divider come from styles/tableStyles.ts (alphaBlack3 / 400 / primary300), spread into all five tables. Padding, font-size and card radius stay per-table (column density + the queue's tab-tuck corner are intentional, left as-is). A full <DataTable> component was NOT built — that stays a future option."
      >
        <Ctx
          id="TBL-CANON"
          where="shipped: shared tableHeadCell + tableDivider — applied to all five tables"
          canonical
        >
          <TableMock
            card={{
              backgroundColor: colors.primary100,
              borderRadius: radii["2xl"], // single canonical radius (16)
              padding: spacing.xl,
              overflow: "hidden",
            }}
            th={{
              textAlign: "left",
              padding: "12px 28px",
              borderBottom: `${strokes.xs} solid ${colors.primary300}`,
              color: colors.alphaBlack3,
              fontWeight: fonts.weight.regular, // 400
              fontSize: fonts.size.m,
              whiteSpace: "nowrap",
            }}
            tr={{ borderBottom: `${strokes.xs} solid ${colors.primary300}` }}
            td={{
              padding: "10px 28px",
              fontSize: fonts.size.m,
              color: colors.neutral900,
              verticalAlign: "middle",
              fontWeight: fonts.weight.regular,
              whiteSpace: "nowrap",
            }}
            headers={[{ label: "#" }, { label: "Name" }, { label: "Status" }]}
            rows={[
              { cells: ["01", "Aisha Rahman", <Pill label="Waiting" bg={colors.yellowAlpha10} fg={colors.yellow200} />] },
              { cells: ["02", "Diego Marín", <Pill label="In room" bg={colors.greenAlpha10} fg={colors.green200} />] },
              { cells: ["03", "Mei-Ling Chen", <Pill label="Done" bg={colors.neutral150} fg={colors.neutral600} />] },
            ]}
          />
        </Ctx>
      </Sub>
    </Section>
  );
}
