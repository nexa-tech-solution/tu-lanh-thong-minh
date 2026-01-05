import React, { useState, useEffect, useCallback } from "react";
import { FoodItem, Recipe, Language } from "../types";
import { generateRecipes } from "../services/geminiService";
import { translations } from "../translations";

interface RecipeSuggestionsProps {
  expiringItems: FoodItem[];
  allItems: FoodItem[];
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  lang: Language;
}

const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({
  expiringItems,
  allItems,
  favorites,
  onToggleFavorite,
  lang,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"ai" | "fav">("ai");

  const t = translations[lang] || translations.en;

  const CACHE_KEY = `smart_fridge_ai_recipes_v2_${lang}`;
  const DATE_KEY = `smart_fridge_last_refresh_date`;

  const fetchRecipes = useCallback(
    async (force: boolean = false) => {
      if (allItems.length === 0) return;

      if (!force) {
        const saved = localStorage.getItem(CACHE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
              setRecipes(parsed);
              return;
            }
          } catch (e) {
            localStorage.removeItem(CACHE_KEY);
          }
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await generateRecipes(expiringItems, allItems, lang);
        if (result && result.length > 0) {
          setRecipes(result);
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          if (force) {
            localStorage.setItem(DATE_KEY, new Date().toDateString());
          }
        }
      } catch (e) {
        setError(lang === "vi" ? "Lỗi kết nối AI." : "AI Connection Error.");
      } finally {
        setLoading(false);
      }
    },
    [allItems.length, expiringItems, lang, CACHE_KEY, DATE_KEY]
  );

  useEffect(() => {
    if (activeSubTab === "ai" && recipes.length === 0) {
      fetchRecipes(false);
    }
  }, [fetchRecipes, activeSubTab, recipes.length]);

  const startAdAndRefresh = () => {
    setAdPlaying(true);
    setAdCountdown(5);

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAdPlaying(false);
          fetchRecipes(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRefreshClick = () => {
    const lastRefresh = localStorage.getItem(DATE_KEY);
    const today = new Date().toDateString();

    if (lastRefresh !== today) {
      fetchRecipes(true);
      return;
    }

    startAdAndRefresh();
  };

  const displayList = activeSubTab === "ai" ? recipes : favorites;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 pb-10">
      {/* Ad Overlay Simulation */}
      {adPlaying && (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-sm aspect-video bg-slate-800 rounded-[30px] flex items-center justify-center mb-8 relative overflow-hidden border-2 border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20 animate-pulse"></div>
            <div className="text-white text-center z-10 p-6">
              <div className="text-5xl mb-4 animate-bounce">🎬</div>
              <p className="font-black text-xl mb-2">{t.adPlaying}</p>
              <div className="w-full bg-white/10 h-2 rounded-full mt-6 overflow-hidden">
                <div
                  className="bg-orange-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="absolute top-6 right-6 bg-black/40 text-white px-4 py-2 rounded-full font-black text-sm backdrop-blur-md">
              {adCountdown}s
            </div>
          </div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            {t.adLoading}
          </p>
        </div>
      )}

      <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-100 mb-4">
        <button
          onClick={() => setActiveSubTab("ai")}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            activeSubTab === "ai"
              ? "bg-orange-500 text-white shadow-md"
              : "text-slate-400"
          }`}
        >
          ✨ AI
        </button>
        <button
          onClick={() => setActiveSubTab("fav")}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            activeSubTab === "fav"
              ? "bg-rose-500 text-white shadow-md"
              : "text-slate-400"
          }`}
        >
          ❤️ {t.favorites}
        </button>
      </div>

      {loading && activeSubTab === "ai" && !adPlaying && (
        <div className="text-center py-10 bg-white rounded-[40px] border-2 border-slate-50">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black text-slate-800">{t.refreshAI}...</p>
        </div>
      )}

      {!loading && !adPlaying && displayList.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <div className="text-6xl mb-4">🍳</div>
          <p className="font-bold">
            {activeSubTab === "ai" ? t.noItems : t.noFavs}
          </p>
        </div>
      )}

      {!adPlaying &&
        displayList.map((recipe, idx) => (
          <div
            key={recipe.id || idx}
            className="bg-white rounded-[35px] shadow-sm border-2 border-slate-100 overflow-hidden mb-6"
          >
            <div className="p-6 bg-slate-50 flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-800 leading-tight">
                    {recipe.name}
                  </h3>
                  {recipe.calories && (
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap">
                      🔥 {recipe.calories} kcal
                    </span>
                  )}
                </div>
                <p className="text-emerald-700 text-xs font-bold mt-1">
                  ✓ {recipe.reason}
                </p>
              </div>
              <button
                onClick={() => onToggleFavorite(recipe)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${
                  favorites.find((f) => f.id === recipe.id)
                    ? "bg-rose-50 border-rose-100 text-rose-500"
                    : "bg-white border-slate-100 text-slate-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={
                    favorites.find((f) => f.id === recipe.id)
                      ? "currentColor"
                      : "none"
                  }
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t.ingredients}
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t.steps}
                </p>
                <div className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

      {activeSubTab === "ai" && !loading && !adPlaying && (
        <div className="space-y-3">
          {localStorage.getItem(DATE_KEY) === new Date().toDateString() && (
            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-tight italic">
              {t.refreshLimit}
            </p>
          )}
          <button
            onClick={handleRefreshClick}
            className="w-full py-5 bg-orange-100 text-orange-700 rounded-3xl font-black transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {localStorage.getItem(DATE_KEY) === new Date().toDateString()
              ? `📺 ${t.watchAd}`
              : `🔄 ${t.refreshAI}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeSuggestions;
