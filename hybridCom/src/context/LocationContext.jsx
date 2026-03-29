import React, { createContext, useState } from 'react'
   export const LocationDataContext = createContext()
function LocationContext(props) {
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Returns distance rounded to 2 decimal places
  };
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [message, setMessage] = useState("Location is not fetched yet !!!");
const [products, setproducts] = useState([
  // Vendor 101: The Trendy Gym/Tech Hub (Nearby)
  {
    id: 1711641273001,
    pName: "Oversized Anime Pump Cover",
    price: 450,
    vendorloc: [22.2921, 70.7932],
    vendorId: "V-101",
    vendorName: "Store_101"
  },
  {
    id: 1711641273002,
    pName: "Mechanical Keyboard Switch Tester",
    price: 850,
    vendorloc: [22.2921, 70.7932], // Same location as above
    vendorId: "V-101",
    vendorName: "Store_101"
  },

  // Vendor 202: The Academic & General Book Store (Slightly further)
  {
    id: 1711641273003,
    pName: "Gujarat Board Exam Prep Guide",
    price: 220,
    vendorloc: [22.3115, 70.8250],
    vendorId: "V-202",
    vendorName: "Store_202"
  },
  {
    id: 1711641273004,
    pName: "Logitech G502 Hero Mouse",
    price: 4200,
    vendorloc: [22.3115, 70.8250], // Same location as above
    vendorId: "V-202",
    vendorName: "Store_202"
  },

  // Vendor 303: The Industrial/Specialist Hub (Far away)
  {
    id: 1711641273005,
    pName: "Industrial Arduino Kit",
    price: 1200,
    vendorloc: [22.2560, 70.6710],
    vendorId: "V-303",
    vendorName: "Store_303"
  },
  {
    id: 1711641273006,
    pName: "External 2TB SSD",
    price: 9500,
    vendorloc: [22.3450, 70.8500],
    vendorId: "V-404", // A standalone vendor for extra variety
    vendorName: "Store_404"
  }
]);
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        setLat(newLat);
        setLng(newLng);

        setMessage(`Your latitude is ${newLat} and longitude is ${newLng}`);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setMessage("User denied the request for Geolocation.");
        } else {
          setMessage("Something went wrong while getting location.");
        }
      },
    );
  };
  return (
    <>
   <LocationDataContext.Provider
  value={{
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
  }} 
>
     { props.children }
    </LocationDataContext.Provider>
   
    </>
  )
}

export default LocationContext