interface SSCLogoProps {
  className?: string;
  size?: number;
}

/** Official SSC logo - use for SSC CGL and other SSC exam branding */
const SSCLogo = ({ className = "", size = 24 }: SSCLogoProps) => (
  <img
    src="/ssc-logo.png"
    alt="SSC"
    className={`object-contain ${className}`}
    width={size}
    height={size}
  />
);

export default SSCLogo;
