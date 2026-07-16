import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { LocationDataContext } from '../context/LocationContext';
import { StoreContext } from '../context/StoreContext';
function Cart() {
  const [showBillDetails, setShowBillDetails] = useState(false);
  const {
    items,
    activeStore,
    totalPrice,
    totalItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);
  const { stores } = useContext(StoreContext);
  const { lat, lng, calculateDistance } = useContext(LocationDataContext);
  const store = stores.find((store) => store.id === activeStore);
  const preferredSuggestedNames = ['Eggs', 'Butter', 'Cheese'];
  const cartItemIds = new Set(items.map((item) => item.id));

  const cartProducts = items
    .map((item) => {
      const product = store?.products.find((product) => product.id === item.id);

      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);

  const preferredSuggestions = preferredSuggestedNames
    .map((name) => store?.products.find((product) => product.name === name))
    .filter(Boolean);

  const suggestedProducts = [
    ...preferredSuggestions,
    ...(store?.products ?? []),
  ].filter(
    (product, index, products) =>
      !cartItemIds.has(product.id) &&
      products.findIndex((item) => item.id === product.id) === index,
  ).slice(0, 3);

  const distance =
    store?.location && lat && lng
      ? Number(calculateDistance(lat, lng, store.location.lat, store.location.lng))
      : 3;
  const deliveryFee = Math.round(distance * 7);
  const platformFee = 30;
  const gst = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + platformFee + gst;

  if (!items.length || !store) {
    return (
      <div className="h-full overflow-y-auto px-6 py-10 text-zinc-100">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-100">Your cart is empty</h1>
          <p className="text-zinc-400">Add products from a store to see them here.</p>
          <Link
            to="/"
            className="rounded-xl bg-amber-400 px-5 py-2.5 font-semibold text-black transition hover:bg-amber-300"
          >
            Browse stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-36 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
          <h1 className="mb-2 bg-linear-to-r from-purple-400 to-amber-400 bg-clip-text text-4xl font-bold text-transparent">
            {store.name}
          </h1>

          <p className="text-sm text-zinc-400">
            {store.location.city} | {store.location.address}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-lg text-amber-400">★</span>
            <span className="font-semibold text-zinc-200">{store.rating}</span>
            <span className="text-sm text-zinc-500">({store.totalReviews} reviews)</span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm text-amber-400">{store.category}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Cart</h2>
          <button
            onClick={clearCart}
            className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Clear cart
          </button>
        </div>

        <ul className="space-y-4">
          {cartProducts.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-4 sm:flex-row sm:items-center"
            >
              <img
                loading="lazy"
                src={`${item.image}?w=300&q=60&auto=format&fit=crop`}
                alt={item.name}
                className="h-28 w-full rounded-xl object-cover sm:w-32"
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p className="text-sm text-zinc-400">{item.category}</p>
                <p className="mt-2 font-mono text-amber-400">₹{item.price}</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-lg font-bold text-amber-400 transition hover:border-amber-500/60"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-lg font-bold text-green-400 transition hover:border-green-500/60"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm text-zinc-500">Subtotal</p>
                  <p className="font-mono text-lg font-bold">₹{item.lineTotal}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-1 text-sm font-semibold text-red-400 transition hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {suggestedProducts.length > 0 && (
          <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
            <h2 className="mb-4 text-xl font-bold">Suggested Items</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{product.name}</p>
                    <p className="font-mono text-sm text-amber-400">₹{product.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product.id, store.id)}
                    className="shrink-0 cursor-pointer rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-black transition hover:bg-amber-300"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
          <button
            onClick={() => setShowBillDetails((current) => !current)}
            className="flex w-full cursor-pointer items-center justify-between text-left"
          >
            <span className="text-xl font-bold">Bill Details</span>
            <span className="text-sm font-semibold text-amber-400">
              {showBillDetails ? 'Hide bill details' : 'See full bill details'}
            </span>
          </button>

          {showBillDetails && (
            <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Items Total ({totalItems} items)</span>
                <span className="font-mono">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Delivery Fee ({distance.toFixed(1)} km x ₹7)
                </span>
                <span className="font-mono">₹{deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Platform Fee</span>
                <span className="font-mono">₹{platformFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">GST</span>
                <span className="font-mono">₹{gst}</span>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4 text-xl font-bold">
            <span>Grand Total</span>
            <span className="font-mono text-amber-400">₹{grandTotal.toFixed(2)}</span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Deliver To</h2>
              <p className="mt-3 font-semibold">Home</p>
              <p className="mt-1 max-w-xl text-sm text-zinc-400">
                22, Kalawad Road, Near Crystal Mall, Rajkot, Gujarat 360005
              </p>
            </div>
            <button className="shrink-0 cursor-pointer text-sm font-semibold text-amber-400 transition hover:text-amber-300">
              Change →
            </button>
          </div>
        </section>

        <button className="mt-6 w-full cursor-pointer rounded-2xl bg-linear-to-r from-green-600 to-emerald-600 px-5 py-4 text-lg font-bold text-zinc-100 transition hover:from-green-500 hover:to-emerald-500">
          Proceed To Checkout
        </button>
      </div>
    </div>
  )
}

export default Cart
