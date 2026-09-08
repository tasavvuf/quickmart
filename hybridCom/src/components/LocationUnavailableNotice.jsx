import { useState, useContext } from "react";
import {
  MapPin,
  RefreshCw,
  Navigation,
  CheckCircle2,
  Sparkles,
  Mail,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { toast } from "react-toastify";
import CurvedInput from "./CurvedInput";
import TextLoop from "./TextLoop";
import GlassSurface from "./GlassSurface";
import { LocationDataContext } from "../context/LocationContext";
import { useAppTheme } from "../context/ThemeContext";
import { api, getApiErrorMessage } from "../lib/api";

export default function LocationUnavailableNotice({
  onStoreChangeLocation,
  compact = false,
}) {
  const { lat, lng } = useContext(LocationDataContext) || {};
  const { isDark } = useAppTheme();

  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleWishlistSubmit = async (emailValue) => {
    const rawEmail = typeof emailValue === "string" ? emailValue : "";
    const emailToSubmit = rawEmail.trim();

    if (!emailToSubmit) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailToSubmit)) {
      toast.error(
        "Please provide a valid email address (e.g. user@example.com)",
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/wishlist", {
        email: emailToSubmit,
        lat: lat || undefined,
        lng: lng || undefined,
      });

      setSubscribed(true);
      setSubmittedEmail(emailToSubmit);
      toast.success(res.data?.message || "Added to wishlist!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to join wishlist"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative w-[100vw] left-1/2 -translate-x-1/2 py-6 sm:py-10 my-2 overflow-hidden ${compact ? "my-2" : ""}`}>
      {/* ─── Upper Side Full-Width Animated Wave TextLoop Ribbon ─── */}
      <div className="absolute inset-x-0 top-0 sm:top-1 w-full pointer-events-none select-none z-0 overflow-hidden py-1">
        <div className="w-full opacity-90 filter drop-shadow-md">
          <TextLoop
            text="Vingo ✦ Local Dukaan, Digital Udaan"
            shape="wave"
            speed={85}
            direction="forward"
            separator="✦"
            curviness={65}
            fontSize={typeof window !== "undefined" && window.innerWidth < 640 ? 26 : 38}
            fontWeight={800}
            letterSpacing={3}
            uppercase
            color="#e7e2d3"
            ribbon
            ribbonColor="#5227FF"
            ribbonWidth={typeof window !== "undefined" && window.innerWidth < 640 ? 60 : 80}
            pauseOnHover
            preserveAspectRatio="none"
          />
        </div>
      </div>

      {/* ─── Compact Centered Floating Main Card With GlassSurface Background ─── */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-2 sm:px-4 mt-6 sm:mt-10">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          borderWidth={0.06}
          brightness={isDark ? 35 : 75}
          opacity={isDark ? 0.9 : 0.94}
          blur={14}
          displace={0.5}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          mixBlendMode="screen"
          className="w-full rounded-3xl border border-border/70 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)]"
        >
          <div className="w-full p-4 sm:p-10 text-center space-y-5 sm:space-y-7">
            {/* Radar Beacon Icon */}
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
              {/* Pulsing ambient radar ring */}
              <div className="absolute inset-0 rounded-3xl bg-amber-400/25 dark:bg-amber-400/15 animate-ping opacity-60 pointer-events-none" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-amber-500/5 border-2 border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/15 text-amber-500">
                <Navigation className="w-9 h-9 transform -rotate-45" />
              </div>
            </div>

            {/* Pill Status Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                10km Delivery Radius Limit
              </span>
            </div>

            {/* Title & Narrative */}
            <div className="space-y-2.5 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                We are not in your neighborhood{" "}
                <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  yet.
                </span>
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                Vingo connects you to neighborhood merchants for lightning-fast
                deliveries within 10km. Drop your email below to vote for your
                area — we expand where demand is strongest!
              </p>
            </div>

            {/* ─── Wishlist Spotlight Box ─── */}
            <div className="w-full bg-secondary/35 dark:bg-secondary/20 border border-border/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-4 shadow-inner">
              {subscribed ? (
                <div className="w-full max-w-md bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-base font-black text-foreground">
                    You're officially on the expansion wishlist!
                  </p>
                  <p className="text-xs text-muted-foreground font-medium max-w-xs">
                    We'll ping{" "}
                    <span className="font-bold text-foreground">
                      {submittedEmail}
                    </span>{" "}
                    the moment partner stores launch near your location.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubscribed(false)}
                    className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted font-bold mt-1 cursor-pointer transition"
                  >
                    Register another email address
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-wider">
                    <Sparkles size={15} className="text-amber-400" />
                    <span>Join our expansion priority waitlist</span>
                  </div>

                  {/* CurvedInput Container */}
                  <div className="w-full flex justify-center px-1">
                    <CurvedInput
                      placeholder="name@example.com"
                      buttonText={submitting ? "Joining..." : "Get Started"}
                      theme={isDark ? "dark" : "light"}
                      bend={20}
                      height={62}
                      width={440}
                      onSubmit={handleWishlistSubmit}
                    />
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground font-bold flex-wrap pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />{" "}
                      Exactly 1 launch notification. Zero spam.
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Flame
                        size={14}
                        className="fill-current text-amber-500"
                      />{" "}
                      High demand area
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Operational Hubs ─── */}
            <div className="w-full bg-secondary/25 border border-border/50 rounded-2xl p-4 sm:p-5">
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                <Navigation size={13} className="text-amber-500" />
                <span>Currently Operational Delivery Hubs</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Bhavnagar, Gujarat (12 Partner Stores)
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Rajkot, Gujarat (18 Partner Stores)
                </span>
              </div>
            </div>

            {/* Change Location Action */}
            {onStoreChangeLocation && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onStoreChangeLocation}
                  className="btn-yellow px-8 py-3 rounded-full font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 hover:brightness-105 transition-all cursor-pointer inline-flex items-center gap-2.5"
                >
                  <RefreshCw size={15} />
                  <span>Change Delivery Location</span>
                </button>
              </div>
            )}
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
