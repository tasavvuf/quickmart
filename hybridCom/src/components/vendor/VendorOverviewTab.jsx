import React from "react";
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle2,
  Package,
  AlertTriangle,
  IndianRupee,
  Store as StoreIcon,
  Play,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function VendorOverviewTab({
  stats,
  loading,
  onToggleStoreOpen,
  onTriggerSimulator,
  onNavigateTab,
}) {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const cards = [
    { title: "Today's Orders", value: stats.todaysOrders || 0, icon: ShoppingBag, accent: "text-blue-500" },
    { title: "Pending Orders", value: stats.pendingOrders || 0, icon: Clock, accent: "text-amber-500", highlight: stats.pendingOrders > 0 },
    { title: "Preparing", value: stats.preparingOrders || 0, icon: ChefHat, accent: "text-purple-500" },
    { title: "Ready for Pickup", value: stats.readyOrders || 0, icon: CheckCircle2, accent: "text-green-500" },
    { title: "Total Products", value: stats.totalProducts || 0, icon: Package, accent: "text-cyan-500" },
    { title: "Low Stock Items", value: stats.lowStockProducts || 0, icon: AlertTriangle, accent: "text-red-500", highlight: stats.lowStockProducts > 0 },
    { title: "Today's Revenue", value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: IndianRupee, accent: "text-amber-500" },
    { title: "Store Status", value: stats.isOpen ? "OPEN" : "CLOSED", icon: StoreIcon, accent: stats.isOpen ? "text-green-500" : "text-muted-foreground", isStatusToggle: true },
  ];

  return (
    <div className="space-y-8">
      {/* Simulator Banner */}
      <div className="app-card app-card-hover p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold app-heading">Vendor Operations Dashboard</h2>
            <p className="text-sm app-muted">Manage live orders, inventory stock, and store availability in real-time.</p>
          </div>
        </div>
        <button
          onClick={() => onTriggerSimulator(1)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 cursor-pointer"
        >
          <Play size={16} className="fill-current" /> Simulate 1 Order
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="app-card app-card-hover p-5 rounded-2xl transition-all hover:translate-y-[-2px] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider app-muted">{card.title}</span>
                <div className={`p-2.5 rounded-xl bg-muted ${card.accent}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight app-heading">{card.value}</span>
                {card.isStatusToggle && (
                  <button
                    onClick={onToggleStoreOpen}
                    className={`app-control text-xs px-3 py-1 rounded-full font-bold ${
                      stats.isOpen ? "text-green-500 border-green-500/40" : "text-destructive border-destructive/40"
                    }`}
                  >
                    Toggle {stats.isOpen ? "Close" : "Open"}
                  </button>
                )}
              </div>
              {card.highlight && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => onNavigateTab("orders")} className="app-card app-card-hover p-6 rounded-2xl cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-400/20">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold app-heading group-hover:text-amber-500 transition-colors">Order Management</h3>
                <p className="text-xs app-muted">Accept → Preparing → Ready</p>
              </div>
            </div>
            <ArrowRight size={20} className="app-muted group-hover:text-amber-500 transition-all group-hover:translate-x-1" />
          </div>
          <div className="flex items-center gap-4 text-xs font-medium app-muted pt-2 border-t border-border">
            <span>Pending: <strong className="text-amber-500">{stats.pendingOrders}</strong></span>
            <span>•</span>
            <span>Preparing: <strong className="text-purple-500">{stats.preparingOrders}</strong></span>
            <span>•</span>
            <span>Ready: <strong className="text-green-500">{stats.readyOrders}</strong></span>
          </div>
        </div>

        <div onClick={() => onNavigateTab("products")} className="app-card app-card-hover p-6 rounded-2xl cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Package size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold app-heading group-hover:text-cyan-500 transition-colors">Product Inventory</h3>
                <p className="text-xs app-muted">Manage catalog, prices, and stock</p>
              </div>
            </div>
            <ArrowRight size={20} className="app-muted group-hover:text-cyan-500 transition-all group-hover:translate-x-1" />
          </div>
          <div className="flex items-center gap-4 text-xs font-medium app-muted pt-2 border-t border-border">
            <span>Total: <strong className="text-cyan-500">{stats.totalProducts}</strong></span>
            <span>•</span>
            <span>Low Stock: <strong className="text-red-500">{stats.lowStockProducts}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
