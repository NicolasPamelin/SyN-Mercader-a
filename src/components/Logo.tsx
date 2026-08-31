/**
 * Marca SyN Mercadería — vector plano inspirado en el logo original
 * (aro + carrito de super con canasto), adaptado a la paleta de la app.
 */

interface MarkProps {
  size?: number
  className?: string
}

/** Carrito de super, línea limpia. viewBox local ~44x40. */
function Carrito(props: { className?: string; strokeWidth?: number }) {
  return (
    <g
      className={props.className}
      strokeWidth={props.strokeWidth ?? 2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {/* mango */}
      <path d="M3.5 8H8l2.2 3.8" />
      {/* canasto */}
      <path d="M10.2 11.8 40 10l-3.6 15-20.8 1z" />
      {/* rejilla */}
      <path d="M18.5 11.3 17.7 25.6M25.7 10.8 25 25.2M32.9 10.3 32.3 24.8M12 18.4l26.2-1.2" />
      {/* chasis a las ruedas */}
      <path d="M15.6 26l3 7.4H33" />
      {/* ruedas */}
      <circle cx="20" cy="36" r="2.6" />
      <circle cx="32" cy="36" r="2.6" />
    </g>
  )
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
      <g transform="translate(12 10.6) scale(0.92)">
        <Carrito className="stroke-ink" />
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
