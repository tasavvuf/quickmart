import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { CartContext } from "../context/CartContext";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptStore } from "../lib/adapters";
import { ShoppingCart, Trash2, AlertTriangle } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="app-card flex flex-col justify-between p-4 rounded-3xl h-64 w-56 animate-pulse">
      <div>
        <div className="w-full h-36 rounded-2xl bg-muted/80 mb-2" />
        <div className="h-5 w-3/4 bg-muted/80 rounded-md mb-2" />
        <div className="h-px w-full bg-muted/60 my-1.5" />
        <div className="h-4 w-1/3 bg-muted/60 rounded-md" />
      </div>
      <div className="h-9 w-full bg-muted/80 rounded-xl mt-2" />
    </div>
  );
}

function Vendor() {
  const { vendorId } = useParams();
  const { lat, lng, calculateDistance } = useContext(LocationDataContext);
  const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    items,
  } = useContext(CartContext);

  const [vendor, setVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVendor = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/stores/${vendorId}`);
        if (cancelled) return;

        const rawStore = response.data?.store;
        if (!rawStore) {
          setError("Store not found");
          setVendor(null);
          setVendorProducts([]);
          return;
        }

        const adapted = adaptStore(rawStore);
        setVendor(adapted);
        setVendorProducts(adapted.products);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Failed to load store"));
        setVendor(null);
        setVendorProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchVendor();
    return () => { cancelled = true; };
  }, [vendorId]);

  const distance =
    vendor?.location?.lat != null &&
    vendor?.location?.lng != null &&
    lat != null &&
    lng != null
      ? calculateDistance(lat, lng, vendor.location.lat, vendor.location.lng)
      : null;

  const isClosed = vendor && !vendor.isOpen;

  // Loading state
  if (isLoading) {
    return (
      <div className={`app-page p-6 ${items.length ? "pb-36" : ""}`}>
        {/* Banner skeleton */}
        <div className="relative mb-16">
          <div className="w-full h-56 rounded-2xl bg-muted/80 animate-pulse" />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 rounded-full bg-muted/80 border-4 border-caramel animate-pulse" />
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="h-8 w-48 bg-muted/80 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-5 w-24 bg-muted/60 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-4 p-6 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`app-page p-6 flex flex-col items-center justify-center min-h-[50vh] ${items.length ? "pb-36" : ""}`}>
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="app-muted text-sm">{error}</p>
      </div>
    );
  }

  // No vendor found (shouldn't normally happen after error state, but safety net)
  if (!vendor) {
    return (
      <div className={`app-page p-6 ${items.length ? "pb-36" : ""}`}>
        <div className="mt-4 app-muted text-lg text-center">
          Store not found.
        </div>
      </div>
    );
  }

  return (
    <div className={`app-page p-6 ${items.length ? "pb-36" : ""}`}>
      {/* Banner with logo overlay at bottom */}
      <div className="relative mb-16">
        {vendor?.banner && (
          <img
            loading="lazy"
            src={`${vendor.banner}?w=300&q=60&auto=format&fit=crop`}
            alt={vendor.name}
            className="w-full h-56 object-cover rounded-2xl"
          />
        )}

        {vendor?.logo && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              loading="lazy"
              src={`${vendor.logo}?w=300&q=60&auto=format&fit=crop`}
              alt={vendor.name}
              className="w-28 h-28 object-cover rounded-full border-4 border-caramel bg-card shadow-xl shadow-caramel/30"
            />
          </div>
        )}
      </div>

      {/* Vendor name with enhanced styling */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-chocolate to-caramel mb-2">
          {vendor?.name || vendorId}
        </h1>
        {vendor?.category && (
          <span className="inline-block text-sm font-semibold text-caramel bg-caramel/10 px-4 py-1 rounded-full">
            {vendor.category}
          </span>
        )}
        {vendor?.rating != null && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-highlight text-lg">★</span>
            <span className="font-semibold">{vendor.rating}</span>
            <span className="app-muted text-sm">
              ({vendor.totalReviews} reviews)
            </span>
          </div>
        )}
        {/* Open / Closed status */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {vendor?.isOpen ? (
            <>
              <span className="text-green-400 text-lg">✓</span>
              <span className="font-semibold">Open</span>
            </>
          ) : (
            <>
              <span className="text-red-400 text-lg">✕</span>
              <span className="font-semibold text-red-400">Closed</span>
            </>
          )}
        </div>
        {vendor?.location && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="app-muted text-sm">{vendor.location.city}</span> |
            <span className="app-muted text-sm">{vendor.location.address}</span>{" "}
            |
            {distance ? (
              <>
                <span className="app-muted text-sm">{distance} km away</span> |
                <span className="app-muted text-sm">
                  {Math.round(distance * 5)} mins to deliver
                </span>
              </>
            ) : (
              <span className="app-muted text-sm">
                Fetch location to see distance
              </span>
            )}
          </div>
        )}
      </div>

      {/* Closed store banner */}
      {isClosed && (
        <div className="mx-auto max-w-lg mb-6 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-red-400 font-semibold text-sm">
            🚫 This store is currently closed. You can browse products but cannot add to cart.
          </p>
        </div>
      )}

      {vendorProducts.length === 0 && (
        <div className="mt-4 app-muted text-lg text-center">
          No products found for this vendor.
        </div>
      )}

      {/* 🧠 Products */}
      <div className="flex flex-wrap gap-4 p-6 justify-center">
        {vendorProducts.map((elem) => {
          const inCart = items.find((item) => item.id === elem.id);
          const isOutOfStock = elem.stock === 0;
          const isDisabled = isClosed || isOutOfStock;

          return (
            <div
              key={elem.id}
              className={`app-card flex flex-col justify-between p-4 rounded-3xl h-64 w-56 transition-opacity ${
                isDisabled ? "opacity-60" : ""
              }`}
            >
              <div>
                <div className="relative">
                  <img
                    loading="lazy"
                    src={`${elem.image}?w=300&q=60&auto=format&fit=crop`}
                    alt={elem.name}
                    className="w-full h-36 object-cover rounded-2xl"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                      <span className="text-white text-xs font-bold bg-red-500/90 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold leading-tight">{elem.name}</h3>
                <div className="app-divider w-full h-px my-1.5" />
                <span className="text-caramel font-mono text-base">
                  ₹{elem.price}
                </span>
              </div>

              {inCart && !isDisabled ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => decreaseQuantity(elem.id)}
                      className="app-control w-7 h-7 flex items-center justify-center rounded-lg text-caramel font-bold text-sm hover:border-caramel/50 hover:shadow-[0_0_8px_color-mix(in_srgb,var(--color-caramel)_20%,transparent)] transition-all active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sm tabular-nums min-w-[2ch] text-center">
                      {inCart.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(elem.id)}
                      className="app-control w-7 h-7 flex items-center justify-center rounded-lg text-green-500 font-bold text-sm hover:border-green-500/50 hover:shadow-[0_0_8px_rgba(34,197,94,0.2)] transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(elem.id)}
                    className="w-full flex items-center justify-center gap-1 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-95"
                  >
                    <Trash2 size={11} />
                    Remove from Cart
                  </button>
                </div>
              ) : (
                <button
                  disabled={isDisabled}
                  onClick={() => !isDisabled && addToCart(elem.id, vendor.id)}
                  className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                    isDisabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-primary text-primary-foreground cursor-pointer active:scale-95 hover:opacity-90 shadow-primary/20"
                  }`}
                >
                  <ShoppingCart size={14} />
                  {isOutOfStock
                    ? "Out of Stock"
                    : isClosed
                      ? "Store Closed"
                      : "Add to Cart"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Vendor;
