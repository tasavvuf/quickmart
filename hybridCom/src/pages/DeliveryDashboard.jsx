import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Package,
  Navigation,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  ShoppingBag,
  ShieldAlert,
  ChevronRight,
  User,
  Store as StoreIcon,
  X,
  ShieldCheck,
} from "lucide-react";
import { api, getApiErrorMessage } from "../lib/api";
import { UserContext } from "../context/UserContext";
import { formatAddress } from "../lib/adapters";
import LiveOrderMap from "../components/LiveOrderMap";
import { socket } from "../lib/socket";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("available"); // 'available' | 'active' | 'history'
  const [stats, setStats] = useState({ totalDeliveries: 0, isAvailable: true, isVerified: true });
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [riderGps, setRiderGps] = useState(null);

  // GPS Watcher & Socket.IO Streaming for Active Delivery
  useEffect(() => {
    if (!activeOrder?._id) return;

    const orderId = activeOrder._id;

    socket.emit("order:join", { orderId }, (res) => {
      if (res?.success) {
        console.log(`[Rider Socket] Joined room ${res.room}`);
      }
    });

    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setRiderGps([latitude, longitude]);

          socket.emit("delivery:location", {
            orderId,
            latitude,
            longitude,
          });
        },
        (err) => {
          console.warn("[Rider GPS Error]:", err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeOrder?._id]);

  const handleVerifyAndDeliver = async (e) => {
    e?.preventDefault();
    if (!otpInput || otpInput.trim().length !== 4) {
      toast.error("Please enter a valid 4-digit Delivery OTP");
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.patch(`/delivery/orders/${activeOrder._id}/status`, {
        status: "DELIVERED",
        otp: otpInput.trim(),
      });
      toast.success("Delivery OTP verified! Order successfully delivered 🎉");
      setShowOtpModal(false);
      setOtpInput("");
      setActiveOrder(null);
      setActiveTab("history");
      loadDashboardData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "OTP Verification failed. Check 4-digit code with customer."));
    } finally {
      setActionLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async (showToastOnRefresh = false) => {
    try {
      if (showToastOnRefresh) setRefreshing(true);

      const [statsRes, availableRes, activeRes, historyRes] = await Promise.allSettled([
        api.get("/delivery/dashboard"),
        api.get("/delivery/available-orders"),
        api.get("/delivery/active"),
        api.get("/delivery/my-orders"),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
      if (availableRes.status === "fulfilled") {
        setAvailableOrders(availableRes.value.data.orders || []);
      }
      if (activeRes.status === "fulfilled") {
        const order = activeRes.value.data.order;
        setActiveOrder(order);
        if (order && activeTab === "available") {
          setActiveTab("active"); // auto-switch to active if an order is in progress
        }
      }
      if (historyRes.status === "fulfilled") {
        setHistoryOrders(historyRes.value.data.orders || []);
      }

      if (showToastOnRefresh) toast.success("Dashboard refreshed");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load delivery dashboard data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto refresh every 10 seconds for real-time available orders
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Accept Order (Atomic)
  const handleAcceptOrder = async (orderId) => {
    setActionLoading(true);
    try {
      const response = await api.post(`/delivery/accept/${orderId}`);
      toast.success("Delivery accepted! Navigate to pickup store.");
      setActiveOrder(response.data.order);
      setActiveTab("active");
      loadDashboardData();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Order was already accepted by another delivery partner!");
      } else {
        toast.error(getApiErrorMessage(err, "Failed to accept delivery"));
      }
      loadDashboardData();
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status Transition
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/delivery/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated: ${newStatus.replace(/_/g, " ")}`);
      
      if (newStatus === "DELIVERED") {
        setActiveOrder(null);
        setActiveTab("history");
      } else {
        setActiveOrder(response.data.order);
      }
      loadDashboardData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setActionLoading(false);
    }
  };

  // Status Action Helper Button
  const getNextStatusAction = (currentDeliveryStatus) => {
    switch (currentDeliveryStatus) {
      case "ASSIGNED":
        return { next: "PICKED_UP", label: "Mark as Picked Up from Store", bg: "bg-amber-500 hover:bg-amber-400 text-black" };
      case "PICKED_UP":
        return { next: "OUT_FOR_DELIVERY", label: "Start Out for Delivery", bg: "bg-blue-600 hover:bg-blue-500 text-white" };
      case "OUT_FOR_DELIVERY":
        return { next: "DELIVERED", label: "Mark Order as Delivered", bg: "bg-emerald-600 hover:bg-emerald-500 text-white" };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="app-card border border-border/80 rounded-3xl p-6 shadow-xl backdrop-blur-xl bg-card/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">{user?.name || "Delivery Partner"}</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Partner Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{user?.phoneNumber || "Partner"}</span> • 
              <span className="text-amber-400 font-semibold">{user?.deliveryPartnerProfile?.vehicleType || "Vehicle"} ({user?.deliveryPartnerProfile?.vehicleNumber || "Verified"})</span>
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-secondary/30 border border-border text-center">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</span>
            <span className="text-lg font-black text-foreground">{stats.totalDeliveries}</span>
          </div>

          <div className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-secondary/30 border border-border text-center">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Status</span>
            <span className={`text-xs font-extrabold ${activeOrder ? "text-amber-400" : "text-emerald-400"}`}>
              {activeOrder ? "On Delivery" : "Ready for Orders"}
            </span>
          </div>

          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all shrink-0"
            title="Refresh Available Orders"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-secondary/30 border border-border/80">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "available"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Available Orders</span>
          {availableOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black text-amber-400 font-black">
              {availableOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "active"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Active Delivery</span>
          {activeOrder && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "history"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>

      {/* TAB CONTENT 1: AVAILABLE ORDERS (within 20km) */}
      {activeTab === "available" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>Orders Ready for Pickup</span>
              <span className="text-xs font-medium text-muted-foreground">(Within 20km radius)</span>
            </h2>
            <span className="text-xs text-muted-foreground">Auto-refreshes every 10s</span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="app-card border border-border/80 rounded-3xl p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No available orders right now</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Orders ready at stores within 20km will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => (
                <div
                  key={order._id}
                  className="app-card border border-border/80 hover:border-amber-500/40 rounded-3xl p-5 shadow-lg backdrop-blur-xl bg-card/60 space-y-4 transition-all"
                >
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-foreground">
                        ₹{order.totalAmount}
                      </span>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                        {order.paymentType} • {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Pickup Store & Customer Delivery */}
                  <div className="space-y-3">
                    {/* Store Info */}
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/60">
                      <StoreIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>{order.store?.name || "Store"}</span>
                          <span className="text-amber-400 font-extrabold flex items-center gap-1">
                            <Navigation className="w-3 h-3" /> {order.distanceToStore} km away
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1">{formatAddress(order.store?.address) || "Store Location"}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/40">
                      <User className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>Delivery to {order.customer?.name || "Customer"}</span>
                          <span className="text-muted-foreground text-[11px]">
                            Store → Customer: {order.storeToCustomerDistance} km
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1">{formatAddress(order.deliveryAddress) || "Customer Address"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={actionLoading || !!activeOrder}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    {activeOrder ? (
                      "Complete current active delivery first"
                    ) : (
                      <>
                        Accept Delivery Order <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ACTIVE DELIVERY */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {!activeOrder ? (
            <div className="app-card border border-border/80 rounded-3xl p-12 text-center space-y-3">
              <Bike className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No active delivery in progress</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Select an order from the 'Available Orders' tab to start delivering.
              </p>
            </div>
          ) : (
            <div className="app-card border border-border/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl bg-card/60 space-y-6">
              
              {/* Active Order Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    CURRENT ACTIVE DELIVERY
                  </span>
                  <h2 className="text-xl font-extrabold text-foreground mt-2">
                    Order #{activeOrder._id.substring(activeOrder._id.length - 8).toUpperCase()}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-foreground">₹{activeOrder.totalAmount}</span>
                  <p className="text-xs font-bold text-amber-400">{activeOrder.paymentType} Payment</p>
                </div>
              </div>

              {/* Progress Stepper for Delivery Status */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Delivery Execution Progress
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  {[
                    { key: "ASSIGNED", label: "Assigned" },
                    { key: "PICKED_UP", label: "Picked Up" },
                    { key: "OUT_FOR_DELIVERY", label: "On The Way" },
                    { key: "DELIVERED", label: "Delivered" },
                  ].map((step, idx) => {
                    const stepOrder = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
                    const currentIdx = stepOrder.indexOf(activeOrder.deliveryStatus);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isDone ? "bg-amber-500" : "bg-border/60"
                          } ${isCurrent ? "ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20" : ""}`}
                        />
                        <span className={`text-[11px] block ${isDone ? "text-amber-400 font-black" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button for Next Transition */}
              {(() => {
                const action = getNextStatusAction(activeOrder.deliveryStatus);
                if (!action) return null;

                return (
                  <button
                    onClick={() => {
                      if (action.next === "DELIVERED") {
                        setOtpInput("");
                        setShowOtpModal(true);
                      } else {
                        handleUpdateStatus(activeOrder._id, action.next);
                      }
                    }}
                    disabled={actionLoading}
                    className={`w-full py-4 px-6 ${action.bg} font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer`}
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {action.label} <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                );
              })()}

              {/* Live Navigation Map for Delivery Partner */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-400" /> Live Road Route & Navigation Map
                  </span>
                  {riderGps && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live GPS Broadcasting
                    </span>
                  )}
                </span>

                <LiveOrderMap
                  storeCoords={
                    activeOrder.store?.location?.coordinates?.length === 2
                      ? [activeOrder.store.location.coordinates[1], activeOrder.store.location.coordinates[0]]
                      : [22.286, 70.792]
                  }
                  customerCoords={
                    activeOrder.deliveryAddress?.location?.coordinates?.length === 2
                      ? [activeOrder.deliveryAddress.location.coordinates[1], activeOrder.deliveryAddress.location.coordinates[0]]
                      : [22.2904, 70.7915]
                  }
                  partnerCoords={riderGps}
                  storeName={activeOrder.store?.name || "Store"}
                  customerName={activeOrder.customer?.name || "Customer"}
                  partnerName={user?.name || "Rider"}
                  height="300px"
                />
              </div>

              {/* Store & Customer Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Store Pickup Card */}
                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <StoreIcon className="w-4 h-4" /> 1. Store Pickup Location
                    </span>
                    {activeOrder.store?.emergencyContact && (
                      <a
                        href={`tel:${activeOrder.store.emergencyContact}`}
                        className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Store
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">{activeOrder.store?.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatAddress(activeOrder.store?.address) || "Store Address"}</p>
                  </div>
                </div>

                {/* Customer Drop Card */}
                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> 2. Customer Drop-off Location
                    </span>
                    {activeOrder.customer?.phoneNumber && (
                      <a
                        href={`tel:${activeOrder.customer.phoneNumber}`}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Customer
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">{activeOrder.customer?.name || "Customer"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatAddress(activeOrder.deliveryAddress) || "Customer Address"}</p>
                  </div>
                </div>

              </div>

              {/* Items List Summary */}
              <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 space-y-2">
                <span className="text-xs font-bold text-foreground block">Order Items Summary ({activeOrder.items?.length || 0} items)</span>
                <div className="divide-y divide-border/40 text-xs">
                  {activeOrder.items?.map((item, i) => (
                    <div key={i} className="py-2 flex justify-between">
                      <span className="text-foreground font-medium">{item.name} × {item.quantity}</span>
                      <span className="text-muted-foreground font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Alert if COD */}
              {activeOrder.paymentType === "COD" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-400" /> Collect Cash on Delivery (COD) from Customer
                  </span>
                  <span className="text-base font-black text-amber-400">₹{activeOrder.totalAmount}</span>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Completed Deliveries</h2>

          {historyOrders.length === 0 ? (
            <div className="app-card border border-border/80 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No completed deliveries yet</h3>
              <p className="text-xs text-muted-foreground">Your delivered orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyOrders.map((order) => (
                <div
                  key={order._id}
                  className="app-card border border-border/80 rounded-2xl p-4 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Delivered
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Store: <strong className="text-foreground">{order.store?.name}</strong> • Customer: <strong className="text-foreground">{order.customer?.name}</strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Delivered at: {new Date(order.deliveredAt || order.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-foreground">₹{order.totalAmount}</span>
                    <span className="block text-[10px] text-muted-foreground">{order.paymentType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4-Digit Customer Delivery OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="app-card w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 bg-card text-foreground space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">Verify Customer OTP</h3>
                  <p className="text-xs text-muted-foreground">Ask customer for their 4-digit PIN</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput("");
                }}
                className="p-2 rounded-xl app-control text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifyAndDeliver} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider text-center">
                  Enter 4-Digit Delivery PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-full text-center text-3xl font-mono font-black tracking-widest py-3.5 bg-secondary/40 border-2 border-amber-500/40 rounded-2xl focus:outline-none focus:border-amber-500 text-amber-400"
                />
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Customer can view this 4-digit PIN in their order tracking screen.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput("");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-xs font-bold hover:bg-secondary/40 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || otpInput.length !== 4}
                  className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify PIN & Deliver <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
