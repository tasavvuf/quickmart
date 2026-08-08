import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  PackageCheck,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  CreditCard,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function VendorOrdersTab({ orders, loading, onUpdateOrderStatus, onRefresh }) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filters = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Preparing", value: "PREPARING" },
    { label: "Ready", value: "READY" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try { setUpdatingId(orderId); await onUpdateOrderStatus(orderId, newStatus); } finally { setUpdatingId(null); }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedFilter === "ALL" ? true
        : selectedFilter === "REJECTED" ? order.vendorStatus === "REJECTED" || order.userStatus?.includes("CANCELLED")
          : order.vendorStatus === selectedFilter;
    const matchesSearch = searchQuery
      ? order.deliveryAddress?.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
        || order.deliveryAddress?.phone?.includes(searchQuery)
        || order._id?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (vendorStatus, userStatus) => {
    if (userStatus?.includes("CANCELLED")) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1.5"><XCircle size={14} /> Cancelled</span>;
    }
    const map = {
      PENDING: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30", icon: <Clock size={14} />, label: "Pending" },
      ACCEPTED: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30", icon: <CheckCircle size={14} />, label: "Accepted" },
      PREPARING: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30", icon: <ChefHat size={14} />, label: "Preparing" },
      READY: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/30", icon: <PackageCheck size={14} />, label: "Ready" },
      PICKED_UP: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30", icon: <PackageCheck size={14} />, label: "Picked Up" },
      OUT_FOR_DELIVERY: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", icon: <PackageCheck size={14} />, label: "Out for Delivery" },
      DELIVERED: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30", icon: <CheckCircle size={14} />, label: "Delivered ✓" },
      REJECTED: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30", icon: <XCircle size={14} />, label: "Rejected" },
    };
    const s = map[vendorStatus] || { bg: "bg-muted", text: "app-muted", border: "border-border", icon: null, label: vendorStatus };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text} border ${s.border} flex items-center gap-1.5 ${vendorStatus === "PENDING" ? "animate-pulse" : ""}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === f.value
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "app-control"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 app-muted" size={16} />
            <input
              type="text"
              placeholder="Search customer, phone, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="app-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
            />
          </div>
          <button onClick={onRefresh} className="app-control p-2.5 rounded-xl" title="Refresh Orders">
            <RefreshCw size={16} className={loading ? "animate-spin text-amber-500" : ""} />
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-20 text-center app-muted">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl app-card app-muted">
          <Clock className="mx-auto mb-3" size={40} />
          <h3 className="text-lg font-bold app-heading mb-1">No Orders Found</h3>
          <p className="text-xs">{searchQuery ? "No orders match your search." : "No orders in this status."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const isUpdating = updatingId === order._id;
            return (
              <div key={order._id} className="app-card p-6 rounded-3xl space-y-4">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                        #{order._id}
                      </span>
                      <span className="text-xs app-muted font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                      {getStatusBadge(order.vendorStatus, order.userStatus)}
                    </div>
                    <h3 className="text-base font-bold app-heading flex items-center gap-2 pt-1">
                      {order.deliveryAddress?.customerName || "Customer"}
                      <span className="text-xs font-mono font-normal app-muted flex items-center gap-1">
                        <Phone size={12} /> {order.deliveryAddress?.phone || "N/A"}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 justify-between lg:justify-end">
                    <div className="text-right">
                      <div className="text-xs app-muted flex items-center justify-end gap-1.5">
                        <CreditCard size={13} />
                        <span className="font-semibold">{order.paymentType} ({order.paymentStatus})</span>
                      </div>
                      <div className="text-xl font-extrabold text-amber-500">₹{order.grandTotal}</div>
                    </div>
                  </div>
                </div>

                {/* Address & Items */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="app-panel-soft p-4 rounded-2xl space-y-2">
                    <div className="text-xs font-bold app-heading uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-amber-500" /> Delivery Location
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      {order.deliveryAddress?.customerName || "Customer"} ({order.deliveryAddress?.phone || "No phone"})
                    </p>
                    <p className="text-xs app-muted leading-relaxed">
                      {order.deliveryAddress?.fullAddress ||
                        `${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.area || ""}, ${order.deliveryAddress?.city || ""}`}
                    </p>
                    {order.deliveryAddress?.location?.coordinates?.length === 2 && (
                      <div className="pt-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.location.coordinates[1]},${order.deliveryAddress.location.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:underline"
                        >
                          View Location on Map ({order.deliveryAddress.location.coordinates[1].toFixed(4)}, {order.deliveryAddress.location.coordinates[0].toFixed(4)})
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 app-panel-soft p-4 rounded-2xl space-y-3">
                    <div className="text-xs font-bold app-heading uppercase tracking-wider flex items-center justify-between">
                      <span>Order Items ({order.items.length})</span>
                      <span className="text-[11px] app-muted font-normal">Fixed Snapshot Price</span>
                    </div>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl app-card text-xs">
                          <div className="flex items-center gap-3">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded-lg border border-border" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center app-muted font-bold text-xs">IMG</div>
                            )}
                            <div>
                              <span className="font-bold app-heading block">{item.productName}</span>
                              <span className="app-muted text-[11px]">₹{item.priceAtPurchase} × {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-amber-500 font-mono">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="text-xs app-muted hover:text-amber-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <History size={14} />
                    {isExpanded ? "Hide History" : "View History"}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {order.vendorStatus === "PENDING" && (
                      <>
                        <button disabled={isUpdating} onClick={() => handleStatusChange(order._id, "REJECTED")}
                          className="app-control px-4 py-2 rounded-xl text-destructive text-xs font-bold disabled:opacity-50">Reject</button>
                        <button disabled={isUpdating} onClick={() => handleStatusChange(order._id, "ACCEPTED")}
                          className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition-all shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50">Accept Order</button>
                      </>
                    )}
                    {order.vendorStatus === "ACCEPTED" && (
                      <button disabled={isUpdating} onClick={() => handleStatusChange(order._id, "PREPARING")}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50">Start Preparing</button>
                    )}
                    {order.vendorStatus === "PREPARING" && (
                      <button disabled={isUpdating} onClick={() => handleStatusChange(order._id, "READY")}
                        className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-50">Mark Ready</button>
                    )}
                    {order.vendorStatus === "READY" && (
                      <div className="flex items-center gap-2 text-xs">
                        {order.deliveryPartner ? (
                          <span className="text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-1.5">
                            <PackageCheck size={14} /> Assigned to Partner: {order.deliveryPartner.name}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                            Waiting for Delivery Partner Pickup
                          </span>
                        )}
                      </div>
                    )}
                    {order.vendorStatus === "PICKED_UP" && (
                      <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/30 flex items-center gap-1.5">
                        <PackageCheck size={14} /> Picked Up by Partner ({order.deliveryPartner?.name || "Rider"})
                      </span>
                    )}
                    {order.vendorStatus === "OUT_FOR_DELIVERY" && (
                      <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/30 flex items-center gap-1.5">
                        <PackageCheck size={14} /> Out for Delivery ({order.deliveryPartner?.name || "Rider"})
                      </span>
                    )}
                    {order.vendorStatus === "DELIVERED" && (
                      <span className="text-xs text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Order Delivered
                      </span>
                    )}
                    {order.vendorStatus === "REJECTED" && (
                      <span className="text-xs text-destructive font-bold bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/30">Order Terminated</span>
                    )}
                  </div>
                </div>

                {/* Status History Drawer */}
                {isExpanded && (
                  <div className="app-panel-soft p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold app-heading uppercase tracking-wider mb-2">Status Change Logs</h4>
                    <div className="space-y-1.5 text-xs app-muted">
                      {order.statusHistory?.map((h, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-border last:border-none">
                          <span className="font-semibold text-amber-500">{h.status}</span>
                          <span className="text-[11px]">by {h.updatedBy} at {new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
