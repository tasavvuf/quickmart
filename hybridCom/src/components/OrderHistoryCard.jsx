import { History, MapPin } from "lucide-react";

const STATUS_STYLES = {
  Delivered: "text-emerald-500",
  Cancelled: "text-red-500",
  Pending: "text-amber-500",
  Shipped: "text-sky-500",
};

export default function OrderHistoryCard({ order }) {
  const statusStyle = STATUS_STYLES[order.status] || "text-amber-500";

  return (
    <div className="app-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-amber-500">
            <History size={16} />
          </span>
          <div>
            <p className="font-bold">{order.storeName}</p>
            <p className="text-xs app-muted">
              {order.id} · {new Date(order.date).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${statusStyle}`}>{order.status}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="app-panel-soft min-h-10 flex-1 rounded-xl px-4 py-2 text-sm">
          <span className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <span className="break-words">
              {order.items?.join(", ") || "No items"}
            </span>
          </span>
        </p>
        <p className="ml-3 text-lg font-bold">
          ₹{order.total}
        </p>
      </div>
    </div>
  );
}
