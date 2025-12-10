"use client";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, FileText, BookUser, BookText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SideBar = ({ children }) => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard size={100}/> },
    { href: "/customer", label: "Customer", icon: <BookUser  size={100}/> },
    { href: "/proposal/all-proposal", label: "Propsals", icon: <BookText /> },
    { href: "/invoice", label: "Invoice", icon: <FileText size={100}/> },
  ];

  return (
    <div className="flex min-h-screen">
      <div
        className={`bg-white border-r text-black p-4 flex flex-col transition-all duration-300 ease-in-out ${
          open ? "w-60" : "w-20"
        }`}
      >
        <div className="flex items-center justify-center mb-6">
          {open && <h1 className="text-2xl font-bold grow">Promizone</h1>}
          <Button
            // variant="ghost"
            onClick={() => setOpen(!open)}
            className="hover:bg-black/60"
          >
            <Menu size={30}/>
          </Button>
        </div>
        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="justify-start gap-4 hover:bg-zinc-700 p-6 hover:text-white"
            >
              <Link href={link.href} className="flex items-center">
                {link.icon}
                {open && <span className="ml-4">{link.label}</span>}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default SideBar;
