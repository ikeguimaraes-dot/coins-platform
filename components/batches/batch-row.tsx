"use client"

import * as React from "react"

import { ApproveBatchDialog } from "@/components/batches/approve-batch-dialog"
import { BatchStatusBadge } from "@/components/batches/batch-status-badge"
import { RejectBatchDialog } from "@/components/batches/reject-batch-dialog"
import { Button } from "@/components/ui/button"
import { centsToReais, formatBRL, formatInt, formatRelativeTime } from "@/lib/dashboard/format"
import type { BatchListItem } from "@/lib/api/batches"

export function BatchRow({ batch }: { batch: BatchListItem }) {
  const [approveOpen, setApproveOpen] = React.useState(false)
  const [rejectOpen, setRejectOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-1.5 border-t px-1 py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold">{batch.organizationName}</span>
          <BatchStatusBadge status={batch.status} />
        </div>
        <div className="mt-0.5 text-[12.5px] text-muted-foreground">
          {formatInt(batch.totalCoins)} coins · {formatBRL(centsToReais(batch.priceInCents))} ·{" "}
          {formatRelativeTime(batch.createdAt)}
        </div>
        {batch.status === "REJECTED" && batch.rejectionReason ? (
          <div className="mt-1 text-[12.5px] text-muted-foreground">Motivo: &quot;{batch.rejectionReason}&quot;</div>
        ) : null}
      </div>

      {batch.status === "PENDING" ? (
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setRejectOpen(true)}>
            Recusar
          </Button>
          <Button onClick={() => setApproveOpen(true)} className="bg-[#C63C0B] hover:bg-[#B23509]">
            Aprovar
          </Button>
        </div>
      ) : null}

      <ApproveBatchDialog batch={batch} open={approveOpen} onOpenChange={setApproveOpen} />
      <RejectBatchDialog batch={batch} open={rejectOpen} onOpenChange={setRejectOpen} />
    </div>
  )
}
