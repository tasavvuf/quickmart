/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptCart } from "../lib/adapters";
import { StoreContext } from "./StoreContext";
import { UserContext } from "./UserContext";

export const CartContext = createContext();

export function CartContextProvider({ children }) {
  const { stores } = useContext(StoreContext);
  const { isLoggedIn, isCheckingAuth } = useContext(UserContext);
  const [activeStore, setActiveStore] = useState(null);
  const [items, setItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const activeStoreId =
    typeof activeStore === "object" && activeStore !== null
      ? activeStore.id
      : activeStore;

  const store =
    typeof activeStore === "object" && activeStore !== null
      ? activeStore
      : stores.find((s) => s.id === activeStoreId);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity ?? 0), 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((total, item) => {
        const product =
          item.product || store?.products?.find((p) => p.id === item.id);
        const price = Number(product?.price ?? 0);
        const quantity = Number(item.quantity ?? 0);

        return total + price * quantity;
      }, 0),
    [items, store],
  );

  const syncCart = useCallback((cart) => {
    const nextCart = adaptCart(cart);
    setActiveStore(nextCart.activeStore);
    setItems(nextCart.items);
  }, []);

  const requireLogin = () => {
    if (isLoggedIn) {
      return true;
    }

    toast.error("Please login to manage your cart");
    return false;
  };

  const loadCart = useCallback(async () => {
    if (!isLoggedIn) {
      setActiveStore(null);
      setItems([]);
      return;
    }

    setIsCartLoading(true);

    try {
      const response = await api.get("/cart");
      syncCart(response.data.cart);
    } catch (error) {
      const code = error?.response?.data?.code;

      if (code === "CART_NOT_FOUND" || error?.response?.status === 404) {
        setActiveStore(null);
        setItems([]);
      } else {
        toast.error(getApiErrorMessage(error, "Failed to load cart"));
      }
    } finally {
      setIsCartLoading(false);
    }
  }, [isLoggedIn, syncCart]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadCart();
    }
  }, [isCheckingAuth, loadCart]);

  const replaceCart = async (productId, storeId) => {
    if (!requireLogin()) {
      return;
    }

    if (!productId || !storeId) {
      toast.error("Missing product details");
      return;
    }

    try {
      const response = await api.post(`/cart/items/${productId}/replacecart`);
      syncCart(response.data.cart);
      toast.success(response.data.message || "Cart replaced");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to replace cart"));
    }
  };

  const showReplaceCartPrompt = (productId, storeId, message) => {
    const toastId = `replace-cart-${productId}`;

    toast.warn(
      <div className="flex flex-col gap-3">
        <p className="text-sm">{message || "Cart contains items from another store."}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(toastId);
              await replaceCart(productId, storeId);
            }}
            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-black"
          >
            Replace cart
          </button>
          <button
            type="button"
            onClick={() => toast.dismiss(toastId)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
      }
    );
  };

  const addToCart = async (productId, storeId) => {
    if (!requireLogin()) {
      return;
    }

    if (!productId || !storeId) {
      toast.error("Missing product details");
      return;
    }

    try {
      const response = await api.post("/cart/items", { productId });
      syncCart(response.data.cart);
      toast.success(response.data.message || "Item added to cart");
    } catch (error) {
      if (error?.response?.data?.code === "DIFFERENT_STORE") {
        showReplaceCartPrompt(productId, storeId, error.response.data.message);
        return;
      }

      toast.error(getApiErrorMessage(error, "Failed to add item to cart"));
    }
  };

  const removeFromCart = async (productId) => {
    if (!requireLogin()) {
      return;
    }

    try {
      const response = await api.delete(`/cart/items/${productId}`);
      syncCart(response.data.cart);
      toast.success(response.data.message || "Item removed from cart");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove item from cart"));
    }
  };

  const increaseQuantity = async (productId) => {
    if (!requireLogin()) {
      return;
    }

    try {
      const response = await api.post(`/cart/items/${productId}/increase`);
      syncCart(response.data.cart);
      toast.success(response.data.message || "Item quantity increased");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to increase item quantity"));
    }
  };

  const decreaseQuantity = async (productId) => {
    if (!requireLogin()) {
      return;
    }

    try {
      const response = await api.post(`/cart/items/${productId}/decrease`);
      syncCart(response.data.cart);
      toast.success(response.data.message || "Item quantity decreased");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to decrease item quantity"));
    }
  };

  const clearCart = async () => {
    if (!requireLogin()) {
      return;
    }

    try {
      const response = await api.delete("/cart");
      syncCart(response.data.cart);
      toast.success(response.data.message || "Cart cleared");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to clear cart"));
    }
  };


  const value = {
    activeStore: activeStoreId,
    store,
    cartStore: store,
    setActiveStore,

    items,
    setItems,
    isCartLoading,
    loadCart,

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
