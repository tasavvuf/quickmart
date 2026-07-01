import React from 'react'
import { Link } from "react-router-dom";


function Nav() {
  return (
    <div>
        <Link to={"/"}>
   <h1 className="text-3xl font-bold p-6">Local Ecom</h1>
</Link>
<div className='w-full flex justify-around'>
<Link to={"/login"} className='w-50 '>
<button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>login</button>
</Link>
<Link to={"/signup"} className='w-50 '>
<button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>signup</button>
</Link>

</div>



</div>
  )
}

export default Nav