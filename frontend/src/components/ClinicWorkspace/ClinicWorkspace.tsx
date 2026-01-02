import React from "react";
import { styles } from "./ClinicWorkspace.styles";

type ClinicWorkspaceProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export function ClinicWorkspace({ left, right }: ClinicWorkspaceProps) {
  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>{left}</div>
      <div style={styles.rightPanel}>{right}</div>
    </div>
  );
}
