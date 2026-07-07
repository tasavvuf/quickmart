/* eslint-disable react-refresh/only-export-components */
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
     return Number((R * c).toFixed(2));; // Returns distance rounded to 2 decimal places
  };
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [message, setMessage] = useState("Location is not fetched yet !!!");

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
