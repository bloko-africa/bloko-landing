"use client";

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle2, Zap } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Lock,
    title: "Fonds protégés",
    description:
      "Votre argent reste sécurisé jusqu'à confirmation de la transaction",
  },
  {
    icon: CheckCircle2,
    title: "Validation claire",
    description: "Processus transparent sans ambiguïté pour les deux parties",
  },
  {
    icon: Zap,
    title: "Libération automatique",
    description:
      "Les fonds sont libérés uniquement quand toutes les conditions sont remplies",
  },
];

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="section-padding bg-[#0a110e] text-white relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a9066_1px,transparent_1px),linear-gradient(to_bottom,#0a9066_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="container-bloko relative z-10">
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              {/* Animated rings */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-[#0a9066]"
              />
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full border-2 border-[#88cfbb]"
              />

              {/* Lock icon */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#0a9066] to-[#088558] rounded-full flex items-center justify-center shadow-2xl">
                <Lock className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-heading leading-tight max-w-3xl mx-auto"
          >
            Et si cela ne vous arrivait{" "}
            <span className="text-gradient-bloko">plus jamais ?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Nous construisons{" "}
            <strong className="text-[#0a9066] font-semibold">Bloko</strong> :
            une infrastructure de confiance qui protège acheteurs et vendeurs.
            Nous sécurisons les transactions à chaque étape et nous développons
            une stratégie pour lutter contre les arnaques en ligne.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-[#0a110e] border-[#0a9066]/20 hover:border-[#0a9066]/50 transition-all duration-300 p-8 h-full group hover:bg-[#0a110e]/70">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-[#0a9066]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0a9066]/20 transition-colors">
                    <feature.icon
                      className="w-7 h-7 text-[#0a9066]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-xl font-heading text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0a9066]/10 border border-[#0a9066]/30 rounded-full">
            <Shield className="w-5 h-5 text-[#0a9066]" />
            <span className="text-[#88cfbb] font-medium">
              95% des risques de fraude éliminés
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
