import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface WorkspaceCardProps {
  children: React.ReactNode;
}

export function WorkspaceCard({ children }: WorkspaceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 180, damping: 28 });
  const springY = useSpring(rotY, { stiffness: 180, damping: 28 });

  const glowOpacity = useSpring(0, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / rect.height) * -10);
    rotY.set(((e.clientX - cx) / rect.width) * 10);
    glowOpacity.set(1);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
    glowOpacity.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => setIsHovered(true);

  // Dynamic spotlight based on mouse position
  const spotX = useTransform(springY, [-10, 10], ["20%", "80%"]);
  const spotY = useTransform(springX, [-10, 10], ["20%", "80%"]);

  return (
    <div style={{ perspective: "1400px", perspectiveOrigin: "center" }}>
      <motion.div
        ref={cardRef}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
          position: "relative",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Outer glow ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 28,
            opacity: glowOpacity,
            background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.5), rgba(99,102,241,0.5))",
            backgroundSize: "200% 200%",
            animation: "gradientShift 4s ease infinite",
            zIndex: -1,
          }}
        />

        {/* Main panel */}
        <div
          style={{
            borderRadius: 24,
            background: "rgba(8, 8, 16, 0.88)",
            border: "1px solid rgba(99,102,241,0.18)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            boxShadow: isHovered
              ? "0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.12), inset 0 0 80px rgba(0,0,0,0.5)"
              : "0 24px 80px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.4s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dynamic spotlight */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              background: useTransform(
                [spotX, spotY],
                ([x, y]) =>
                  `radial-gradient(circle 300px at ${x} ${y}, rgba(99,102,241,0.07) 0%, transparent 60%)`
              ),
              pointerEvents: "none",
              opacity: glowOpacity,
              zIndex: 1,
            }}
          />

          {/* Scan line sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
              animation: "scanH 4s ease-in-out infinite",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Corner accents */}
          {[
            { top: 0, left: 0, borderTop: "2px solid", borderLeft: "2px solid" },
            { top: 0, right: 0, borderTop: "2px solid", borderRight: "2px solid" },
            { bottom: 0, left: 0, borderBottom: "2px solid", borderLeft: "2px solid" },
            { bottom: 0, right: 0, borderBottom: "2px solid", borderRight: "2px solid" },
          ].map((style, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 20,
                height: 20,
                borderColor: "rgba(99,102,241,0.5)",
                pointerEvents: "none",
                zIndex: 3,
                ...style,
              }}
            />
          ))}

          {/* Top status bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(99,102,241,0.03)",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.7 }} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.68rem",
                color: "rgba(99,102,241,0.6)",
                letterSpacing: "0.12em",
              }}
            >
              COPYCLOUD://SECURE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  animation: "pulse 2s ease infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.65rem",
                  color: "#22c55e",
                  letterSpacing: "0.1em",
                }}
              >
                LIVE
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10 }}>
            {children}
          </div>
        </div>

        <style>{`
          @keyframes scanH {
            0% { transform: translateY(0); opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 0.4; }
            100% { transform: translateY(600px); opacity: 0; }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
