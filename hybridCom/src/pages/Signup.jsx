import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
    const navigate = useNavigate()
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [username, setusername] = useState("")
    const signupapicall = async () => {
        if (!email || !password || !username) {
            toast.error("Please fill all fields")
            return
        }
        // call api
        try {
            console.log("calling api")
            const responce = await axios.post('https://api.freeapi.app/api/v1/users/register', { email, password, username })


            if (responce.data.success) {
                toast.success("Signup successful!")
                navigate("/login")
            } else {
                toast.error(responce.data.message || "Signup failed")
            }
        } catch {
            toast.error("An error occurred during signup")
        }
    }
  return (
    <div className="app-page p-6 flex flex-col justify-center items-center">
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
   
           <button type="submit" className="app-control px-6 py-3 text-amber-500 rounded-lg text-lg" onClick={(e)=>{
            e.preventDefault();
            signupapicall();
           }}>Sign up</button>
        </form>
    </div>
  )
}
