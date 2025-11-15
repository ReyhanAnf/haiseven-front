"use client";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

export const MovingBorderButton = ({
  borderRadius = "12px",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration = "2s",
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <Component
      className={cn(
        "bg-transparent relative text-xl p-[1px] overflow-hidden",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 opacity-[0.8] bg-[radial-gradient(var(--grad-blue-start)_40%,transparent_60%)]",
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative bg-white border border-slate-200 backdrop-blur-xl text-slate-900 flex items-center justify-center w-full h-full text-sm antialiased",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export const MovingBorder = ({
  children,
  duration = "2000ms",
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: string;
  rx?: string;
  ry?: string;
  [key: string]: any;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          animation: `move ${duration} linear infinite`,
        }}
      >
        {children}
      </div>
    </>
  );
};
