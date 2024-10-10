import { Offer } from "../types";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
}

export default function OfferCard({ offer, onClick }: OfferCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2">{offer.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{offer.company}</p>
      <p className="text-sm mb-2">{offer.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">
          {typeof offer.price === "number"
            ? `$${offer.price}`
            : "Open to offers"}
        </span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {offer.type}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>
          {offer.quantity} {offer.unit}
        </p>
        <p>{offer.location}</p>
      </div>
    </div>
  );
}
