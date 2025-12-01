"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, ArrowRight, AlertCircle } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function WaitlistSection() {
  const supabase = createClient();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email invalide");
      setIsSubmitting(false);
      return;
    }

    const { data: existing } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .single();

    if (existing) {
      setError("Cet email est déjà inscrit");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("waitlist").insert({
      first_name: firstName,
      email: email,
      source: "website",
    });

    if (error) {
      console.error("Erreur Supabase :", error);

      if (error.code === "23505") {
        setError("Cet email est déjà inscrit");
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }

      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section
      ref={ref}
      className="section-padding bg-gradient-to-b from-[#0a110e] to-[#0a110e] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a9066]/20 via-transparent to-transparent" />

      <div className="container-bloko relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-[#0a9066]/10 rounded-2xl backdrop-blur-sm mb-4"
            >
              <Bell className="w-8 h-8 text-[#0a9066]" strokeWidth={1.5} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-heading text-white leading-tight"
            >
              Soyez parmi les premiers informés
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 leading-relaxed"
            >
              Rejoignez la liste d&apos;attente et soyez les premiers à
              expérimenter une nouvelle façon d&apos;acheter et vendre en ligne,
              en toute confiance.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-14 bg-white/5 border-[#0a9066]/30 text-white placeholder:text-white/50 focus:border-[#0a9066] focus:ring-[#0a9066] rounded-xl text-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 bg-white/5 border-[#0a9066]/30 text-white placeholder:text-white/50 focus:border-[#0a9066] focus:ring-[#0a9066] rounded-xl text-lg"
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-bloko hover:opacity-90 transition-opacity text-white font-semibold text-lg py-7 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Inscription en cours..."
                  ) : (
                    <>
                      Rejoignez la liste d&apos;attente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6 bg-[#0a9066]/10 border border-[#0a9066]/30 rounded-2xl"
              >
                <div className="w-16 h-16 bg-[#0a9066] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading text-white mb-2">
                  Merci {firstName} !
                </h3>
                <p className="text-white/80">
                  Vous êtes maintenant sur la liste d&apos;attente. Nous vous
                  contacterons très bientôt.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-white/60 text-sm"
          >
            <span>Pas de spam, promis</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
