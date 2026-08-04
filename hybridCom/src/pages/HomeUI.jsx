import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { StoreContext } from "../context/StoreContext";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { SmoothInput } from "../components/ui/skiper-ui/skiper106";
import { Search, X, MapPin, RefreshCw } from "lucide-react";

const SEARCH_STORAGE_KEY = "home_search_query";

function SkeletonCard() {
  return (
    <div className="app-card flex flex-col justify-between p-4 rounded-3xl min-h-72 w-56 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-full h-32 rounded-2xl bg-muted/60 mb-3" />
        <div className="h-5 w-3/4 bg-muted/60 rounded-md mb-2" />
        <div className="h-4 w-1/2 bg-muted/40 rounded-md" />
      </div>
      <div className="app-divider w-full h-px my-2" />
      <div className="flex justify-between items-center my-2">
        <div className="h-5 w-12 bg-muted/60 rounded-md" />
        <div className="h-4 w-16 bg-muted/40 rounded-full" />
      </div>
      <div className="h-9 w-full bg-muted/60 rounded-xl" />
    </div>
  );
}

function HomeUI() {
  const { stores, isLoadingStores } = useContext(StoreContext);
  const { items: cartItems } = useContext(CartContext);
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
    <div className={`app-page ${cartItems.length ? "pb-36" : "pb-8"}`}>
      {/* Search & Location Bar Section */}
      <div className="app-band flex flex-col justify-center items-center gap-4 py-8 px-6">
        <div className="app-card w-full max-w-2xl rounded-2xl p-4 shadow-lg flex flex-col gap-3">
          {/* Location Badge Indicator */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="app-muted">Delivering to:</span>
              <button
                type="button"
                onClick={rePromptLocationChoice}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition cursor-pointer"
                title="Change location"
              >
                <MapPin size={13} />
                <span>{locationDisplayLabel}</span>
                <RefreshCw size={11} className="ml-1 opacity-70" />
              </button>
            </div>

            {lat != null && lng != null && (
              <span className="app-muted text-[11px] hidden sm:inline">
                ({lat.toFixed(3)}, {lng.toFixed(3)})
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SmoothInput
              aria-label="Search products"
              placeholder="Search for any product…"
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
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-black shadow-md shadow-amber-500/20 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:flex-none"
              >
                <Search size={18} />
                Search
              </button>

              {savedQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="app-control flex min-h-12 w-12 items-center justify-center rounded-xl"
                  aria-label="Clear search"
                  title="Clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {savedQuery && (
          <div className="mt-1 text-center">
            <p className="app-muted text-sm">
              Showing results for{" "}
              <span className="text-amber-400 font-semibold">
                {savedQuery}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="mt-6">
        <h1 className="app-heading text-3xl font-bold text-center mb-6">
          Featured Products
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-8 p-6 justify-center items-start">
          {isLoadingStores ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            featuredProducts.map(({ product, store }) => {
              const distance = store.distance;

              return (
                <div
                  key={product.id}
                  className="app-card app-card-hover flex flex-col justify-between p-4 rounded-3xl min-h-72 w-56 transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-muted">
                      <img
                        loading="lazy"
                        src={`${product.image}?w=300&q=60&auto=format&fit=crop`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-center">
                      {product.name}
                    </h3>
                    {distance != null &&
                      (distance < 5 ? (
                        <span className="text-xs font-bold text-black px-3 py-1 rounded-full bg-violet-300 mt-2">
                          Delivery in 30 mins ⚡
                        </span>
                      ) : (
                        <span></span>
                      ))}
                  </div>

                  <div className="app-divider w-full h-px my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-mono text-lg font-bold">
                      ₹{product.price}
                    </span>
                    {distance != null ? (
                      <span className="app-muted text-xs bg-muted px-2 py-1 rounded-full font-medium">
                        📍 {distance} km away
                      </span>
                    ) : (
                      <span className="app-muted text-[10px] italic">
                        Distance unavailable
                      </span>
                    )}
                  </div>

                  <Link to={`/vendor/${store.id}`} className="block w-full mt-2">
                    <button className="app-control w-full py-2 rounded-xl text-sm flex flex-col items-center cursor-pointer">
                      {distance != null ? (
                        distance < 5 ? (
                          <span className="app-muted text-xs">
                            only ≈ {Math.ceil(distance * 5)} min delivery
                          </span>
                        ) : (
                          <span className="app-muted text-xs">
                            {Math.ceil(distance * 5)} min delivery
                          </span>
                        )
                      ) : (
                        <div></div>
                      )}
                      <span>View Vendor</span>
                    </button>
                  </Link>
                </div>
              );
            })
          )}

          {!isLoadingStores && !featuredProducts.length && (
            <div className="app-card w-full max-w-md rounded-2xl p-6 text-center app-muted">
              {savedQuery ? (
                <>
                  No featured products found for{" "}
                  <span className="font-semibold text-amber-400">{savedQuery}</span>.
                </>
              ) : (
                "No open nearby stores with featured products right now."
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center my-8 px-6">
        <div className="app-divider h-px flex-1"></div>
        <span className="app-muted px-4 text-sm font-semibold">
          BROWSE STORES
        </span>
        <div className="app-divider h-px flex-1"></div>
      </div>

      {/* Stores Section */}
      <div>
        <h2 className="app-heading text-3xl font-bold text-center mb-6">
          All Stores
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-8 p-6 justify-center items-start">
          {isLoadingStores ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredStores.map((store) => {
              const distance = store.distance;

              return (
                <div
                  key={store.id}
                  className="app-card app-card-hover flex flex-col justify-between p-4 rounded-3xl min-h-72 w-56 transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-full h-24 rounded-2xl overflow-hidden mb-3 bg-muted">
                      <img
                        loading="lazy"
                        src={`${store.logo}?w=300&q=60&auto=format&fit=crop`}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-center">
                      {store.name}
                    </h3>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-2">
                      {store.category}
                    </span>
                  </div>

                  <div className="app-divider w-full h-px my-2" />

                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span className="font-semibold text-sm">
                        {store.rating}
                      </span>
                      <span className="app-muted text-xs">
                        ({store.totalReviews})
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        store.isOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {store.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="app-muted text-xs">
                      {store.products.length} products
                    </span>
                    {distance != null ? (
                      <span className="app-muted text-xs bg-muted px-2 py-1 rounded-full font-medium">
                        📍 {distance} km away
                      </span>
                    ) : (
                      <span className="app-muted text-[10px] italic">
                        Distance unavailable
                      </span>
                    )}
                  </div>

                  <Link to={`/vendor/${store.id}`} className="block w-full">
                    <button className="app-control w-full py-2 rounded-xl text-sm flex flex-col items-center cursor-pointer">
                      {distance != null ? (
                        distance < 5 ? (
                          <span className="text-xs text-violet-300 font-bold">
                            ⚡ Fast Delivery
                          </span>
                        ) : (
                          <span className="app-muted text-xs">
                            {Math.ceil(distance * 5)} min delivery
                          </span>
                        )
                      ) : (
                        <span></span>
                      )}
                      <span>Visit Store</span>
                    </button>
                  </Link>
                </div>
              );
            })
          )}

          {!isLoadingStores && !filteredStores.length && (
            <div className="app-card w-full max-w-md rounded-2xl p-6 text-center app-muted">
              {savedQuery ? (
                <>
                  No stores found for{" "}
                  <span className="font-semibold text-amber-400">{savedQuery}</span>.
                </>
              ) : (
                "No open stores near your location."
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeUI;
