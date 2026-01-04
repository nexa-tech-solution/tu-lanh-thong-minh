import React, { useState } from "react";
import { FoodItem, Category, Language } from "../types";
import { translations } from "../translations";

interface AddFoodModalProps {
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, "id" | "addedAt">) => void;
  lang: Language;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  onClose,
  onAdd,
  lang,
}) => {
  const t = translations[lang] || translations.en;

  const [formData, setFormData] = useState<Omit<FoodItem, "id" | "addedAt">>({
    name: "",
    category: "Thịt & Hải sản",
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    quantity: "1",
    unit: t.units[0],
    icon: "🥩",
  });

  const emojis = [
    "🥩",
    "🍗",
    "🐟",
    "🍤",
    "🥚",
    "🥛",
    "🥦",
    "🥬",
    "🥕",
    "🥔",
    "🍅",
    "🍎",
    "🍌",
    "🍇",
    "🍞",
    "🌶️",
    "🧂",
    "🧀",
    "🥫",
    "🍦",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
    onClose();
  };

  const categories: Category[] = [
    "Thịt & Hải sản",
    "Rau củ",
    "Trái cây",
    "Sữa & Trứng",
    "Gia vị",
    "Khác",
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#FDFCF0] w-full max-w-md rounded-t-[45px] sm:rounded-[45px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[95vh] scrollbar-hide">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {t.addFood}
          </h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center bg-white text-slate-400 rounded-full shadow-sm active:scale-90 transition-all border border-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-2">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t.pickIcon}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-4 pt-2 pl-2 scrollbar-hide">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`flex-shrink-0 w-12 h-12 text-2xl flex items-center justify-center rounded-2xl border-2 transition-all ${
                    formData.icon === emoji
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-110"
                      : "bg-white border-slate-100 shadow-sm"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t.itemName}
            </label>
            <input
              required
              autoFocus
              className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t.namePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.quantity}
              </label>
              <input
                required
                type="number"
                step="0.1"
                className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm text-center"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.unit}
              </label>
              <select
                className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm appearance-none text-center cursor-pointer"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              >
                {t.units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t.category}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-tight ${
                    formData.category === cat
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-400 hover:border-orange-200"
                  }`}
                >
                  {t.categories[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t.expiryDate}
            </label>
            <input
              required
              type="date"
              className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-[28px] text-xl font-black mt-4 shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {t.saveToFridge} 💾
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFoodModal;
