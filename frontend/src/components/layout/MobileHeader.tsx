import { AppLogo } from '../ui/AppLogo'

export function MobileHeader() {
  return (
    <header className="px-4 py-3.5 lg:hidden">
      <AppLogo size="md" showName />
    </header>
  )
}
