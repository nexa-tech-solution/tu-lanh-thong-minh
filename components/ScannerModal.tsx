import React, { useState, useEffect, useRef } from "react";
import { FoodItem, Language, Category } from "../types";
import { translations } from "../translations";

interface ScannerModalProps {
  lang: Language;
  onClose: () => void;
  onScan: (item: Omit<FoodItem, "id" | "addedAt">) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({
  lang,
  onClose,
  onScan,
}) => {
  const [status, setStatus] = useState<
    "idle" | "searching" | "fetching" | "confirming" | "unsupported"
  >("idle");
  const [detectedItem, setDetectedItem] = useState<Partial<FoodItem> | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<any>(null);
  const t = translations[lang] || translations.en;

  // Bản đồ chuyển đổi danh mục từ Open Food Facts sang danh mục của app
  const mapCategory = (offCategory: string): Category => {
    const cat = offCategory.toLowerCase();
    if (cat.includes("meat") || cat.includes("fish") || cat.includes("seafood"))
      return "Thịt & Hải sản";
    if (cat.includes("vegetable") || cat.includes("plant")) return "Rau củ";
    if (cat.includes("fruit")) return "Trái cây";
    if (cat.includes("dairy") || cat.includes("egg") || cat.includes("cheese"))
      return "Sữa & Trứng";
    if (
      cat.includes("spice") ||
      cat.includes("sauce") ||
      cat.includes("condiment") ||
      cat.includes("oil")
    )
      return "Gia vị";
    return "Khác";
  };

  useEffect(() => {
    // Kiểm tra hỗ trợ BarcodeDetector
    if (!("BarcodeDetector" in window)) {
      setStatus("unsupported");
      return;
    }

    // @ts-ignore
    detectorRef.current = new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
    });

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("searching");
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert(t.scanner.cameraError);
        onClose();
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [t.scanner.cameraError, onClose]);

  // Vòng lặp quét mã vạch
  useEffect(() => {
    let animationId: number;

    const detect = async () => {
      if (status === "searching" && videoRef.current && detectorRef.current) {
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            handleBarcodeFound(code);
            return; // Dừng vòng lặp khi thấy mã
          }
        } catch (e) {
          console.error("Detection error:", e);
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    if (status === "searching") {
      animationId = requestAnimationFrame(detect);
    }

    return () => cancelAnimationFrame(animationId);
  }, [status]);

  const handleBarcodeFound = async (code: string) => {
    setStatus("fetching");
    try {
      // Gọi API Open Food Facts (Miễn phí 100%)
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,categories,quantity,image_small_url`
      );
      const data = await res.json();

      if (data.status === 1) {
        const product = data.product;
        const itemName = product.product_name || `Sản phẩm ${code}`;
        const cat = mapCategory(product.categories || "");

        setDetectedItem({
          name: itemName,
          category: cat,
          quantity: product.quantity ? product.quantity.split(" ")[0] : "1",
          unit: product.quantity
            ? product.quantity.split(" ")[1] || "pcs"
            : "pcs",
          expiryDate: new Date(Date.now() + 86400000 * 14)
            .toISOString()
            .split("T")[0], // Mặc định 14 ngày
          icon: getIconForCategory(cat),
        });
        setStatus("confirming");
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      } else {
        alert(
          lang === "vi"
            ? "Sản phẩm này chưa có trong dữ liệu mã vạch!"
            : "Product not found in database!"
        );
        setStatus("searching");
      }
    } catch (err) {
      console.error(err);
      setStatus("searching");
    }
  };

  const getIconForCategory = (cat: Category) => {
    switch (cat) {
      case "Thịt & Hải sản":
        return "🥩";
      case "Rau củ":
        return "🥦";
      case "Trái cây":
        return "🍎";
      case "Sữa & Trứng":
        return "🥛";
      case "Gia vị":
        return "🧂";
      default:
        return "📦";
    }
  };

  const handleConfirm = () => {
    if (detectedItem) {
      onScan(detectedItem as Omit<FoodItem, "id" | "addedAt">);
      onClose();
    }
  };

  if (status === "unsupported") {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-10 text-center text-white">
        <div className="text-6xl mb-6">🚫</div>
        <h2 className="text-2xl font-black mb-4">{t.scanner.unsupported}</h2>
        <p className="opacity-60 mb-8">
          {lang === "vi"
            ? "Bác vui lòng sử dụng Chrome hoặc Edge trên điện thoại để dùng tính năng này."
            : "Please use Chrome or Edge on mobile."}
        </p>
        <button
          onClick={onClose}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs"
        >
          {t.cancel}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[80] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[100] w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="relative w-full h-full max-w-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Khung quét Laser đỏ */}
        {status === "searching" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-72 h-48 border-2 border-white/20 rounded-3xl relative">
              <div className="absolute inset-0 bg-red-500/5"></div>
              <div className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-laser-move top-1/2"></div>
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
            <div className="mt-8 bg-black/50 backdrop-blur-lg px-8 py-4 rounded-3xl border border-white/10 mx-6 text-center max-w-[280px]">
              <p className="text-white text-xs font-black tracking-widest uppercase mb-1">
                {t.scanner.searching}
              </p>
              <p className="text-white/60 text-[10px] leading-relaxed">
                {t.scanner.instruction}
              </p>
            </div>
          </div>
        )}

        {status === "fetching" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black tracking-widest uppercase text-xs">
              {t.scanner.analyzing}
            </p>
          </div>
        )}

        {/* Bảng xác nhận thông tin */}
        {status === "confirming" && detectedItem && (
          <div className="absolute inset-0 flex items-end justify-center p-6 bg-black/40 backdrop-blur-sm animate-in slide-in-from-bottom-10">
            <div className="bg-[#FDFCF0] w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-inner flex items-center justify-center text-5xl">
                  {detectedItem.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t.scanner.found}
                  </h4>
                  <p className="text-xl font-black text-slate-800 leading-tight">
                    {detectedItem.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    {t.category}
                  </p>
                  <p className="font-bold text-slate-700 text-xs truncate">
                    {t.categories[detectedItem.category as Category]}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    {t.quantity}
                  </p>
                  <p className="font-bold text-slate-700 text-xs">
                    {detectedItem.quantity} {detectedItem.unit}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStatus("searching")}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs active:scale-95 transition-all uppercase"
                >
                  {t.scanner.rescan}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-orange-100 active:scale-95 transition-all uppercase"
                >
                  {t.scanner.save} ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes laser-move {
          0%, 100% { transform: translateY(-70px); opacity: 0.2; }
          50% { transform: translateY(70px); opacity: 1; }
        }
        .animate-laser-move {
          animation: laser-move 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScannerModal;
