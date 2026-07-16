import { MapPin, Pencil, Check, Trash2 } from "lucide-react";

export default function AddressCard({ address, isActive, onSelect, onEdit, onDelete }) {
  return (
    <div className="app-card rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold">{address.label || "Address"}</span>
        {isActive && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-amber-500">
            <Check size={12} />
            Active
          </span>
        )}
      </div>

      <p className="app-panel-soft min-h-12 rounded-xl px-4 py-3 text-sm">
        <span className="flex items-start gap-2">
          <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <span className="break-words">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
            {`, ${address.city}`}
            {`, ${address.state}`}
            {` - ${address.pincode}`}
          </span>
        </span>
      </p>

      <div className="mt-3 flex gap-2">
        {!isActive && (
          <button
            onClick={onSelect}
            className="app-control flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <Check size={14} />
            Set Active
          </button>
        )}
        <button
          onClick={onEdit}
          className="app-control flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
        >
          <Pencil size={14} />
          Edit
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="app-control flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-destructive hover:text-destructive"
            aria-label={`Delete ${address.label || "address"}`}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
