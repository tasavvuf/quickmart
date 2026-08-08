import { useContext, useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Package,
  Clock,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { UserContext } from "../context/UserContext";
import { api, getApiErrorMessage } from "../lib/api";

function UserPage() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.userName || user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || "",
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoadingOrders(true);
        const res = await api.get("/orders");
        if (res.data?.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  const avatarInitial = useMemo(() => {
    const nameStr = user?.name || user?.userName || user?.username || "User";
    return nameStr.trim().charAt(0).toUpperCase();
  }, [user?.name, user?.userName, user?.username]);

  const activeAddressText = useMemo(() => {
    if (!user?.addresses?.length && !user?.address) return "No saved addresses";
    const selected = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
    if (selected) {
      return `${selected.houseNumber ? selected.houseNumber + ', ' : ''}${selected.street}, ${selected.city}`;
    }
    return typeof user.address === "string" ? user.address : "Manage your addresses";
  }, [user]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const saveUserInfo = () => {
    setUser((current) => ({ ...current, ...formData }));
    setIsEditing(false);
  };

  const startEditing = () => {
    setFormData({
      username: user?.userName || user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || user?.phoneNumber || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const getStatusBadge = (order) => {
    const vStatus = order.vendorStatus || "PENDING";
    const dStatus = order.deliveryStatus || "WAITING";

    if (vStatus === "DELIVERED" || dStatus === "DELIVERED") {
      return <span className="bg-green-500/10 text-green-500 border border-green-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
    }
    if (vStatus === "REJECTED" || order.userStatus?.includes("CANCELLED")) {
      return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">Cancelled</span>;
    }
    return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">{vStatus}</span>;
  };

  return (
    <div className="app-page px-5 py-8 pb-28">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* User Header Profile Card */}
        <section className="app-card flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border border-border shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 text-3xl font-extrabold text-amber-500">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.userName || user.username || "User"} avatar`}
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
              <h1 className="truncate text-2xl sm:text-3xl font-extrabold app-heading">
                {user?.name || user?.userName || user?.username || "User"}
              </h1>
              <p className="truncate text-sm app-muted mt-0.5">
                {user?.email || "No email provided"}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-2 self-start">
              <button
                onClick={cancelEditing}
                className="app-control flex h-11 w-11 items-center justify-center rounded-xl cursor-pointer"
                aria-label="Cancel editing"
                title="Cancel"
              >
                <X size={18} />
              </button>
              <button
                onClick={saveUserInfo}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-amber-500 text-black font-bold transition hover:opacity-90 shadow-md shadow-amber-500/20"
                aria-label="Save user details"
                title="Save"
              >
                <Save size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="app-control flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl text-amber-500 cursor-pointer"
              aria-label="Edit user details"
              title="Edit Profile"
            >
              <Pencil size={18} />
            </button>
          )}
        </section>

        {isEditing && (
          <section className="app-card grid gap-4 rounded-2xl p-5 sm:grid-cols-2 border border-border">
            <label className="flex flex-col gap-1 text-xs font-bold app-heading">
              Username
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
                className="app-input w-full rounded-xl px-4 py-2.5 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold app-heading">
              Full Name
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="app-input w-full rounded-xl px-4 py-2.5 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold app-heading">
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="app-input w-full rounded-xl px-4 py-2.5 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold app-heading">
              Phone Number
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="app-input w-full rounded-xl px-4 py-2.5 text-xs"
              />
            </label>
          </section>
        )}

        {/* Address Book Navigation Link */}
        <Link to="/address-book" className="app-card app-card-hover p-4 rounded-2xl border border-border flex items-center justify-between transition-all">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 font-bold">
              <MapPin size={18} />
            </span>
            <span>
              <span className="block font-bold text-sm app-heading">Address Book</span>
              <span className="block text-xs app-muted truncate max-w-sm">
                {activeAddressText}
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="app-muted" />
        </Link>

        {/* Order History Navigation Link */}
        <Link to="/orders" className="app-card app-card-hover p-4 rounded-2xl border border-border flex items-center justify-between transition-all">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 font-bold">
              <History size={18} />
            </span>
            <span>
              <span className="block font-bold text-sm app-heading">Order History</span>
              <span className="block text-xs app-muted">
                {loadingOrders ? "Loading orders..." : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="app-muted" />
        </Link>

        {/* Recent Orders Section */}
        <section className="app-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider app-muted">
              Recent Orders
            </h2>
            {orders.length > 0 && (
              <Link to="/orders" className="text-xs font-bold text-amber-500 hover:underline">
                View All ({orders.length})
              </Link>
            )}
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center p-6 app-muted text-xs font-semibold">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading recent orders...
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="app-panel-soft app-card-hover p-4 rounded-2xl border border-border cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-amber-500">
                        #{order._id}
                      </span>
                      {getStatusBadge(order)}
                    </div>
                    <p className="text-xs app-muted">
                      {order.store?.name || "Store"} • {order.items?.length || 0} items • ₹{order.grandTotal?.toFixed(2)}
                    </p>
                  </div>
                  <ChevronRightIcon size={16} className="app-muted" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs app-muted py-4 text-center">No orders placed yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserPage;
