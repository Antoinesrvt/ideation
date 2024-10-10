"use client";

import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from './Sidebar';

const TopBar = () => {
  const [newOffer, setNewOffer] = React.useState({
    title: "",
    description: "",
    type: "one-time",
    priceType: "fixed", // New field to track price type
    price: "", // Changed to string to handle both number input and "open" state
    company: "",
  });

  const handleAddOffer = () => {
    // Here you would typically send the new offer to your backend
    console.log("New offer:", newOffer);
    // Reset the form
    setNewOffer({
      title: "",
      description: "",
      type: "one-time",
      priceType: "fixed",
      price: "",
      company: "",
    });
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <Sidebar isMobile />
        <h1 className="text-2xl font-semibold ml-4">Waste Marketplace</h1>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Offer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
            <DialogDescription>
              Create a new waste or surplus offer for other businesses.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Offer Type</Label>
              <RadioGroup
                value={newOffer.type}
                onValueChange={(value) => setNewOffer({ ...newOffer, type: value as "one-time" | "recurring" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time">One-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring">Recurring</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Select
                value={newOffer.priceType}
                onValueChange={(value) => setNewOffer({ ...newOffer, priceType: value, price: value === "open" ? "open" : "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="open">Open to Offers</SelectItem>
                </SelectContent>
              </Select>
              {newOffer.priceType === "fixed" && (
                <Input
                  type="number"
                  value={newOffer.price}
                  onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={newOffer.company}
                onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button onClick={handleAddOffer}>Add Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default TopBar;