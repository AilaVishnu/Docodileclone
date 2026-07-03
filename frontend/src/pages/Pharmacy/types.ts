export type MedForm =
  | "tablet"
  | "syrup"
  | "cream"
  | "spray"
  | "soap"
  | "serum"
  | "drops"
  | "ointment";

export type MedCategory =
  | "Acne & skin"
  | "Cleansers & soaps"
  | "Topicals"
  | "Tablets"
  | "Serums & boosters";

// Grid/shelf grouping axes. Sorting in the list view is handled by the column
// headers, and "needs attention" is now a filter — neither is a grouping.
export type GroupBy = "form" | "category" | "none";

export type Med = {
  id: string;
  name: string;
  category: MedCategory;
  form: MedForm;
  invoiceNo: string;
  batch: string;
  supplier?: string;
  packPrice: number;
  packMrp: number;
  unitsPerPack: number;
  unitPrice: number;
  unitsInStock: number;
  expiry: string; // YYYY-MM
  discountPct: number;
  gstPct: number;
};
