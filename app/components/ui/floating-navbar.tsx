"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 1,
        y: 0,
      }}
      className={cn(
        "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-slate-200 rounded-full bg-white shadow-lg z-[5000] px-4 py-2 items-center justify-center space-x-2",
        className
      )}
    >
      {navItems.map((navItem, idx) => (
        <Link
          key={`link-${idx}`}
          href={navItem.link}
          className={cn(
            "relative text-slate-700 items-center flex space-x-1 hover:text-slate-900 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
          )}
        >
          <span className="block sm:hidden">{navItem.icon}</span>
          <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
        </Link>
      ))}
    </motion.div>
  );
};
