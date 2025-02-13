"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import "../app/globals.css";

export default function Layout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <html lang="en">
      <body className="main-container">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen w-full text-3xl font-bold">
            Loading... Please wait
          </div>
        ) : (
          <>
            <Navbar />
            <Sidebar />
            <div className="content-wrapper">{children}</div>
          </>
        )}
      </body>
    </html>
  );
}
