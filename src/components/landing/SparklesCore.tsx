import { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SparklesCore = ({
  id,
  background,
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = "#FFF",
  className,
  style,
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement as HTMLElement;
        setSize({
          width: parent?.offsetWidth || window.innerWidth,
          height: parent?.offsetHeight || window.innerHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const noise3D = createNoise3D();
    let animationId: number;
    let time = 0;

    // Configuration
    const particleCount = size.width * size.height / (10000 / particleDensity);
    const particleArray: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      maxLife: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particleArray.push({
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        size: minSize + Math.random() * (maxSize - minSize),
        speedX: Math.random() * 0.2 - 0.1,
        speedY: Math.random() * 0.2 - 0.1,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, size.width, size.height);
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size.width, size.height);
      }

      time += 0.003;

      particleArray.forEach((particle) => {
        particle.life += 0.2;
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * size.width;
          particle.y = Math.random() * size.height;
        }

        // Use noise to affect movement
        const noiseValue = noise3D(
          particle.x * 0.01,
          particle.y * 0.01,
          time
        );

        particle.x += particle.speedX + noiseValue * 0.5;
        particle.y += particle.speedY + noiseValue * 0.5;

        // Keep particles within bounds
        if (particle.x > size.width) particle.x = 0;
        if (particle.x < 0) particle.x = size.width;
        if (particle.y > size.height) particle.y = 0;
        if (particle.y < 0) particle.y = size.height;

        // Calculate opacity based on lifetime
        const opacity = Math.min(
          1,
          Math.min(
            particle.life / 20,
            (particle.maxLife - particle.life) / 20
          )
        );

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [size, minSize, maxSize, particleDensity, particleColor, background]);

  return (
    <canvas
      id={id}
      ref={canvasRef}
      width={size.width}
      height={size.height}
      className={className}
      style={style}
    />
  );
};
