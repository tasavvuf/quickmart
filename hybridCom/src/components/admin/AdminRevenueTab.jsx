import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Calendar as CalendarIcon,
  TrendingUp,
  ShoppingBag,
  Store as StoreIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react";
import { api, getApiErrorMessage } from "../../lib/api";
import { toast } from "react-toastify";

export default function AdminRevenueTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  const fetchRevenueData = useCallback(async (start = "", end = "", storeId = "") => {
    setLoading(true);
    try {
      let url = "/admin/revenue";
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);
      if (storeId) params.append("storeId", storeId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load platform revenue analytics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setFilterType("CUSTOM");
    setSelectedDayKey(null);
    fetchRevenueData(startDate, endDate, selectedStoreId);
  };

  const handleResetFilter = () => {
    setFilterType("ALL");
    setStartDate("");
    setEndDate("");
    setSelectedStoreId("");
    setSelectedDayKey(null);
    fetchRevenueData();
  };

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  const dailyMap = {};
  if (data?.dailyBreakdown) {
    data.dailyBreakdown.forEach((item) => {
      dailyMap[item.date] = item;
    });
  }

  let displayOrders = data?.deliveredOrders || [];
  if (selectedDayKey) {
    displayOrders = displayOrders.filter((o) => {
      const dKey = new Date(o.deliveredAt || o.createdAt).toISOString().split("T")[0];
      return dKey === selectedDayKey;
    });
  }

  const summary = data?.summary || {
    totalMerchandiseSales: 0,
    totalPlatformFees: 0,
    totalDeliveryFees: 0,
    totalGrossCustomerPaid: 0,
    totalDeliveredOrders: 0,
    totalItemsSold: 0,
    todaySales: 0,
    todayPlatformFees: 0,
    todayOrdersCount: 0,
    thisWeekSales: 0,
    thisWeekPlatformFees: 0,
    thisWeekOrdersCount: 0,
    thisMonthSales: 0,
    thisMonthPlatformFees: 0,
    thisMonthOrdersCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#363537] flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
              <IndianRupee size={20} />
            </span>
            <span>Platform Revenue & Financial Intelligence</span>
          </h2>
          <p className="text-xs text-[#706f73] mt-0.5 font-medium">
            System-wide gross merchandise value (GMV), vendor revenue, platform commission fees, and delivery collection
          </p>
        </div>

        <button
          onClick={() => fetchRevenueData(startDate, endDate, selectedStoreId)}
          className="px-4 py-2 rounded-2xl bg-white border border-[#e5e5e7] text-[#363537] text-xs font-bold flex items-center gap-2 hover:bg-[#f6f6f7] transition cursor-pointer shrink-0 shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#363537]" : ""} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV / Merchandise Value */}
        <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider">
              Total GMV (Vendor Sales)
            </span>
            <span className="p-2 rounded-xl bg-[#f6f6f7] text-[#363537]">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#363537] font-mono">
            ₹{(Number(summary.totalMerchandiseSales) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#706f73] font-medium">
            {summary.totalDeliveredOrders || 0} delivered orders • {summary.totalItemsSold || 0} items sold
          </p>
        </div>

        {/* Platform Fees Earned */}
        <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider">
              Platform Fees Earned
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <IndianRupee size={16} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            ₹{(Number(summary.totalPlatformFees) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#706f73] font-medium">
            Platform fee collected per checkout
          </p>
        </div>

        {/* Today's GMV */}
        <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider">
              Today's GMV Sales
            </span>
            <span className="p-2 rounded-xl bg-[#f6f6f7] text-[#363537]">
              <CalendarIcon size={16} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#363537] font-mono">
            ₹{(Number(summary.todaySales) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#706f73] font-medium">
            {summary.todayOrdersCount || 0} orders delivered today (₹{summary.todayPlatformFees || 0} fee)
          </p>
        </div>

        {/* This Month's GMV */}
        <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider">
              This Month's GMV
            </span>
            <span className="p-2 rounded-xl bg-[#f6f6f7] text-[#363537]">
              <ShoppingBag size={16} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#363537] font-mono">
            ₹{(Number(summary.thisMonthSales) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#706f73] font-medium">
            {summary.thisMonthOrdersCount || 0} orders this month (₹{summary.thisMonthPlatformFees || 0} fee)
          </p>
        </div>
      </div>

      {/* Interactive Calendar & Filter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar View (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eeeeef]">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#363537]" />
              <h3 className="font-extrabold text-base text-[#363537]">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl bg-[#f6f6f7] text-[#706f73] hover:text-[#363537] transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentCalendarDate(new Date())}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-[#f6f6f7] text-[#363537] hover:bg-[#e5e5e7]"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl bg-[#f6f6f7] text-[#706f73] hover:text-[#363537] transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase tracking-wider text-[#9e9da2]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Slots */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[48px] sm:h-16 rounded-xl sm:rounded-2xl bg-[#fbfbfb] opacity-40" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(dayNum).padStart(2, "0");
              const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
              const dayData = dailyMap[dateKey];
              const isSelected = selectedDayKey === dateKey;
              const isToday = new Date().toISOString().split("T")[0] === dateKey;

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
                      ? "border-[#363537] bg-[#363537]/10 ring-2 ring-[#363537]"
                      : dayData
                      ? "border-[#363537]/30 bg-[#fbfbfb] hover:border-[#363537] hover:bg-white cursor-pointer shadow-xs"
                      : "border-[#e5e5e7]/60 bg-[#fbfbfb]"
                  } ${isToday && !isSelected ? "ring-1 ring-amber-500" : ""}`}
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                    <span className={isToday ? "text-amber-600 font-black" : "text-[#706f73]"}>
                      {dayNum}
                    </span>
                    {dayData && (
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {dayData ? (
                    <div className="text-right">
                      <div className="text-[9px] sm:text-[10px] font-mono font-black text-[#363537] truncate">
                        ₹{dayData.merchandiseSales.toFixed(0)}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-[#706f73] font-semibold leading-tight hidden sm:block">
                        {dayData.ordersCount} {dayData.ordersCount === 1 ? "ord" : "ords"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[8px] text-[#9e9da2]/50 text-center">-</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#eeeeef] flex items-center justify-between text-xs text-[#706f73]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[#363537]/10 border border-[#363537]/30 inline-block" />
              Active sales days (click to filter list below)
            </span>
            {selectedDayKey && (
              <button
                onClick={() => setSelectedDayKey(null)}
                className="text-[#363537] font-bold hover:underline"
              >
                Clear Day Selection ({selectedDayKey})
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Custom Filter & Vendor Store Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Custom Date Range Filter */}
          <div className="bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#eeeeef]">
              <Filter size={16} className="text-[#363537]" />
              <h3 className="font-extrabold text-sm text-[#363537]">Filter by Date Range</h3>
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#706f73] mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-[#fbfbfb] border border-[#e5e5e7] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#706f73] mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-[#fbfbfb] border border-[#e5e5e7] font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#363537] hover:bg-[#201f21] text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Apply Date Filter
                </button>
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="px-3.5 py-2.5 rounded-xl bg-[#f6f6f7] hover:bg-[#e5e5e7] text-[#363537] font-bold text-xs transition cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Top Stores Leaderboard */}
          <div className="bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-[#eeeeef]">
              <StoreIcon size={16} className="text-[#363537]" />
              <h3 className="font-extrabold text-sm text-[#363537]">Top Selling Vendor Stores</h3>
            </div>

            {(!data?.storeLeaderboard || data.storeLeaderboard.length === 0) ? (
              <p className="text-xs text-[#706f73] py-2">No vendor sales data available yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {data.storeLeaderboard.map((item, idx) => (
                  <div
                    key={item.storeId || idx}
                    className="p-3 rounded-2xl bg-[#fbfbfb] border border-[#e5e5e7] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-[#363537] block truncate">{item.storeName}</span>
                      <span className="text-[10px] text-[#706f73] font-medium">
                        {item.ordersCount} orders • {item.itemsSold} items sold
                      </span>
                    </div>
                    <span className="font-mono font-black text-[#363537] shrink-0">
                      ₹{item.merchandiseSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivered Platform Orders Breakdown */}
      <div className="bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeef]">
          <h3 className="font-extrabold text-sm text-[#363537] flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>
              Delivered Orders Breakdown {selectedDayKey ? `(${selectedDayKey})` : `(${displayOrders.length})`}
            </span>
          </h3>
          <span className="text-xs text-[#706f73] font-medium">Pure Item Sales + Fees</span>
        </div>

        {displayOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#706f73] font-medium">
            No delivered orders found matching this selection.
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl bg-[#fbfbfb] border border-[#e5e5e7] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-[#e5e5e7] text-[#363537]">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-[#363537]">
                      Store: {order.store?.name || "Store"}
                    </span>
                    <span className="text-[11px] text-[#706f73]">
                      Customer: {order.customer?.name || "Customer"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-[#363537]">
                      ₹{order.grandTotal}
                    </span>
                    <span className="block text-[10px] text-[#706f73]">
                      Delivered: {new Date(order.deliveredAt || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-2.5 rounded-xl bg-white border border-[#e5e5e7] space-y-1 text-xs text-[#706f73]">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="truncate max-w-xs text-[#363537] font-medium">
                        {it.quantity}x {it.productName}
                      </span>
                      <span className="font-mono font-medium">
                        ₹{it.priceAtPurchase} × {it.quantity} = ₹{it.subtotal || (it.priceAtPurchase * it.quantity)}
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
