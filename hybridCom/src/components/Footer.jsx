import React from "react";
import { Phone, Heart, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/80 bg-card/60 backdrop-blur-md text-foreground py-8 px-4 sm:px-8 mt-12 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black">
              <img src="/vingo.png" alt="Vingo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight app-heading">Vingo</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Beta Version 1.0
                </span>
              </div>
              <p className="text-xs app-muted">Local Dukaan, Digital Udaan.</p>
            </div>
          </div>

          {/* Contact Support Pill */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="tel:8469191292"
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Phone size={14} className="animate-bounce" />
              <span>Help & Support: 8469191292</span>
            </a>
          </div>
        </div>

        {/* Beta Disclaimer & Notice */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Beta Version 1.0 Notice:</strong> You are using the beta release of Vingo. Some minor glitches, bugs, or temporary downtime may be expected as we continuously improve and refine the hyperlocal experience. For any order help, issues, or feedback, please contact us directly at <a href="tel:8469191292" className="text-amber-500 font-bold hover:underline">8469191292</a>.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs app-muted pt-2">
          <span>© {new Date().getFullYear()} Vingo Platform. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:8469191292" className="hover:text-amber-500 transition">
              Customer Support: 8469191292
            </a>
            <span>•</span>
            <Link to="/store" className="hover:text-amber-500 transition">
              Browse Stores
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
