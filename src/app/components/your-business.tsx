"use client";

import { useState } from "react";
import { Building2, Package, BarChart3, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BusinessInfo = {
  name: string;
  legalName: string;
  registrationNumber: string;
  address: string;
  offersProposed: number;
  offersMade: number;
  currentOffers: number;
};

export default function YourBusinessPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "EcoSolutions Inc.",
    legalName: "EcoSolutions Incorporated",
    registrationNumber: "REG123456789",
    address: "123 Green Street, Eco City, EC 12345",
    offersProposed: 15,
    offersMade: 8,
    currentOffers: 5,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically send the updated info to your backend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessInfo({
      ...businessInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Business</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offers Proposed
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {businessInfo.offersProposed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessInfo.offersMade}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Offers
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {businessInfo.currentOffers}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            View and edit your business information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                name="name"
                value={businessInfo.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                name="legalName"
                value={businessInfo.legalName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={businessInfo.registrationNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={businessInfo.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Information
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}