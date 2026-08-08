import { MapPin, Pencil, Check, Trash2 } from "lucide-react";

export default function AddressCard({ address, isActive, onSelect, onEdit, onDelete, onSetDefault }) {
  const addressText =
    address.fullAddress ||
    [
      address.street || address.line1,
      address.area || address.line2,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div className="app-card rounded-2xl p-5 relative flex flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{address.label || "Address"}</span>
            {address.isDefault && (
              <span className="bg-amber-400/20 text-amber-500 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Default
              </span>
            )}
          </div>
          {isActive && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-xs font-semibold text-green-500">
              <Check size={12} />
              Active
            </span>
          )}
        </div>

        <p className="app-panel-soft min-h-12 rounded-xl px-4 py-3 text-sm">
          <span className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-caramel" />
            <span className="break-words">{addressText}</span>
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!isActive && (
          <button
            onClick={onSelect}
            className="app-control flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            <Check size={14} />
            Set Active
          </button>
        )}
        {!address.isDefault && onSetDefault && (
          <button
            onClick={onSetDefault}
            className="px-3 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-500 hover:bg-amber-400/20 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            Make Default
          </button>
        )}
        <button
          onClick={onEdit}
          className="app-control flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
        >
          <Pencil size={14} />
          Edit
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="app-control flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:text-destructive cursor-pointer"
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
