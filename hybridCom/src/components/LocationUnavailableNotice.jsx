import { MapPin, MapPinOff, RefreshCw, Navigation } from "lucide-react";

export default function LocationUnavailableNotice({ onStoreChangeLocation, compact = false }) {
  return (
    <div className={`w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-md text-center ${compact ? "my-4" : "my-8"}`}>
      <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-foreground border border-border">
          <MapPinOff className="w-7 h-7 text-amber-500" />
        </div>

        {/* Status Badge */}
        <span className="badge-yellow text-[11px] py-1 px-3 font-bold uppercase tracking-wider">
          Service Not Available In Your Area (10km Radius)
        </span>

        {/* Title & Message */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            We are not available at your location yet
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
            Vingo operates within a 10km delivery radius from partner stores. Stay tuned as we expand to your neighborhood soon!
          </p>
        </div>

        {/* Available Cities */}
        <div className="w-full bg-secondary/40 border border-border rounded-xl p-4 mt-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
            <Navigation size={12} className="text-amber-500" />
            <span>Currently Available Cities</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground">
              <MapPin size={13} className="text-amber-500" /> Bhavnagar, Gujarat
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground">
              <MapPin size={13} className="text-amber-500" /> Rajkot, Gujarat
            </span>
          </div>
        </div>

        {/* Change Location Action */}
        {onStoreChangeLocation && (
          <button
            type="button"
            onClick={onStoreChangeLocation}
            className="btn-yellow px-6 py-2.5 rounded-full font-black text-xs shadow-sm active:scale-95 transition cursor-pointer flex items-center gap-2 mt-2"
          >
            <RefreshCw size={14} />
            <span>Change Delivery Location</span>
          </button>
        )}
      </div>
    </div>
  );
}
