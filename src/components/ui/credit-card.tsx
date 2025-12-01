"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";

export function CreditCard() {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values pour la rotation 3D
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Springs pour des mouvements fluides
  const springRotateX = useSpring(rotateX, {
    stiffness: 300,
    damping: 30,
  });
  const springRotateY = useSpring(rotateY, {
    stiffness: 300,
    damping: 30,
  });

  // Effet de brillance qui suit la souris
  const glareX = useTransform(springRotateY, [-20, 20], ["0%", "100%"]);
  const glareY = useTransform(springRotateX, [-20, 20], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateYValue = (mouseX / (rect.width / 2)) * 15;
    const rotateXValue = -(mouseY / (rect.height / 2)) * 15;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="relative w-[340px] h-[214px] cursor-pointer"
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {/* La carte principale */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
          {/* Background avec gradient métallique */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black">
            {/* Pattern de fond subtil */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="card-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="20" cy="20" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#card-pattern)" />
              </svg>
            </div>

            {/* Effet holographique animé */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(10, 144, 102, 0.4) 0%, transparent 50%)`,
              }}
            />

            {/* Gradient overlay pour profondeur */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
          </div>

          {/* Contenu de la carte */}
          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Top section */}
            <div className="flex justify-between items-start">
              {/* Puce EMV dorée */}
              <div className="relative w-12 h-10">
                <svg
                  viewBox="0 0 48 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Contour de la puce */}
                  <rect
                    x="2"
                    y="2"
                    width="44"
                    height="36"
                    rx="4"
                    fill="url(#chip-gold)"
                    stroke="#B8860B"
                    strokeWidth="1"
                  />
                  {/* Lignes de la puce */}
                  <line
                    x1="12"
                    y1="10"
                    x2="36"
                    y2="10"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="36"
                    y2="15"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="12"
                    y1="20"
                    x2="36"
                    y2="20"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="12"
                    y1="25"
                    x2="36"
                    y2="25"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="12"
                    y1="30"
                    x2="36"
                    y2="30"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  {/* Lignes verticales */}
                  <line
                    x1="18"
                    y1="10"
                    x2="18"
                    y2="30"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="24"
                    y1="10"
                    x2="24"
                    y2="30"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />
                  <line
                    x1="30"
                    y1="10"
                    x2="30"
                    y2="30"
                    stroke="#8B7500"
                    strokeWidth="1"
                  />

                  {/* Gradient doré */}
                  <defs>
                    <linearGradient id="chip-gold" x1="0" y1="0" x2="0" y2="40">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#B8860B" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Reflet sur la puce */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded opacity-60" />
              </div>

              {/* Contactless icon */}
              <div className="flex flex-col items-end gap-1">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-70"
                >
                  <path
                    d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs text-white/50 font-light tracking-wider">
                  Contactless
                </span>
              </div>
            </div>

            {/* Numéro de carte */}
            <div className="space-y-3">
              <div className="flex gap-4 font-mono text-white text-xl tracking-[0.3em]">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  ••••
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  ••••
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  ••••
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="text-[#0a9066]"
                >
                  4567
                </motion.span>
              </div>
            </div>

            {/* Bottom section */}
            <div className="flex justify-between items-end">
              {/* Holder et expiry */}
              <div className="space-y-1">
                <div className="text-[9px] text-white/50 uppercase tracking-wider font-light">
                  Card Holder
                </div>
                <div className="text-sm text-white font-medium tracking-wider">
                  BLOKO USER
                </div>
                <div className="flex gap-4 mt-2">
                  <div>
                    <div className="text-[9px] text-white/50 uppercase tracking-wider">
                      Valid Thru
                    </div>
                    <div className="text-xs text-white font-mono">12/28</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-[#0a9066] flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-white/70 font-semibold">
                      SECURED
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo réseau (Visa style) */}
              <div className="flex flex-col items-end">
                <svg
                  width="60"
                  height="20"
                  viewBox="0 0 60 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Logo "BLOKO" stylisé */}
                  <text
                    x="0"
                    y="15"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="14"
                    fontWeight="700"
                    fill="white"
                    letterSpacing="1"
                  >
                    BLOKO
                  </text>
                  {/* Accent vert */}
                  <rect
                    x="0"
                    y="17"
                    width="60"
                    height="2"
                    fill="#0a9066"
                    rx="1"
                  />
                </svg>
                <span className="text-[8px] text-white/40 mt-1 tracking-wider">
                  PAYMENT NETWORK
                </span>
              </div>
            </div>
          </div>

          {/* Reflet global sur la carte */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Bordure lumineuse subtile */}
          <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
        </div>

        {/* Ombre portée dynamique */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(10, 144, 102, 0.4) 0%, rgba(136, 207, 187, 0.2) 100%)",
            transform: "translateZ(-20px) scale(0.95)",
          }}
        />
      </motion.div>

      {/* Particules flottantes autour de la carte */}
      <motion.div
        className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#0a9066]"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#88cfbb]"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </motion.div>
  );
}
