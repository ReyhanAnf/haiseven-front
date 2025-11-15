"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useId, useState } from "react";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  children?: React.ReactNode;
}

export const SparklesCore = (props: SparklesProps) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    particleDensity,
    particleColor,
  } = props;
  const [init, setInit] = useState(false);

  useEffect(() => {
    setInit(true);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {init && <Particles id={id} {...props} />}
    </div>
  );
};

interface ParticlesProps extends SparklesProps {
  id?: string;
}

const Particles = ({
  id,
  background,
  minSize = 1,
  maxSize = 3,
  particleDensity = 100,
  particleColor = "#FFF",
}: ParticlesProps) => {
  const canvasId = useId();
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      growing: boolean;
    }>
  >([]);

  useEffect(() => {
    const canvas = document.getElementById(
      id || canvasId
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    const createParticles = () => {
      const newParticles = [];
      for (let i = 0; i < particleDensity; i++) {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          growing: Math.random() > 0.5,
        });
      }
      setParticles(newParticles);
    };

    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.growing) {
          particle.opacity += 0.01;
          if (particle.opacity >= 1) particle.growing = false;
        } else {
          particle.opacity -= 0.01;
          if (particle.opacity <= 0.3) particle.growing = true;
        }

        if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > height) particle.speedY *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [particles]);

  return (
    <canvas
      id={id || canvasId}
      className="absolute inset-0 h-full w-full"
      style={{
        background: background || "transparent",
      }}
    ></canvas>
  );
};
