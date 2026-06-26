import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Receipt,
  FileDown,
  Sparkles,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  User,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { AppLogo } from '../ui/AppLogo'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
  /** When true, hides nav items already in bottom mobile bar */
  mobileDrawer?: boolean
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: FileDown },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const MOBILE_DRAWER_HIDDEN = new Set(['dashboard', 'insights'])

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
  className,
  mobileDrawer = false,
}: SidebarProps) {
  const userName = useSettingsStore((s) => s.userName)
  const visibleNavItems = mobileDrawer
    ? navItems.filter((item) => !MOBILE_DRAWER_HIDDEN.has(item.id))
    : navItems

  const showCollapse = !mobileDrawer && onToggleCollapse

  return (
    <aside
      className={cn(
        'flex h-full flex-col',
        collapsed ? 'px-1.5 py-3' : 'px-3 py-4',
        className
      )}
    >
      {showCollapse && (
        <div
          className={cn(
            'mb-3 border-b border-[var(--color-border)]/30 pb-3',
            collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-2'
          )}
        >
          <AppLogo
            size={collapsed ? 'sm' : 'lg'}
            showName={!collapsed}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <nav className="space-y-1 flex-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              className={cn(
                'w-full flex items-center rounded-xl text-sm font-medium transition-all',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-[var(--color-primary)]')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </motion.button>
          )
        })}
      </nav>

      {!mobileDrawer && (
        <div className="mt-auto pt-3 border-t border-[var(--color-border)]/30">
          <button
            type="button"
            onClick={() => onTabChange('settings')}
            title={collapsed ? userName : undefined}
            aria-label={collapsed ? `${userName}, view profile` : undefined}
            className={cn(
              'w-full flex items-center rounded-xl transition-colors hover:bg-[var(--color-surface-hover)]',
              collapsed ? 'justify-center p-1.5' : 'gap-3 px-3 py-2.5',
              activeTab === 'settings' && 'bg-[var(--color-primary)]/10'
            )}
          >
            <div
              className={cn(
                'shrink-0 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-medium',
                collapsed ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
              )}
            >
              {userName.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{userName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">View profile</p>
              </div>
            )}
          </button>
        </div>
      )}
    </aside>
  )
}

export function MobileNav({
  activeTab,
  onTabChange,
  onQuickAdd,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onQuickAdd?: () => void
}) {
  const mobileItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'add', label: 'Add', icon: Plus, isFab: true },
    { id: 'insights', label: 'AI', icon: Sparkles },
    { id: 'settings', label: 'More', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--color-border)]/50 safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          if (item.isFab) {
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onQuickAdd?.()}
                aria-label="Add transaction"
                className="relative -mt-6 h-14 w-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md flex items-center justify-center"
              >
                <Icon className="h-6 w-6" />
              </motion.button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              className={cn(
                'flex items-center justify-center p-2.5 rounded-lg transition-colors min-w-[48px]',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
