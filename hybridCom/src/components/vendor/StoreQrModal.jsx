import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  Copy,
  Check,
  Share2,
  Printer,
  Download,
  ExternalLink,
  Store as StoreIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

export default function StoreQrModal({ store, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const printAreaRef = useRef(null);

  const storeId = store?._id || store?.id || "";
  const storeUrl = storeId ? `${window.location.origin}/vendor/${storeId}` : window.location.origin;

  useEffect(() => {
    if (!storeUrl) return;

    QRCode.toDataURL(storeUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: "#1A1A1A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [storeUrl]);

  if (!isOpen || !store) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Store link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${store.name} on Vingo`,
          text: `Order fresh products directly from ${store.name} on Vingo — Local Dukaan, Digital Udaan!`,
          url: storeUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Could not share link");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${(store.name || "store").toLowerCase().replace(/\s+/g, "_")}_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR Code downloaded!");
  };

  const handlePrintStandee = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the standee");
      return;
    }

    const standeeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${store.name} - Vingo Standee</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            body {
              background-color: #FA551E;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .standee-card {
              background: linear-gradient(145deg, #FF5B22 0%, #FA551E 50%, #E64A19 100%);
              width: 100%;
              max-width: 480px;
              border-radius: 40px;
              padding: 45px 35px;
              color: #ffffff;
              text-align: center;
              display: flex;
              flex-col: column;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            }
            .brand-section {
              margin-bottom: 25px;
            }
            .vingo-logo {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 8px;
            }
            .logo-icon {
              width: 58px;
              height: 58px;
            }
            .brand-name {
              font-size: 52px;
              font-weight: 900;
              letter-spacing: -1.5px;
              line-height: 1;
              color: #ffffff;
            }
            .tagline {
              font-size: 15px;
              font-weight: 700;
              letter-spacing: 0.5px;
              opacity: 0.95;
              text-transform: uppercase;
            }
            .qr-container-outer {
              position: relative;
              width: 270px;
              height: 270px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px 0;
            }
            /* White scanner bracket corners */
            .corner {
              position: absolute;
              width: 42px;
              height: 42px;
              border-color: #ffffff;
              border-style: solid;
            }
            .corner-tl {
              top: 0;
              left: 0;
              border-width: 7px 0 0 7px;
              border-top-left-radius: 20px;
            }
            .corner-tr {
              top: 0;
              right: 0;
              border-width: 7px 7px 0 0;
              border-top-right-radius: 20px;
            }
            .corner-bl {
              bottom: 0;
              left: 0;
              border-width: 0 0 7px 7px;
              border-bottom-left-radius: 20px;
            }
            .corner-br {
              bottom: 0;
              right: 0;
              border-width: 0 7px 7px 0;
              border-bottom-right-radius: 20px;
            }
            .qr-box {
              background: #ffffff;
              padding: 12px;
              border-radius: 20px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-image {
              width: 195px;
              height: 195px;
              display: block;
            }
            .store-info {
              margin-top: 15px;
            }
            .scan-text {
              font-size: 17px;
              font-weight: 800;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
              background: rgba(255, 255, 255, 0.2);
              padding: 6px 18px;
              border-radius: 30px;
              display: inline-block;
            }
            .store-name {
              font-size: 26px;
              font-weight: 900;
              margin-top: 10px;
              margin-bottom: 4px;
              line-height: 1.2;
            }
            .store-category {
              font-size: 14px;
              font-weight: 600;
              opacity: 0.9;
            }
            .footer-url {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px dashed rgba(255, 255, 255, 0.35);
              width: 100%;
              font-size: 12px;
              font-weight: 600;
              opacity: 0.9;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="brand-section">
              <div class="vingo-logo">
                <img src="${window.location.origin}/vingo.png" alt="Vingo" class="logo-icon" style="object-fit: cover; border-radius: 50%; width: 58px; height: 58px;" />
                <div class="brand-name">vingo</div>
              </div>
              <div class="tagline">Local Dukaan, Digital Udaan</div>
            </div>

            <div class="qr-container-outer">
              <div class="corner corner-tl"></div>
              <div class="corner corner-tr"></div>
              <div class="corner corner-bl"></div>
              <div class="corner corner-br"></div>
              <div class="qr-box">
                <img src="${qrDataUrl}" alt="Store QR Code" class="qr-image" />
              </div>
            </div>

            <div class="store-info">
              <div class="scan-text">SCAN & ORDER ONLINE</div>
              <div class="store-name">${store.name || "Vendor Store"}</div>
              <div class="store-category">${store.category || "Local Store"} • ${store.address?.city || store.location?.city || "Hyperlocal Delivery"}</div>
            </div>

            <div class="footer-url">
              ${storeUrl}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(standeeHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <StoreIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold app-heading">Share Store & QR Standee</h2>
              <p className="text-xs app-muted">Print table standee or share direct store link with customers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="app-control w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Standee Preview Card (Styled to match the template exactly) */}
        <div className="flex justify-center">
          <div
            ref={printAreaRef}
            className="w-full max-w-xs bg-linear-to-b from-[#FF5722] via-[#FA551E] to-[#E64A19] text-white rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Top Brand Logo */}
            <div className="mb-4 space-y-1">
              <div className="flex items-center justify-center gap-2.5">
                <img src="/vingo.png" alt="Vingo" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <span className="text-3xl font-black tracking-tight text-white">vingo</span>
              </div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                Local Dukaan, Digital Udaan
              </p>
            </div>

            {/* QR Viewfinder Container with 4 Corner Brackets */}
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              {/* Four white rounded corners */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br-xl" />

              {/* QR Image Box */}
              <div className="bg-white p-2.5 rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Store QR Code" className="w-34 h-34 rounded-lg object-contain" />
                ) : (
                  <div className="w-34 h-34 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
                    <span className="text-xs text-gray-400 font-bold">Generating QR...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Store Information */}
            <div className="mt-3 space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold tracking-wide uppercase">
                Scan to Order
              </span>
              <h3 className="text-base font-extrabold text-white line-clamp-1 mt-1">
                {store.name || "Vendor Store"}
              </h3>
              <p className="text-[11px] font-medium text-white/80">
                {store.category || "Local Store"} • {store.address?.city || store.location?.city || "Hyperlocal"}
              </p>
            </div>
          </div>
        </div>

        {/* Copy Share URL Bar */}
        <div className="space-y-2">
          <label className="text-xs font-bold app-muted">Direct Store Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={storeUrl}
              className="app-input flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-secondary/40 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="app-control shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:border-amber-500 transition cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handlePrintStandee}
            className="w-full min-h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Standee (PDF)</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full min-h-11 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-4 py-2.5 transition flex items-center justify-center gap-2 border border-border active:scale-95 cursor-pointer"
          >
            <Share2 size={15} />
            <span>Share Link</span>
          </button>

          <button
            onClick={handleDownloadQr}
            className="w-full min-h-11 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs px-4 py-2.5 transition flex items-center justify-center gap-2 border border-border active:scale-95 cursor-pointer"
          >
            <Download size={15} />
            <span>Save QR Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}
