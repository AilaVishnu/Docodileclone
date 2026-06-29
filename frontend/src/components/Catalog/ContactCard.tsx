import React from "react";
import { Card } from "../Card";
import { Tag } from "../Tag";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { colors, fonts, radii } from "../../styles/theme";
import type { DirEntry } from "../../pages/Catalog/catalogData";

/**
 * ContactCard — a directory tile for a Catalog party (referral doctor, lab,
 * supplier or general contact). Shows identity + tags, a row of phonebook
 * quick-actions (call / WhatsApp / email / directions) and an optional CTA.
 */
export function ContactCard({ entry, onOpen, onEdit }: { entry: DirEntry; onOpen: (e: DirEntry) => void; onEdit?: (e: DirEntry) => void }) {
  return (
    <Card variant="surface" padding="l">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0, padding: "2px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
          <button type="button" onClick={() => onOpen(entry)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left", minWidth: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: radii.l, background: colors.primary200, color: colors.primary700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {entry.icon}
            </div>
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontFamily: fonts.family.primary, fontSize: fonts.size.s, fontWeight: fonts.weight.medium, color: colors.neutral900, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
              <div style={{ fontSize: fonts.size.xs, color: colors.neutral600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.subtitle}</div>
            </div>
          </button>
          {onEdit && <IconButton ariaLabel="Edit" title="Edit" size={30} onClick={() => onEdit(entry)}><Icon name="edit-pencil" tone="inherit" size={17} /></IconButton>}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {entry.tags.map((t) => <Tag key={t} label={t} variant="outline" />)}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {entry.phone && <IconButton ariaLabel="Call" title="Call" size={32}><Icon name="phone" tone="inherit" size={18} /></IconButton>}
            {entry.whatsapp && <IconButton ariaLabel="WhatsApp" title="WhatsApp" size={32}><Icon name="chat-square-call" tone="inherit" size={18} /></IconButton>}
            {entry.email && <IconButton ariaLabel="Email" title="Email" size={32}><Icon name="envelope" tone="inherit" size={18} /></IconButton>}
            {entry.address && <IconButton ariaLabel="Directions" title="Directions" size={32}><Icon name="map-point" tone="inherit" size={18} /></IconButton>}
          </div>
          {entry.cta && (
            <Button variant="secondaryLight" size="sm" iconRight={<Icon name="arrow-right" tone="inherit" size={15} />} onClick={() => onOpen(entry)}>
              {entry.cta}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
