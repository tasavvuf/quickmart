import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { LocationDataContext } from "../context/LocationContext";

function Vendor() {
  const {
    products,
    lat,
    lng,
    calculateDistance,
  } = useContext(LocationDataContext);

  const { vendorId } = useParams();

  const vendorProducts = products.filter(
    (product) => product.vendorId === vendorId
  );

  return (
    <div className="h-dvh text-white p-6">
      <h1 className="text-3xl font-bold">{vendorId}</h1>

      <p className="mt-4 text-zinc-300 text-lg">
        {vendorProducts.length > 0
          ? vendorProducts[0].vendorName
          : "No products found for this vendor."}
      </p>

      {/* 🧠 Vendor Distance Info (show once, not map) */}
      {vendorProducts.length > 0 && (() => {
        const elem = vendorProducts[0];

        const distance =
          lat && lng
            ? calculateDistance(
                lat,
                lng,
                elem.vendorloc[0],
                elem.vendorloc[1]
              )
            : null;

        if (!distance) {
          return (
            <span className="text-[10px] text-zinc-500 italic">
              Fetch location to see distance
            </span>
          );
        }

        const time = Math.ceil(distance * 5);

        return (
          <div className="flex gap-3 mt-2 items-center">
            <span className="text-xs text-zinc-400">
              {distance < 5 ? "only ≈ " : ""}
              {time} min delivery
            </span>

          </div>
        );
      })()}

      {/* 🧠 Products */}
      <div className="flex flex-wrap gap-4 p-6 justify-center">
        {vendorProducts.map((elem) => (
          <div
            key={elem.id}
            className="bg-[#1b1b1d] flex flex-col justify-between p-4 rounded-3xl h-64 w-56 border border-zinc-800"
          >
            <div>
              <h3 className="text-xl font-bold text-zinc-100">
                {elem.pName}
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