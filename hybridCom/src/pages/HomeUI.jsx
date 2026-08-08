import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { StoreContext } from "../context/StoreContext";
import { CartContext } from "../context/CartContext";
import { SmoothInput } from "../components/ui/skiper-ui/skiper106";
import { Search, X, MapPin, RefreshCw, Zap, Store as StoreIcon, Star, Plus } from "lucide-react";

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

function HomeUI() {
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
  };

  const normalizedQuery = savedQuery.toLowerCase();

  const searchMatches = (value) =>
    value?.toString().toLowerCase().includes(normalizedQuery);

  const featuredProducts = stores.flatMap((store) => {
    return store.products
      .filter((product) => product.featured)
      .filter((product) => {
        if (!normalizedQuery) return true;

        return (
          searchMatches(product.name) ||
          searchMatches(product.category) ||
          searchMatches(store.name) ||
          searchMatches(store.category)
        );
      })
      .map((product) => ({ product, store }));
  });

  const filteredStores = stores.filter((store) => {
    if (!normalizedQuery) return true;

    return (
      searchMatches(store.name) ||
      searchMatches(store.category) ||
      searchMatches(store.location?.city) ||
      store.products.some((product) => searchMatches(product.name))
    );
  });

  const locationDisplayLabel = (() => {
    if (locationSource === "saved") return "Saved Location 🏠";
    if (locationSource === "gps") return "Current GPS 📍";
    if (locationSource === "ip") return locationName || "IP Location 🌐";
    return "Location Set 📍";
  })();

  return (
    <div className={`app-page ${cartItems.length ? "pb-36" : "pb-12"}`}>
      {/* Search & Location Hero Section with Radial Gradient */}
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
          </div>

          {/* Central Search Card Container */}
          <div className="app-card w-full max-w-2xl rounded-3xl p-4 sm:p-5 shadow-2xl border border-border bg-card flex flex-col gap-4">
            {/* Location Picker Pill */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <span className="text-muted-foreground font-semibold">Deliver to:</span>
                <button
                  type="button"
                  onClick={rePromptLocationChoice}
                  className="badge-yellow cursor-pointer hover:scale-105 transition-transform"
                  title="Change delivery location"
                >
                  <MapPin size={13} />
                  <span>{locationDisplayLabel}</span>
                  <RefreshCw size={11} className="ml-1 opacity-70" />
                </button>
              </div>

              {lat != null && lng != null && (
                <span className="text-muted-foreground text-[11px] font-mono hidden sm:inline bg-muted px-2.5 py-0.5 rounded-full border border-border">
                  {lat.toFixed(3)}, {lng.toFixed(3)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SmoothInput
                aria-label="Search products"
                placeholder="Search fresh milk, snacks, vegetables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <div className="flex gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!search.trim()}
                  className="btn-primary flex min-h-12 flex-1 px-6 py-3 rounded-full font-black text-sm sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search size={18} />
                  Search
                </button>

                {savedQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="btn-secondary min-h-12 w-12 rounded-full flex items-center justify-center"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {savedQuery && (
            <div className="mt-1 text-center">
              <p className="text-muted-foreground text-sm font-semibold">
                Showing search results for{" "}
                <span className="text-foreground font-black underline decoration-sunyellow">
                  "{savedQuery}"
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Featured Products Section */}
        <section className="mt-10">
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
                      {/* Product Image Container Aspect Ratio */}
                      <div className="product-image-container relative">
                        <img
                          loading="lazy"
                          src={`${product.image}?w=400&q=80&auto=format&fit=crop`}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Small Yellow Pill Badge for Speed ("30 mins") */}
                        {distance != null && distance < 5 && (
                          <div className="absolute top-2 left-2 badge-yellow shadow-md">
                            <Zap size={11} className="fill-current text-[#0B132B]" /> 30 mins
                          </div>
                        )}
                      </div>

                      {/* Product Title */}
                      <h3 className="text-base font-black text-foreground leading-snug line-clamp-1">
                        {product.name}
                      </h3>
                      <Link to={`/vendor/${store.id}`} className="text-xs text-muted-foreground hover:underline mt-0.5 font-bold line-clamp-1 block">
                        By {store.name}
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                      {/* High Contrast Price Tag */}
                      <div className="flex flex-col">
                        <span className="text-foreground font-mono text-xl font-black">
                          ₹{product.price}
                        </span>
                        {distance != null && (
                          <span className="text-[10px] text-muted-foreground font-bold">
                            📍 {distance} km
                          </span>
                        )}
                      </div>

                      {/* Add-To-Cart High Contrast Sun Yellow Pill Button */}
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
                {savedQuery ? (
                  <>
                    No featured products found matching{" "}
                    <span className="font-black text-foreground">"{savedQuery}"</span>.
                  </>
                ) : (
                  "No open nearby stores with featured products right now."
                )}
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
              filteredStores.map((store) => {
                const distance = store.distance;

                return (
                  <div
                    key={store.id}
                    className="app-card app-card-hover flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Store Logo Banner */}
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
                        <span>{store.products.length} products</span>
                        {distance != null ? (
                          <span className="font-black text-foreground">📍 {distance} km</span>
                        ) : (
                          <span>Nearby</span>
                        )}
                      </div>

                      <Link to={`/vendor/${store.id}`} className="block w-full">
                        <button className="btn-secondary w-full py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                          <StoreIcon size={15} />
                          <span>View Vendor</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}

            {!isLoadingStores && !filteredStores.length && (
              <div className="col-span-full app-card rounded-2xl p-8 text-center text-muted-foreground font-bold">
                {savedQuery ? (
                  <>
                    No stores found matching{" "}
                    <span className="font-black text-foreground">"{savedQuery}"</span>.
                  </>
                ) : (
                  "No open stores near your location."
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomeUI;
