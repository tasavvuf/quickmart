import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { api, getApiErrorMessage } from "../lib/api";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Store as StoreIcon,
  Play,
  Zap,
  RotateCw,
} from "lucide-react";

import VendorOverviewTab from "../components/vendor/VendorOverviewTab";
import VendorOrdersTab from "../components/vendor/VendorOrdersTab";
import VendorProductsTab from "../components/vendor/VendorProductsTab";
import VendorStoreTab from "../components/vendor/VendorStoreTab";

export default function VendorDashboard() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [autoSimulate, setAutoSimulate] = useState(false);
  const autoSimulateRef = useRef(autoSimulate);
  autoSimulateRef.current = autoSimulate;

  const fetchDashboard = useCallback(async () => {
    try {
      setErrorMessage("");
      const res = await api.get("/vendor/dashboard");
      if (res.data.success) {
        setStats(res.data);
        setStore(res.data.store);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Failed to load vendor store data"));
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get("/vendor/orders");
      if (res.data.success) setOrders(res.data.orders);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get("/vendor/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (error) {
      console.error("Products fetch error:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingDashboard(true);
      await Promise.all([fetchDashboard(), fetchOrders(), fetchProducts()]);
      setLoadingDashboard(false);
    };
    loadAll();
  }, [fetchDashboard, fetchOrders, fetchProducts]);

  const handleTriggerSimulator = async (count = 1) => {
    try {
      const res = await api.post("/vendor/orders/simulator/trigger", { count });
      if (res.data.success) {
        toast.success(`⚡ ${res.data.orders.length} New Order Generated!`, { position: "top-right" });
        fetchOrders();
        fetchDashboard();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to simulate order"));
    }
  };

  useEffect(() => {
    let intervalId;
    if (autoSimulate) {
      intervalId = setInterval(() => {
        if (autoSimulateRef.current) handleTriggerSimulator(1);
      }, 8000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [autoSimulate]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        fetchDashboard();
        fetchProducts();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update order status"));
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const res = await api.post("/vendor/products", productData);
      if (res.data.success) { toast.success("Product created!"); fetchProducts(); fetchDashboard(); }
    } catch (error) { toast.error(getApiErrorMessage(error, "Failed to create product")); }
  };

  const handleUpdateProduct = async (productId, updateData) => {
    try {
      const res = await api.patch(`/vendor/products/${productId}`, updateData);
      if (res.data.success) { toast.success("Product updated!"); fetchProducts(); fetchDashboard(); }
    } catch (error) { toast.error(getApiErrorMessage(error, "Failed to update product")); }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const res = await api.delete(`/vendor/products/${productId}`);
      if (res.data.success) { toast.success("Product deleted!"); fetchProducts(); fetchDashboard(); }
    } catch (error) { toast.error(getApiErrorMessage(error, "Failed to delete product")); }
  };

  const handleUpdateStore = async (storeData) => {
    try {
      const res = await api.patch("/vendor/store", storeData);
      if (res.data.success) { setStore(res.data.store); toast.success("Store details saved!"); fetchDashboard(); }
    } catch (error) { toast.error(getApiErrorMessage(error, "Failed to update store details")); }
  };

  const handleToggleStoreOpen = async () => {
    if (!store) return;
    await handleUpdateStore({ isOpen: !store.isOpen });
  };

  const pendingOrdersCount = stats?.pendingOrders || 0;

  const tabClasses = (tab) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
      activeTab === tab
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        : "app-control"
    }`;

  return (
    <div className="app-page p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="app-card border-destructive/50 bg-destructive/10 p-4 rounded-2xl text-destructive text-sm font-bold">
            {errorMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl border-2 border-caramel/60 overflow-hidden shadow-lg shadow-caramel/10">
              {store?.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center font-bold text-xl text-caramel">
                  {store?.name?.charAt(0) || "V"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold app-heading tracking-tight">{store?.name || "My Store"}</h1>
                <button
                  onClick={handleToggleStoreOpen}
                  className={`app-control px-3 py-0.5 rounded-full text-xs font-bold ${
                    store?.isOpen ? "text-green-500 border-green-500/40" : "text-destructive border-destructive/40"
                  }`}
                >
                  ● {store?.isOpen ? "STORE OPEN" : "STORE CLOSED"}
                </button>
              </div>
              <p className="app-muted text-xs mt-0.5">
                {store?.category || "Local E-commerce Store"} • {store?.address?.city || ""}
              </p>
            </div>
          </div>

          {/* Simulator Controls */}
          <div className="flex items-center gap-3 app-card p-2 rounded-2xl">
            <div className="px-3 py-1 text-xs font-bold text-caramel flex items-center gap-1.5 border-r border-border">
              <Zap size={14} className="fill-caramel" /> Simulator
            </div>
            <button
              onClick={() => handleTriggerSimulator(1)}
              className="app-control flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caramel text-xs font-bold active:scale-95"
            >
              <Play size={13} className="fill-current" /> Generate Order
            </button>
            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`app-control flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                autoSimulate ? "text-green-500 border-green-500/40" : ""
              }`}
            >
              <RotateCw size={13} className={autoSimulate ? "animate-spin" : ""} />
              Auto: {autoSimulate ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
          <button onClick={() => setActiveTab("overview")} className={tabClasses("overview")}>
            <LayoutDashboard size={16} /> Overview
          </button>
          <button onClick={() => setActiveTab("orders")} className={tabClasses("orders")}>
            <ShoppingBag size={16} /> Orders
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-caramel text-primary-foreground animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("products")} className={tabClasses("products")}>
            <Package size={16} /> Products ({products.length})
          </button>
          <button onClick={() => setActiveTab("store")} className={tabClasses("store")}>
            <StoreIcon size={16} /> Store Settings
          </button>
        </div>

        {/* Content */}
        <div className="pt-2">
          {activeTab === "overview" && (
            <VendorOverviewTab stats={stats} loading={loadingDashboard} onToggleStoreOpen={handleToggleStoreOpen} onTriggerSimulator={handleTriggerSimulator} onNavigateTab={(t) => setActiveTab(t)} />
          )}
          {activeTab === "orders" && (
            <VendorOrdersTab orders={orders} loading={loadingOrders} onUpdateOrderStatus={handleUpdateOrderStatus} onRefresh={() => { fetchOrders(); fetchDashboard(); }} />
          )}
          {activeTab === "products" && (
            <VendorProductsTab products={products} loading={loadingProducts} onCreateProduct={handleCreateProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} />
          )}
          {activeTab === "store" && (
            <VendorStoreTab store={store} onUpdateStore={handleUpdateStore} />
          )}
        </div>
      </div>
    </div>
  );
}
