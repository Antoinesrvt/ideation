import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{offer.title}</CardTitle>
        <CardDescription>{offer.company}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
        <p className="font-semibold">
          Type: <span className="font-normal">{offer.type}</span>
        </p>
        <p className="font-semibold">
          Price:{" "}
          <span className="font-normal">
            {offer.price === "open" ? "Open to offers" : `$${offer.price}`}
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Contact Seller</Button>
      </CardFooter>
    </Card>
  );
};

export default OfferCard;