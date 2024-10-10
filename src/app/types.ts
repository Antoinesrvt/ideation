export type Offer = {
  id: number;
  title: string;
  description: string;
  type: "one-time" | "recurring";
  price: number | "open";
  company: string;
};