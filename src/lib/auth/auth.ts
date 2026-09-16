import { render } from "@react-email/render";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, magicLink } from "better-auth/plugins";
import { sendEmail } from "../email/send";
import { MagicLinkEmail } from "../email/templates/magic-link";
import { OtpCodeEmail } from "../email/templates/otp-code";
import { db } from "../db";
import { authorizationPlugins } from "./modules/authorization";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set.");
}

const hasGoogleOAuth =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "Mode Shop Admin",
  baseURL: process.env.BETTER_AUTH_URL!,

  user: {
    additionalFields: {
      phoneNumber: {
        type: "number",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      // Compte staff "vendeur" rattache a une Boutique. input: false -> un
      // client ne peut jamais se l'auto-attribuer a l'inscription ou via
      // authClient.updateUser ; seul db.user.update() (cote serveur, dans
      // createBoutique/addBoutiqueStaff) le renseigne.
      boutiqueId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },

  socialProviders: hasGoogleOAuth
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,

  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  plugins: [
    ...authorizationPlugins,
    // Connexion sans mot de passe, priorisée dans l'UI : un lien envoyé par
    // email (usage unique, 5 min). disableSignUp reste false — un compte
    // client sans mot de passe reçoit le rôle "customer" par défaut (aucun
    // accès back-office, voir modules/authorization/index.ts), donc créer
    // un compte via ce flux n'ouvre aucun accès staff.
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Ton lien de connexion Bloko",
          html: await render(MagicLinkEmail({ url })),
          category: "compte",
        });
      },
    }),
    // Code à 6 chiffres : alternative à la fois pour se connecter sans
    // mot de passe ("sign-in") et pour le récupérer ("forget-password",
    // via emailOtp.requestPasswordReset + emailOtp.resetPassword côté
    // client) — un seul mécanisme d'email pour les deux besoins.
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendEmail({
          to: email,
          subject:
            type === "forget-password"
              ? "Ton code pour réinitialiser ton mot de passe"
              : "Ton code de connexion Bloko",
          html: await render(OtpCodeEmail({ otp, type })),
          category: "compte",
        });
      },
    }),
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "compact",
    },
    deferSessionRefresh: true,
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
    process.env.BETTER_AUTH_URL!,
    "https://bloko.me",
    "https://www.bloko.me",
  ].filter(Boolean),
});
