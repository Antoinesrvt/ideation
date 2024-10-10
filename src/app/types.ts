export type Offer = {
  id: number;
  title: string;
  description: string;
  type: "one-time" | "recurring";
  price: number | "open";
  company: string;
  quantity: number;
  unit: string;
  location: string;
  availableFrom: string;
  availableUntil: string;
  certifications: string[];
  contactPerson: string;
  contactEmail: string;
};
