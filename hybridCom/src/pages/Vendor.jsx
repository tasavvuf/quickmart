import { useContext } from "react";
import { useParams } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { LocationDataContext } from "../context/LocationContext";
function Vendor() {
  const { stores } = useContext(StoreContext);
  const { lat, lng , calculateDistance } = useContext(LocationDataContext);


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
    <div className="h-dvh text-white p-6 overflow-y-auto">
      {/* Banner with logo overlay at bottom */}
      <div className="relative mb-16">
        {vendor?.banner && (
          <img
            src={vendor.banner}
            alt={vendor.name}
            className="w-full h-56 object-cover rounded-2xl"
          />
        )}

        {vendor?.logo && (
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={vendor.logo}
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
            <span className="text-zinc-500 text-sm">({vendor.totalReviews} reviews)</span>
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
            <span className="text-zinc-400 text-sm">{vendor.location.city}</span> |
            <span className="text-zinc-400 text-sm">{vendor.location.address}</span> |
            {distance ? (
              <>
                <span className="text-zinc-400 text-sm">{distance} km away</span> |
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
        {vendorProducts.map((elem) => (
          <div
            key={elem.id}
            className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-64 w-56 border border-zinc-800"
          >
            <div>
              <img
                src={elem.image}
                alt={elem.name}
                className="w-full h-40 object-cover rounded-2xl"
              />
              <h3 className="text-xl font-bold text-zinc-100">
                {elem.name}
              </h3>

              <div className="bg-zinc-600 w-full h-px my-2" />

              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-mono text-lg">
                  ₹{elem.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vendor;
