/**
 * Marca SyN Mercadería — vector plano inspirado en el logo original
 * (aro + carrito de super), adaptado a la paleta de la app.
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
      <circle
        cx="32"
        cy="32"
        r="26.5"
        className="stroke-marca"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* carrito */}
      <g
        transform="translate(11.4 13) scale(1.7)"
        className="stroke-ink"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 1h3.4l2.5 12.4a1.7 1.7 0 0 0 1.7 1.35h8.9a1.7 1.7 0 0 0 1.66-1.32L22.6 6H5.3" />
        <circle cx="8.6" cy="20" r="1.5" />
        <circle cx="18.4" cy="20" r="1.5" />
      </g>
    </svg>
  )
}

/** Marca + "Mercadería" para pantallas amplias (login, splash). */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={72} />
      <span className="font-display text-[13px] font-semibold uppercase tracking-[0.4em] text-marca-ink">
        Mercadería
      </span>
    </div>
  )
}
