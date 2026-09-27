import React, { useState } from 'react';
import { X, Search, Shield, Swords, Info, Award } from 'lucide-react';
import { PokemonType } from '../types/pokemon';
import { TYPE_CHART, getTypeMultiplier } from '../data/pokemonData';
import { sound } from '../utils/audio';

interface TypeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_TYPES: { type: PokemonType; label: string; icon: string; bg: string }[] = [
  { type: 'NORMAL', label: '一般', icon: '⚪', bg: 'bg-stone-500' },
  { type: 'FIRE', label: '火', icon: '🔥', bg: 'bg-red-500' },
  { type: 'WATER', label: '水', icon: '💧', bg: 'bg-blue-500' },
  { type: 'GRASS', label: '草', icon: '🍃', bg: 'bg-emerald-600' },
  { type: 'ELECTRIC', label: '電', icon: '⚡', bg: 'bg-amber-500' },
  { type: 'ROCK', label: '岩石', icon: '🪨', bg: 'bg-yellow-700' },
  { type: 'STEEL', label: '鋼', icon: '⚔️', bg: 'bg-slate-400' },
  { type: 'GROUND', label: '地面', icon: '🏜️', bg: 'bg-amber-700' },
  { type: 'FLYING', label: '飛行', icon: '🕊️', bg: 'bg-indigo-400' },
  { type: 'ICE', label: '冰', icon: '❄️', bg: 'bg-cyan-400' },
  { type: 'FIGHTING', label: '格鬥', icon: '🥊', bg: 'bg-orange-700' },
  { type: 'PSYCHIC', label: '超能力', icon: '🔮', bg: 'bg-pink-500' },
  { type: 'GHOST', label: '幽靈', icon: '👻', bg: 'bg-purple-700' },
  { type: 'DRAGON', label: '龍', icon: '🐉', bg: 'bg-violet-600' },
];

export const TypeChartModal: React.FC<TypeChartModalProps> = ({ isOpen, onClose }) => {
  const [selectedAtk, setSelectedAtk] = useState<PokemonType>('WATER');
  const [selectedDef, setSelectedDef] = useState<PokemonType>('FIRE');

  if (!isOpen) return null;

  const currentMult = getTypeMultiplier(selectedAtk, selectedDef);

  let resultDescription = '';
  let resultClass = '';
  if (currentMult >= 2.0) {
    resultDescription = '💥 效果絕佳！造成 2.0 倍致命剋制傷害！';
    resultClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  } else if (currentMult === 0) {
    resultDescription = '⛔ 完全無效！攻擊被免疫（0 倍傷害）！';
    resultClass = 'text-rose-400 bg-rose-950/60 border-rose-500/40';
  } else if (currentMult < 1.0) {
    resultDescription = '🛡️ 效果不理想...造成 0.5 倍減半抗性傷害。';
    resultClass = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
  } else {
    resultDescription = '⚔️ 一般傷害，造成標準 1.0 倍效果。';
    resultClass = 'text-slate-300 bg-slate-800/60 border-slate-600/40';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div>
              <h2 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                寶可夢屬性相剋速查寶典
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Gen 1-2 經典標準
                </span>
              </h2>
              <p className="text-xs text-neutral-400">掌握屬性剋制，就是戰勝道館館主與聯盟冠軍的關鍵！</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.sfxCancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 retro-scroll">
          {/* Interactive Calculator */}
          <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Swords className="w-4 h-4" />
              即時屬性剋制推演計算機
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attacker selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  1. 選擇攻擊招式屬性 (Attacking Move):
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-900 rounded border border-neutral-800">
                  {ALL_TYPES.map((t) => (
                    <button
                      key={`atk-${t.type}`}
                      onClick={() => {
                        sound.sfxSelect();
                        setSelectedAtk(t.type);
                      }}
                      className={`px-2 py-1 text-xs rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedAtk === t.type
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                          : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Defender selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  2. 選擇防守寶可夢屬性 (Defending Target):
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-900 rounded border border-neutral-800">
                  {ALL_TYPES.map((t) => (
                    <button
                      key={`def-${t.type}`}
                      onClick={() => {
                        sound.sfxSelect();
                        setSelectedDef(t.type);
                      }}
                      className={`px-2 py-1 text-xs rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        selectedDef === t.type
                          ? 'bg-blue-500 text-white font-bold shadow-sm'
                          : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Result Banner */}
            <div className={`p-3.5 rounded-lg border flex items-center justify-between ${resultClass}`}>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold">
                  【{ALL_TYPES.find((t) => t.type === selectedAtk)?.label}】 打擊 【{ALL_TYPES.find((t) => t.type === selectedDef)?.label}】
                </div>
                <div className="text-sm font-bold">{resultDescription}</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono tracking-tight">{currentMult.toFixed(1)}x</span>
                <span className="block text-[10px] opacity-75">傷害倍率</span>
              </div>
            </div>
          </div>

          {/* Core Starter Triangle Diagram */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              初代禦三家核心相生相剋循環
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-center">
                <span className="text-2xl block mb-1">🔥</span>
                <h4 className="font-bold text-sm text-red-400">火屬性</h4>
                <p className="text-xs text-neutral-300 mt-1">
                  剋制 <span className="text-emerald-400 font-bold">草、冰、蟲、鋼</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  被 <span className="text-blue-400">水、地面、岩石</span> 剋制
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-center">
                <span className="text-2xl block mb-1">💧</span>
                <h4 className="font-bold text-sm text-blue-400">水屬性</h4>
                <p className="text-xs text-neutral-300 mt-1">
                  剋制 <span className="text-red-400 font-bold">火、地面、岩石</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  被 <span className="text-emerald-400">草、電</span> 剋制
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-center">
                <span className="text-2xl block mb-1">🍃</span>
                <h4 className="font-bold text-sm text-emerald-400">草屬性</h4>
                <p className="text-xs text-neutral-300 mt-1">
                  剋制 <span className="text-blue-400 font-bold">水、地面、岩石</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  被 <span className="text-red-400">火、冰、飛行、毒、蟲</span> 剋制
                </p>
              </div>
            </div>
          </div>

          {/* Key Gym & Boss tips */}
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 text-neutral-300">
            <div className="font-bold text-neutral-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              關卡破關戰術指南：
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>
                <strong className="text-neutral-200">深灰道館（小拳石 🪨）：</strong>
                岩石系抵抗一般與火系。選水槍（傑尼龜）或藤鞭（妙蛙種子）可直破防禦！選小火龍請探訪月見山取得水之石或研習鋼系金屬爪。
              </li>
              <li>
                <strong className="text-neutral-200">石英高原（噴火龍 🔥）：</strong>
                火屬性王牌，小心烈焰渦流與大字爆炎！善用水屬性特攻造成 2.0 倍致命傷，適時調配傷藥回復體力。
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={() => {
              sound.sfxSelect();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs transition-colors cursor-pointer"
          >
            了解並返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
