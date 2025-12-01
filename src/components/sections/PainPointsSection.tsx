"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef } from "react";

const painPoints = [
  "J'ai payé mais je n'ai jamais reçu le produit",
  "L'acheteur a disparu après avoir reçu le colis",
  "Je ne fais plus confiance aux achats en ligne",
  "Le produit reçu ne correspondait pas à l'annonce",
];

export function PainPointsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="pain-points"
      ref={ref}
      className="section-padding bg-[#0a110e] text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0a9066] to-transparent" />

      <div className="container-bloko">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading mb-4">
            Cela vous est-il déjà arrivé ?
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#0a110e]/50 border border-[#0a9066]/20 hover:border-[#0a9066]/50 transition-all duration-300 hover:bg-[#0a110e]/70">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#0a9066]/20 flex items-center justify-center group-hover:bg-[#0a9066]/30 transition-colors">
                    <Check className="h-5 w-5 text-[#0a9066]" strokeWidth={3} />
                  </div>
                </div>
                <p className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                  {point}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-[#88cfbb] text-lg md:text-xl">
            Ces situations vous parlent ? Racontez-nous !
          </p>
        </motion.div>
      </div>
    </section>
  );
}
