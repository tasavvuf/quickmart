import { Save, X } from "lucide-react";

const FIELDS = [
  { key: "label", label: "Label (e.g. Home, Work)" },
  { key: "line1", label: "Address Line 1" },
  { key: "line2", label: "Address Line 2" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pincode", label: "Pincode" },
];

export default function AddressForm({ formData, isNew, onChange, onCancel, onSave }) {
  return (
    <div className="app-card rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-bold">
        {isNew ? "Add Address" : "Edit Address"}
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-sm font-semibold">
            {field.label}
            <input
              type="text"
              value={formData[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              className="app-input w-full rounded-xl px-4 py-3"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          className="app-control flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
        >
          <Save size={16} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="app-control flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
}
