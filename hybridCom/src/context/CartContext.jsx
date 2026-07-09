/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState, useEffect, useContext } from "react";
import { StoreContext } from "./StoreContext";
export const CartContext = createContext();
export function CartContextProvider({ children }) {
  const {stores} = useContext(StoreContext);
  const [activeStore, setActiveStore] = useState(null);
  const [items, setItems] = useState([]);

  const getItemPrice = (item) => {
    const store = stores.find((s) => s.id === activeStore);
    if (!store) return null;
    const product = store.products.find((p) => p.id === item.id);
    return product ? product.price : null;
  };

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity ?? 0), 0),
    [items],
  );
  useEffect(() => {

    if (items.length === 0) {
      setActiveStore(null)
    }

  }, [items])

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + getItemPrice(item) * Number(item.quantity ?? 0),
        0,
      ),
    [items],
  );

  const replaceCart = (newItems = [], store) => {
    setActiveStore(store);
    setItems(
      newItems.map((item) => ({
        ...item,
        quantity: Math.max(Number(item.quantity ?? 1), 1),
      })),
    );

  };
  const addToCart = (productId, store) => {
    if (!productId || !store) {
      console.log('missing details for adding to cart');
      return;
    }
    console.log('adding to cart', productId, store);
    if (!activeStore) {
      console.log('setting active store');
      setActiveStore(store)
       setItems((currentItems) => {
      return [...currentItems, { id: productId, quantity: 1 }];
    });
    console.log('added to cart', items);
    return;
    }
    console.log('active store', activeStore);
    if (activeStore !== store) {
      console.log('different store, replacing cart', activeStore, store);
      replaceCart([{ id: productId, quantity: 1 }], store);
      return;
    }
    setItems((currentItems) => {
      return [...currentItems, { id: productId, quantity: 1 }];
    });
    console.log('added to cart', items);
   
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  };

  const increaseQuantity = (productId) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Number(item.quantity ?? 1) - 1 }
            : item,
        )
        .filter((item) => Number(item.quantity) > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
    setActiveStore(null);
  };


  const value = {
    activeStore,
    setActiveStore,

    items,
    setItems,

    totalItems,
    totalPrice,

    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    replaceCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContextProvider;
