import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useFinanceStore } from '../../stores/useFinanceStore'
import { useFinance } from '../../hooks/useFinance'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { processAIQuery, AI_QUICK_ACTIONS } from '../../utils/aiEngine'
import { cn } from '../../utils/cn'

export function AIChat() {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatMessages = useFinanceStore((s) => s.chatMessages)
  const addChatMessage = useFinanceStore((s) => s.addChatMessage)
  const clearChat = useFinanceStore((s) => s.clearChat)
  const { incomes, expenses, stats } = useFinance()
  const currencySymbol = useSettingsStore((s) => s.currencySymbol)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return
    addChatMessage('user', text)
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))

    const response = processAIQuery(text, { incomes, expenses, stats, symbol: currencySymbol })
    addChatMessage('assistant', response)
    setIsTyping(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-card)] overflow-hidden">
      {chatMessages.length > 0 && (
        <div className="flex items-center justify-end px-3 py-1.5 border-b border-[var(--color-border)]/50 shrink-0">
          <button
            onClick={clearChat}
            className="text-xs text-[var(--color-text-muted)] hover:text-red-400 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Clear chat
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 min-h-0">
        {chatMessages.length === 0 && !isTyping && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Tap a question below or type your own
          </p>
        )}

        <AnimatePresence>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'user' ? 'bg-[var(--color-primary)]/20' : 'bg-[var(--color-secondary)]/20'
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-text)]'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
              )}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-[var(--color-surface-subtle)] rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)]/50 bg-[var(--color-card)]">
        <div className="px-3 pt-2 pb-1">
          <div className="grid grid-cols-2 gap-2">
            {AI_QUICK_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="text-xs justify-start h-auto py-2"
                disabled={isTyping}
                onClick={() => sendMessage(action.query)}
              >
                <Sparkles className="h-3 w-3 shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3 pb-3">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            className="flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              rows={2}
              placeholder="Ask about your finances..."
              className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/50 px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
