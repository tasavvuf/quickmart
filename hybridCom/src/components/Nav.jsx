import { useContext } from 'react'
import { Link } from "react-router-dom";
import { UserContext } from '../context/UserContext';
import { User } from 'lucide-react';

function Nav() {
  const { isLoggedIn, user } = useContext(UserContext);
  const avatarInitial = (user?.username?.trim()?.charAt(0) || "U").toUpperCase();

  return (
    <div className="border-b border-zinc-900 bg-black">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <Link to={"/"}>
          <h1 className="text-3xl font-bold">Local Ecom</h1>
        </Link>

        {isLoggedIn && (
          <Link
            to={"/user"}
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-amber-400/40 bg-[#1b1b1d] text-lg font-bold text-amber-400 transition hover:border-amber-300 hover:bg-zinc-800"
            aria-label="Open user profile"
            title="Profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.username || "User"} avatar`}
                className="h-full w-full object-cover"
              />
            ) : user?.username ? (
              avatarInitial
            ) : (
              <User size={20} />
            )}
          </Link>
        )}
      </div>

      {!isLoggedIn && (
        <div className='w-full flex justify-around'>
          <Link to={"/login"} className='w-50 '>
            <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>login</button>
          </Link>
          <Link to={"/signup"} className='w-50 '>
            <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>signup</button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Nav
