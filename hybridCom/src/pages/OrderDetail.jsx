import React, { useEffect, useState, useCallback, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../lib/api";
import Stepper, { Step } from "../components/Stepper";
import LiveOrderMap from "../components/LiveOrderMap";
import { socket } from "../lib/socket";
import { UserContext } from "../context/UserContext";
import {
  Phone,
  Store as StoreIcon,
  UserCheck,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Package,
  Copy,
  ShieldCheck,
  MapPin,
  Navigation,
} from "lucide-react";
import { toast } from "react-toastify";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Your order has been received by the store." },
  { key: "ACCEPTED", label: "Order Accepted", desc: "Store accepted your order." },
  { key: "PREPARING", label: "Preparing Items", desc: "Store is preparing your items." },
  { key: "READY", label: "Ready for Pickup", desc: "Order is packed and ready for delivery." },
  { key: "PICKED_UP", label: "Picked Up", desc: "Delivery partner picked up your order." },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Order is on the way to your address." },
  { key: "DELIVERED", label: "Delivered", desc: "Order delivered successfully." },
];

const getStatusRank = (order) => {
  if (!order) return 0;
  const vendorStatus = order.vendorStatus || "PENDING";
  const deliveryStatus = order.deliveryStatus || "WAITING";

  if (vendorStatus === "DELIVERED" || deliveryStatus === "DELIVERED") return 6;
  if (vendorStatus === "OUT_FOR_DELIVERY" || deliveryStatus === "OUT_FOR_DELIVERY") return 5;
  if (vendorStatus === "PICKED_UP" || deliveryStatus === "PICKED_UP") return 4;
  if (vendorStatus === "READY") return 3;
  if (vendorStatus === "PREPARING") return 2;
  if (vendorStatus === "ACCEPTED") return 1;
  return 0; // PENDING
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [partnerLocation, setPartnerLocation] = useState(null);

  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.success) {
        setOrder(res.data.order);
        setError(null);
      }
    } catch (err) {
      if (!isSilent) {
        setError(getApiErrorMessage(err, "Failed to load order details"));
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  // Socket.IO Room Joining & Location Stream
  useEffect(() => {
    if (!orderId) return;

    socket.emit("order:join", { orderId }, (res) => {
      if (res?.success) {
        console.log(`[Socket.IO] Joined order room: ${res.room}`);
      }
    });

    socket.on("delivery:location", (data) => {
      if (data && data.latitude && data.longitude) {
        setPartnerLocation([data.latitude, data.longitude]);
      }
    });

    const handleStatusUpdate = (payload) => {
      if (payload && payload.order) {
        setOrder(payload.order);
      } else {
        fetchOrder(true);
      }
    };

    socket.on("order:status_updated", handleStatusUpdate);

    return () => {
      socket.off("delivery:location");
      socket.off("order:status_updated", handleStatusUpdate);
    };
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    // Live auto-polling every 3 seconds for instant status updates
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleCopyOrderId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      toast.success("Order ID copied to clipboard!");
    }
  };

  if (loading && !order) {
    return (
      <div className="app-page p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="app-muted text-sm font-semibold">Loading live order tracking...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="app-page p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="text-red-400 mb-3" />
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p className="app-muted text-sm mb-6">{error || "Could not locate this order."}</p>
        <Link
          to="/orders"
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const currentRank = getStatusRank(order);
  const activeStepNumber = currentRank + 1;
  const isCancelled = order.userStatus?.includes("CANCELLED") || order.vendorStatus === "REJECTED";
  const orderIdString = String(order._id);
  const storeName = order.store?.name || "Store";
  const storePhone = order.store?.emergencyContact || order.store?.phone || "";

  return (
    <div className="app-page p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="app-control flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <button
          onClick={() => fetchOrder(true)}
          className="app-control flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin text-amber-500" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Order Main Summary Card */}
      <div className="app-card p-6 sm:p-8 rounded-3xl border border-border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold app-heading tracking-tight">
                Order <span className="font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 font-bold">#{orderIdString}</span>
              </h1>
              <button
                onClick={handleCopyOrderId}
                className="p-1.5 rounded-lg app-control text-xs app-muted hover:text-amber-500 transition cursor-pointer"
                title="Copy Order ID"
              >
                <Copy size={14} />
              </button>
              {isCancelled && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  Cancelled / Rejected
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-amber-500 mt-1">{storeName}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-2xl font-mono font-extrabold text-amber-500">
              ₹{order.grandTotal?.toFixed(2)}
            </span>
            <p className="app-muted text-xs mt-1">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Live Order Status Stepper */}
        <div className="py-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider app-muted mb-4 text-center">
            LIVE ORDER STATUS
          </h2>

          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center text-red-400 text-sm font-bold">
              Order has been cancelled or rejected by vendor.
            </div>
          ) : (
            <div className="w-full">
              <Stepper activeStep={activeStepNumber} hideFooter={true}>
                {STATUS_STEPS.map((step, idx) => {
                  const isCurrent = idx === currentRank;
                  const isDone = idx < currentRank;

                  return (
                    <Step key={step.key}>
                      <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl app-panel-soft border border-border w-full">
                        <div className="flex items-center justify-center gap-3 flex-wrap mb-2">
                          <h3 className={`text-lg sm:text-xl font-extrabold ${isCurrent ? 'text-amber-500' : isDone ? 'text-green-500' : 'app-muted'}`}>
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full">
                              In Progress
                            </span>
                          )}
                          {isDone && (
                            <span className="bg-green-500/20 text-green-500 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm app-muted font-medium max-w-lg leading-relaxed">{step.desc}</p>
                      </div>
                    </Step>
                  );
                })}
              </Stepper>
            </div>
          )}
        </div>

        {/* Delivery OTP Verification Card for Customer */}
        {order.deliveryOtp && !isCancelled && order.deliveryStatus !== "DELIVERED" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Delivery Verification PIN
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share this 4-digit PIN with your delivery partner upon arrival to complete delivery.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-amber-500/40">
              <span className="font-mono text-2xl font-black text-amber-400 tracking-widest">
                {order.deliveryOtp}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.deliveryOtp);
                  toast.success("Delivery OTP copied to clipboard!");
                }}
                className="p-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                title="Copy OTP"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Live Order Map */}
        {!isCancelled && (
          <div className="space-y-2 my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider app-muted flex items-center gap-2">
                <Navigation size={14} className="text-amber-500" /> Live Delivery Route & Tracking
              </h3>
              {partnerLocation || (order.liveDeliveryLocation?.coordinates?.length === 2 && order.liveDeliveryLocation.coordinates[0] !== 0) ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Rider Live GPS Stream
                </span>
              ) : (
                <span className="text-[11px] font-medium app-muted">
                  Auto-Fitted Route View
                </span>
              )}
            </div>

            <LiveOrderMap
              storeCoords={
                order.store?.location?.coordinates?.length === 2
                  ? [order.store.location.coordinates[1], order.store.location.coordinates[0]]
                  : [22.286, 70.792]
              }
              customerCoords={
                order.deliveryAddress?.location?.coordinates?.length === 2
                  ? [order.deliveryAddress.location.coordinates[1], order.deliveryAddress.location.coordinates[0]]
                  : [22.2904, 70.7915]
              }
              partnerCoords={
                partnerLocation ||
                (order.liveDeliveryLocation?.coordinates?.length === 2 && order.liveDeliveryLocation.coordinates[0] !== 0
                  ? [order.liveDeliveryLocation.coordinates[1], order.liveDeliveryLocation.coordinates[0]]
                  : null)
              }
              storeName={order.store?.name || "Store"}
              customerName={order.deliveryAddress?.customerName || "Customer"}
              partnerName={order.deliveryPartner?.name || "Delivery Rider"}
              height="350px"
            />
          </div>
        )}

        {/* Divider */}
        <div className="pt-2 border-t border-border" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Delivery Partner */}
          <div className="app-card p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider app-muted">
                Delivery Partner
              </span>
            </div>
            <p className="text-sm font-semibold mt-1">
              {order.deliveryPartner?.name || "Not assigned yet"}
            </p>
            {order.deliveryPartner?.phoneNumber && (
              <a
                href={`tel:${order.deliveryPartner.phoneNumber}`}
                className="inline-flex items-center gap-1 text-xs text-amber-500 font-bold mt-1 hover:underline"
              >
                <Phone size={12} /> Call Partner
              </a>
            )}
          </div>

          {/* Store Info */}
          <div className="app-card p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-1">
              <StoreIcon size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider app-muted">
                Store
              </span>
            </div>
            <p className="text-sm font-semibold mt-1 truncate">{storeName}</p>
            {storePhone ? (
              <a
                href={`tel:${storePhone}`}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer"
              >
                <Phone size={12} /> Call Store
              </a>
            ) : (
              <span className="text-xs app-muted mt-1 inline-block">Phone N/A</span>
            )}
          </div>

          {/* Payment */}
          <div className="app-card p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider app-muted">
                Payment
              </span>
            </div>
            <p className="text-sm font-semibold mt-1">
              {order.paymentType === "UPI" ? "Online UPI" : "Cash on Delivery"}
            </p>
            <span
              className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                order.paymentStatus === "PAID"
                  ? "bg-green-500/10 text-green-500 border border-green-500/30"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
              }`}
            >
              {order.paymentStatus || "PENDING"}
            </span>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-extrabold uppercase tracking-wider app-muted mb-3 flex items-center gap-2">
            <Package size={14} /> Items Ordered ({order.items?.length || 0})
          </h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs app-muted font-bold">{item.quantity}x</span>
                  <span className="font-medium truncate">{item.productName}</span>
                </div>
                <span className="font-mono font-semibold">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm font-bold">
            <span>Grand Total</span>
            <span className="font-mono text-amber-500 text-base">₹{order.grandTotal?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
