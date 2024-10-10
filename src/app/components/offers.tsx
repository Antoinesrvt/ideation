"use client";

import { useState } from "react";
import {
  ChevronDown,
  Paperclip,
  Send,
  Bell,
  Sidebar, // Add this import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Offer = {
  id: string;
  title: string;
  company: string;
  date: string;
  status: "active" | "pending" | "completed";
};

type Message = {
  id: string;
  sender: "user" | "client";
  content: string;
  timestamp: string;
};

const offers: Offer[] = [
  {
    id: "1",  
      title: "Recyclable Plastic Surplus",
      company: "EcoPlast Inc.",
      date: "14/06",
      status: "active",
    },
    {
      id: "2",
      title: "Monthly Paper Waste Collection",
      company: "PaperCycle Ltd.",
      date: "04/06",
      status: "pending",
    },
    {
      id: "3",
      title: "Electronic Waste Disposal",
      company: "TechRecycle",
      date: "26/05",
      status: "completed",
    },
    {
      id: "4",
      title: "Organic Waste for Composting",
      company: "GreenEarth Farms",
      date: "13/05",
      status: "active",
    },
    {
      id: "5",
      title: "Industrial Metal Scrap",
      company: "MetalWorks Co.",
      date: "05/05",
      status: "pending",
    },
  ];

export default function OffersPage() {


  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(offers[0]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "client",
      content:
        "Hello, I'm interested in your recyclable plastic surplus. Can you provide more details about the types of plastic and quantities available?",
      timestamp: "06/03/2023 15:56",
    },
    {
      id: "2",
      sender: "user",
      content:
        "We have a mix of HDPE and PET plastics, approximately 500kg each. The materials are clean and sorted. Would you like to schedule a pickup or delivery?",
      timestamp: "06/03/2023 16:10",
    },
    {
      id: "3",
      sender: "client",
      content:
        "That sounds great. Could we arrange a pickup for next Tuesday or Wednesday morning?",
      timestamp: "06/03/2023 16:15",
    },
    {
      id: "4",
      sender: "user",
      content:
        "Absolutely, we can arrange that. Tuesday morning works best for us. Can you provide your email so I can send you a confirmation and the necessary paperwork?",
      timestamp: "06/03/2023 16:20",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const [showSidebar, setShowSidebar] = useState(true);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          sender: "user",
          content: newMessage,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Left Sidebar - Offer List */}
      <div className="w-64 bg-white border-r overflow-auto">
        <div className="p-4 border-b">
          <Input
            type="search"
            placeholder="Search offers..."
            className="w-full"
            // startDecorator={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Actives <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem>All Offers</DropdownMenuItem>
            <DropdownMenuItem>Active</DropdownMenuItem>
            <DropdownMenuItem>Pending</DropdownMenuItem>
            <DropdownMenuItem>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedOffer?.id === offer.id ? "bg-blue-50" : ""
            }`}
            onClick={() => setSelectedOffer(offer)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-500">{offer.company}</p>
              </div>
              <span className="text-sm text-gray-400">{offer.date}</span>
            </div>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
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

      {/* Main Content - Chat */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Client" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h2 className="font-semibold">{selectedOffer?.company}</h2>
              <p className="text-sm text-gray-500">{selectedOffer?.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
              <Sidebar className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
              <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 bg-white border-t">
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Offer Details */}
      {showSidebar && selectedOffer && (
        <div className="w-64 bg-white border-l overflow-auto">
          <div className="p-4 border-b">
            <Avatar className="h-16 w-16 mx-auto">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <h2 className="text-center font-semibold mt-2">John Doe</h2>
            <p className="text-center text-sm text-gray-500">
              EcoWaste Solutions
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              No current mission
            </p>
          </div>
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-2">EcoWaste Solutions</h3>
            <p className="text-sm text-gray-600 mb-1">1 employee</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Payment Status:</span> Pending
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Payment cannot be completed. Please update your company details in
              the settings.
            </p>
          </div>
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-2">Current Activity</h3>
            <p className="text-sm text-gray-600">0 active offers</p>
          </div>
          <div className="p-4">
            <Button className="w-full mb-2">Accept Offer</Button>
            <Button variant="outline" className="w-full">
              Decline Offer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
