import { useState, useEffect } from 'react'
import { Sidebar, MobileNav } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { StickySummaryBar } from './StickySummaryBar'
import { AddTransactionModal } from '../expenses/AddTransactionModal'
import { DashboardPage } from '../../pages/DashboardPage'
import { ExpensesPage } from '../../pages/ExpensesPage'
import { ReportsPage } from '../../pages/ReportsPage'
import { InsightsPage } from '../../pages/InsightsPage'
import { SettingsPage } from '../../pages/SettingsPage'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useAuthStore } from '../../stores/useAuthStore'
import { cn } from '../../utils/cn'

const SIDEBAR_COLLAPSED_KEY = 'finflow-sidebar-collapsed'

export function AppLayout() {
  const [activeTab, setActiveTab] = useState('expenses')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  })
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const isDesktop = useIsDesktop()
  const entryTab = useAuthStore((s) => s.entryTab)
  const clearEntryTab = useAuthStore((s) => s.clearEntryTab)

  useEffect(() => {
    if (entryTab) {
      setActiveTab(entryTab)
      clearEntryTab()
    }
  }, [entryTab, clearEntryTab])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const isInsights = activeTab === 'insights'
  const showSummary = !isInsights

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />
      case 'expenses': return <ExpensesPage />
      case 'reports': return <ReportsPage />
      case 'insights': return <InsightsPage />
      case 'settings': return <SettingsPage />
      default: return <ExpensesPage />
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-background)] flex flex-col">
      <div className="flex flex-1 min-h-0 min-w-0">
        <div
          className={cn(
            'hidden lg:flex shrink-0 flex-col border-r border-[var(--color-border)]/30 sticky top-0 self-start',
            'transition-[width] duration-[250ms] ease-[ease] h-dvh',
            sidebarCollapsed ? 'w-12' : 'w-72'
          )}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />
        </div>

        <div className="flex flex-1 min-w-0 flex-col min-h-0 lg:h-dvh lg:overflow-hidden">
          <div className="lg:hidden sticky top-0 z-40 border-b border-[var(--color-border)]/30 bg-[var(--color-background)]/95 backdrop-blur-sm">
            <MobileHeader />
            {showSummary && <StickySummaryBar embedded />}
          </div>

          <div className="hidden lg:block">
            {showSummary && <StickySummaryBar />}
          </div>

          <main
            className={cn(
              'flex-1 min-w-0 w-full flex flex-col min-h-0',
              'px-4 md:px-6 pt-4 md:pt-6',
              activeTab === 'expenses' ? 'overflow-y-auto lg:overflow-hidden' : 'overflow-y-auto',
              isInsights ? 'pb-[72px] lg:pb-6' : 'pb-24 lg:pb-6'
            )}
          >
            {renderContent()}
          </main>
        </div>
      </div>

      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={() => setShowQuickAdd(true)}
      />

      <AddTransactionModal
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        usePanel={isDesktop}
      />
    </div>
  )
}
