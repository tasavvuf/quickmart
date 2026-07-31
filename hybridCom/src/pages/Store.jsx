import { Link } from "react-router-dom";
import { LogIn, Store as StoreIcon, UserPlus } from "lucide-react";

export default function Store() {
  return (
    <div className="app-page flex flex-col items-center px-6 py-10">
      <div className="app-card flex w-full max-w-2xl flex-col gap-6 rounded-3xl p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-500">
            <StoreIcon size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Vendor store access</h2>
            <p className="app-muted mt-2 text-sm">
              Login or create a vendor account for seller access.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/vendor-login"
            className="app-control flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl px-6 py-5 text-center"
          >
            <LogIn size={24} className="text-amber-500" />
            <span className="text-lg font-semibold">Vendor login</span>
          </Link>

          <Link
            to="/vendor-signup"
            className="app-control flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl px-6 py-5 text-center"
          >
            <UserPlus size={24} className="text-amber-500" />
            <span className="text-lg font-semibold">Vendor registration</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
