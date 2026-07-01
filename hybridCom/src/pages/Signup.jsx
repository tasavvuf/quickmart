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
        console.log("calling api")
const options = {
  method: 'POST',
  url: 'https://api.freeapi.app/api/v1/users/register',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    email: email,
    password: password,
    username: username
  }
}
axios.request(options).then(function (response) {
  if (response.data.success) {

    toast.success("User created successfully")
    navigate("/login", { replace: true, state: { from: "/signup", success: true } })
  } else {
    toast.error("User creation failed: " + response.data.message)
  }
}).catch(function (error) {
  console.error(error);
 
  toast.error("User creation failed: " + error.message)
});
    }
  return (
    <div className="h-dvh text-white p-6 flex flex-col justify-center items-center">
        <form onSubmit={(e)=>{e.preventDefault()}} className="bg-[#1b1b1d] p-8 rounded-3xl border border-zinc-800 flex flex-col gap-6 w-full max-w-md">
           <div className="flex flex-col gap-2">
                <label className="text-zinc-200">username</label>
                <input type="text" name="username" value={username} onChange={(e)=>{setusername(e.target.value)}} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400 transition" />
           </div>
           <div className="flex flex-col gap-2">
                <label className="text-zinc-200">email</label>
                <input type="text" name="email" value={email} onChange={(e)=>{setemail(e.target.value)}} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400 transition" />
           </div>
           <div className="flex flex-col gap-2">
                <label className="text-zinc-200">password</label>
                <input type="password" name="password" value={password} onChange={(e)=>{setpassword(e.target.value)}} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400 transition" />
           </div>
   
           <button type="submit" className="px-6 py-3 bg-[#2b2b2b] text-amber-400 rounded-lg text-lg hover:bg-zinc-700 transition" onClick={(e)=>{
            e.preventDefault();
            signupapicall();
           }}>Sign up</button>
        </form>
    </div>
  )
}
