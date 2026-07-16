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
     <div className="app-page p-6 flex flex-col justify-center items-center">
        <form onSubmit={(e)=>{e.preventDefault()}} className="app-card p-8 rounded-3xl flex flex-col gap-6 w-full max-w-md">
           <div className="flex flex-col gap-2">
                <label>username</label>
                <input type="text" name="username" value={username} onChange={(e)=>{setusername(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
          
           <div className="flex flex-col gap-2">
                <label>password</label>
                <input type="password" name="password" value={password} onChange={(e)=>{setpassword(e.target.value)}} className="app-input rounded-lg px-4 py-3" />
           </div>
   
           <button type="submit" className="app-control px-6 py-3 text-amber-500 rounded-lg text-lg" onClick={(e)=>{
            e.preventDefault();
            signinapicall();
           }}> Login</button>
        </form>
    </div>
  )
}

export default Login
