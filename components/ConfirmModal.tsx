import React from "react";
import { Language } from "../types";
import { translations } from "../translations";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Language;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-800 text-center mb-8 leading-relaxed">
          {message}
        </h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-lg shadow-lg shadow-rose-200 active:scale-95 transition-all"
          >
            {t.delete || "Xóa"}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-lg active:scale-95 transition-all"
          >
            {t.cancel || "Bỏ qua"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
