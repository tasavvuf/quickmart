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
  const { user, setActiveAddress, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useContext(UserContext);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddressForm);

  const addresses = user?.addresses?.length
    ? user.addresses
    : user?.address
      ? [
          {
            id: "primary-address",
            _id: "primary-address",
            label: "Home",
            street: typeof user.address === "string" ? user.address : user.address.street,
            fullAddress: typeof user.address === "string" ? user.address : user.address.fullAddress,
            line1: typeof user.address === "string" ? user.address : user.address.line1,
            line2: typeof user.address === "string" ? "" : user.address.line2,
            city: typeof user.address === "string" ? "Surat" : user.address.city,
            state: typeof user.address === "string" ? "Gujarat" : user.address.state,
            pincode: typeof user.address === "string" ? "" : user.address.pincode,
            isDefault: true,
          },
        ]
      : [];

  const startAdding = () => {
    setEditingId("new");
    setForm(emptyAddressForm);
  };

  const startEditing = (address) => {
    setEditingId(address.id || address._id);
    setForm({
      label: address.label || "",
      line1: address.street || address.line1 || address.fullAddress || "",
      line2: address.area || address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: Boolean(address.isDefault),
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

    const payload = {
      label: form.label,
      street: form.line1,
      area: form.line2,
      city: form.city || "Surat",
      state: form.state || "Gujarat",
      pincode: form.pincode || "",
      fullAddress: `${form.line1}, ${form.line2 ? form.line2 + ", " : ""}${form.city || "Surat"}, ${form.state || "Gujarat"}${form.pincode ? " - " + form.pincode : ""}`,
      isDefault: Boolean(form.isDefault),
    };

    if (editingId === "new") {
      addAddress(payload);
    } else {
      updateAddress(editingId, payload);
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
            <p className="text-xs font-semibold uppercase tracking-wide text-caramel">
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
            className="glass glass-hover flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-2xl p-5 text-sm font-semibold text-caramel cursor-pointer"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-caramel/15">
              <Plus size={20} />
            </span>
            Add New Address
          </button>

          {addresses.map((address) => {
            const addrId = address.id || address._id;
            return (
              <AddressCard
                key={addrId}
                address={address}
                isActive={user?.activeAddressId === addrId || user?.selectedAddressId === addrId}
                onSelect={() => setActiveAddress(addrId)}
                onSetDefault={() => setDefaultAddress(addrId)}
                onEdit={() => startEditing(address)}
                onDelete={() => handleDelete(addrId)}
              />
            );
          })}
        </section>

        {!addresses.length && !editingId && (
          <div className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center text-sm text-muted-foreground">
            <MapPin size={22} className="text-caramel" />
            No saved addresses yet.
          </div>
        )}
      </main>
    </div>
  );
}
