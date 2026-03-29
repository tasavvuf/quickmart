import React, { useContext, useState } from "react";
import { LocationDataContext } from "./context/LocationContext";
function App() {
 const {
  getUserLocation,
  products,
  setproducts,
  message,
  setMessage,
  lat,
  setLat,
  lng,
  setLng,
  calculateDistance,
} = useContext(LocationDataContext);
  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <h1 className="text-3xl font-bold p-6">Local Ecom</h1>

      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        <button
          onClick={getUserLocation}
          className="px-6 py-3 bg-[#2b2b2b] text-amber-400 rounded-lg text-lg"
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
      {/* Add flex and wrap to the container */}
      <div className="flex flex-wrap gap-4 p-6 justify-center">
        {products.map(function (elem) {
          // 1. Calculate distance only if user location is fetched
          const distance =
            lat && lng
              ? calculateDistance(
                  lat,
                  lng,
                  elem.vendorloc[0],
                  elem.vendorloc[1],
                )
              : null;

          return (
            <div
              key={elem.id}
              className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-64 w-56 border border-zinc-800"
            >
              <div>
            <h3 className="text-xl font-bold text-zinc-100">{elem.pName}</h3>
            {distance ? (
                  distance < 5 ? (
                    <span className="text-xs font-bold text-black px-3 py-1 rounded-full bg-violet-300">
                    Delivery in 30 mins ⚡
                    </span>
                  ) : (
                    <span >
                     
                    </span>
                  )
                ) : (
                  <div></div>
                )}
              </div>
              
              <div className="bg-zinc-600 w-full h-px" />

              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-mono text-lg">
                  ₹{elem.price}
                </span>

                {distance ? (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                    📍 {distance} km away
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 italic">
                    Fetch location to see distance
                  </span>
                )}
              </div>

              <button className="bg-zinc-800 py-2 rounded-xl text-sm hover:bg-zinc-700 transition flex flex-col ">
                {distance ? (
                  distance < 5 ? (
                    <span className="text-xs text-zinc-400 ">
                      only ≈ {Math.ceil(distance * 5)} min delivery
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400 ">
                      {Math.ceil(distance * 5)} min delivery
                    </span>
                  )
                ) : (
                  <div></div>
                )}
                <span>View Vendor</span> 
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
