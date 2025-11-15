import { cn } from "@/lib/utils";
import React from "react";

export const GridBackground = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn("h-full w-full bg-white bg-grid-slate-200/60 relative", className)}>
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
};

export const DotBackground = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn("h-full w-full bg-white bg-dot-slate-300/50 relative", className)}>
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
};
