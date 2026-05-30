import { CSSProperties, ReactNode } from "react";
import { styles } from "./PageHeader.styles";

interface PageHeaderProps {
  /** Title shown centered in the bar. String or rich node (e.g. with an inline dropdown). */
  title: ReactNode;
  /** Back handler. If omitted, no back button is rendered (the left slot stays empty so the title stays centered). */
  onBack?: () => void;
  /** Accessible label / tooltip for the back button. */
  backLabel?: string;
  /** Right-hand actions — icons or buttons. Optional; the slot reserves space and right-aligns its contents. */
  actions?: ReactNode;
  /** Render the title inside the default <h2> wrapper. Set false to supply your own heading markup. Default true. */
  wrapTitle?: boolean;
  /** Override / extend the outer bar style (e.g. a page whose shell uses non-standard padding). */
  style?: CSSProperties;
}

/** Left-pointing arrow, 20px at a 1.5px stroke to match the sidebar icon weight. */
function BackArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Shared sticky app-bar for full-page views. Three zones: back (left),
 * title (center), actions (right). See PageHeader.styles.ts for layout notes.
 */
export function PageHeader({ title, onBack, backLabel = "Back", actions, wrapTitle = true, style }: PageHeaderProps) {
  return (
    <header style={{ ...styles.bar, ...style }}>
      {onBack && (
        <button type="button" style={styles.backButton} onClick={onBack} title={backLabel} aria-label={backLabel}>
          <BackArrow />
        </button>
      )}

      <div style={styles.inner}>
        {/* empty left cell balances the right actions cell so the title stays centered */}
        <div />

        <div style={styles.center}>
          {wrapTitle ? <h2 style={styles.title}>{title}</h2> : title}
        </div>

        <div style={styles.right}>{actions}</div>
      </div>
    </header>
  );
}
