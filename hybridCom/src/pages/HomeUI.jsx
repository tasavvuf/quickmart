import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { StoreContext } from "../context/StoreContext";
import { CartContext } from "../context/CartContext";
import { api } from "../lib/api";
import { adaptProduct, adaptStore } from "../lib/adapters";
import LocationUnavailableNotice from "../components/LocationUnavailableNotice";
import { SmoothInput } from "../components/ui/skiper-ui/skiper106";
import { Search, X, MapPin, RefreshCw, Zap, Store as StoreIcon, Star, Plus, Package } from "lucide-react";

const SEARCH_STORAGE_KEY = "home_search_query";

function SkeletonCard() {
  return (
    <div className="app-card flex flex-col justify-between p-4 rounded-2xl min-h-80 w-60 animate-pulse border border-border">
      <div className="flex flex-col items-center w-full">
        <div className="w-full h-36 rounded-xl bg-muted/80 mb-3" />
        <div className="h-5 w-3/4 bg-muted/80 rounded-md mb-2" />
        <div className="h-4 w-1/2 bg-muted/60 rounded-md" />
      </div>
      <div className="app-divider w-full h-px my-3" />
      <div className="flex justify-between items-center my-2 w-full">
        <div className="h-5 w-14 bg-muted/80 rounded-md" />
        <div className="h-4 w-20 bg-muted/60 rounded-full" />
      </div>
      <div className="h-10 w-full bg-muted/80 rounded-full mt-2" />
    </div>
  );
}

export default function HomeUI() {
  const { stores, isLoadingStores } = useContext(StoreContext);
  const { items: cartItems, addToCart } = useContext(CartContext);
  const {
    lat,
    lng,
    locationSource,
    locationName,
    rePromptLocationChoice,
  } = useContext(LocationDataContext);

  const [search, setSearch] = useState(
    () => localStorage.getItem(SEARCH_STORAGE_KEY) || ""
  );
  const [savedQuery, setSavedQuery] = useState(
    () => localStorage.getItem(SEARCH_STORAGE_KEY) || ""
  );

  // Backend full-text search results state
  const [searchResults, setSearchResults] = useState({ products: [], stores: [], count: { products: 0, stores: 0 } });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    const query = search.trim();
    if (!query) {
      localStorage.removeItem(SEARCH_STORAGE_KEY);
      setSavedQuery("");
      setSearch("");
      return;
    }

    localStorage.setItem(SEARCH_STORAGE_KEY, query);
    setSavedQuery(query);
  };

  const clearSearch = () => {
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    setSearch("");
    setSavedQuery("");
    setSearchResults({ products: [], stores: [], count: { products: 0, stores: 0 } });
  };

  // Perform backend search whenever savedQuery or location changes
  useEffect(() => {
    if (!savedQuery.trim()) {
      setSearchResults({ products: [], stores: [], count: { products: 0, stores: 0 } });
      setIsSearching(false);
      return;
    }

    let active = true;
    const fetchSearchResults = async () => {
      setIsSearching(true);
      try {
        const response = await api.get("/stores/search", {
          params: {
            q: savedQuery,
            lat,
            lng,
          },
        });

        if (active && response.data?.success) {
          setSearchResults({
            products: response.data.products || [],
            stores: response.data.stores || [],
            count: response.data.count || { products: 0, stores: 0 },
          });
        }
      } catch (err) {
        console.error("Backend search error:", err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    fetchSearchResults();
    return () => {
      active = false;
    };
  }, [savedQuery, lat, lng]);

  const featuredProducts = stores.flatMap((store) => {
    return store.products
      .filter((product) => product.featured)
      .map((product) => ({ product, store }));
  });

  const locationDisplayLabel = (() => {
    if (locationSource === "saved") return "Saved Location";
    if (locationSource === "gps") return "Current GPS";
    if (locationSource === "ip") return locationName || "IP Location";
    return "Location Set";
  })();

  return (
    <div className={`app-page ${cartItems.length ? "pb-36" : "pb-12"}`}>
      {/* Search & Location Hero Section */}
      <div className="app-band hero-band py-10 px-6">
        <div className="mx-auto max-w-4xl flex flex-col items-center text-center gap-5">
          {/* Header Title */}
          <div>
            <span className="badge-yellow mb-3 inline-flex">
              <Zap size={14} className="fill-current text-[#0B132B]" /> Express Local Delivery
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Groceries & Essentials, <br className="hidden sm:inline" />
              <span className="underline decoration-[#FACC15] underline-offset-4">
                Delivered in Minutes
              </span>
            </h1>
            <p className="app-muted text-xs sm:text-sm mt-2 max-w-xl mx-auto font-medium">
              Order directly from verified hyperlocal merchants near your address with real-time live routing.
            </p>
          </div>

          {/* Interactive Search Bar Box */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-2 bg-card/90 p-2 rounded-2xl sm:rounded-full border-2 border-border shadow-xl backdrop-blur-md">
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products (e.g. Milk, Atta, Shampoo, Soap) or stores..."
                className="w-full pl-12 pr-10 py-3 bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  title="Clear Search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="btn-yellow w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full font-black text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Search</span>
            </button>
          </div>

          {/* Active Search Filter Status Banner */}
          {savedQuery && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-foreground px-4 py-1.5 rounded-full text-xs font-bold animate-in fade-in">
              <span>Search results for: <strong className="text-amber-400">"{savedQuery}"</strong></span>
              <button
                onClick={clearSearch}
                className="ml-1 text-muted-foreground hover:text-foreground font-black text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {/* Location Badge Indicator */}
          <div className="flex items-center gap-3 text-xs font-bold flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-foreground bg-secondary/80 px-3.5 py-1.5 rounded-full border border-border">
              <MapPin size={14} className="text-amber-400" />
              <span>{locationDisplayLabel}</span>
            </span>

            <button
              type="button"
              onClick={rePromptLocationChoice}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline decoration-dotted font-bold cursor-pointer transition"
            >
              <RefreshCw size={12} /> Change location
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-12">
        {/* IF SEARCH IS ACTIVE: SHOW BACKEND SEARCH RESULTS */}
        {savedQuery ? (
          <div className="space-y-10">
            {/* 1. MATCHED PRODUCTS FROM BACKEND SEARCH */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    <span>Matching Products ({searchResults.count.products})</span>
                  </h2>
                  <p className="text-muted-foreground text-xs font-medium">
                    Products across all stores matching "{savedQuery}"
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : searchResults.products.length === 0 ? (
                <div className="app-card rounded-2xl p-8 text-center text-muted-foreground font-bold">
                  No products found matching "<span className="text-foreground">{savedQuery}</span>".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchResults.products.map((rawProduct) => {
                    const product = adaptProduct(rawProduct);
                    const store = rawProduct.store ? adaptStore(rawProduct.store) : { id: rawProduct.storeId, name: "Store", isOpen: true };
                    const distance = rawProduct.store?.distance;

                    return (
                      <div
                        key={product.id}
                        className="app-card app-card-hover flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 group"
                      >
                        <div>
                          <div className="product-image-container relative">
                            <img
                              loading="lazy"
                              src={`${product.image}?w=400&q=80&auto=format&fit=crop`}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.featured && (
                              <span className="absolute top-2 left-2 badge-yellow text-[10px] py-0.5 px-2 font-black">
                                Featured
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-foreground leading-snug line-clamp-1">
                            {product.name}
                          </h3>
                          <Link to={`/vendor/${store.id}`} className="text-xs text-muted-foreground hover:underline mt-0.5 font-bold line-clamp-1 block">
                            By {store.name}
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-foreground font-mono text-xl font-black">
                              ₹{product.price}
                            </span>
                            {distance != null && (
                              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <MapPin size={11} className="text-amber-400" /> {distance} km
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(product.id, store.id)}
                            className="btn-yellow px-4 py-2 text-xs font-black shadow-md active:scale-95 cursor-pointer"
                            title={`Add ${product.name} to cart`}
                          >
                            <Plus size={15} strokeWidth={3} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 2. MATCHED STORES FROM BACKEND SEARCH */}
            <section className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-amber-400" />
                    <span>Matching Stores ({searchResults.count.stores})</span>
                  </h2>
                  <p className="text-muted-foreground text-xs font-medium">
                    Merchants matching "{savedQuery}"
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : searchResults.stores.length === 0 ? (
                <div className="app-card rounded-2xl p-8 text-center text-muted-foreground font-bold">
                  No stores found matching "<span className="text-foreground">{savedQuery}</span>".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchResults.stores.map((rawStore) => {
                    const store = adaptStore(rawStore);
                    const distance = store.distance;

                    return (
                      <div
                        key={store.id}
                        className="app-card app-card-hover flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-lg transition-all duration-300"
                      >
                        <div>
                          <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 bg-muted border border-border">
                            <img
                              loading="lazy"
                              src={`${store.logo}?w=400&q=70&auto=format&fit=crop`}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                                  store.isOpen
                                    ? "bg-emerald-500 text-white border-emerald-700"
                                    : "bg-red-500 text-white border-red-700"
                                }`}
                              >
                                {store.isOpen ? "● OPEN" : "CLOSED"}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-black text-foreground mb-1 line-clamp-1">
                            {store.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge-yellow text-[11px] py-0.5 px-2.5">
                              {store.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-black text-foreground">
                              <Star size={13} className="fill-[#FACC15] text-[#0B132B]" />
                              <span>{store.rating}</span>
                              <span className="text-muted-foreground text-[11px]">({store.totalReviews})</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                            {distance != null ? (
                              <span className="font-black text-foreground flex items-center gap-1">
                                <MapPin size={12} className="text-amber-400" /> {distance} km away
                              </span>
                            ) : (
                              <span className="font-medium text-muted-foreground">Local Merchant</span>
                            )}
                          </div>

                          <Link to={`/vendor/${store.id}`} className="block w-full">
                            <button className="btn-secondary w-full py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                              <StoreIcon size={15} />
                              <span>View Store</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : !isLoadingStores && stores.length === 0 ? (
          /* LOCATION UNAVAILABLE STATE (No stores within 10km) */
          <LocationUnavailableNotice onStoreChangeLocation={rePromptLocationChoice} />
        ) : (
          /* DEFAULT VIEW: FEATURED PRODUCTS & EXPLORE STORES */
          <>
            {/* Featured Products Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Featured Products
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Top picks from highly rated nearby local stores
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoadingStores ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  featuredProducts.map(({ product, store }) => {
                    const distance = store.distance;

                    return (
                      <div
                        key={product.id}
                        className="app-card app-card-hover flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 group"
                      >
                        <div>
                          <div className="product-image-container relative">
                            <img
                              loading="lazy"
                              src={`${product.image}?w=400&q=80&auto=format&fit=crop`}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            {distance != null && distance < 5 && (
                              <div className="absolute top-2 left-2 badge-yellow shadow-md">
                                <Zap size={11} className="fill-current text-[#0B132B]" /> 30 mins
                              </div>
                            )}
                          </div>

                          <h3 className="text-base font-black text-foreground leading-snug line-clamp-1">
                            {product.name}
                          </h3>
                          <Link to={`/vendor/${store.id}`} className="text-xs text-muted-foreground hover:underline mt-0.5 font-bold line-clamp-1 block">
                            By {store.name}
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-foreground font-mono text-xl font-black">
                              ₹{product.price}
                            </span>
                            {distance != null && (
                              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <MapPin size={11} className="text-amber-400" /> {distance} km
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(product.id, store.id)}
                            className="btn-yellow px-4 py-2 text-xs font-black shadow-md active:scale-95 cursor-pointer"
                            title={`Add ${product.name} to cart`}
                          >
                            <Plus size={15} strokeWidth={3} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {!isLoadingStores && !featuredProducts.length && (
                  <div className="col-span-full app-card rounded-2xl p-8 text-center text-muted-foreground font-bold">
                    No open nearby stores with featured products right now.
                  </div>
                )}
              </div>
            </section>

            {/* Divider */}
            <div className="flex items-center justify-center my-12">
              <div className="app-divider h-0.5 flex-1"></div>
              <span className="text-muted-foreground px-4 text-xs font-black tracking-widest uppercase">
                EXPLORE LOCAL STORES
              </span>
              <div className="app-divider h-0.5 flex-1"></div>
            </div>

            {/* Stores Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    All Local Stores
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Verified merchants ready for direct fulfillment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoadingStores ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  stores.map((store) => {
                    const distance = store.distance;

                    return (
                      <div
                        key={store.id}
                        className="app-card app-card-hover flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-lg transition-all duration-300"
                      >
                        <div>
                          <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 bg-muted border border-border">
                            <img
                              loading="lazy"
                              src={`${store.logo}?w=400&q=70&auto=format&fit=crop`}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                                  store.isOpen
                                    ? "bg-emerald-500 text-white border-emerald-700"
                                    : "bg-red-500 text-white border-red-700"
                                }`}
                              >
                                {store.isOpen ? "● OPEN" : "CLOSED"}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-black text-foreground mb-1 line-clamp-1">
                            {store.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge-yellow text-[11px] py-0.5 px-2.5">
                              {store.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-black text-foreground">
                              <Star size={13} className="fill-[#FACC15] text-[#0B132B]" />
                              <span>{store.rating}</span>
                              <span className="text-muted-foreground text-[11px]">({store.totalReviews})</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                            {distance != null ? (
                              <span className="font-black text-foreground flex items-center gap-1">
                                <MapPin size={12} className="text-amber-400" /> {distance} km away
                              </span>
                            ) : (
                              <span className="font-medium text-muted-foreground">Local Merchant</span>
                            )}
                          </div>

                          <Link to={`/vendor/${store.id}`} className="block w-full">
                            <button className="btn-secondary w-full py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                              <StoreIcon size={15} />
                              <span>View Store</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
