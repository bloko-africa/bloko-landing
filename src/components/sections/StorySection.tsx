"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Shield } from "lucide-react";
import { useInView } from "framer-motion";
import { blokoEvents } from "../analytics/GoogleAnalytics";
import { useRef } from "react";

export function StorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="section-padding bg-gradient-to-br from-[#0a9066] to-[#088558] relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#88cfbb]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0a110e]/20 rounded-full blur-3xl" />

      <div className="container-bloko relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm mb-4"
          >
            <MessageSquare className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-heading text-white leading-tight"
          >
            Racontez votre expérience !
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            Vos histoires nous aideront à créer une solution conçue et adaptée
            aux contraintes du marché africain. Toutes vos informations
            resteront confidentielles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4"
          >
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-[#0a9066] font-semibold text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <a
                href="https://tally.so/r/WOJkNa"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => blokoEvents.shareExperience("story_section")}
              >
                Partager mon histoire
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-white/80 text-sm pt-4"
          >
            <Shield className="h-4 w-4" />
            <span>Vos données sont protégées et confidentielles</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
