import { useContext } from "react";
import { useParams } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { LocationDataContext } from "../context/LocationContext";
import { CartContext } from "../context/CartContext";
import { ShoppingCart, Trash2 } from "lucide-react";
function Vendor() {
  const { stores } = useContext(StoreContext);
  const { lat, lng, calculateDistance } = useContext(LocationDataContext);
  const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    items
  } = useContext(CartContext);

  const { vendorId } = useParams();

  const vendorProducts = stores
    .filter((store) => store.id === vendorId)
    .flatMap((store) => store.products);

  const vendor = stores.find((store) => store.id === vendorId);
  const distance =
    vendor?.location && lat && lng
      ? calculateDistance(lat, lng, vendor.location.lat, vendor.location.lng)
      : null;

  return (
    <div className={`h-full text-white p-6 overflow-y-auto ${items.length ? "pb-36" : ""}`}>
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
              className="w-28 h-28 object-cover rounded-full border-4 border-purple-500 bg-[#1b1b1d] shadow-xl shadow-purple-500/40"
            />
          </div>
        )}
      </div>

      {/* Vendor name with enhanced styling */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-amber-400 mb-2">
          {vendor?.name || vendorId}
        </h1>
        {vendor?.category && (
          <span className="inline-block text-sm font-semibold text-amber-400 bg-amber-400/10 px-4 py-1 rounded-full">
            {vendor.category}
          </span>
        )}
        {vendor?.rating && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-amber-400 text-lg">★</span>
            <span className="text-zinc-200 font-semibold">{vendor.rating}</span>
            <span className="text-zinc-500 text-sm">
              ({vendor.totalReviews} reviews)
            </span>
          </div>
        )}
        {vendor?.isOpen && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-zinc-200 font-semibold">Open</span>
          </div>
        )}
        {vendor?.location && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-zinc-400 text-sm">
              {vendor.location.city}
            </span>{" "}
            |
            <span className="text-zinc-400 text-sm">
              {vendor.location.address}
            </span>{" "}
            |
            {distance ? (
              <>
                <span className="text-zinc-400 text-sm">
                  {distance} km away
                </span>{" "}
                |
                <span className="text-zinc-400 text-sm">
                  {Math.round(distance * 5)} mins to deliver
                </span>
              </>
            ) : (
              <span className="text-zinc-500 text-sm">
                Fetch location to see distance
              </span>
            )}
          </div>
        )}
      </div>

      {vendorProducts.length === 0 && (
        <div className="mt-4 text-zinc-300 text-lg">
          No products found for this vendor.
        </div>
      )}
      {/* 🧠 Products */}
      <div className="flex flex-wrap gap-4 p-6 justify-center">
        {vendorProducts.map((elem) => {
          const inCart = items.find((item) => item.id === elem.id);
          return (
            <div
              key={elem.id}
              className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-64 w-56 border border-zinc-800"
            >
              <div>
                <img
                  loading="lazy"
                  src={`${elem.image}?w=300&q=60&auto=format&fit=crop`}
                  alt={elem.name}
                  className="w-full h-36 object-cover rounded-2xl"
                />
                <h3 className="text-lg font-bold text-zinc-100 leading-tight">{elem.name}</h3>
                <div className="bg-zinc-600 w-full h-px my-1.5" />
                <span className="text-amber-400 font-mono text-base">₹{elem.price}</span>
              </div>

              {inCart ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => decreaseQuantity(elem.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-sm hover:border-amber-500/50 hover:shadow-[0_0_8px_rgba(251,191,36,0.2)] transition-all active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-zinc-100 font-semibold text-sm tabular-nums min-w-[2ch] text-center">
                      {inCart.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(elem.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-green-400 font-bold text-sm hover:border-green-500/50 hover:shadow-[0_0_8px_rgba(34,197,94,0.2)] transition-all active:scale-90"
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
                  onClick={() => addToCart(elem.id, vendor.id)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-zinc-100 text-sm font-semibold cursor-pointer active:scale-95 hover:from-green-500 hover:to-emerald-500 shadow-[0_4px_12px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.35)] transition-all"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
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
