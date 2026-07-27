import { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { LocationDataContext } from '../context/LocationContext'
import { api, getApiErrorMessage } from '../lib/api'

export default function Signup() {
    const navigate = useNavigate()
    const { lat, lng, getUserLocation, message } = useContext(LocationDataContext)
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [username, setusername] = useState("")
    const [address, setAddress] = useState("")
    const [profilePhoto, setProfilePhoto] = useState(null)

    const signupapicall = async () => {
        if (!email || !password || !username || !address) {
            toast.error("Please fill all fields")
            return
        }

        if (lat == null || lng == null) {
            toast.error("Please fetch your location before signup")
            return
        }

        try {
            const formData = new FormData()

            formData.append("userName", username)
            formData.append("email", email)
            formData.append("password", password)
            formData.append("address", address)
            formData.append("location", JSON.stringify({ lat, lng }))

            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto)
            }

            const response = await api.post('/auth/reg', formData)

            toast.success(response.data.message || "Signup successful!")
            navigate("/login")
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Signup failed"))
        }
    }
  return (
    <div className="app-page flex flex-col items-center justify-start px-6 pt-6 pb-16">
        <form onSubmit={(e)=>{e.preventDefault()}} className="app-card p-8 rounded-3xl flex flex-col gap-6 w-full max-w-md">
           <div className="flex flex-col gap-2">
                <label>username</label>
                <input type="text" name="username" value={username} onChange={(e)=>{setusername(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
           <div className="flex flex-col gap-2">
                <label>email</label>
                <input type="text" name="email" value={email} onChange={(e)=>{setemail(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
           <div className="flex flex-col gap-2">
                <label>password</label>
                <input type="password" name="password" value={password} onChange={(e)=>{setpassword(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
           <div className="flex flex-col gap-2">
                <label>address</label>
                <input type="text" name="address" value={address} onChange={(e)=>{setAddress(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
           <div className="flex flex-col gap-2">
                <label>profile photo</label>
                <input type="file" name="profilePhoto" accept="image/*" onChange={(e)=>{setProfilePhoto(e.target.files?.[0] || null)}} className="app-input rounded-lg px-4 py-3" />
           </div>
           <div className="flex flex-col gap-2">
                <button type="button" className="app-control px-6 py-3 text-amber-500 rounded-lg text-lg" onClick={getUserLocation}>Fetch location</button>
                <p className="app-muted text-sm">{message}</p>
           </div>
   
           <button type="submit" className="app-control px-6 py-3 text-amber-500 rounded-lg text-lg" onClick={(e)=>{
            e.preventDefault();
            signupapicall();
           }}>Sign up</button>
        </form>
    </div>
  )
}
