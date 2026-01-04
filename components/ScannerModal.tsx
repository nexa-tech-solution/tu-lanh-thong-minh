import React, { useState, useEffect, useRef } from "react";
import { FoodItem, Category, Language } from "../types";
import { translations } from "../translations";

// Added lang property to ScannerModalProps interface to support localization
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
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleManualScan = () => {
    setScanning(false);
    const mockItem: Omit<FoodItem, "id" | "addedAt"> = {
      name: "Gà ta thả vườn",
      category: "Thịt & Hải sản",
      expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      quantity: "1.5",
      unit: "kg",
    };

    setTimeout(() => {
      onScan(mockItem);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[80] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="absolute top-8 right-8">
        <button
          onClick={onClose}
          className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-sm aspect-square relative rounded-[50px] overflow-hidden border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover grayscale opacity-60"
        />

        {/* Khung quét thân thiện */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-64 h-64 border-4 border-emerald-500 rounded-[40px] relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-emerald-400 -translate-x-2 -translate-y-2 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-emerald-400 translate-x-2 -translate-y-2 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-emerald-400 -translate-x-2 translate-y-2 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-emerald-400 translate-x-2 translate-y-2 rounded-br-xl"></div>
            <div className="absolute left-0 right-0 h-1 bg-emerald-400/80 animate-scan-line top-1/2 shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4 max-w-xs">
        <h3 className="text-white text-3xl font-black">{t.scannerTitle}</h3>
        <p className="text-white/60 text-lg font-medium leading-relaxed">
          {t.scannerDesc}
        </p>
      </div>

      <div className="mt-12 w-full max-w-sm">
        <button
          onClick={handleManualScan}
          disabled={!scanning}
          className="w-full py-6 bg-emerald-600 text-white rounded-[30px] text-2xl font-black active:scale-95 transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50"
        >
          {scanning
            ? lang === "vi"
              ? "Quét Thử Ngay"
              : "Try Scanning"
            : lang === "vi"
            ? "Đang xử lý..."
            : "Processing..."}
        </button>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-120px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScannerModal;
