import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Shield,
  Store as StoreIcon,
  Bike,
  Users,
  ShoppingBag,
  Clock,
  RefreshCw,
  Eye,
  FileText,
  LogOut,
  MapPin,
  Phone,
  Check,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { api, getApiErrorMessage } from "../lib/api";
import { UserContext } from "../context/UserContext";
import { formatAddress } from "../lib/adapters";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, setUser, setIsLoggedIn } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'stores' | 'vendors' | 'delivery' | 'orders'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [stores, setStores] = useState([]);
  const [storeStatusFilter, setStoreStatusFilter] = useState("ALL");
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerDocs, setSelectedPartnerDocs] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  // Load Admin Console Data
  const loadAdminData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);

      const [overviewRes, storesRes, vendorsRes, partnersRes, ordersRes] = await Promise.allSettled([
        api.get("/admin/overview"),
        api.get("/admin/stores"),
        api.get("/admin/vendors"),
        api.get("/admin/delivery-partners"),
        api.get("/admin/orders"),
      ]);

      if (overviewRes.status === "fulfilled") setOverviewData(overviewRes.value.data.data);
      if (storesRes.status === "fulfilled") setStores(storesRes.value.data.stores || []);
      if (vendorsRes.status === "fulfilled") setVendors(vendorsRes.value.data.vendors || []);
      if (partnersRes.status === "fulfilled") setPartners(partnersRes.value.data.partners || []);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data.orders || []);

      if (showToast) toast.success("Console refreshed");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load admin data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Unauthorized: Access restricted to Administrators");
      navigate("/admin/login");
      return;
    }
    loadAdminData();
  }, [user]);

  const handleVerifyStore = async (storeId, isApproved) => {
    setActionLoadingId(storeId);
    try {
      const res = await api.patch(`/admin/stores/${storeId}/verify`, { isApproved });
      toast.success(res.data?.message || `Store ${isApproved ? "Approved" : "Rejected"}`);
      loadAdminData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Verification update failed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyPartner = async (partnerId, isVerified) => {
    setActionLoadingId(partnerId);
    try {
      const res = await api.patch(`/admin/delivery-partners/${partnerId}/verify`, { isVerified });
      toast.success(res.data?.message || `Rider status updated`);
      loadAdminData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Verification update failed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore
    }
    setUser(null);
    setIsLoggedIn(false);
    toast.info("Logged out");
    navigate("/admin/login");
  };

  const filteredStores = stores.filter((s) => {
    if (storeStatusFilter === "PENDING_APPROVAL") return !s.isVerifiedByAdmin;
    if (storeStatusFilter === "VERIFIED") return s.isVerifiedByAdmin;
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "ALL") {
      return o.vendorStatus === orderStatusFilter || o.deliveryStatus === orderStatusFilter;
    }
    return true;
  });

  if (loading && !overviewData) {
    return (
      <div
        className="admin-monochrome min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: "#fbfbfb", color: "#363537", fontFamily: "'Satoshi', 'Satoshi Fallback', sans-serif" }}
      >
        <div className="flex items-center gap-3 font-bold text-xs tracking-wide uppercase text-[#363537]">
          <div className="w-5 h-5 border-2 border-[#363537] border-t-transparent rounded-full animate-spin" />
          Loading Admin Console...
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-monochrome min-h-screen p-4 sm:p-8 pb-24 space-y-6"
      style={{
        backgroundColor: "#fbfbfb",
        color: "#363537",
        fontFamily: "'Satoshi', 'Satoshi Fallback', sans-serif",
      }}
    >
      {/* Console Top Header */}
      <header className="bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#363537] text-[#fbfbfb] flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#363537]">
                QuickMart Admin
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                Root Access
              </span>
            </div>
            <p className="text-xs text-[#706f73] mt-0.5 font-medium">
              Administrator: <strong className="text-[#363537]">{user?.email || "admin@ecom.com"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => loadAdminData(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-[#ffffff] hover:bg-[#f4f4f5] border border-[#e5e5e7] text-[#363537] transition shrink-0 cursor-pointer"
            title="Refresh Console"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-[#ffffff] hover:bg-[#f4f4f5] border border-[#e5e5e7] text-[#363537] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#706f73]" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Monochrome Navigation Tabs */}
      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#e5e5e7] overflow-x-auto shadow-sm">
        {[
          { key: "overview", label: "Overview", icon: Shield, badge: null },
          { key: "stores", label: "Store Approvals", icon: StoreIcon, badge: overviewData?.metrics?.pendingStores },
          { key: "vendors", label: "Vendors Roster", icon: Users, badge: null },
          { key: "delivery", label: "Delivery Fleet", icon: Bike, badge: overviewData?.metrics?.pendingPartners },
          { key: "orders", label: "Platform Orders", icon: ShoppingBag, badge: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#363537] text-[#fbfbfb] font-black shadow-sm"
                  : "text-[#706f73] hover:text-[#363537] hover:bg-[#f6f6f7]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-[#fbfbfb] text-[#363537]"
                      : "bg-[#363537] text-[#fbfbfb]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && overviewData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider block">
                Total Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#363537]">
                ₹{overviewData.metrics.totalRevenue.toFixed(2)}
              </div>
              <span className="text-[11px] text-[#706f73] font-medium block">Combined store volume</span>
            </div>

            <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider block">
                Total Orders
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#363537]">
                {overviewData.metrics.totalOrders}
              </div>
              <span className="text-[11px] text-[#706f73] font-medium block">Across platform</span>
            </div>

            <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider block">
                Stores
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#363537] flex items-center gap-2">
                <span>{overviewData.metrics.totalStores}</span>
                {overviewData.metrics.pendingStores > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7] font-bold">
                    {overviewData.metrics.pendingStores} Pending
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#706f73] font-medium block">{overviewData.metrics.totalVendors} Vendor accounts</span>
            </div>

            <div className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold tracking-wider block">
                Delivery Fleet
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#363537] flex items-center gap-2">
                <span>{overviewData.metrics.totalPartners}</span>
                {overviewData.metrics.pendingPartners > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7] font-bold">
                    {overviewData.metrics.pendingPartners} Unverified
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#706f73] font-medium block">Registered Riders</span>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white border border-[#e5e5e7] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3">
              <h2 className="text-sm font-extrabold text-[#363537] flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#706f73]" />
                <span>Recent Platform Activity</span>
              </h2>
              <span className="text-xs text-[#9e9da2] font-medium">Real-time Order Stream</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-extrabold text-[#706f73] border-b border-[#e5e5e7] bg-[#fbfbfb]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Store</th>
                    <th className="p-3">Vendor Phase</th>
                    <th className="p-3">Delivery Phase</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeef]">
                  {overviewData.recentOrders?.map((order) => (
                    <tr key={order._id} className="hover:bg-[#fbfbfb] transition">
                      <td className="p-3 font-mono font-extrabold text-[#363537]">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="p-3 font-semibold text-[#363537]">{order.customer?.name || "Customer"}</td>
                      <td className="p-3 text-[#706f73] font-medium">{order.store?.name || "Store"}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                          {order.vendorStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-[#363537]">₹{order.grandTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE APPROVALS */}
      {activeTab === "stores" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#363537]">Store Approval Management</h2>
              <p className="text-xs text-[#706f73] font-medium">Verify vendor registrations and store availability</p>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5e5e7] text-xs shadow-sm">
              {["ALL", "PENDING_APPROVAL", "VERIFIED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStoreStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                    storeStatusFilter === f
                      ? "bg-[#363537] text-[#fbfbfb]"
                      : "text-[#706f73] hover:text-[#363537]"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStores.map((store) => (
              <div key={store._id} className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-[#eeeeef] pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#363537] flex items-center gap-2">
                      <span>{store.name}</span>
                      {store.isVerifiedByAdmin ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-[#363537] text-[#363537]">
                          Pending Approval
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#706f73] font-semibold mt-0.5">{store.category}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#706f73] bg-[#fbfbfb] px-2.5 py-1 rounded-lg border border-[#e5e5e7]">
                    GST: {store.gstNumber || "N/A"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#363537]">
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#9e9da2] shrink-0" />
                    <span>Owner: <strong className="text-[#363537]">{store.owner?.name || "Vendor"}</strong> ({store.owner?.email})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#9e9da2] shrink-0" />
                    <span>Emergency Phone: <strong className="text-[#363537]">{store.emergencyContact || store.owner?.phoneNumber || "N/A"}</strong></span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#9e9da2] shrink-0 mt-0.5" />
                    <span className="text-[#706f73] font-medium">{formatAddress(store.address)}</span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#eeeeef]">
                  {!store.isVerifiedByAdmin ? (
                    <button
                      onClick={() => handleVerifyStore(store._id, true)}
                      disabled={actionLoadingId === store._id}
                      className="flex-1 py-2.5 px-4 bg-[#363537] hover:bg-[#201f21] text-[#fbfbfb] font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve & Activate Store
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerifyStore(store._id, false)}
                      disabled={actionLoadingId === store._id}
                      className="flex-1 py-2.5 px-4 bg-[#ffffff] hover:bg-[#f4f4f5] text-[#363537] border border-[#e5e5e7] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-[#706f73]" /> Revoke Store Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VENDORS ROSTER */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#363537]">Registered Vendors ({vendors.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v._id} className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#363537] text-[#fbfbfb] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#363537]">{v.name}</h3>
                    <p className="text-xs text-[#706f73] font-medium">{v.email}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#fbfbfb] border border-[#e5e5e7] text-xs space-y-1">
                  <span className="text-[10px] text-[#9e9da2] uppercase font-extrabold block">Associated Store</span>
                  <div className="font-bold text-[#363537]">{v.store?.name || "No Store Linked"}</div>
                  <div className="text-[#706f73] text-[11px] font-medium">{v.store?.category || "General"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY PARTNERS & DOCUMENT INSPECTOR */}
      {activeTab === "delivery" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#363537]">Delivery Partner Roster ({partners.length})</h2>
              <p className="text-xs text-[#706f73] font-medium">Inspect ImageKit uploaded identity & vehicle documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((p) => {
              const prof = p.deliveryPartnerProfile || {};
              const docs = prof.documents || {};
              const docCount = Object.values(docs).filter((d) => d?.url).length;

              return (
                <div key={p._id} className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-[#eeeeef] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#363537] text-[#fbfbfb] flex items-center justify-center font-bold shrink-0">
                        <Bike className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#363537] flex items-center gap-2">
                          <span>{p.name}</span>
                          {prof.isVerified ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                              Verified Rider
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-[#363537] text-[#363537]">
                              Pending Verification
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#706f73] font-medium">{p.phoneNumber} • {prof.vehicleType || "Vehicle"} ({prof.vehicleNumber || "No RC"})</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#fbfbfb] p-3 rounded-2xl border border-[#e5e5e7]">
                    <div>
                      <span className="text-[10px] text-[#9e9da2] uppercase font-bold block">License Number</span>
                      <span className="font-mono text-[#363537] font-bold">{prof.drivingLicenseNumber || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9e9da2] uppercase font-bold block">Emergency Contact</span>
                      <span className="text-[#363537] font-medium">{prof.emergencyContactName} ({prof.emergencyContactNumber})</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPartnerDocs({ partnerName: p.name, docs })}
                      className="flex-1 py-2.5 px-3 bg-[#ffffff] hover:bg-[#f4f4f5] text-[#363537] border border-[#e5e5e7] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#706f73]" />
                      <span>Inspect Documents ({docCount})</span>
                    </button>

                    <button
                      onClick={() => handleVerifyPartner(p._id, !prof.isVerified)}
                      disabled={actionLoadingId === p._id}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                        prof.isVerified
                          ? "bg-[#ffffff] hover:bg-[#f4f4f5] text-[#363537] border border-[#e5e5e7]"
                          : "bg-[#363537] hover:bg-[#201f21] text-[#fbfbfb] shadow-sm"
                      }`}
                    >
                      {prof.isVerified ? "Revoke Verification" : "Approve Rider"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ALL PLATFORM ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-bold text-[#363537]">Platform Order Stream ({orders.length})</h2>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5e5e7] text-xs shadow-sm">
              {["ALL", "PENDING", "ACCEPTED", "PREPARING", "READY", "DELIVERED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                    orderStatusFilter === f
                      ? "bg-[#363537] text-[#fbfbfb]"
                      : "text-[#706f73] hover:text-[#363537]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white border border-[#e5e5e7] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-[#363537] text-xs bg-[#fbfbfb] px-2.5 py-1 rounded-lg border border-[#e5e5e7]">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                      Vendor: {order.vendorStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f6f7] text-[#363537] border border-[#e5e5e7]">
                      Delivery: {order.deliveryStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#363537]">
                    Store: <strong className="text-[#363537]">{order.store?.name}</strong> • Customer: <strong className="text-[#363537]">{order.customer?.name}</strong> ({order.customer?.phoneNumber})
                  </p>
                  <p className="text-[11px] text-[#706f73]">
                    Assigned Rider: {order.deliveryPartner?.name || "Unassigned"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#363537]">₹{order.grandTotal}</span>
                  <span className="block text-[10px] font-bold text-[#706f73] uppercase">{order.paymentType} • {order.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTOR MODAL */}
      {selectedPartnerDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e5e5e7] w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-[#363537] max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeef] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#363537] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#363537]" />
                  <span>Verification Documents — {selectedPartnerDocs.partnerName}</span>
                </h3>
                <p className="text-xs text-[#706f73] font-medium">Encrypted documents visible strictly to authorized Administrators</p>
              </div>
              <button
                onClick={() => setSelectedPartnerDocs(null)}
                className="p-2 rounded-xl bg-[#f6f6f7] text-[#706f73] hover:text-[#363537] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Driving License", doc: selectedPartnerDocs.docs?.drivingLicense },
                { label: "Vehicle RC", doc: selectedPartnerDocs.docs?.vehicleRC },
                { label: "Vehicle Insurance", doc: selectedPartnerDocs.docs?.vehicleInsurance },
                { label: "Aadhaar Card", doc: selectedPartnerDocs.docs?.aadhaarCard },
                { label: "PAN Card", doc: selectedPartnerDocs.docs?.panCard },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#fbfbfb] border border-[#e5e5e7] space-y-2">
                  <span className="text-xs font-bold text-[#363537] block">{item.label}</span>
                  {item.doc?.url ? (
                    <div className="space-y-2">
                      <img src={item.doc.url} alt={item.label} className="w-full h-36 object-cover rounded-xl border border-[#e5e5e7]" />
                      <a
                        href={item.doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#363537] hover:underline"
                      >
                        View Full Document Image <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-white border border-dashed border-[#e5e5e7] flex items-center justify-center text-xs text-[#9e9da2] font-medium">
                      No document uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPartnerDocs(null)}
              className="w-full py-3 bg-[#363537] hover:bg-[#201f21] text-[#fbfbfb] font-bold text-xs rounded-xl cursor-pointer shadow-sm"
            >
              Close Document Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
