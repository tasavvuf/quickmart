import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { UserContext } from "../context/UserContext";
import OrderHistoryCard from "../components/OrderHistoryCard";

function UserPage() {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
  });

  const avatarInitial = useMemo(() => {
    return (user?.username?.trim()?.charAt(0) || "U").toUpperCase();
  }, [user?.username]);

  const activeAddress = user?.addresses?.find(
    (address) => address.id === user?.activeAddressId
  ) || user?.address;

  const recentOrders = (user?.orderHistory || []).slice(0, 2);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const saveUserInfo = () => {
    setUser((current) => ({ ...current, ...formData }));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob || "",
    });
    setIsEditing(false);
  };

  const fields = [
    { icon: <User size={16} />, label: "Username", value: formData.username },
    { icon: <Mail size={16} />, label: "Email", value: formData.email },
    { icon: <Phone size={16} />, label: "Phone", value: formData.phone },
    { icon: <Calendar size={16} />, label: "DOB", value: formData.dob, date: true },
  ];

  return (
    <div className="app-page px-5 py-8 pb-28">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="glass flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-400/10 text-3xl font-bold text-amber-500">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.username || "User"} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarInitial
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                My Account
              </p>
              <h1 className="truncate text-3xl font-bold">{user?.username}</h1>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2 self-start">
              <button
                onClick={cancelEditing}
                className="glass glass-hover flex h-11 w-11 items-center justify-center rounded-xl"
                aria-label="Cancel editing"
                title="Cancel"
              >
                <X size={18} />
              </button>
              <button
                onClick={saveUserInfo}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-amber-400 text-black transition hover:bg-amber-300"
                aria-label="Save user details"
                title="Save"
              >
                <Save size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="glass glass-hover flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl text-amber-500"
              aria-label="Edit user details"
              title="Edit"
            >
              <Pencil size={18} />
            </button>
          )}
        </section>

        {isEditing && (
          <section className="glass grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.label} className="flex flex-col gap-1 text-sm font-semibold">
                {field.label}
                <input
                  type={field.date ? "date" : "text"}
                  value={field.value}
                  onChange={(event) => updateField(field.label.toLowerCase(), event.target.value)}
                  className="glass-input w-full rounded-xl px-4 py-3"
                />
              </label>
            ))}
          </section>
        )}

        <Link to="/address-book" className="glass app-link rounded-2xl">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <MapPin size={18} />
            </span>
            <span>
              <span className="block font-semibold">Address Book</span>
              <span className="block text-sm text-muted-foreground">
                {activeAddress
                  ? `${activeAddress.line1}, ${activeAddress.city}`
                  : "Manage your addresses"}
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>

        <Link to="/orders" className="glass app-link rounded-2xl">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <History size={18} />
            </span>
            <span>
              <span className="block font-semibold">Order History</span>
              <span className="block text-sm text-muted-foreground">
                {(user?.orderHistory || []).length} orders placed
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Orders
          </h2>

          {recentOrders.length ? (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <OrderHistoryCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}

          {(user?.orderHistory || []).length > 2 && (
            <Link
              to="/orders"
              className="mt-4 block text-center text-sm font-semibold text-amber-500 transition hover:text-amber-400"
            >
              View all orders
            </Link>
          )}
        </section>

        <Link to="/address-book" className="glass app-link rounded-2xl">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <MapPin size={18} />
            </span>
            <span>
              <span className="block font-semibold">Active Address</span>
              <span className="block text-sm text-muted-foreground">
                {activeAddress
                  ? `${activeAddress.line1}, ${activeAddress.city}`
                  : "Manage your addresses"}
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </main>
    </div>
  );
}

export default UserPage;
