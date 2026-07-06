import { useContext } from 'react';
import { Link } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";
import { StoreContext } from '../context/StoreContext';
function HomeUI() {
  const { stores } = useContext(StoreContext);
  const {
    getUserLocation,
    message,
    lat,
    lng,
    calculateDistance,
  } = useContext(LocationDataContext);

  return (
    <div className='overflow-y-auto pb-8'>
      {/* Location Section */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-8 px-6 bg-linear-to-b from-[#1b1b1d] to-[#151517]">
        <button
          onClick={getUserLocation}
          className="px-6 py-3 bg-[#2b2b2b] text-amber-400 rounded-lg text-lg hover:bg-[#3b3b3b] transition"
        >
          Fetch Your Location
        </button>

        <p className="text-zinc-200 text-xl text-center px-6">{message}</p>

        {lat && lng && (
          <p className="text-green-400 text-lg">
            📍 Lat: {lat} <br />
            Lng: {lng}
          </p>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-zinc-100">Featured Products</h1>
        <div className="flex flex-wrap gap-6 p-6 justify-center items-start">
       {stores.flatMap(store => {
  const distance =
    lat && lng
      ? calculateDistance(
          lat,
          lng,
          store.location.lat,
          store.location.lng
        )
      : null;

  return store.products
    .filter(product => product.featured)
    .map(product => (
            <div
              key={product.id}
              className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-72 w-56 border border-zinc-800 hover:border-amber-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10"
            >
              <div className="flex flex-col items-center">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 text-center">
                  {product.name}
                </h3>
                {distance && (
                  distance < 5 ? (
                    <span className="text-xs font-bold text-black px-3 py-1 rounded-full bg-violet-300 mt-2">
                      Delivery in 30 mins ⚡
                    </span>
                  ) : (
                    <span></span>
                  )
                )
              }
              </div>

              <div className="bg-zinc-600 w-full h-px my-2" />

              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-mono text-lg">
                  ₹{product.price}
                </span>
                {distance && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                    📍 {distance} km away
                  </span>
                ) || (
                  <span className="text-[10px] text-zinc-500 italic">
                    Fetch location to see distance
                  </span>
                )}
              </div>

              <Link to={`/vendor/${store.id}`} className="block w-full">
                <button className="w-full bg-zinc-800 py-2 rounded-xl text-sm hover:bg-zinc-700 transition flex flex-col items-center">
                  {distance && (
                    distance < 5 ? (
                      <span className="text-xs text-zinc-400">
                        only ≈ {Math.ceil(distance * 5)} min delivery
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {Math.ceil(distance * 5)} min delivery
                      </span>
                    )
                  ) || (
                    <div></div>
                  )}
                  <span className="text-zinc-200">View Vendor</span>
                </button>
              </Link>
            </div>
          ))
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center my-8 px-6">
        <div className="h-px bg-zinc-700 flex-1"></div>
        <span className="px-4 text-zinc-500 text-sm font-semibold">BROWSE STORES</span>
        <div className="h-px bg-zinc-700 flex-1"></div>
      </div>

      {/* Stores Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-6 text-zinc-100">All Stores</h2>
        <div className="flex flex-wrap gap-6 p-6 justify-center items-start">

        {stores.map((store) => {
          const distance =
            lat && lng
              ? calculateDistance(
                  lat,
                  lng,
                 store.location.lat,
                 store.location.lng
                )
              : null;

          return (
            <div key={store.id} className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-72 w-56 border border-zinc-800 hover:border-amber-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10" >
              <div className="flex flex-col items-center">
                <div className="w-full h-24 rounded-2xl overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={store.banner}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">{store.name}</h3>
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-2">
                  {store.category}
                </span>
              </div>

              <div className="bg-zinc-600 w-full h-px my-2" />

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  <span className="text-zinc-200 font-semibold">{store.rating}</span>
                  <span className="text-zinc-500 text-xs">({store.totalReviews})</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${store.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {store.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-400">
                  {store.products.length} products
                </span>
                {distance  ? (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                    📍 {distance} km away
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 italic">
                    Fetch location to see distance
                  </span>
                )}
              </div>

              <Link to={`/vendor/${store.id}`} className="block w-full">
                <button className="w-full bg-zinc-800 py-2 rounded-xl text-sm hover:bg-zinc-700 transition flex flex-col items-center">
                  {distance ? (
                    distance < 5 ? (
                      <span className="text-xs text-violet-300 font-bold">
                        ⚡ Fast Delivery
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        {Math.ceil(distance * 5)} min delivery
                      </span>
                    )
                  ) || (
                    <div></div>
                  )
                : (
                  <span></span>
                )}
                  <span className="text-zinc-200">Visit Store</span>
                </button>
              </Link>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
export default HomeUI
