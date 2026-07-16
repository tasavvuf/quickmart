import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { UserContext } from "../context/UserContext";
import AddressCard from "../components/AddressCard";
import AddressForm from "../components/AddressForm";

const emptyAddressForm = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressBook() {
  const { user, setActiveAddress, addAddress, updateAddress, deleteAddress } =
    useContext(UserContext);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddressForm);

  const addresses = user?.addresses?.length
    ? user.addresses
    : user?.address
      ? [user.address]
      : [];

  const startAdding = () => {
    setEditingId("new");
    setForm(emptyAddressForm);
  };

  const startEditing = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyAddressForm);
  };

  const save = () => {
    if (!form.label.trim() || !form.line1.trim()) return;

    if (editingId === "new") {
      addAddress(form);
    } else {
      updateAddress(editingId, form);
    }

    cancel();
  };

  const handleDelete = (addressId) => {
    deleteAddress(addressId);
    if (editingId === addressId) cancel();
  };

  return (
    <div className="app-page px-5 py-8 pb-28">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center gap-4">
          <Link
            to="/user"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full glass glass-hover"
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Account
            </p>
            <h1 className="text-2xl font-bold">Address Book</h1>
          </div>
        </header>

        {editingId && (
          <AddressForm
            formData={form}
            isNew={editingId === "new"}
            onChange={updateField}
            onCancel={cancel}
            onSave={save}
          />
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={startAdding}
            className="glass glass-hover flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-2xl p-5 text-sm font-semibold text-amber-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15">
              <Plus size={20} />
            </span>
            Add New Address
          </button>

          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isActive={user?.activeAddressId === address.id}
              onSelect={() => setActiveAddress(address.id)}
              onEdit={() => startEditing(address)}
              onDelete={() => handleDelete(address.id)}
            />
          ))}
        </section>

        {!addresses.length && !editingId && (
          <div className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center text-sm text-muted-foreground">
            <MapPin size={22} className="text-amber-500" />
            No saved addresses yet.
          </div>
        )}
      </main>
    </div>
  );
}
