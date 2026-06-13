import React from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { ModalHeader } from "../ModalHeader";
import { PRESETS, WeekSchedule } from "./scheduleStorage";

type SchedulePresetsModalProps = {
  onPick: (week: WeekSchedule) => void;
  onCustom: () => void;
  onDismiss: () => void;
};

export function SchedulePresetsModal({ onPick, onCustom, onDismiss }: SchedulePresetsModalProps) {
  return (
    <Modal isOpen onClose={onDismiss} surface={colors.primary100} width={560}>
      <div style={styles.body}>
        <ModalHeader title="Set your hours" subtitle="Pick a starting point — you can tweak any day after." align="center" />

        <div style={styles.presetGrid}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p.week as WeekSchedule)}
              style={styles.presetCard}
            >
              <span style={styles.presetIcon}>{p.icon}</span>
              <span style={styles.presetLabel}>{p.label}</span>
              <span style={styles.presetSummary}>{p.summary}</span>
            </button>
          ))}

          <button onClick={onCustom} style={styles.presetCard}>
            <span style={styles.presetIcon}>🛠</span>
            <span style={styles.presetLabel}>Custom</span>
            <span style={styles.presetSummary}>Build your own</span>
          </button>
        </div>

        <Button variant="light" size="sm" onClick={onDismiss}>
          Skip for now
        </Button>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.m,
  },
  presetGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.s,
    width: "100%",
    marginTop: spacing.s,
  },
  presetCard: {
    backgroundColor: colors.neutral100,
    border: `1.5px solid ${colors.primary200}`,
    borderRadius: radii.xl,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    cursor: "pointer",
    fontFamily: fonts.family.primary,
    transition: "border-color 0.15s, transform 0.05s",
  },
  presetIcon: {
    fontSize: "28px",
    marginBottom: "4px",
  },
  presetLabel: {
    fontSize: fonts.size.m,
    fontWeight: 600,
    color: colors.neutral900,
  },
  presetSummary: {
    fontSize: fonts.size.xs,
    color: colors.neutral600,
  },
};
