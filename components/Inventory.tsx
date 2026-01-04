import React, { useState } from "react";
import { FoodItem, Category, Language } from "../types";
import { getCategoryIcon } from "./Dashboard";
import { translations } from "../translations";

interface InventoryProps {
  items: FoodItem[];
  removeItem: (id: string) => void;
  lang: Language;
}

const Inventory: React.FC<InventoryProps> = ({ items, removeItem, lang }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "Tất cả">(
    "Tất cả"
  );

  const t = translations[lang] || translations.en;

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (Category | "Tất cả")[] = [
    "Tất cả",
    "Thịt & Hải sản",
    "Rau củ",
    "Trái cây",
    "Sữa & Trứng",
    "Gia vị",
    "Khác",
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-700">
      <div className="space-y-4">
        {/* Thanh tìm kiếm */}
        <div className="relative group">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-14 py-4 text-lg font-bold focus:outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-500/5 shadow-sm transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400 group-focus-within:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/center"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Lọc danh mục - Đã sửa lỗi hiển thị ngôn ngữ */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black tracking-widest uppercase whitespace-nowrap transition-all border-2 ${
                selectedCategory === cat
                  ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100"
                  : "bg-white border-slate-100 text-slate-400 hover:border-orange-200"
              }`}
            >
              {cat === "Tất cả"
                ? t.all || "Tất cả"
                : t.categories[cat as Category] || cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {filteredItems.map((item) => {
          const isExpired = new Date(item.expiryDate) < new Date();
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-[30px] shadow-sm border-2 border-slate-50 flex items-center justify-between active:bg-orange-50/50 transition-all hover:border-orange-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  {item.icon || getCategoryIcon(item.category)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-400">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-tight ${
                        isExpired ? "text-rose-500" : "text-slate-300"
                      }`}
                    >
                      {new Date(item.expiryDate).toLocaleDateString(
                        lang === "vi"
                          ? "vi-VN"
                          : lang === "en"
                          ? "en-US"
                          : "ja-JP"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="w-11 h-11 flex items-center justify-center text-slate-200 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
                </svg>
              </button>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="text-6xl mb-4 grayscale opacity-30">📦</div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              {t.noItems || "Không tìm thấy gì"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
