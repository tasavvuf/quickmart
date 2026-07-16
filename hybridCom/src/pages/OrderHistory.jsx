import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, MapPin, Package } from "lucide-react";
import { UserContext } from "../context/UserContext";
import OrderHistoryCard from "../components/OrderHistoryCard";

export default function OrderHistory() {
  const { user } = useContext(UserContext);
  const orders = user?.orderHistory || [];

  const totalSpent = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="app-page px-5 py-8 pb-28">
      <main className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center gap-4">
          <Link
            to="/user"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full glass glass-hover"
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Account
            </p>
            <h1 className="text-2xl font-bold">Order History</h1>
          </div>
        </header>

        <section className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <Package size={18} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Amount Spent</p>
            <p className="text-lg font-bold text-amber-500">₹{totalSpent}</p>
          </div>
        </section>

        {orders.length ? (
          <section className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </section>
        ) : (
          <div className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center text-sm text-muted-foreground">
            <History size={22} className="text-amber-500" />
            No orders placed yet.
          </div>
        )}
      </main>
    </div>
  );
}
