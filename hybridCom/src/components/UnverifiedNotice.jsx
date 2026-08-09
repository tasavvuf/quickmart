import React from "react";
import { ShieldAlert, Phone, RefreshCw, Clock, CheckCircle2 } from "lucide-react";

export default function UnverifiedNotice({ type = "vendor", name = "", onRefresh }) {
  const isVendor = type === "vendor";

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full app-card border border-amber-500/30 bg-card/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 text-center">
        {/* Animated Glow Shield Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock size={12} />
          </div>
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block uppercase tracking-wider">
            Verification Pending
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isVendor ? "Store Verification Pending" : "Rider Approval Pending"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isVendor
              ? `Hello ${name || "Merchant"}! Your store registration is under review by QuickMart Admin. Access to store management and product listing will open as soon as admin approves your account.`
              : `Hello ${name || "Rider"}! Your delivery partner application and documents are currently under admin review. Access to live order pools will open upon admin approval.`}
          </p>
        </div>

        {/* Contact Admin Box */}
        <div className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contact Admin For Urgent Verification
          </p>
          <a
            href="tel:+918469191292"
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Phone size={18} className="fill-current" />
            <span>Call Admin: +91 8469191292</span>
          </a>
          <p className="text-[11px] text-muted-foreground font-semibold">
            Support hours: 9:00 AM – 9:00 PM IST
          </p>
        </div>

        {/* Refresh Action Button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={onRefresh || (() => window.location.reload())}
            className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={15} />
            <span>Check Verification Status (Refresh)</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Once admin approves, click refresh to enter dashboard immediately</span>
          </div>
        </div>
      </div>
    </div>
  );
}
