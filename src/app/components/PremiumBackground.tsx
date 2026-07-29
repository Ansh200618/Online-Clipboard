import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function PremiumBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const ox1 = useSpring(useMotionValue(0), { stiffness: 25, damping: 30 });
  const oy1 = useSpring(useMotionValue(0), { stiffness: 25, damping: 30 });
  const ox2 = useSpring(useMotionValue(0), { stiffness: 15, damping: 25 });
  const oy2 = useSpring(useMotionValue(0), { stiffness: 15, damping: 25 });
  const ox3 = useSpring(useMotionValue(0), { stiffness: 10, damping: 20 });
  const oy3 = useSpring(useMotionValue(0), { stiffness: 10, damping: 20 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      mouseX.set(nx);
      mouseY.set(ny);
      ox1.set((nx - 0.5) * 80);
      oy1.set((ny - 0.5) * 80);
      ox2.set((nx - 0.5) * -55);
      oy2.set((ny - 0.5) * -55);
      ox3.set((nx - 0.5) * 40);
      oy3.set((ny - 0.5) * 40);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, background: "#030307" }}>
      {/* 3D grid floor */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-40%",
          right: "-40%",
          height: "80%",
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(600px) rotateX(72deg)",
          transformOrigin: "center bottom",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Top grid (subtle flat) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Orb 1 — indigo, top-left */}
      <motion.div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)",
          filter: "blur(60px)",
          x: ox1,
          y: oy1,
        }}
      />

      {/* Orb 2 — purple, bottom-right */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          filter: "blur(70px)",
          x: ox2,
          y: oy2,
        }}
      />

      {/* Orb 3 — blue, center */}
      <motion.div
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
          x: ox3,
          y: oy3,
        }}
      />

      {/* Floating code fragments */}
      {FRAGMENTS.map((f) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, f.opacity, 0], y: [10, -10, 10] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: f.top,
            left: f.left,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: f.size,
            fontWeight: 700,
            color: f.color,
            letterSpacing: "0.15em",
            pointerEvents: "none",
            userSelect: "none",
            textShadow: `0 0 20px ${f.color}`,
          }}
        >
          {f.text}
        </motion.div>
      ))}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3,3,7,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

const FRAGMENTS = [
  { id: 1, text: "6F3X9A", top: "12%", left: "7%", opacity: 0.18, duration: 7, delay: 0, size: "0.75rem", color: "rgba(99,102,241,0.7)" },
  { id: 2, text: "WIPE://24H", top: "22%", left: "88%", opacity: 0.14, duration: 9, delay: 1.5, size: "0.7rem", color: "rgba(168,85,247,0.6)" },
  { id: 3, text: "E2E", top: "68%", left: "5%", opacity: 0.16, duration: 8, delay: 2, size: "0.85rem", color: "rgba(99,102,241,0.6)" },
  { id: 4, text: "∅ NULL", top: "78%", left: "90%", opacity: 0.12, duration: 11, delay: 3, size: "0.72rem", color: "rgba(168,85,247,0.5)" },
  { id: 5, text: "TX:OK", top: "45%", left: "92%", opacity: 0.13, duration: 6, delay: 0.5, size: "0.72rem", color: "rgba(99,102,241,0.5)" },
  { id: 6, text: "AES", top: "85%", left: "14%", opacity: 0.1, duration: 10, delay: 4, size: "0.8rem", color: "rgba(56,189,248,0.4)" },
  { id: 7, text: "···", top: "35%", left: "3%", opacity: 0.2, duration: 5, delay: 1, size: "1rem", color: "rgba(99,102,241,0.4)" },
  { id: 8, text: "SHA-256", top: "55%", left: "87%", opacity: 0.1, duration: 12, delay: 2.5, size: "0.68rem", color: "rgba(168,85,247,0.4)" },
];
