// components/GradientCursor.tsx
"use client";

import { useEffect } from "react";

export const GradientCursor = () => {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className =
      "fixed w-64 h-64 rounded-full pointer-events-none mix-blend-multiply filter blur-xl opacity-30 bg-gradient-to-r from-cypher-secondary to-cypher-accent";
    document.body.appendChild(cursor);

    const moveCursor = (e: MouseEvent) => {
      cursor.style.left = e.clientX - 128 + "px";
      cursor.style.top = e.clientY - 128 + "px";
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  return null;
};
