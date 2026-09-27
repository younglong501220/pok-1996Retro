import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardPotion?: (count: number) => void;
}

interface Question {
  id: number;
  question: string;
  attacker: string;
  defender: string;
  options: { text: string; mult: number; isCorrect: boolean }[];
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '傑尼龜使用【水槍】攻擊小火龍，傷害倍率是多少？',
    attacker: '💧 水屬性',
    defender: '🔥 火屬性',
    options: [
      { text: '0.5x (效果不好)', mult: 0.5, isCorrect: false },
      { text: '1.0x (一般傷害)', mult: 1.0, isCorrect: false },
      { text: '2.0x (效果絕佳！)', mult: 2.0, isCorrect: true },
      { text: '0x (完全無效)', mult: 0, isCorrect: false },
    ],
    explanation: '水剋火！水屬性招式對火屬性寶可夢造成 2.0 倍效果絕佳傷害！',
  },
  {
    id: 2,
    question: '小火龍若直接對岩石系【小拳石】使用【火花】，會發生什麼事？',
    attacker: '🔥 火屬性',
    defender: '🪨 岩石屬性',
    options: [
      { text: '造成 2.0 倍爆擊', mult: 2.0, isCorrect: false },
      { text: '效果不好，傷害減半 (0.5x)', mult: 0.5, isCorrect: true },
      { text: '完全無法命中 (0x)', mult: 0, isCorrect: false },
      { text: '造成 1.5 倍傷害', mult: 1.5, isCorrect: false },
    ],
    explanation: '岩石抗火！火屬性打在岩石系身上僅有 0.5 倍傷害，效果不理想。',
  },
  {
    id: 3,
    question: '妙蛙種子的【藤鞭】(草系) 攻擊水系或岩石系，效果如何？',
    attacker: '🍃 草屬性',
    defender: '💧 水 / 🪨 岩',
    options: [
      { text: '0.5x 抵抗', mult: 0.5, isCorrect: false },
      { text: '2.0x 致命剋制！', mult: 2.0, isCorrect: true },
      { text: '無效打擊', mult: 0, isCorrect: false },
      { text: '1.0x 普攻', mult: 1.0, isCorrect: false },
    ],
    explanation: '草系同時剋制水系、岩石系與地面系！藤鞭能輕鬆造成 2.0 倍重擊！',
  },
  {
    id: 4,
    question: '小火龍在月見山習得【水流尾】(水系)，拿來打宿敵的【噴火龍】(火系)：',
    attacker: '💧 水屬性',
    defender: '🔥 噴火龍',
    options: [
      { text: '2.0x 效果絕佳！', mult: 2.0, isCorrect: true },
      { text: '0.5x 效果不理想', mult: 0.5, isCorrect: false },
      { text: '1.0x 一般傷害', mult: 1.0, isCorrect: false },
      { text: '招式反彈自傷', mult: 0, isCorrect: false },
    ],
    explanation: '噴火龍具備火屬性，水流尾能命中火系弱點，造成 2.0 倍致命傷！',
  },
  {
    id: 5,
    question: '小火龍特訓學會的鋼系招式【金屬爪】，對岩石系小拳石效果如何？',
    attacker: '⚔️ 鋼屬性',
    defender: '🪨 岩石屬性',
    options: [
      { text: '0.5x 被岩石吸收', mult: 0.5, isCorrect: false },
      { text: '2.0x 效果絕佳，劈開防禦！', mult: 2.0, isCorrect: true },
      { text: '1.0x 一般打擊', mult: 1.0, isCorrect: false },
      { text: '命中率歸零', mult: 0, isCorrect: false },
    ],
    explanation: '鋼系剋制岩石、冰與妖精！金屬爪能精準劈碎小拳石的高防禦！',
  },
];

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onRewardPotion }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const isCorrect = currentQ.options[index].isCorrect;
    if (isCorrect) {
      sound.sfxSuperEffective();
      setScore((s) => s + 1);
    } else {
      sound.sfxNotEffective();
    }
  };

  const handleNext = () => {
    sound.sfxSelect();
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      sound.sfxVictory();
    }
  };

  const handleRestart = () => {
    sound.sfxSelect();
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setHasClaimedReward(false);
  };

  const handleClaim = () => {
    sound.sfxHeal();
    setHasClaimedReward(true);
    if (onRewardPotion) {
      onRewardPotion(2);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <h2 className="font-bold text-sm text-neutral-100">
                屬性相剋博士檢定考
              </h2>
              <p className="text-[11px] text-neutral-400">測驗你對寶可夢屬性特性的瞭解</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.sfxCancel();
              onClose();
            }}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!isFinished ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>
                  第 <span className="text-emerald-400 font-bold">{currentIdx + 1}</span> / {QUIZ_QUESTIONS.length} 題
                </span>
                <span>目前得分：{score * 20} 分</span>
              </div>

              {/* Matchup Tag */}
              <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
                <span className="text-amber-400">{currentQ.attacker}</span>
                <span className="text-neutral-500">➔</span>
                <span className="text-cyan-400">{currentQ.defender}</span>
              </div>

              {/* Question Text */}
              <div className="text-sm font-bold text-neutral-100 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800 leading-relaxed">
                {currentQ.question}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border-neutral-700';
                  if (selectedOption !== null) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-300 font-bold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-300';
                    } else {
                      btnStyle = 'opacity-40 bg-neutral-900 border-neutral-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-2.5 text-xs text-left rounded-lg border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt.text}</span>
                      {selectedOption !== null && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {selectedOption === idx && !opt.isCorrect && (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answered */}
              {selectedOption !== null && (
                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs text-neutral-300 space-y-2">
                  <div className="font-semibold text-emerald-400">💡 博士解析：</div>
                  <div>{currentQ.explanation}</div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleNext}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all cursor-pointer"
                    >
                      {currentIdx + 1 < QUIZ_QUESTIONS.length ? '下一題 ➔' : '查看總成績 ➔'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Result Screen */
            <div className="text-center py-4 space-y-4">
              <span className="text-4xl block">🏆</span>
              <div>
                <h3 className="text-lg font-bold text-neutral-100">測驗完成！</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  你的得分：<span className="text-emerald-400 font-bold text-base">{score * 20}</span> / 100 分
                  （答對 {score} / {QUIZ_QUESTIONS.length} 題）
                </p>
              </div>

              {score >= 4 ? (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-700/60 rounded-lg text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    太神了！大木博士頒發【屬性大師】榮譽！
                  </div>
                  <p className="text-neutral-300">你對屬性相剋了然於胸，獲得額外獎勵 2 瓶傷藥！</p>
                  {!hasClaimedReward ? (
                    <button
                      onClick={handleClaim}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded text-xs transition-colors cursor-pointer"
                    >
                      領取 2 瓶傷藥 🎒
                    </button>
                  ) : (
                    <span className="inline-block text-xs text-amber-400 font-medium">✓ 已領取獎勵！</span>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs text-neutral-300">
                  再接再厲！複習屬性速查表後再次挑戰，滿分可獲得傷藥獎勵喔！
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新測驗
                </button>
                <button
                  onClick={() => {
                    sound.sfxSelect();
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer"
                >
                  返回冒險
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
