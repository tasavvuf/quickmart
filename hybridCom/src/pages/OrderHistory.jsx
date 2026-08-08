import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, History, Package, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { api, getApiErrorMessage } from "../lib/api";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders");
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalSpent = orders
    .filter((order) => !order.userStatus?.includes("CANCELLED") && order.vendorStatus !== "REJECTED")
    .reduce((sum, order) => sum + (order.grandTotal || 0), 0);

  const getStatusBadge = (order) => {
    const vStatus = order.vendorStatus || "PENDING";
    const dStatus = order.deliveryStatus || "WAITING";

    if (vStatus === "DELIVERED" || dStatus === "DELIVERED") {
      return <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
    }
    if (vStatus === "REJECTED" || order.userStatus?.includes("CANCELLED")) {
      return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">Cancelled</span>;
    }
    return <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">{vStatus}</span>;
  };

  return (
    <div className="app-page px-5 py-8 pb-28">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold">Order History</h1>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="app-control flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-caramel" : ""} />
            Refresh
          </button>
        </header>

        <section className="app-card flex items-center justify-between gap-4 rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-caramel/15 text-caramel font-bold">
              <Package size={18} />
            </span>
            <div>
              <p className="text-sm app-muted">Total Orders</p>
              <p className="text-lg font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm app-muted">Amount Spent</p>
            <p className="text-lg font-bold text-caramel">₹{totalSpent.toFixed(2)}</p>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="app-muted text-sm font-semibold">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="app-card flex flex-col items-center gap-2 rounded-2xl p-8 text-center text-sm text-red-400 border border-red-500/30">
            <AlertCircle size={24} />
            {error}
          </div>
        ) : orders.length ? (
          <section className="flex flex-col gap-3">
            {orders.map((order) => {
              const shortId = String(order._id).slice(-6).toUpperCase();
              const storeName = order.store?.name || "Store";
              const itemCount = order.items?.length || 0;

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="app-card app-card-hover p-5 rounded-2xl border border-border cursor-pointer transition-all hover:translate-y-[-2px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base">Order #{shortId}</span>
                        {getStatusBadge(order)}
                      </div>
                      <p className="text-xs font-semibold text-caramel mt-0.5">{storeName}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-amber-400">
                        ₹{order.grandTotal?.toFixed(2)}
                      </span>
                      <ChevronRight size={18} className="app-muted" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs app-muted pt-2 border-t border-border">
                    <span>
                      {itemCount} item{itemCount > 1 ? "s" : ""} • {order.paymentType === "UPI" ? "Online UPI" : "COD"}
                    </span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="app-card flex flex-col items-center gap-2 rounded-2xl p-10 text-center text-sm app-muted border border-border">
            <History size={24} className="text-caramel" />
            No orders placed yet.
          </div>
        )}
      </main>
    </div>
  );
}
