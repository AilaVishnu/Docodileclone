import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillPrint } from "./BillPrint";
import { colors, fonts } from "../../styles/theme";

// Sage monogram standing in for the clinic logo (clinics pass their own).
const Logo = (
  <div style={{ width: 56, height: 56, borderRadius: 14, background: colors.secondary100, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.family.secondary, fontSize: 26, color: colors.secondary700 }}>
    T
  </div>
);

const TSKIN = {
  name: "TSKIN Dermatology Clinic",
  address: "23-73/1, 1st floor, Anandbagh, Opp Cinepolis, Malkajgiri, Hyderabad, 500047",
  phone: "8639638549",
  instagram: "tskin_clinic",
  email: "tskinhyderabad@gmail.com",
  logo: Logo,
};

const meta = {
  title: "Components/BillPrint",
  component: BillPrint,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ background: colors.neutral200, padding: 32, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}><Story /></div>
      </div>
    ),
  ],
} satisfies Meta<typeof BillPrint>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
  clinic: TSKIN,
  patient: { name: "Vishnu", age: 20, gender: "M", mobile: "7780187019", id: "T1104" },
  invoiceNo: "2085",
  billDate: "23 Jun 2026 · 1:41 PM",
};

/** Services only, paid in full (the sample bill). */
export const ServicesPaid: Story = {
  args: {
    ...base,
    status: "paid",
    items: [{ name: "Chemical peel for underarms/neck", qty: 1, price: 3000 }],
    paymentMode: "Cash",
  },
};

/** A pharmacy bill — medicines only, paid. */
export const PharmacyPaid: Story = {
  args: {
    ...base,
    invoiceNo: "2091",
    patient: { name: "Imran Khan", age: 41, gender: "M", mobile: "9000012345", id: "T1142" },
    status: "paid",
    items: [
      { name: "Cetirizine 10mg", qty: 10, price: 12, kind: "medicine" },
      { name: "Mometasone cream 0.1% (15g)", qty: 1, price: 240, kind: "medicine" },
      { name: "Sunscreen gel SPF 50 (50g)", qty: 1, price: 650, kind: "medicine" },
    ],
    paymentMode: "UPI",
  },
};

/** Mixed bill — services + medicines, grouped into sections. */
export const MixedPaid: Story = {
  args: {
    ...base,
    invoiceNo: "2093",
    patient: { name: "Priya Nair", age: 29, gender: "F", mobile: "9849098490", id: "T1150" },
    status: "paid",
    items: [
      { name: "Consultation", qty: 1, price: 600, kind: "service" },
      { name: "Acne extraction", qty: 1, price: 1500, kind: "service" },
      { name: "Doxycycline 100mg", qty: 14, price: 9, kind: "medicine" },
      { name: "Benzoyl peroxide gel (20g)", qty: 1, price: 320, kind: "medicine" },
    ],
    gstAmount: 0,
    paymentMode: "Card",
  },
};

/** Partially paid — mixed bill with a discount, GST and an outstanding balance. */
export const PartiallyPaid: Story = {
  args: {
    ...base,
    invoiceNo: "2086",
    patient: { name: "Anjali Reddy", age: 34, gender: "F", mobile: "9849012345", id: "T1188", address: "Kompally, Hyderabad" },
    status: "due",
    referredBy: "Dr. Mehta",
    items: [
      { name: "Consultation", qty: 1, price: 600, kind: "service" },
      { name: "Laser hair reduction — full face", qty: 1, price: 5000, discount: 500, kind: "service" },
      { name: "Sunscreen SPF 50 (50g)", qty: 2, price: 650, kind: "medicine" },
    ],
    gstAmount: 234,
    paymentMode: "UPI",
    received: 4000,
  },
};

/** Refunded — bill was paid, then refunded. */
export const Refunded: Story = {
  args: {
    ...base,
    invoiceNo: "2079",
    patient: { name: "Lakshmi Iyer", age: 52, gender: "F", mobile: "9000056789", id: "T1099" },
    status: "refunded",
    items: [{ name: "Lab — CBC panel", qty: 1, price: 600, kind: "service" }],
    paymentMode: "UPI",
  },
};

/** Waived — charge forgiven; nothing collected, no balance. */
export const Waived: Story = {
  args: {
    ...base,
    invoiceNo: "2071",
    patient: { name: "Anil Kumar", age: 60, gender: "M", mobile: "9000033333", id: "T1077" },
    status: "waived",
    items: [{ name: "Follow-up consultation", qty: 1, price: 500, kind: "service" }],
  },
};
