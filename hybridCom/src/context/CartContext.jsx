/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState, useContext } from "react";
import { StoreContext } from "./StoreContext";
export const CartContext = createContext();
export function CartContextProvider({ children }) {
  const {stores} = useContext(StoreContext);
  const [activeStore, setActiveStore] = useState(null);
  const [items, setItems] = useState([]);

  const store = stores.find((store) => store.id === activeStore);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity ?? 0), 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = store?.products.find((product) => product.id === item.id);
        const price = Number(product?.price ?? 0);
        const quantity = Number(item.quantity ?? 0);

        return total + price * quantity;
      }, 0),
    [items, store],
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
      setItems([{ id: productId, quantity: 1 }]);
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
      const itemExists = currentItems.some((item) => item.id === productId);

      if (itemExists) {
        return currentItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
            : item,
        );
      }

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
