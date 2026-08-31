type ActivityItem = {
  id: string
  title: string
  subtitle: string
  when: string
  statusColor: string
}

export function ActivityCard({
  title,
  items,
  emptyMessage,
}: {
  title: string
  items: ActivityItem[]
  emptyMessage: string
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <h3 className="mb-1 font-serif text-[15px] font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 border-t py-2.5 first:border-t-0">
              <span
                className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.statusColor }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold">{item.title}</div>
                <div className="text-[12px] text-muted-foreground">{item.subtitle}</div>
              </div>
              <span className="whitespace-nowrap text-[11.5px] tabular-nums text-muted-foreground">
                {item.when}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
