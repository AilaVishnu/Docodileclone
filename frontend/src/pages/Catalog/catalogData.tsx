import React from "react";
import { Icon } from "../../components/Icon";
import { colors } from "../../styles/theme";

// ── Mock data for the Catalog module exploration ────────────────────────────
// Two kinds of entries: SERVICES (things the clinic sells, priced → booking /
// billing) and DIRECTORY entries (parties the clinic connects to: referral
// doctors, labs, suppliers, general contacts).

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

// Services come from the real ServicesView / GET /api/tenant/services. This file
// only holds the directory (referral doctors, labs, suppliers, contacts).
const doc = <Icon name="stethoscope" tone="inherit" size={22} />;
const bld = <Icon name="buildings" tone="inherit" size={22} />;
const lab = <Icon name="heart-pulse" tone="inherit" size={22} />;

export const DIRECTORY: Record<Exclude<Category, "Services">, DirEntry[]> = {
  "Referral doctors": [
    { id: "d1", name: "Dr. Anjali Menon", subtitle: "Dermatosurgery · Apollo", icon: doc, tags: ["We refer", "Preferred"], phone: "+91 98201 11111", whatsapp: true, email: "anjali@apollo.in", address: "Apollo, Jubilee Hills", cta: "Refer",
      details: [{ label: "Specialty", value: "Dermatosurgery, Mohs" }, { label: "Consult fee", value: "₹800" }, { label: "Languages", value: "English, Hindi, Telugu" }],
      activity: ["Referred Aarav Sharma — 12 Jun (consulted)", "Referred Meera R — 28 May (report back)"] },
    { id: "d2", name: "Dr. Vikram Rao", subtitle: "Rheumatology · Star Hospital", icon: doc, tags: ["Refers to us"], phone: "+91 99490 22222", whatsapp: true, email: "vrao@star.in", address: "Star Hospital, Banjara Hills", cta: "Refer",
      details: [{ label: "Specialty", value: "Rheumatology" }, { label: "Sends us", value: "Psoriatic-arthritis skin cases" }], activity: ["Sent us 4 patients this quarter"] },
    { id: "d3", name: "Dr. Priya Nair", subtitle: "Plastic surgery · KIMS", icon: doc, tags: ["We refer"], phone: "+91 90000 33333", whatsapp: true, email: "priya@kims.in", address: "KIMS, Kondapur", cta: "Refer",
      details: [{ label: "Specialty", value: "Aesthetic / reconstructive" }, { label: "Consult fee", value: "₹1,000" }] },
  ],
  Labs: [
    { id: "l1", name: "Metropolis Labs", subtitle: "Pathology · home collection", icon: lab, tags: ["Contract rates", "TAT 24h"], phone: "+91 80000 44444", whatsapp: true, email: "hyd@metropolis.in", address: "Somajiguda", cta: "Order test", offersLabel: "Tests & rates",
      offers: [{ name: "CBC", meta: "₹250" }, { name: "Skin scraping KOH", meta: "₹350" }, { name: "ANA profile", meta: "₹1,800" }], details: [{ label: "TAT", value: "24 hours" }, { label: "Home collection", value: "Yes — ₹100" }], activity: ["8 orders this month", "Last report attached — 14 Jun"] },
    { id: "l2", name: "DermPath Labs", subtitle: "Dermatopathology", icon: lab, tags: ["Biopsy", "TAT 5d"], phone: "+91 80000 55555", email: "lab@dermpath.in", address: "Madhapur", cta: "Order test", offersLabel: "Tests & rates",
      offers: [{ name: "Skin biopsy H&E", meta: "₹1,200" }, { name: "DIF", meta: "₹3,500" }], details: [{ label: "TAT", value: "5 days" }] },
    { id: "l3", name: "SRL Diagnostics", subtitle: "Pathology · imaging", icon: lab, tags: ["TAT 24h"], phone: "+91 80000 66666", whatsapp: true, email: "hyd@srl.in", address: "Ameerpet", cta: "Order test",
      offers: [{ name: "Vitamin D", meta: "₹900" }, { name: "Thyroid profile", meta: "₹600" }], offersLabel: "Tests & rates" },
  ],
  Suppliers: [
    { id: "v1", name: "MedPlus Distribution", subtitle: "Pharma distributor", icon: bld, tags: ["Net 30", "Primary"], phone: "+91 70000 77777", whatsapp: true, email: "orders@medplus.in", address: "Balanagar", cta: "Reorder", offersLabel: "Supplies",
      offers: [{ name: "Pantoprazole 40mg", meta: "₹4.2 / strip" }, { name: "Doxycycline 100mg", meta: "₹6.0 / strip" }], details: [{ label: "Payment terms", value: "Net 30" }, { label: "Lead time", value: "2 days" }, { label: "Rep", value: "Suresh · +91 70000 70000" }], activity: ["PO #142 delivered — 10 Jun", "Reorder due: Pantoprazole (8 left)"] },
    { id: "v2", name: "Cosmeceutica Co.", subtitle: "Skincare brands", icon: bld, tags: ["Aesthetics"], phone: "+91 70000 88888", email: "sales@cosmeceutica.in", address: "Gachibowli", cta: "Reorder", offersLabel: "Supplies",
      offers: [{ name: "Sunscreen SPF50", meta: "₹220 / unit" }, { name: "Glycolic 6% cleanser", meta: "₹180 / unit" }] },
    { id: "v3", name: "DermaTech Equipment", subtitle: "Lasers · AMC", icon: bld, tags: ["AMC active"], phone: "+91 70000 99999", email: "service@dermatech.in", address: "Service: pan-India", cta: "Log ticket", details: [{ label: "AMC", value: "Valid till Mar 2027" }, { label: "Engineer", value: "Ravi · +91 70000 90000" }] },
  ],
  Contacts: [
    { id: "c1", name: "EcoClean", subtitle: "Biomedical waste", icon: <Icon name="trash-bin" tone="inherit" size={22} />, tags: ["Weekly pickup"], phone: "+91 60000 11111", details: [{ label: "Pickup", value: "Every Tue & Fri" }] },
    { id: "c2", name: "Star Health TPA", subtitle: "Insurance desk", icon: <Icon name="verified-badge" tone="inherit" size={22} />, tags: ["Cashless"], phone: "+91 60000 22222", email: "tpa@starhealth.in" },
    { id: "c3", name: "QuickPrint", subtitle: "Printing · stationery", icon: <Icon name="printer" tone="inherit" size={22} />, phone: "+91 60000 33333", whatsapp: true },
  ],
};
