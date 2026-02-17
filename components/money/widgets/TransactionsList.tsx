'use client'

import { cn } from '@/lib/utils'
import {
  CATEGORY_CONFIG,
  type Transaction,
  type SpendingCategory,
} from '@/components/money/sample-data'

interface TransactionsListProps {
  transactions: Transaction[]
  filterCategory?: SpendingCategory
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatAmount(amount: number): string {
  return '-$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Filter icon SVG component
function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-500"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function TransactionRow({
  transaction,
  dimmed = false,
}: {
  transaction: Transaction
  dimmed?: boolean
}) {
  const config = CATEGORY_CONFIG[transaction.category]

  return (
    <div
      className={cn(
        'group flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer',
        'hover:bg-slate-50 dark:hover:bg-[#1c1f27]',
        'border border-transparent hover:border-slate-200 dark:hover:border-slate-800',
        dimmed && 'opacity-60 hover:opacity-100'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-slate-100 dark:bg-[#282e39] flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span className="text-base">{config.icon}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{transaction.merchant}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(transaction.date)} &bull; {transaction.subcategory}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{formatAmount(transaction.amount)}</p>
        {transaction.isRecurring && (
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
            Recurring
          </span>
        )}
      </div>
    </div>
  )
}

export function TransactionsList({ transactions, filterCategory }: TransactionsListProps) {
  const filteredTransactions = filterCategory
    ? transactions.filter((t) => t.category === filterCategory)
    : []

  const otherTransactions = filterCategory
    ? transactions.filter((t) => t.category !== filterCategory)
    : transactions

  const filterLabel = filterCategory
    ? CATEGORY_CONFIG[filterCategory].label + ' Category'
    : 'All Categories'

  return (
    <div className="rounded-2xl bg-[rgba(28,31,39,0.7)] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white">Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">{filterLabel}</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#282e39] transition-colors">
          <FilterIcon />
        </button>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-hide">
        {/* Filtered category transactions */}
        {filteredTransactions.length > 0 && (
          <div className="space-y-0.5">
            {filteredTransactions.map((txn) => (
              <TransactionRow key={txn.id} transaction={txn} />
            ))}
          </div>
        )}

        {/* Divider for other transactions */}
        {filterCategory && otherTransactions.length > 0 && (
          <div className="flex items-center gap-3 py-3 px-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Other Recent
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
        )}

        {/* Other transactions */}
        {otherTransactions.length > 0 && (
          <div className="space-y-0.5">
            {otherTransactions.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                dimmed={!!filterCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-white/[0.06]">
        <button className="w-full py-2.5 text-sm font-medium text-[#135bec] hover:text-white bg-[#135bec]/10 hover:bg-[#135bec]/20 rounded-xl transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  )
}
