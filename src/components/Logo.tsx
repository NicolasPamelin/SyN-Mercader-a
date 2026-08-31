/**
 * Marca SyN Mercadería — redibujada como vector plano a partir del logo original
 * (aro + techo de casa + "SyN" serif), adaptada a la paleta de la app.
 */

interface MarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 40, className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="SyN Mercadería"
      className={className}
    >
      <circle cx="32" cy="32" r="30" className="stroke-marca" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="26.5" className="stroke-marca" strokeWidth="1" opacity="0.45" />
      <path
        d="M17 24 32 12l15 12"
        className="stroke-ink"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="32"
        y="45"
        textAnchor="middle"
        className="fill-ink"
        style={{
          fontFamily: "'Fraunces', 'Georgia', serif",
          fontWeight: 600,
          fontSize: 19,
          letterSpacing: '-0.02em',
        }}
      >
        SyN
      </text>
    </svg>
  )
}

/** Marca + "Mercadería" para pantallas amplias (login, splash). */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ''}`}>
      <LogoMark size={72} />
      <span className="font-display text-[13px] font-semibold uppercase tracking-[0.4em] text-marca-ink">
        Mercadería
      </span>
    </div>
  )
}
