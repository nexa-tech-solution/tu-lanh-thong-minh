import React, { useState, useEffect, useRef } from "react";
import { FoodItem, Language, Category } from "../types";
import { translations } from "../translations";
import { Html5Qrcode } from "html5-qrcode";

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
    "idle" | "searching" | "fetching" | "confirming" | "error" | "requesting"
  >("idle");
  const [detectedItem, setDetectedItem] = useState<Partial<FoodItem> | null>(
    null
  );
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const t = translations[lang] || translations.en;

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

  // Hàm xin quyền Camera tường minh
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Sau khi có quyền, đóng stream ngay để nhường cho thư viện quét
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.error("Permission denied or camera error:", err);
      return false;
    }
  };

  const initScanner = async () => {
    setStatus("requesting");

    // Bước 1: Xin quyền trước
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setStatus("error");
      return;
    }

    try {
      // Dọn dẹp scanner cũ nếu có
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
        },
        (decodedText) => {
          handleBarcodeFound(decodedText);
        },
        () => {
          // Bỏ qua lỗi quét liên tục (frame không có mã)
        }
      );
      setStatus("searching");
    } catch (err) {
      console.error("Scanner start error:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    // Thử chạy ngay khi mở modal
    initScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleBarcodeFound = async (code: string) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }

    setStatus("fetching");
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,categories,quantity`
      );
      const data = await res.json();

      if (data.status === 1) {
        const product = data.product;
        const cat = mapCategory(product.categories || "");
        setDetectedItem({
          name: product.product_name || `Sản phẩm ${code}`,
          category: cat,
          quantity: product.quantity ? product.quantity.split(" ")[0] : "1",
          unit: product.quantity
            ? product.quantity.split(" ")[1] || "pcs"
            : "pcs",
          expiryDate: new Date(Date.now() + 86400000 * 14)
            .toISOString()
            .split("T")[0],
          icon: getIconForCategory(cat),
        });
        setStatus("confirming");
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      } else {
        alert(t.scanner.analyzing + " (Không tìm thấy sản phẩm này)");
        resumeScanning();
      }
    } catch (err) {
      console.error(err);
      resumeScanning();
    }
  };

  const resumeScanning = async () => {
    setStatus("searching");
    if (scannerRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 180 } },
          handleBarcodeFound,
          () => {}
        );
      } catch (e) {
        setStatus("error");
      }
    }
  };

  const handleConfirm = () => {
    if (detectedItem) {
      onScan(detectedItem as Omit<FoodItem, "id" | "addedAt">);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[80] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[100] w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-transform"
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

      <div className="relative w-full h-full max-w-lg overflow-hidden flex flex-col items-center justify-center">
        <div id="reader" className="w-full h-full object-cover"></div>

        {/* Màn hình xin quyền hoặc báo lỗi */}
        {(status === "requesting" ||
          status === "error" ||
          status === "idle") && (
          <div className="absolute inset-0 bg-[#0F172A] flex flex-col items-center justify-center p-10 text-center z-50">
            <div className="w-28 h-28 bg-orange-500/10 rounded-[40px] flex items-center justify-center text-5xl mb-8 animate-pulse shadow-inner border border-orange-500/20">
              {status === "error" ? "❌" : "📷"}
            </div>
            <h2 className="text-white text-3xl font-black mb-4 leading-tight">
              {status === "error"
                ? t.scanner.cameraError
                : t.scanner.permissionTitle}
            </h2>
            <p className="text-white/50 text-base font-medium mb-12 leading-relaxed max-w-xs">
              {status === "error" ? "" : t.scanner.permissionDesc}
            </p>

            <button
              onClick={initScanner}
              className="group bg-orange-600 hover:bg-orange-500 text-white px-12 py-6 rounded-[32px] font-black uppercase text-sm shadow-2xl shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-4 border-b-4 border-orange-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="group-hover:rotate-12 transition-transform"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {t.scanner.startBtn}
            </button>

            <button
              onClick={onClose}
              className="mt-8 text-white/30 text-xs font-black uppercase tracking-[0.3em] hover:text-white/60 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        )}

        {/* Lớp phủ khi đang tìm mã vạch */}
        {status === "searching" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-80 h-56 border-2 border-white/20 rounded-[40px] relative">
              <div className="absolute inset-0 bg-red-500/5 rounded-[40px]"></div>
              <div className="absolute left-8 right-8 h-0.5 bg-red-600 shadow-[0_0_25px_rgba(220,38,38,1)] animate-laser-move top-1/2"></div>
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-[24px]"></div>
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-[24px]"></div>
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-[24px]"></div>
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-[24px]"></div>
            </div>
            <div className="mt-14 bg-black/70 backdrop-blur-3xl px-10 py-6 rounded-[35px] border border-white/10 mx-6 text-center max-w-[320px] shadow-2xl">
              <p className="text-white text-xs font-black tracking-[0.25em] uppercase mb-2 animate-pulse">
                {t.scanner.searching}
              </p>
              <p className="text-white/60 text-[11px] leading-relaxed font-medium">
                {t.scanner.instruction}
              </p>
            </div>
          </div>
        )}

        {/* Trạng thái đang tải từ API */}
        {status === "fetching" && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center backdrop-blur-xl z-50">
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-8"></div>
            <p className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs animate-pulse">
              {t.scanner.analyzing}
            </p>
          </div>
        )}

        {/* Modal xác nhận sản phẩm tìm thấy */}
        {status === "confirming" && detectedItem && (
          <div className="absolute inset-0 flex items-end justify-center p-6 bg-black/50 backdrop-blur-md animate-in slide-in-from-bottom-10 z-[60]">
            <div className="bg-[#FDFCF0] w-full max-w-sm rounded-[50px] p-10 shadow-2xl space-y-8 border-2 border-orange-100">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-[35px] shadow-sm flex items-center justify-center text-6xl border border-slate-50">
                  {detectedItem.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">
                    {t.scanner.found}
                  </h4>
                  <p className="text-2xl font-black text-slate-800 leading-tight">
                    {detectedItem.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                    {t.category}
                  </p>
                  <p className="font-black text-slate-800 text-xs truncate">
                    {t.categories[detectedItem.category as Category]}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                    {t.quantity}
                  </p>
                  <p className="font-black text-slate-800 text-xs">
                    {detectedItem.quantity} {detectedItem.unit}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={resumeScanning}
                  className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[30px] font-black text-xs active:scale-95 transition-all uppercase tracking-widest"
                >
                  {t.scanner.rescan}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-[2] py-6 bg-orange-600 text-white rounded-[30px] font-black text-xs shadow-2xl shadow-orange-600/30 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-orange-800"
                >
                  {t.scanner.save} ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        #reader { background: #000 !important; }
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        @keyframes laser-move {
          0%, 100% { transform: translateY(-85px); opacity: 0.1; }
          50% { transform: translateY(85px); opacity: 1; }
        }
        .animate-laser-move {
          animation: laser-move 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScannerModal;
