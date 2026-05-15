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

export type GroupBy = "alpha" | "form" | "attention";

export type Med = {
  id: string;
  name: string;
  category: MedCategory;
  form: MedForm;
  invoiceNo: string;
  batch: string;
  packPrice: number;
  packMrp: number;
  unitsPerPack: number;
  unitPrice: number;
  unitsInStock: number;
  expiry: string; // YYYY-MM
  discountPct: number;
  gstPct: number;
};
