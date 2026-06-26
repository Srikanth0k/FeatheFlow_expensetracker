import { cn } from '../../utils/cn'

const LOGO_SRC = '/Chick.png'
export const APP_NAME = 'Featherflow'

interface AppLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Show Featherflow wordmark beside the icon */
  showName?: boolean
}

const iconSizeClass = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
} as const

const nameSizeClass = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl lg:text-4xl',
} as const

function AppName({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={cn('font-semibold tracking-tight text-[var(--color-text)] truncate', nameSizeClass[size])}>
      Feather<span className="text-[var(--color-primary)]">flow</span>
    </span>
  )
}

export function AppLogo({ className, size = 'md', showName = false }: AppLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <img
        src={LOGO_SRC}
        alt=""
        className={cn('shrink-0 object-contain', iconSizeClass[size])}
      />
      {showName ? (
        <AppName size={size} />
      ) : (
        <span className="sr-only">{APP_NAME}</span>
      )}
    </div>
  )
}
