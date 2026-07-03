import React from "react";

// ── Catalog directory ───────────────────────────────────────────────────────
// Two kinds of Catalog entries: SERVICES (things the clinic sells, priced →
// booking / billing) and DIRECTORY entries (parties the clinic connects to:
// referral doctors, labs, suppliers, general contacts).
//
// Services come from the real ServicesView / GET /api/tenant/services. The
// directory has no backend yet, so its lists start EMPTY — each clinic adds its
// own via each tab's "Add" action. (No demo/mock data ships.)

export type DirEntry = {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  tags?: string[];
  phone?: string;
  whatsapp?: boolean;
  email?: string;
  address?: string;
  /** Primary action label for this entry type (e.g. "Refer", "Order test"). */
  cta?: string;
  details?: { label: string; value: string }[];
  /** Services / tests / products this party offers, with a price/meta. */
  offers?: { name: string; meta: string }[];
  offersLabel?: string;
  activity?: string[];
};

export type Category = "Services" | "Referral doctors" | "Labs" | "Suppliers" | "Contacts";
