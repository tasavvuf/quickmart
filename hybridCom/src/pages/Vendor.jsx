import { useContext, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { CartContext } from "../context/CartContext";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptStore, formatAddress } from "../lib/adapters";
import {
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Search,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Store as StoreIcon,
  Phone,
  Plus,
  Minus,
} from "lucide-react";

function SkeletonCard() {
  return (
    <div className="app-card flex flex-col justify-between p-4 rounded-3xl h-72 animate-pulse border border-border/60">
      <div className="space-y-3">
        <div className="w-full h-36 rounded-2xl bg-muted/80" />
        <div className="h-4 w-3/4 bg-muted/80 rounded-md" />
        <div className="h-4 w-1/3 bg-muted/60 rounded-md" />
      </div>
      <div className="h-10 w-full bg-muted/80 rounded-xl mt-4" />
    </div>
  );
}

export default function Vendor() {
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

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

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
        setVendorProducts(adapted.products || []);
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
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  const distance = useMemo(() => {
    if (
      vendor?.location?.lat != null &&
      vendor?.location?.lng != null &&
      lat != null &&
      lng != null
    ) {
      return calculateDistance(lat, lng, vendor.location.lat, vendor.location.lng);
    }
    return null;
  }, [vendor, lat, lng, calculateDistance]);

  const isClosed = vendor && !vendor.isOpen;

  // Extract unique categories from vendor products
  const categories = useMemo(() => {
    const set = new Set();
    vendorProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", "FEATURED", ...Array.from(set)];
  }, [vendorProducts]);

  // Filtered product list
  const filteredProducts = useMemo(() => {
    return vendorProducts.filter((product) => {
      // Category filter
      if (selectedCategory === "FEATURED" && !product.featured) return false;
      if (selectedCategory !== "ALL" && selectedCategory !== "FEATURED" && product.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCat = product.category?.toLowerCase().includes(query);
        return matchName || matchCat;
      }

      return true;
    });
  }, [vendorProducts, selectedCategory, searchQuery]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="app-page px-4 sm:px-6 py-6 pb-36 max-w-7xl mx-auto space-y-6">
        <div className="w-full h-48 sm:h-64 rounded-3xl bg-muted/80 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="app-page px-6 py-16 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Store Not Available</h2>
        <p className="app-muted text-sm max-w-md">{error}</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="app-page px-6 py-16 text-center app-muted text-lg">
        Store not found.
      </div>
    );
  }

  return (
    <div className={`app-page px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-8 ${items.length ? "pb-36" : "pb-16"}`}>
      {/* HERO STORE BANNER CARD */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-xl">
        {/* Background Banner Image or Gradient */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-primary via-indigo-600 to-amber-500">
          {vendor.banner ? (
            <img
              src={`${vendor.banner}?w=1200&q=80&auto=format&fit=crop`}
              alt={vendor.name}
              className="w-full h-full object-cover opacity-90 transform scale-105"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400/30 via-transparent to-black/30" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>

        {/* Store Profile Info Content */}
        <div className="relative px-6 pb-6 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full">
            {/* Store Avatar Logo */}
            <div className="relative shrink-0">
              {vendor.logo ? (
                <img
                  src={`${vendor.logo}?w=300&q=80&auto=format&fit=crop`}
                  alt={vendor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-card bg-card shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary text-primary-foreground border-4 border-card flex items-center justify-center font-black text-3xl shadow-2xl">
                  {vendor.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Title & Metadata Badges */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {vendor.name}
                </h1>
                {vendor.isVerifiedByAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Admin Verified
                  </span>
                )}
              </div>

              {/* Sub-Badges Row */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs font-semibold">
                {vendor.category && (
                  <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                    {vendor.category}
                  </span>
                )}

                {/* Open / Closed Status Pill (Static green dot, no blinking) */}
                {vendor.isOpen ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Open Now
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 font-bold">
                    <XCircle size={13} /> Store Closed
                  </span>
                )}

                {/* Rating Badge (Identical to HomeUI) */}
                {vendor.rating != null && (
                  <div className="flex items-center gap-1 text-xs font-black text-foreground bg-secondary/80 px-3 py-1 rounded-xl border border-border">
                    <Star size={13} className="fill-[#FACC15] text-[#0B132B]" />
                    <span>{vendor.rating}</span>
                    <span className="text-muted-foreground text-[11px]">({vendor.totalReviews})</span>
                  </div>
                )}
              </div>

              {/* Location & Distance Details */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-amber-400 shrink-0" />
                  {vendor.address || vendor.location?.address || "Local Marketplace"}
                </span>

                {distance != null && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock size={13} /> {distance} km away (~{Math.round(distance * 5)} mins)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚫 Store Closed Notice Banner */}
      {isClosed && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 text-xs sm:text-sm text-red-400 font-bold">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Store is currently closed for new orders. You can browse products catalog below.</span>
          </div>
        </div>
      )}

      {/* 🔍 IN-STORE SEARCH & CATEGORY FILTER TOOLBAR */}
      <div className="app-card p-4 rounded-3xl border border-border/80 space-y-4 shadow-lg backdrop-blur-xl bg-card/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${vendor.name}...`}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Counter */}
          <span className="text-xs font-bold text-muted-foreground shrink-0">
            Showing {filteredProducts.length} of {vendorProducts.length} items
          </span>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  {cat === "ALL" ? "All Items" : cat === "FEATURED" ? "Featured Picks" : cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="app-card border border-border/80 rounded-3xl p-12 text-center space-y-3">
          <StoreIcon className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No matching products found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((elem) => {
            const inCart = items.find((item) => item.id === elem.id);
            const isOutOfStock = elem.stock === 0;
            const isDisabled = isClosed || isOutOfStock;

            return (
              <div
                key={elem.id}
                className={`group app-card border border-border/80 hover:border-amber-500/40 rounded-3xl p-4 shadow-lg backdrop-blur-xl bg-card/60 flex flex-col justify-between h-full transition-all duration-300 ${
                  isDisabled ? "opacity-60" : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Product Image Box */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-secondary/40 border border-border/60">
                    {elem.image ? (
                      <img
                        loading="lazy"
                        src={`${elem.image}?w=400&q=75&auto=format&fit=crop`}
                        alt={elem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <StoreIcon size={24} className="text-muted-foreground/60" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {elem.featured && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Sparkles size={10} /> Featured
                      </span>
                    )}

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-500/90 text-white shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {elem.category || "General"}
                    </span>
                    <h3
                      className="text-xs sm:text-sm font-extrabold text-foreground leading-snug line-clamp-2"
                      title={elem.name}
                    >
                      {elem.name}
                    </h3>
                  </div>
                </div>

                {/* Price & Cart Actions */}
                <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                      ₹{elem.price}
                    </span>
                    {elem.stock > 0 && elem.stock <= 5 && (
                      <span className="text-[10px] font-bold text-amber-500">Only {elem.stock} left</span>
                    )}
                  </div>

                  {inCart && !isDisabled ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-secondary/40 border border-border p-1 rounded-xl">
                        <button
                          onClick={() => decreaseQuantity(elem.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-card text-foreground hover:text-amber-400 font-bold text-xs transition cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-extrabold text-xs tabular-nums text-foreground">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(elem.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-card text-foreground hover:text-emerald-400 font-bold text-xs transition cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(elem.id)}
                        className="w-full flex items-center justify-center gap-1 py-1 rounded-lg text-red-400 hover:bg-red-500/10 text-[10px] font-bold transition cursor-pointer"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isDisabled}
                      onClick={() => !isDisabled && addToCart(elem.id, vendor.id)}
                      className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                        isDisabled
                          ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10 active:scale-95"
                      }`}
                    >
                      <ShoppingCart size={13} />
                      <span>{isOutOfStock ? "Out of Stock" : isClosed ? "Closed" : "Add to Cart"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
