"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
export function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById("pain-points");
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a110e] to-[#0a110e]/95 text-white overflow-hidden"
    >
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a9066_1px,transparent_1px),linear-gradient(to_bottom,#0a9066_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      </div>

      <div className="container-bloko relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-heading leading-tight max-w-4xl"
          >
            Vous avez déjà perdu de l&apos;argent
            <br />
            <span className="text-gradient-bloko">
              dans un achat en ligne ?
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-[#88cfbb] max-w-2xl"
          >
            Vous n&apos;êtes pas seuls, aidez-nous à construire la solution
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#88cfbb] cursor-pointer"
          onClick={scrollToNext}
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
