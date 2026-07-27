"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

interface DropdownItem {
  title: string;
  href: string;
}

interface NavDropdownProps {
  title: string;
  items: DropdownItem[];
}

export function NavDropdown({ title, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">
        {title}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`absolute left-0 top-full pt-1 z-50 min-w-max transition-opacity duration-150 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <ul className="bg-white border border-gray-200 rounded-md shadow-md p-1.5 grid gap-0.5">
          {items.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="block px-3 py-2 text-sm rounded-sm hover:bg-gray-100 whitespace-nowrap transition-colors"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
