import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  width?: number;
  height?: number;
}

export function Logo({
  className = "",
  variant = "default",
  width = 120,
  height = 40,
}: LogoProps) {
  const logoSrc =
    variant === "white" ? "/logo/bloko-logo-white.png" : "/logo/bloko-logo.png";

  return (
    <div className={`relative ${className}`}>
      <Image
        src={logoSrc}
        alt="Bloko"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
}
