"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/supabase-context";
import { Icons } from "@/components/ui/icons";

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useSupabase();

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">AI ideation</span>
        </Link>

        <nav className="flex items-center space-x-6">
          {loading ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="default"
                onClick={() => router.push('/dashboard/profile')}
              >
                My Profile
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push('/signin')}
              >
                Sign In
              </Button>
              <Button
                variant="default"
                onClick={() => router.push('/signup')}
              >
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
