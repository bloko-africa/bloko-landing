import Link from "next/link";

type StorefrontFooterProps = {
  storeName: string;
  handle: string;
  bio: string | null;
  ville: string;
  savPhone: string | null;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
};

export function StorefrontFooter({
  storeName,
  handle,
  bio,
  ville,
  savPhone,
  social,
}: StorefrontFooterProps) {
  const base = `/b/${handle}`;
  const description = bio || `Boutique en direct depuis ${ville}.`;
  const socialLinks = [
    { name: "Facebook", href: social.facebook, icon: FacebookIcon },
    { name: "Instagram", href: social.instagram, icon: InstagramIcon },
    { name: "TikTok", href: social.tiktok, icon: TikTokIcon },
    { name: "WhatsApp", href: social.whatsapp, icon: WhatsAppIcon },
  ].filter((link) => link.href);

  return (
    <footer className="border-t border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div>
            <p className="text-heading-6 font-medium text-dark dark:text-white">
              {storeName}
            </p>
            <p className="mt-2 max-w-md text-body-sm text-dark-5 dark:text-dark-6">
              {description}
            </p>
            {savPhone && (
              <a
                href={`tel:${savPhone.replace(/\s+/g, "")}`}
                className="mt-2 inline-block text-body-sm font-medium text-dark hover:text-primary dark:text-white"
              >
                SAV : {savPhone}
              </a>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex size-10 items-center justify-center rounded-full border border-stroke text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-stroke pt-6 text-body-sm dark:border-dark-3">
          <Link
            href={`${base}/mentions-legales`}
            className="text-dark-5 hover:text-primary dark:text-dark-6"
          >
            Mentions légales
          </Link>
          <Link href={`${base}/cgv`} className="text-dark-5 hover:text-primary dark:text-dark-6">
            Conditions générales de vente
          </Link>
        </div>

        <p className="mt-6 text-body-xs text-dark-5 dark:text-dark-6">
          © {new Date().getFullYear()} {storeName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8.4h2.8l.4-3.3h-3.2V7.1c0-.95.26-1.6 1.63-1.6h1.74V2.56C15.98 2.4 15.06 2.32 14 2.32c-2.4 0-4 1.46-4 4.15v2.85H7.2v3.3H10V21h3.5z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.5c-.8-.7-1.3-1.7-1.4-2.8h-2.9v13.4c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4.25 0 .5.04.7.1v-3c-.23-.03-.46-.05-.7-.05-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V9.1c1.1.8 2.4 1.3 3.9 1.3V7.5c-.9 0-1.7-.3-2.4-.8-.4-.3-.7-.7-.9-1.2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.66.15-.2.3-.75.95-.92 1.15-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.27-.2-.57-.35z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.9.53 3.68 1.44 5.2L2 22l4.94-1.4A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.7 0-3.28-.47-4.63-1.28l-.33-.2-3.3.94.95-3.2-.21-.34A8.18 8.18 0 0 1 3.8 12c0-4.53 3.68-8.2 8.2-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.52-3.67 8.2-8.2 8.2z" />
    </svg>
  );
}
