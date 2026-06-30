import type { ClinicBill } from "./BillsView";

// Storybook fixture for BillsView only. The live Bills page now self-fetches
// from GET /api/tenant/bills (listClinicBills); this static set is used solely
// by the stories so they render without the network.
const B = (p: Partial<ClinicBill>): ClinicBill => ({
  id: p.invoiceNo!, invoiceNo: "", billDate: "", billed: 0, paid: 0, due: 0, refund: 0,
  depositApplied: null, payStatus: null, paymentMethod: null, items: null, appointmentId: null,
  createdAt: "", patientName: "", ...p,
}) as ClinicBill;

// Build the `items` JSON line-item snapshot (the shape BillModal writes at Charge
// & Bill, and BillReadModal reads back). qty × unit sums to the bill's `billed`.
const it = (...rows: [string, number, number][]) =>
  JSON.stringify(rows.map(([name, qty, unit]) => ({ name, qty, unit, gst: 0, disc: 0, discUnit: "₹", kind: "service" })));

export const sampleBills: ClinicBill[] = [
  B({ patientName: "Ramesh Babu", invoiceNo: "INV-2026-0042", billDate: "2026-06-24", billed: 1850, paid: 1850, due: 0, paymentMethod: "UPI", today: true, items: it(["Consultation", 1, 500], ["Dressing", 1, 350], ["Antibiotics course", 1, 1000]) }),
  B({ patientName: "Sunita Rao", invoiceNo: "INV-2026-0041", billDate: "2026-06-24", billed: 3200, paid: 1500, due: 1700, paymentMethod: "Card", today: true, items: it(["Consultation", 1, 600], ["Minor procedure — wound dressing", 1, 2000], ["Dressing kit", 2, 300]) }),
  B({ patientName: "Imran Khan", invoiceNo: "INV-2026-0040", billDate: "2026-06-24", billed: 600, paid: 600, due: 0, paymentMethod: "Cash", today: true, items: it(["Consultation", 1, 600]) }),
  B({ patientName: "Priya Nair", invoiceNo: "INV-2026-0039", billDate: "2026-06-24", billed: 2400, paid: 0, due: 2400, paymentMethod: null, today: true, items: it(["Consultation", 1, 600], ["Minor procedure", 1, 1800]) }),
  B({ patientName: "Arjun Mehta", invoiceNo: "INV-2026-0038", billDate: "2026-06-23", billed: 900, paid: 900, due: 0, paymentMethod: "UPI", items: it(["Consultation", 1, 500], ["Suture removal", 1, 400]) }),
  B({ patientName: "Fatima Sheikh", invoiceNo: "INV-2026-0037", billDate: "2026-06-23", billed: 4500, paid: 2000, due: 2500, paymentMethod: "Card", items: it(["Consultation", 1, 500], ["Ear lobe repair", 1, 4000]) }),
  B({ patientName: "Vikram Singh", invoiceNo: "INV-2026-0036", billDate: "2026-06-22", billed: 1200, paid: 1200, due: 0, paymentMethod: "Cash", items: it(["Consultation", 1, 600], ["Dressing", 1, 600]) }),
  B({ patientName: "Lakshmi Iyer", invoiceNo: "INV-2026-0035", billDate: "2026-06-21", billed: 800, paid: 800, due: 0, refund: 200, paymentMethod: "UPI", items: it(["Lab — CBC panel", 1, 600], ["Paracetamol 650mg", 1, 200]) }),
  B({ patientName: "Meena Joshi", invoiceNo: "INV-2026-0034", billDate: "2026-06-20", billed: 500, paid: 0, due: 0, payStatus: "WAIVED", paymentMethod: "Waive", items: it(["Follow-up consultation", 1, 500]) }),
];
