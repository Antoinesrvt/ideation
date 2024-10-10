import { Offer } from "../types";
import { useRef, useEffect } from "react";

interface OfferModalProps {
  offer: Offer;
  onClose: () => void;
}

export default function OfferModal({ offer, onClose }: OfferModalProps) {
  // const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleContactClick = () => {
    // setIsContactFormOpen(true);
    // Here you would typically open a contact form or initiate an email
    console.log("Contact button clicked");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{offer.title}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Company</p>
              <p className="font-medium">{offer.company}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium capitalize">{offer.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-medium">
                {typeof offer.price === "number"
                  ? `$${offer.price}`
                  : "Open to offers"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Quantity</p>
              <p className="font-medium">
                {offer.quantity} {offer.unit}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">{offer.location}</p>
            </div>
            <div>
              <p className="text-gray-600">Available</p>
              <p className="font-medium">
                {offer.availableFrom} to {offer.availableUntil}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Description</p>
            <p className="mt-1">{offer.description}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Certifications</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {offer.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <p>{offer.contactPerson}</p>
            <p>{offer.contactEmail}</p>
            <button
              onClick={handleContactClick}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Contact Business
            </button>
          </div>
        </div>
        <div className="bg-gray-100 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleContactClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Contact Business
          </button>
        </div>
      </div>
    </div>
  );
}
