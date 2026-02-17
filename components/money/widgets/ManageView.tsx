"use client"

import { useState } from "react"
import type { Subscription } from "@/components/money/sample-data"
import { SubscriptionTable } from "@/components/money/widgets/SubscriptionTable"
import { MonthlyOutlook } from "@/components/money/widgets/MonthlyOutlook"
import { CancelSubscriptionModal } from "@/components/money/CancelSubscriptionModal"

// ---------------------------------------------------------------------------
// ManageView -- combines the subscription table, monthly outlook, and modal
// ---------------------------------------------------------------------------

interface ManageViewProps {
  subscriptions: Subscription[]
}

export function ManageView({ subscriptions }: ManageViewProps) {
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCancelClick = (sub: Subscription) => {
    setCancelTarget(sub)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setCancelTarget(null)
  }

  const handleConfirmCancel = () => {
    // In a real app this would trigger an API call to cancel the subscription.
    // For now we simply close the modal.
    setIsModalOpen(false)
    setCancelTarget(null)
  }

  return (
    <>
      <div className="flex gap-6">
        {/* Left: Subscription Table */}
        <div className="flex-1 min-w-0">
          <SubscriptionTable
            subscriptions={subscriptions}
            onCancelClick={handleCancelClick}
          />
        </div>

        {/* Right: Monthly Outlook */}
        <div className="w-80 shrink-0">
          <MonthlyOutlook subscriptions={subscriptions} />
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelSubscriptionModal
        subscription={cancelTarget}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmCancel}
      />
    </>
  )
}
