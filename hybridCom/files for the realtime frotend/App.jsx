import { MapContainer, TileLayer, Marker, Popup ,useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const userIcon = L.icon({
  iconUrl: "https://img.icons8.com/color/48/region-code.png",

 
});
const socket = io("http://10.254.67.208:3000");
function FollowCamera({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
}

function App() {
  const [postion, setPostion] = useState([0,0])
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    socket.on('connect', () => {
    console.log('Connected to server',socket.id);
  });
    if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      setPostion([position.coords.latitude, position.coords.longitude])
      socket.emit('send-location', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    }, (error) => {
      console.error(error)
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    })
  }
  socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
   setUsers((prevUsers) =>
    prevUsers.find(user => user.id === id) ? 
    prevUsers.map(user => user.id === id ? { ...user, latitude, longitude } : user) : 
    [...prevUsers, { id, latitude, longitude }]
   
  )
})
socket.on("user-disconnected", (id) => {
  setUsers((prevUsers) =>
    prevUsers.filter((user) => user.id !== id)
  );
});
  }, []);

  return (
    <div>


    <MapContainer
  center={postion}
  zoom={13}
  scrollWheelZoom={true}
  style={{ height: "95vh", width: "100%" }}
>
  <TileLayer
    attribution="tevindustries"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <FollowCamera position={postion} />

  {users.map((user) => (
    user.latitude && user.longitude && (
      <Marker
        key={user.id}
        position={[user.latitude, user.longitude]}
      >
        <Popup>{user.id}</Popup>
      </Marker>
    )
  ))}
  <Marker position={postion} icon={userIcon} >  
<Popup>{socket.id}</Popup></Marker>
</MapContainer>



</div>
  )
}

export default App