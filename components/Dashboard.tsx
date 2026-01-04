
import React from 'react';
import { FoodItem, Language } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  items: FoodItem[];
  expiringItems: FoodItem[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ items, expiringItems, lang }) => {
  const t = translations[lang];

  const getStatusInfo = (daysLeft: number) => {
    if (daysLeft < 0) return { color: 'bg-rose-500', text: t.expired, emoji: '❌' };
    if (daysLeft <= 1) return { color: 'bg-orange-500', text: t.needToCook, emoji: '⚠️' };
    if (daysLeft <= 3) return { color: 'bg-yellow-500', text: t.expiringSoon, emoji: '⏰' };
    return { color: 'bg-emerald-500', text: t.stillFresh, emoji: '✅' };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 flex flex-col items-center text-center">
          <p className="text-4xl font-black text-slate-800">{items.length}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold">{t.itemsCount}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-[32px] border-2 border-orange-100 flex flex-col items-center text-center">
          <p className="text-4xl font-black text-orange-600">{expiringItems.length}</p>
          <p className="text-xs text-orange-400 mt-1 uppercase font-bold">{t.needToCookCount}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <span className="text-orange-500">📍</span> {t.expiringSoon}
        </h2>
        <div className="space-y-4">
          {expiringItems.slice(0, 5).map(item => {
            const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
            const status = getStatusInfo(daysLeft);
            
            return (
              <div key={item.id} className="bg-white p-5 rounded-[28px] border-2 border-slate-50 flex items-center gap-4 active:scale-95 transition-all">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon || getCategoryIcon(item.category)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-800 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white ${status.color}`}>
                      {status.text}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {daysLeft < 0 ? '!!!' : `${daysLeft} ${t.daysLeft}`}
                    </span>
                  </div>
                </div>
                <div className="text-2xl">{status.emoji}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'Thịt & Hải sản': return '🥩';
    case 'Rau củ': return '🥦';
    case 'Trái cây': return '🍎';
    case 'Sữa & Trứng': return '🥛';
    case 'Gia vị': return '🧂';
    default: return '📦';
  }
};

export default Dashboard;
