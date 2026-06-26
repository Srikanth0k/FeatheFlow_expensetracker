import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Switch'
import { ExportPanel } from '../export/ExportPanel'
import { ThemePicker } from './ThemePicker'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { CURRENCIES } from '../../constants/categories'
import { User, FileDown, LogOut, Palette, Bell } from 'lucide-react'
import { useState } from 'react'

export function SettingsPanel() {
  const settings = useSettingsStore()
  const logout = useAuthStore((s) => s.logout)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-bold mb-1">Settings</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Customize your experience</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
              Appearance
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Choose how Featherflow looks on your device.
            </p>
          </div>
          <ThemePicker />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-medium text-sm shrink-0">
            {settings.userName.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </div>
          Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            hint="Displayed in the sidebar and on exported reports."
            value={settings.userName}
            onChange={(e) => settings.updateSettings({ userName: e.target.value })}
          />
          <Select
            label="Currency"
            hint="Used for all amounts and reports throughout the app."
            options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} ${c.name}` }))}
            value={settings.currency}
            onChange={(e) => {
              const curr = CURRENCIES.find((c) => c.code === e.target.value)
              settings.updateSettings({ currency: e.target.value, currencySymbol: curr?.symbol || '₹' })
            }}
          />
          <Input
            label="Default Income"
            hint="Used to pre-fill income when adding salary or recurring credits."
            type="number"
            value={settings.defaultIncome}
            onChange={(e) => settings.updateSettings({ defaultIncome: Number(e.target.value) })}
          />
          <Input
            label="Salary Day"
            hint="Day of the month you typically receive salary (1–31)."
            type="number"
            min={1}
            max={31}
            value={settings.salaryDay}
            onChange={(e) => settings.updateSettings({ salaryDay: Number(e.target.value) })}
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--color-primary)]" />
          Notifications
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Manage alerts and reminders. Delivery will be enabled in a future update.
        </p>
        <div className="space-y-5 divide-y divide-[var(--color-border)]/30">
          <div className="pb-5">
            <Switch
              label="Enable notifications"
              description="Master switch for all Featherflow alerts on this device."
              checked={settings.notifications}
              onChange={(checked) => settings.updateSettings({ notifications: checked })}
            />
          </div>
          <div className="py-5">
            <Switch
              label="Budget alerts"
              description="Get notified when spending exceeds your monthly budget."
              checked={settings.budgetAlerts}
              onChange={(checked) => settings.updateSettings({ budgetAlerts: checked })}
              disabled={!settings.notifications}
            />
          </div>
          <div className="py-5">
            <Switch
              label="Monthly summary"
              description="Receive a recap of income, expenses, and savings each month."
              checked={settings.monthlySummary}
              onChange={(checked) => settings.updateSettings({ monthlySummary: checked })}
              disabled={!settings.notifications}
            />
          </div>
          <div className="pt-5">
            <Switch
              label="Auto backup reminders"
              description="Remind you to export or back up your data periodically."
              checked={settings.autoBackup}
              onChange={(checked) => settings.updateSettings({ autoBackup: checked })}
              disabled={!settings.notifications}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-2">Account</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Sign out of this device and invalidate your session token.
        </p>
        <Button
          variant="outline"
          className="w-full sm:w-auto text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={handleLogout}
          loading={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </Card>

      {/* Mobile: reports live here instead of a separate nav tab */}
      <div className="lg:hidden space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileDown className="h-5 w-5 text-[var(--color-primary)]" />
            Reports
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Export and preview your financial data</p>
        </div>
        <ExportPanel />
      </div>
    </div>
  )
}
