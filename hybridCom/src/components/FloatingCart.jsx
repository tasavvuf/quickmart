import {useContext} from 'react'
import { CartContext } from "../context/CartContext"
import {StoreContext} from "../context/StoreContext"
import { Link } from "react-router-dom";
function FloatingCart() {
const {
    items,

    totalItems,

    totalPrice,

    activeStore
} = useContext(CartContext);  
const { stores } = useContext(StoreContext);
const activeStoreName = stores.find(store => store.id === activeStore)?.name || activeStore;
if(items.length===0)
    return null;
return (
    <div className='app-bottom-bar fixed bottom-0 left-0 right-0 h-28 max-h-28 overflow-hidden flex flex-col items-center justify-center z-50'>
        <div className='max-h-full max-w-full overflow-hidden text-center'>
            <div className='app-muted truncate text-xs'>{activeStoreName}</div>
            <div className='flex flex-wrap justify-center gap-2 text-sm'>
                <p>Items: {totalItems}</p>
                <span>•</span>
                <p>Total: ₹{totalPrice.toFixed(2)}</p>
            </div>
              <Link to="/cart">
                    <button className='text-blue-500 hover:text-blue-400 cursor-pointer'>
                        [ View Cart → ]
                    </button>
                </Link>
        </div>
    </div>
  )
}

export default FloatingCart
