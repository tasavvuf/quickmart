import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { UserContext } from '../context/UserContext'
function Login() {
  const [username, setusername] = useState("")
  const [password, setpassword] = useState("")
  const { setIsLoggedIn , setAccessToken, setRefreshToken ,setUser} = useContext(UserContext)
  const navigate = useNavigate()
  const signinapicall = async () => {
    if (!username || !password) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const response = await axios.post('https://api.freeapi.app/api/v1/users/login', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.success("Login successful")
        localStorage.setItem('accessToken', JSON.stringify(response.data.data.accessToken));
        localStorage.setItem('refreshToken', JSON.stringify(response.data.data.refreshToken));
        setIsLoggedIn(true)
        setAccessToken(response.data.data.accessToken)
        setRefreshToken(response.data.data.refreshToken)
        setUser({
          username: response.data.data.username,
          email: response.data.data.email,
          role: response.data.data.role,
          id: response.data.data.user._id,
          avatar: response.data.data.user.avatar?.url || null
        })
        navigate("/", { replace: true })
      } else { 
        toast.error(response.data.message || "Login failed")
      }
    } catch (error) {
      console.error(error)
      if (error.response) {
        toast.error(error.response.data?.message || `Login failed: ${error.response.status}`)
      } else if (error.request) {
        toast.error("Network error. Please check your connection.")
      } else {
        toast.error(error.message || "Login failed")
      }
    }
  }
  return (
     <div className="h-dvh text-white p-6 flex flex-col justify-center items-center">
        <form onSubmit={(e)=>{e.preventDefault()}} className="bg-[#1b1b1d] p-8 rounded-3xl border border-zinc-800 flex flex-col gap-6 w-full max-w-md">
           <div className="flex flex-col gap-2">
                <label className="text-zinc-200">username</label>
                <input type="text" name="username" value={username} onChange={(e)=>{setusername(e.target.value)}} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400 transition" />
           </div>
          
           <div className="flex flex-col gap-2">
                <label className="text-zinc-200">password</label>
                <input type="password" name="password" value={password} onChange={(e)=>{setpassword(e.target.value)}} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400 transition" />
           </div>
   
           <button type="submit" className="px-6 py-3 bg-[#2b2b2b] text-amber-400 rounded-lg text-lg hover:bg-zinc-700 transition" onClick={(e)=>{
            e.preventDefault();
            signinapicall();
           }}> Login</button>
        </form>
    </div>
  )
}

export default Login