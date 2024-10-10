"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Offer = {
  id: number;
  title: string;
  description: string;
  type: "one-time" | "recurring";
  price: number | "open";
  company: string;
  status: "active" | "pending" | "completed";
};

const OfferList: Offer[] =
  [
    {
      id: 1,
      title: "Surplus Office Furniture",
      description: "Gently used office chairs and desks available",
      type: "one-time",
      price: 500,
      company: "TechCorp Inc.",
      status: "active",
    },
    {
      id: 2,
      title: "Monthly Paper Waste",
      description: "Approximately 500kg of paper waste available monthly",
      type: "recurring",
      price: "open",
      company: "PrintMaster Ltd.",
      status: "pending",
    },
    {
      id: 3,
      title: "Electronic Waste Disposal",
      description: "Various electronic components and devices for recycling",
      type: "one-time",
      price: 250,
      company: "GreenTech Solutions",
      status: "completed",
    },
    {
      id: 4,
      title: "Weekly Food Surplus",
      description: "Excess produce and packaged foods from our cafeteria",
      type: "recurring",
      price: "open",
      company: "MegaCorp Enterprises",
      status: "active",
    },
  ]


export default function Offers() {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "completed">("all");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const filteredOffers = OfferList.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="bg-white border-b p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          <Select
            value={statusFilter}
            onValueChange={(
              value: "all" | "active" | "pending" | "completed"
            ) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container mx-auto p-2 h-full">
        {/* Offers list and details */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Offers list */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedOffer?.id === offer.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedOffer(offer)}
              >
                <h3 className="font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-500">{offer.company}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">{offer.type}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      offer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : offer.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Offer details */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            {selectedOffer ? (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedOffer.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {selectedOffer.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold">Type</h3>
                    <p>{selectedOffer.type}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Price</h3>
                    <p>
                      {selectedOffer.price === "open"
                        ? "Open to offers"
                        : `$${selectedOffer.price}`}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Company</h3>
                    <p>{selectedOffer.company}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <p>{selectedOffer.status}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Contact Seller
                  </button>
                  <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50">
                    Save for Later
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select an offer to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}