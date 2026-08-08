import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";
import { LocationDataContext } from "../context/LocationContext";
import { StoreContext } from "../context/StoreContext";
import { UserContext } from "../context/UserContext";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptProduct } from "../lib/adapters";
import { Plus, MapPin, CheckCircle2, Home, Navigation, PlusCircle, X, Check } from "lucide-react";

function Cart() {
  const navigate = useNavigate();
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressTab, setAddressTab] = useState("saved"); // 'saved' | 'new'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentType, setPaymentType] = useState("COD"); // 'COD' | 'UPI'

  const [newAddrForm, setNewAddrForm] = useState({
    label: "Home",
    street: "",
    area: "",
    city: "Surat",
    state: "Gujarat",
    pincode: "",
    isDefault: false,
  });

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
    store: cartStore,
  } = useContext(CartContext);
  const { stores } = useContext(StoreContext);
  const { user, setActiveAddress, addAddress, setDefaultAddress } = useContext(UserContext);
  const { lat, lng, locationSource, calculateDistance } = useContext(LocationDataContext);
  const store = cartStore || stores.find((s) => s.id === activeStore);
  const cartItemIds = new Set(items.map((item) => item.id));

  const selectedDeliveryAddress =
    user?.currentDeliveryAddress ||
    user?.addresses?.find((a) => String(a.id || a._id) === String(user?.selectedAddressId)) ||
    user?.defaultAddress ||
    (user?.addresses?.length ? user.addresses[0] : null);

  const hasSelectedSavedAddress = Boolean(selectedDeliveryAddress) && locationSource === "saved";

  const handleProceedToCheckout = async () => {
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }

    if (!selectedDeliveryAddress && !hasSelectedSavedAddress) {
      setShowAddressModal(true);
      toast.warn("Please choose or add a delivery address before checkout");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await api.post("/cart/checkout", {
        paymentType,
        deliveryAddress: selectedDeliveryAddress
          ? {
              street: selectedDeliveryAddress.street || selectedDeliveryAddress.fullAddress,
              area: selectedDeliveryAddress.area || "",
              city: selectedDeliveryAddress.city || "Surat",
              state: selectedDeliveryAddress.state || "Gujarat",
              pincode: selectedDeliveryAddress.pincode || "",
              fullAddress: selectedDeliveryAddress.fullAddress || selectedDeliveryAddress.street,
              customerName: user?.name || "Customer",
              phone: user?.phoneNumber || "N/A",
              location: selectedDeliveryAddress.location || { lat: lat || 22.2904, lng: lng || 70.7915 },
            }
          : null,
      });

      toast.success(response.data?.message || "Order placed successfully!");
      const newOrderId = response.data?.order?._id;
      clearCart();
      if (newOrderId) {
        navigate(`/orders/${newOrderId}`);
      } else {
        navigate("/orders");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to place order"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    const storeId = store?.id || activeStore;
    if (!storeId) return;

    let cancelled = false;
    api
      .get(`/stores/${storeId}`)
      .then((res) => {
        if (!cancelled && res.data?.store?.products) {
          setStoreProducts(res.data.store.products.map(adaptProduct));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [store?.id, activeStore]);

  const cartProducts = items
    .map((item) => {
      const product =
        item.product || store?.products?.find((p) => p.id === item.id);

      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);

  const availableStoreProducts =
    storeProducts.length > 0 ? storeProducts : store?.products ?? [];

  const suggestedProducts = availableStoreProducts
    .filter((product) => !cartItemIds.has(product.id))
    .slice(0, 4);

  const distance =
    store?.location?.lat != null &&
    store?.location?.lng != null &&
    lat != null &&
    lng != null
      ? Number(
          calculateDistance(lat, lng, store.location.lat, store.location.lng),
        )
      : 3;
  const deliveryFee = Math.round(distance * 7);
  const platformFee = 30;
  const gst = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + platformFee + gst;

  if (!items.length || !store) {
    return (
      <div className="app-page px-6 py-10">
        <div className="app-card mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="app-muted">
            Add products from a store to see them here.
          </p>
          <Link
            to="/"
            className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Browse stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page px-6 py-8 pb-36">
      <div className="mx-auto max-w-5xl">
        <div className="app-card mb-8 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 bg-linear-to-r from-chocolate to-caramel bg-clip-text text-4xl font-bold ">
              {store.name}
            </h1>

            <p className="app-muted text-sm">
              {store.location?.city} | {store.location?.address}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-lg text-highlight">★</span>
              <span className="font-semibold">{store.rating}</span>
              <span className="app-muted text-sm">
                ({store.totalReviews} reviews)
              </span>
              <span className="app-muted">|</span>
              <span className="text-sm text-caramel">{store.category}</span>
            </div>
          </div>

          <Link
            to={`/vendor/${store.id}`}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-md text-sm"
          >
            <Plus size={16} />
            <span>Add More Items</span>
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Cart</h2>
          <div className="flex items-center gap-3">
            <Link
              to={`/vendor/${store.id}`}
              className="text-sm font-semibold text-caramel hover:underline hidden sm:inline"
            >
              + Add items
            </Link>
            <button
              onClick={clearCart}
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 cursor-pointer"
            >
              Clear cart
            </button>
          </div>
        </div>

        <ul className="space-y-4">
          {cartProducts.map((item) => (
            <li
              key={item.id}
              className="app-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              <img
                loading="lazy"
                src={`${item.image}?w=300&q=60&auto=format&fit=crop`}
                alt={item.name}
                className="h-28 w-full rounded-xl object-cover sm:w-32"
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p className="app-muted text-sm">{item.category}</p>
                <p className="mt-2 font-mono text-caramel">₹{item.price}</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="app-control flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-caramel hover:border-caramel/60"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="app-control flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-green-500 hover:border-green-500/60"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="app-muted text-sm">Subtotal</p>
                  <p className="font-mono text-lg font-bold">
                    ₹{item.lineTotal}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-1 text-sm font-semibold text-red-400 transition hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {suggestedProducts.length > 0 && (
          <section className="app-card mt-6 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Suggestions from {store.name}</h2>
                <p className="text-muted-foreground text-xs font-medium">Add popular items directly from this store</p>
              </div>
              <Link
                to={`/vendor/${store.id}`}
                className="text-xs font-bold text-caramel hover:underline inline-flex items-center gap-1"
              >
                View all items →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="app-panel-soft flex items-center justify-between gap-3 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {product.image && (
                      <img
                        loading="lazy"
                        src={`${product.image}?w=100&q=60&auto=format&fit=crop`}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-sm">{product.name}</p>
                      <p className="font-mono text-xs text-caramel font-bold">
                        ₹{product.price}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product.id, store.id)}
                    className="shrink-0 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="app-card mt-6 rounded-2xl p-5">
          <button
            onClick={() => setShowBillDetails((current) => !current)}
            className="flex w-full cursor-pointer items-center justify-between text-left"
          >
            <span className="text-xl font-bold">Bill Details</span>
            <span className="text-sm font-semibold text-caramel">
              {showBillDetails ? "Hide bill details" : "See full bill details"}
            </span>
          </button>

          {showBillDetails && (
            <div className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="app-muted">
                  Items Total ({totalItems} items)
                </span>
                <span className="font-mono">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="app-muted">
                  Delivery Fee ({distance.toFixed(1)} km x ₹7)
                </span>
                <span className="font-mono">₹{deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="app-muted">Platform Fee</span>
                <span className="font-mono">₹{platformFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="app-muted">GST</span>
                <span className="font-mono">₹{gst}</span>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xl font-bold">
            <span>Grand Total</span>
            <span className="font-mono text-caramel">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Payment Method Selector */}
        <section className="app-card mt-6 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-3">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType("COD")}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                paymentType === "COD"
                  ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-extrabold text-sm">💵 Cash On Delivery (COD)</span>
                {paymentType === "COD" && <Check className="text-amber-400" size={16} />}
              </div>
              <span className="app-muted text-xs">Pay cash when your order arrives</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentType("UPI")}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                paymentType === "UPI"
                  ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-extrabold text-sm">⚡ Online UPI</span>
                {paymentType === "UPI" && <Check className="text-amber-400" size={16} />}
              </div>
              <span className="app-muted text-xs">Pay instantly via Google Pay, PhonePe, UPI</span>
            </button>
          </div>
        </section>

        <section className="app-card mt-6 rounded-2xl p-5">
          {selectedDeliveryAddress ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Deliver To</h2>
                  <span className="bg-amber-400/20 text-amber-500 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {selectedDeliveryAddress.label || "Saved Address"}
                  </span>
                  {selectedDeliveryAddress.isDefault && (
                    <span className="bg-green-500/10 text-green-500 border border-green-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                      Default 🌟
                    </span>
                  )}
                </div>
                <p className="app-muted mt-2 max-w-xl text-sm leading-relaxed">
                  {selectedDeliveryAddress.fullAddress ||
                    `${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.city}`}
                </p>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="shrink-0 cursor-pointer text-sm font-bold text-amber-500 hover:text-amber-400 transition"
              >
                Change →
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Deliver To</h2>
                <p className="app-muted text-xs mt-1">
                  Using GPS location. Choose a saved address or add a new address for delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="shrink-0 cursor-pointer rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-5 py-2.5 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <MapPin size={16} />
                <span>Choose delivery address</span>
              </button>
            </div>
          )}
        </section>

        <button
          onClick={handleProceedToCheckout}
          disabled={isPlacingOrder}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-amber-400 hover:bg-amber-300 text-black px-5 py-4 text-lg font-extrabold transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPlacingOrder ? (
            <>
              <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Placing Order...
            </>
          ) : (
            "Proceed To Checkout 🚀"
          )}
        </button>

        {/* Delivery Address Selection & Creation Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="app-card w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-amber-400/20 bg-background text-foreground max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <MapPin className="text-amber-400" size={22} />
                  <h3 className="text-xl font-bold">Select Delivery Address</h3>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-1 rounded-xl hover:bg-muted text-muted-foreground transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-2 mt-4 mb-4">
                <button
                  type="button"
                  onClick={() => setAddressTab("saved")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    addressTab === "saved"
                      ? "bg-amber-400 text-black shadow-md"
                      : "app-control"
                  }`}
                >
                  <Home size={15} />
                  <span>Saved Addresses ({user?.addresses?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddressTab("new")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    addressTab === "new"
                      ? "bg-amber-400 text-black shadow-md"
                      : "app-control"
                  }`}
                >
                  <PlusCircle size={15} />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Tab 1: Saved Addresses List */}
              {addressTab === "saved" && (
                <div className="space-y-3">
                  {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr) => {
                      const addrId = addr.id || addr._id;
                      const isSelected =
                        String(selectedDeliveryAddress?.id || selectedDeliveryAddress?._id) ===
                        String(addrId);

                      return (
                        <div
                          key={addrId}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            setActiveAddress(addrId);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">
                                {addr.label || "Address"}
                              </span>
                              {addr.isDefault && (
                                <span className="bg-amber-400/20 text-amber-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30">
                                  Default 🌟
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                <Check size={16} /> Selected
                              </span>
                            )}
                          </div>
                          <p className="app-muted text-xs leading-relaxed">
                            {addr.fullAddress || `${addr.street}, ${addr.city}`}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAddress(addrId);
                                setShowAddressModal(false);
                                toast.success(`Selected "${addr.label}" for delivery!`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              Deliver Here
                            </button>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDefaultAddress(addrId);
                                  toast.success(`Set "${addr.label}" as default address!`);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center app-muted text-xs space-y-2">
                      <p>No saved addresses found.</p>
                      <button
                        type="button"
                        onClick={() => setAddressTab("new")}
                        className="text-amber-500 font-bold underline cursor-pointer"
                      >
                        + Add a new address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Add New Address Form (Uses Current GPS Coordinates) */}
              {addressTab === "new" && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newAddrForm.street.trim()) {
                      toast.error("Please enter street address");
                      return;
                    }
                    const payload = {
                      label: newAddrForm.label || "Home",
                      street: newAddrForm.street,
                      area: newAddrForm.area,
                      city: newAddrForm.city || "Surat",
                      state: newAddrForm.state || "Gujarat",
                      pincode: newAddrForm.pincode || "",
                      fullAddress: `${newAddrForm.street}, ${newAddrForm.area ? newAddrForm.area + ", " : ""}${newAddrForm.city || "Surat"}, ${newAddrForm.state || "Gujarat"}${newAddrForm.pincode ? " - " + newAddrForm.pincode : ""}`,
                      location: { lat: lat || 22.2904, lng: lng || 70.7915 },
                      isDefault: Boolean(newAddrForm.isDefault),
                    };

                    await addAddress(payload);
                    setShowAddressModal(false);
                    toast.success("New address added and selected for delivery!");
                  }}
                  className="space-y-3"
                >
                  <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-500 flex items-center gap-2">
                    <Navigation size={15} className="shrink-0" />
                    <span>
                      Using exact GPS location ({lat ? lat.toFixed(4) : "22.2904"}, {lng ? lng.toFixed(4) : "70.7915"})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold app-muted block mb-1">
                        Address Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Home, Work, Apartment"
                        value={newAddrForm.label}
                        onChange={(e) =>
                          setNewAddrForm({ ...newAddrForm, label: e.target.value })
                        }
                        className="app-input w-full px-3 py-2 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold app-muted block mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="395007"
                        value={newAddrForm.pincode}
                        onChange={(e) =>
                          setNewAddrForm({ ...newAddrForm, pincode: e.target.value })
                        }
                        className="app-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold app-muted block mb-1">
                      Street / Flat / Building No.
                    </label>
                    <input
                      type="text"
                      placeholder="12 Green Park, Vesu"
                      value={newAddrForm.street}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, street: e.target.value })
                      }
                      className="app-input w-full px-3 py-2 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold app-muted block mb-1">
                      Area / Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="Near Adajan Circle"
                      value={newAddrForm.area}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, area: e.target.value })
                      }
                      className="app-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold app-muted block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={newAddrForm.city}
                        onChange={(e) =>
                          setNewAddrForm({ ...newAddrForm, city: e.target.value })
                        }
                        className="app-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold app-muted block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={newAddrForm.state}
                        onChange={(e) =>
                          setNewAddrForm({ ...newAddrForm, state: e.target.value })
                        }
                        className="app-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newAddrForm.isDefault}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, isDefault: e.target.checked })
                      }
                      className="h-4 w-4 rounded-xs border-border bg-input text-amber-500 focus:ring-amber-500"
                    />
                    <span>Set as Default Delivery Address 🌟</span>
                  </label>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm shadow-md transition cursor-pointer"
                    >
                      Save & Deliver Here 📍
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
