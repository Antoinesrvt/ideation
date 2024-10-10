"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OfferCard from "./OfferCard";
import { Offer } from '../types';

const Offers: Offer[] = [
  {
    id: 1,
    title: "Surplus Office Furniture",
    description: "Gently used office chairs and desks available",
    type: "one-time",
    price: 500,
    company: "TechCorp Inc.",
  },
  {
    id: 2,
    title: "Monthly Paper Waste",
    description: "Approximately 500kg of paper waste available monthly",
    type: "recurring",
    price: "open",
    company: "PrintMaster Ltd.",
  },
  {
    id: 3,
    title: "Electronic Waste Disposal",
    description: "Various electronic components and devices for recycling",
    type: "one-time",
    price: 250,
    company: "GreenTech Solutions",
  },
  {
    id: 4,
    title: "Weekly Food Surplus",
    description: "Excess produce and packaged foods from our cafeteria",
    type: "recurring",
    price: "open",
    company: "MegaCorp Enterprises",
  },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "one-time" | "recurring">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "fixed" | "open">("all");

  const filteredOffers = Offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || offer.type === typeFilter;
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "fixed" && typeof offer.price === "number") ||
      (priceFilter === "open" && offer.price === "open");
    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <>
      {/* Filters and search */}
      <div className="bg-white border-b p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          <Select
            value={typeFilter}
            onValueChange={(value: "all" | "one-time" | "recurring") => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="recurring">Recurring</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priceFilter}
            onValueChange={(value: "all" | "fixed" | "open") => setPriceFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="open">Open to Offers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Offer grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </>
  );
}