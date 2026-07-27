import { useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { UserContext } from '../context/UserContext'
import { api, getApiErrorMessage } from '../lib/api'

function Login() {
  const [username, setusername] = useState("")
  const [password, setpassword] = useState("")
  const { applyAuthenticatedUser, setRefreshToken } = useContext(UserContext)
  const navigate = useNavigate()

  const signinapicall = async () => {
    if (!username || !password) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const response = await api.post('/auth/login', {
        userName: username,
        email: username,
        password
      })

      toast.success(response.data.message || "Login successful")
      localStorage.setItem('accessToken', JSON.stringify(response.data.token));
      setRefreshToken(null)
      applyAuthenticatedUser(response.data.user, response.data.token)
      navigate("/", { replace: true })
    } catch (error) {
      console.error(error)
      toast.error(getApiErrorMessage(error, "Login failed"))
    }
  }
  return (
     <div className="app-page flex flex-col items-center justify-start px-6 pt-10 pb-16">
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
