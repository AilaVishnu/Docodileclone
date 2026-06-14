import { CSSProperties, ReactNode } from "react";
import { styles } from "./PageHeader.styles";
import { Icon } from "../Icon";

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
  /** Override / extend the inner 3-zone row (max-width / padding). Use when a page
   *  needs its right actions to align with the TopNav avatar rather than the
   *  capped content grid. */
  innerStyle?: CSSProperties;
}

/**
 * Shared sticky app-bar for full-page views. Three zones: back (left),
 * title (center), actions (right). See PageHeader.styles.ts for layout notes.
 */
export function PageHeader({ title, onBack, backLabel = "Back", actions, wrapTitle = true, style, innerStyle }: PageHeaderProps) {
  return (
    <header style={{ ...styles.bar, ...style }}>
      {onBack && (
        <button type="button" style={styles.backButton} onClick={onBack} title={backLabel} aria-label={backLabel}>
          <Icon name="arrow-left" size={24} tone="inherit" />
        </button>
      )}

      <div style={{ ...styles.inner, ...innerStyle }}>
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
