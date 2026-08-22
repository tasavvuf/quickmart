import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../lib/api";
import { toast } from "react-toastify";

export default function VendorRevenueTab({ store }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterType, setFilterType] = useState("ALL"); // ALL, TODAY, WEEK, MONTH, CUSTOM
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(null); // 'YYYY-MM-DD'

  const fetchRevenueData = useCallback(async (start = "", end = "") => {
    setLoading(true);
    try {
      let url = "/vendor/revenue";
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load revenue analytics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    if (!startDate && !endDate) {
      toast.info("Please select at least a start date or end date");
      return;
    }
    setFilterType("CUSTOM");
    setSelectedDayKey(null);
    fetchRevenueData(startDate, endDate);
  };

  const handleResetFilter = () => {
    setFilterType("ALL");
    setStartDate("");
    setEndDate("");
    setSelectedDayKey(null);
    fetchRevenueData();
  };

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  // Map daily breakdown for quick lookup
  const dailyMap = {};
  if (data?.dailyBreakdown) {
    data.dailyBreakdown.forEach((item) => {
      dailyMap[item.date] = item;
    });
  }

  // Filter delivered orders for the bottom list
  let displayOrders = data?.deliveredOrders || [];
  if (selectedDayKey) {
    displayOrders = displayOrders.filter((o) => {
      const dKey = new Date(o.deliveredAt || o.createdAt).toISOString().split("T")[0];
      return dKey === selectedDayKey;
    });
  } else if (filterType === "TODAY") {
    const todayKey = new Date().toISOString().split("T")[0];
    displayOrders = displayOrders.filter((o) => {
      const dKey = new Date(o.deliveredAt || o.createdAt).toISOString().split("T")[0];
      return dKey === todayKey;
    });
  } else if (filterType === "CUSTOM" && (startDate || endDate)) {
    displayOrders = displayOrders.filter((o) => {
      const d = new Date(o.deliveredAt || o.createdAt);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }

  const summary = data?.summary || {
    totalLifetimeRevenue: 0,
    totalDeliveredOrders: 0,
    totalItemsSold: 0,
    todayRevenue: 0,
    todayOrdersCount: 0,
    thisWeekRevenue: 0,
    thisWeekOrdersCount: 0,
    thisMonthRevenue: 0,
    thisMonthOrdersCount: 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Policy Explanation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black app-heading flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
              <IndianRupee size={22} />
            </span>
            <span>Vendor Revenue & Earnings</span>
          </h2>
          <p className="text-xs app-muted mt-1">
            Real-time analytics and calendar breakdown of your delivered product sales profit
          </p>
        </div>

        <button
          onClick={() => fetchRevenueData(startDate, endDate)}
          className="app-control shrink-0 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 hover:border-amber-500 transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-amber-500" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Pure Revenue Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground flex items-start gap-3">
        <Info size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
            Pure Vendor Merchandise Sales Profit
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All revenue metrics below reflect <strong>pure product selling price (MRP at delivery time)</strong> from successfully delivered orders. Platform fees and delivery charges are completely excluded.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lifetime Revenue */}
        <div className="app-card p-5 rounded-3xl border border-border shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider app-muted">Total Lifetime</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp size={16} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-amber-500">
              ₹{(Number(summary.totalLifetimeRevenue) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] app-muted mt-1 flex items-center gap-2">
              <span>{summary.totalDeliveredOrders || 0} delivered orders</span>
              <span>•</span>
              <span>{summary.totalItemsSold || 0} items sold</span>
            </p>
          </div>
        </div>

        {/* This Month's Revenue */}
        <div className="app-card p-5 rounded-3xl border border-border shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider app-muted">This Month</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <CalendarIcon size={16} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-foreground">
              ₹{(Number(summary.thisMonthRevenue) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] app-muted mt-1">
              {summary.thisMonthOrdersCount || 0} orders delivered this month
            </p>
          </div>
        </div>

        {/* This Week's Revenue */}
        <div className="app-card p-5 rounded-3xl border border-border shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider app-muted">This Week</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ShoppingBag size={16} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-foreground">
              ₹{(Number(summary.thisWeekRevenue) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] app-muted mt-1">
              {summary.thisWeekOrdersCount || 0} orders delivered this week
            </p>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="app-card p-5 rounded-3xl border border-border shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider app-muted">Today</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-500">
              ₹{(Number(summary.todayRevenue) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] app-muted mt-1">
              {summary.todayOrdersCount || 0} orders delivered today
            </p>
          </div>
        </div>
      </div>

      {/* Custom Range & Calendar Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Calendar with Daily Revenue Markers (7 cols) */}
        <div className="lg:col-span-7 app-card p-6 rounded-3xl border border-border shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-500" />
              <h3 className="font-extrabold text-base app-heading">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl app-control hover:bg-muted transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentCalendarDate(new Date())}
                className="px-2.5 py-1 text-xs font-bold rounded-xl app-control hover:bg-muted"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl app-control hover:bg-muted transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider app-muted">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[48px] sm:h-16 rounded-xl sm:rounded-2xl bg-secondary/10 opacity-30" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(dayNum).padStart(2, "0");
              const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
              const dayData = dailyMap[dateKey];
              const isSelected = selectedDayKey === dateKey;
              const isToday =
                new Date().toISOString().split("T")[0] === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => {
                    if (dayData) {
                      setSelectedDayKey(isSelected ? null : dateKey);
                    }
                  }}
                  className={`min-h-[48px] sm:h-16 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500"
                      : dayData
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                      : "border-border/60 bg-card/50"
                  } ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                    <span className={isToday ? "text-amber-500 font-extrabold" : "app-muted"}>
                      {dayNum}
                    </span>
                    {dayData && (
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {dayData ? (
                    <div className="text-right">
                      <div className="text-[9px] sm:text-[10px] font-mono font-black text-emerald-500 truncate">
                        ₹{dayData.revenue.toFixed(0)}
                      </div>
                      <div className="text-[8px] sm:text-[9px] app-muted leading-tight font-medium hidden sm:block">
                        {dayData.ordersCount} {dayData.ordersCount === 1 ? "order" : "orders"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[8px] text-muted-foreground/30 text-center">-</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs app-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 inline-block" />
              Green days indicate delivered orders
            </span>
            {selectedDayKey && (
              <button
                onClick={() => setSelectedDayKey(null)}
                className="text-amber-500 font-bold hover:underline"
              >
                Clear Day Selection ({selectedDayKey})
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Custom Range Picker & Active Filter Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Custom Date Range Filter Card */}
          <div className="app-card p-6 rounded-3xl border border-border shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Filter size={18} className="text-amber-500" />
              <h3 className="font-bold app-heading text-base">Custom Date Range</h3>
            </div>

            <form onSubmit={handleApplyCustomFilter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider app-muted mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="app-input w-full p-2.5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider app-muted mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="app-input w-full p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Apply Range Filter
                </button>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="px-3.5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border transition cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Custom Range Result Box */}
            {summary.customRangeRevenue != null && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  Filtered Period Revenue
                </span>
                <div className="text-2xl font-black font-mono text-amber-500">
                  ₹{(Number(summary.customRangeRevenue) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs app-muted">
                  {summary.customRangeOrdersCount || 0} orders delivered between {startDate || "Start"} to {endDate || "Today"}
                </p>
              </div>
            )}
          </div>

          {/* Quick Selection Filter Shortcuts */}
          <div className="app-card p-5 rounded-3xl border border-border shadow-md space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider app-muted">
              Quick Filter Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterType("ALL");
                  setSelectedDayKey(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  filterType === "ALL" && !selectedDayKey
                    ? "border-amber-500 bg-amber-500/15 text-amber-500"
                    : "border-border bg-secondary/30 hover:bg-secondary/60 text-foreground"
                }`}
              >
                All Lifetime Orders
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterType("TODAY");
                  setSelectedDayKey(null);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  filterType === "TODAY" && !selectedDayKey
                    ? "border-amber-500 bg-amber-500/15 text-amber-500"
                    : "border-border bg-secondary/30 hover:bg-secondary/60 text-foreground"
                }`}
              >
                Today's Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivered Orders Breakdown Feed */}
      <div className="app-card p-6 rounded-3xl border border-border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-amber-500" />
            <h3 className="font-bold app-heading text-base">
              Delivered Orders Breakdown
              {selectedDayKey ? ` for ${selectedDayKey}` : ""} ({displayOrders.length})
            </h3>
          </div>
          <span className="text-xs font-semibold app-muted">
            Net Vendor Profit per order
          </span>
        </div>

        {displayOrders.length === 0 ? (
          <div className="p-8 text-center app-muted space-y-2">
            <ShoppingBag size={32} className="mx-auto text-muted-foreground/40" />
            <p className="text-sm font-bold">No delivered orders found for this selection.</p>
            <p className="text-xs">Only orders that have been successfully delivered contribute to vendor revenue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      #{order._id.slice(-8)}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {order.customerName || "Customer"}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={11} /> DELIVERED
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-emerald-500">
                      +₹{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                    <div className="text-[10px] app-muted">
                      {new Date(order.deliveredAt || order.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>

                {/* Items in this delivered order */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider app-muted mb-1">
                    Delivered Items & Pricing
                  </div>
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span className="truncate max-w-xs font-medium text-foreground">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-mono font-semibold">
                        ₹{item.priceAtPurchase || item.price || 0} × {item.quantity} = ₹{item.subtotal || (item.priceAtPurchase * item.quantity) || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
