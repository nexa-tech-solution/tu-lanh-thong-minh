import React, { useState } from "react";
import { FoodItem, Category, Language } from "../types";
import { translations } from "../translations";

interface AddFoodModalProps {
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, "id" | "addedAt">) => void;
  lang: Language;
}

interface PresetItem {
  name: string;
  icon: string;
  category: Category;
  days: number;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  onClose,
  onAdd,
  lang,
}) => {
  const t = translations[lang] || translations.en;

  const presets: PresetItem[] = [
    {
      name: lang === "vi" ? "Trứng" : "Eggs",
      icon: "🥚",
      category: "Sữa & Trứng",
      days: 14,
    },
    {
      name: lang === "vi" ? "Sữa" : "Milk",
      icon: "🥛",
      category: "Sữa & Trứng",
      days: 7,
    },
    {
      name: lang === "vi" ? "Thịt heo" : "Pork",
      icon: "🥩",
      category: "Thịt & Hải sản",
      days: 4,
    },
    {
      name: lang === "vi" ? "Rau muống" : "Spinach",
      icon: "🥬",
      category: "Rau củ",
      days: 3,
    },
    {
      name: lang === "vi" ? "Táo" : "Apple",
      icon: "🍎",
      category: "Trái cây",
      days: 14,
    },
    {
      name: lang === "vi" ? "Cá tươi" : "Fresh Fish",
      icon: "🐟",
      category: "Thịt & Hải sản",
      days: 2,
    },
    {
      name: lang === "vi" ? "Sữa chua" : "Yogurt",
      icon: "🍦",
      category: "Sữa & Trứng",
      days: 10,
    },
    {
      name: lang === "vi" ? "Cà rốt" : "Carrot",
      icon: "🥕",
      category: "Rau củ",
      days: 21,
    },
  ];

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
    "🍫",
    "🥤",
    "🍺",
    "🥟",
    "🍜",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
    onClose();
  };

  const applyPreset = (p: PresetItem) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + p.days);
    setFormData({
      ...formData,
      name: p.name,
      icon: p.icon,
      category: p.category,
      expiryDate: expiry.toISOString().split("T")[0],
    });
  };

  const addDays = (days: number) => {
    const current = formData.expiryDate
      ? new Date(formData.expiryDate)
      : new Date();
    current.setDate(current.getDate() + days);
    setFormData({
      ...formData,
      expiryDate: current.toISOString().split("T")[0],
    });
  };

  const adjustQty = (amount: number) => {
    const current = parseFloat(formData.quantity) || 0;
    const next = Math.max(0, current + amount);
    setFormData({ ...formData, quantity: next.toString() });
  };

  const categories: Category[] = [
    "Thịt & Hải sản",
    "Rau củ",
    "Trái cây",
    "Sữa & Trứng",
    "Gia vị",
    "Khác",
  ];

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case "Thịt & Hải sản":
        return "bg-rose-500";
      case "Rau củ":
        return "bg-emerald-500";
      case "Trái cây":
        return "bg-orange-500";
      case "Sữa & Trứng":
        return "bg-blue-500";
      case "Gia vị":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#FDFCF0] w-full max-w-lg rounded-t-[45px] sm:rounded-[45px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[95vh] scrollbar-hide">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {t.addFood}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 rounded-full shadow-sm active:scale-90 transition-all border border-slate-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Quick Presets Section */}
          <div className="px-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              {lang === "vi" ? "Gợi ý nhanh" : "Quick Suggestions"}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="flex-shrink-0 bg-white border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm active:scale-95 transition-all hover:border-orange-200"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 px-2">
            {/* Name and Icon Group */}
            <div className="flex gap-4 items-end">
              <div className="flex-shrink-0 relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t.pickIcon}
                </label>
                <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-[28px] flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">
                  <span className="z-10">{formData.icon}</span>
                  <div
                    className={`absolute inset-0 opacity-10 ${getCategoryColor(
                      formData.category
                    )}`}
                  ></div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t.itemName}
                </label>
                <input
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t.namePlaceholder}
                />
              </div>
            </div>

            {/* Icon Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`flex-shrink-0 w-11 h-11 text-xl flex items-center justify-center rounded-xl border-2 transition-all ${
                    formData.icon === emoji
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                      : "bg-white border-slate-100 hover:border-orange-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quantity and Unit Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {t.quantity}
                </label>
                <div className="flex items-center gap-2 bg-white border-2 border-slate-100 rounded-[24px] p-2 shadow-sm">
                  <button
                    type="button"
                    onClick={() => adjustQty(-1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-[18px] font-black text-xl active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <input
                    required
                    type="number"
                    step="0.1"
                    className="flex-1 min-w-0 bg-transparent text-center text-xl font-black focus:outline-none"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => adjustQty(1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-[18px] font-black text-xl active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {t.unit}
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm appearance-none cursor-pointer"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  >
                    {t.units.map((u) => (
                      <option key={u} value={u} className="font-bold py-2">
                        {u}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.category}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-3.5 rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-tight flex flex-col items-center gap-1 ${
                      formData.category === cat
                        ? `${getCategoryColor(
                            cat
                          )} border-transparent text-white shadow-lg scale-[1.02]`
                        : "bg-white border-slate-100 text-slate-400 hover:border-orange-200"
                    }`}
                  >
                    {t.categories[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.expiryDate}
              </label>
              <div className="space-y-3">
                <input
                  required
                  type="date"
                  className="w-full bg-white border-2 border-slate-100 rounded-[22px] px-6 py-4 text-lg font-bold focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => addDays(days)}
                      className="flex-shrink-0 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[11px] font-black border border-orange-100 active:scale-95 transition-all"
                    >
                      +{days} {t.daysLeft}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-5 bg-emerald-600 text-white rounded-[32px] text-xl font-black mt-4 shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-800"
            >
              {t.saveToFridge} 💾
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
