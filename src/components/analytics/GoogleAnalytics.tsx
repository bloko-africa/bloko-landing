"use client";

import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_ID || process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

export const blokoEvents = {
  signUpWaitlist: (source: string = "website") => {
    trackEvent("sign_up", {
      method: "waitlist",
      source: source,
    });
  },

  shareExperience: (method: string) => {
    trackEvent("share_experience", {
      method: method,
    });
  },
};
