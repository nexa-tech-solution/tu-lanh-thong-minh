import React, { useState, useEffect, useMemo } from "react";
import { FoodItem, Recipe, Language } from "./types";
import { translations, languagesInfo } from "./translations";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import RecipeSuggestions from "./components/RecipeSuggestions";
import ScannerModal from "./components/ScannerModal";
import AddFoodModal from "./components/AddFoodModal";
import ConfirmModal from "./components/ConfirmModal";
import OnboardingModal from "./components/OnboardingModal";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "inventory" | "recipes"
  >("dashboard");
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem("lang") as Language) || "en"
  );
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const [items, setItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem("smart_fridge_items");
    // Trả về mảng rỗng thay vì dữ liệu mẫu ban đầu
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem("smart_fridge_favs");
    return saved ? JSON.parse(saved) : [];
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_completed")
  );

  useEffect(() => {
    localStorage.setItem("smart_fridge_items", JSON.stringify(items));
    localStorage.setItem("smart_fridge_favs", JSON.stringify(favorites));
    localStorage.setItem("lang", lang);
  }, [items, favorites, lang]);

  const t = translations[lang] || translations.en;

  const addItem = (item: Omit<FoodItem, "id" | "addedAt">) => {
    const newItem: FoodItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      setItems((prev) => prev.filter((item) => item.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites((prev) => {
      const isFav = prev.find((f) => f.id === recipe.id);
      if (isFav) return prev.filter((f) => f.id !== recipe.id);
      return [...prev, recipe];
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const expiringItems = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 3);
    return items.filter((item) => new Date(item.expiryDate) <= limit);
  }, [items]);

  const langList: Language[] = ["vi", "en", "ja", "ko", "zh"];

  return (
    <div className="min-h-screen bg-[#FDFCF0] max-w-lg mx-auto shadow-2xl relative flex flex-col overflow-hidden">
      {showOnboarding && (
        <OnboardingModal lang={lang} onComplete={handleOnboardingComplete} />
      )}

      {/* Overlay để đóng menu ngôn ngữ khi nhấn ra ngoài */}
      {isLangMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLangMenuOpen(false)}
        />
      )}

      <header className="bg-white/80 backdrop-blur-md px-6 pt-6 pb-6 sticky top-0 z-50 shadow-sm flex items-center justify-between rounded-b-[40px] border-b border-orange-50">
        <div>
          <h1 className="text-2xl font-black text-orange-600 tracking-tight leading-none mb-1">
            {t.appName}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            {t.subHeader}
          </p>
        </div>
        <div className="flex gap-2 relative">
          {/* Bộ chọn ngôn ngữ dạng Click */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`px-3 h-11 flex items-center gap-2 rounded-2xl font-black text-xs border-2 transition-all active:scale-95 ${
                isLangMenuOpen
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <span className="text-lg">{languagesInfo[lang].flag}</span>
              <span className="hidden xs:inline">
                {languagesInfo[lang].name}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${
                  isLangMenuOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-[28px] shadow-2xl border border-slate-100 p-2 flex flex-col gap-1 min-w-[160px] animate-in slide-in-from-top-2 z-50 overflow-hidden">
                {langList.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[11px] font-black transition-colors ${
                      lang === l
                        ? "bg-orange-500 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg">{languagesInfo[l].flag}</span>
                    <span className="flex-1 text-left">
                      {languagesInfo[l].name}
                    </span>
                    {lang === l && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-11 h-11 flex items-center justify-center bg-orange-100 text-orange-600 rounded-2xl active:scale-90 transition-transform"
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
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            </svg>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-11 h-11 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-90 transition-transform"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="p-6 flex-grow pb-32">
        {activeTab === "dashboard" && (
          <Dashboard items={items} expiringItems={expiringItems} lang={lang} />
        )}
        {activeTab === "inventory" && (
          <Inventory
            items={items}
            removeItem={setConfirmDeleteId}
            lang={lang}
          />
        )}
        {activeTab === "recipes" && (
          <RecipeSuggestions
            expiringItems={expiringItems}
            allItems={items}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            lang={lang}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur-xl border-t border-orange-100 px-4 py-4 flex justify-around z-40 rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] safe-area-bottom">
        <NavButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          label={t.dashboard}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
        />
        <NavButton
          active={activeTab === "inventory"}
          onClick={() => setActiveTab("inventory")}
          label={t.inventory}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
        />
        <NavButton
          active={activeTab === "recipes"}
          onClick={() => setActiveTab("recipes")}
          label={t.recipes}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          }
        />
      </nav>

      {isScannerOpen && (
        <ScannerModal
          lang={lang}
          onClose={() => setIsScannerOpen(false)}
          onScan={addItem}
        />
      )}
      {isAddModalOpen && (
        <AddFoodModal
          lang={lang}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addItem}
        />
      )}
      {confirmDeleteId && (
        <ConfirmModal
          message={t.confirmDelete}
          lang={lang}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  label,
  icon,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
      active ? "text-orange-600 bg-orange-50" : "text-slate-400"
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-wide">
      {label}
    </span>
  </button>
);

export default App;
