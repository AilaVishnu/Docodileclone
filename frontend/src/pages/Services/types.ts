export type DiscountMode = "%" | "₹";

export type Service = {
  id: string;
  name: string;
  code: string;
  price: number;
  duration: number;
  discount: number;
  discountMode: DiscountMode;
  gst: number;
};
