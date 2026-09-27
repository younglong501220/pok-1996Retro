import React from 'react';
import { ActionButtonConfig, PaletteTheme, Pokemon } from '../types/pokemon';
import { sound } from '../utils/audio';

interface BattleScreenProps {
  locationTitle: string;
  potions: number;
  playerMon: Pokemon | null;
  enemyMon: Pokemon | null;
  dialogText: string;
  buttons: ActionButtonConfig[];
  theme: PaletteTheme;
  showScanlines: boolean;
  enemyShake: boolean;
  playerShake: boolean;
  combatFloater: { text: string; type: 'super' | 'weak' | 'normal' | 'heal' } | null;
  onUsePotionQuick?: () => void;
  gymBadges: string[];
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  locationTitle,
  potions,
  playerMon,
  enemyMon,
  dialogText,
  buttons,
  theme,
  showScanlines,
  enemyShake,
  playerShake,
  combatFloater,
  onUsePotionQuick,
  gymBadges,
}) => {
  // Calculate HP percentage safely
  const playerHpPercent = playerMon
    ? Math.max(0, Math.min(100, Math.round((playerMon.hp / playerMon.maxHp) * 100)))
    : 0;

  const enemyHpPercent = enemyMon
    ? Math.max(0, Math.min(100, Math.round((enemyMon.hp / enemyMon.maxHp) * 100)))
    : 0;

  return (
    <div
      className="relative w-full h-[470px] sm:h-[490px] border-4 rounded-md flex flex-col justify-between overflow-hidden shadow-inner select-none font-mono"
      style={{
        backgroundColor: theme.screenBg,
        borderColor: theme.screenDark,
        color: theme.screenDark,
      }}
    >
      {/* Optional CRT Scanlines & Dot Matrix Texture */}
      {showScanlines && (
        <div className="absolute inset-0 scanlines-overlay dot-matrix-pattern z-20 pointer-events-none opacity-60" />
      )}

      {/* Top HUD */}
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs font-bold border-b-2 z-10"
        style={{
          borderColor: theme.screenMid,
          backgroundColor: theme.screenLight,
          color: theme.screenDark,
        }}
      >
        <div className="flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-xs">
          <span className="text-[10px] px-1 py-0.2 rounded border" style={{ borderColor: theme.screenDark }}>
            AREA
          </span>
          <span className="truncate">{locationTitle}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {gymBadges.length > 0 && (
            <span
              title="已獲得深灰道館：灰色徽章"
              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1"
              style={{
                backgroundColor: theme.screenBg,
                borderColor: theme.screenDark,
              }}
            >
              🏅 灰色徽章
            </span>
          )}

          <button
            onClick={onUsePotionQuick}
            disabled={potions <= 0 || !playerMon || playerMon.hp >= playerMon.maxHp}
            title={playerMon && playerMon.hp < playerMon.maxHp ? '點擊使用傷藥回復 18 HP' : '傷藥儲備'}
            className="text-[11px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:translate-y-px"
            style={{
              backgroundColor: theme.screenBg,
              borderColor: theme.screenDark,
              color: theme.screenDark,
            }}
          >
            🎒 傷藥: {potions}
          </button>
        </div>
      </div>

      {/* Battle / Scenario Stage */}
      <div className="relative flex-1 p-3 flex flex-col justify-between z-10">
        {/* Floating Combat Callout */}
        {combatFloater && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1 rounded border-2 shadow-lg text-xs font-black tracking-wide animate-bounce ${
              combatFloater.type === 'super'
                ? 'bg-amber-300 text-amber-950 border-amber-950'
                : combatFloater.type === 'weak'
                ? 'bg-stone-300 text-stone-900 border-stone-900'
                : combatFloater.type === 'heal'
                ? 'bg-emerald-200 text-emerald-950 border-emerald-950'
                : 'bg-white text-black border-black'
            }`}
          >
            {combatFloater.text}
          </div>
        )}

        {/* Top/Enemy Zone */}
        <div className="flex justify-end items-center gap-3">
          {enemyMon ? (
            <>
              {/* Enemy Info Box */}
              <div
                className={`p-2 rounded border-2 min-w-[150px] shadow-sm transition-transform ${
                  enemyShake ? 'animate-shake' : ''
                }`}
                style={{
                  backgroundColor: theme.screenLight,
                  borderColor: theme.screenDark,
                  color: theme.screenDark,
                }}
              >
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="truncate max-w-[100px]">{enemyMon.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded border" style={{ borderColor: theme.screenDark }}>
                    {enemyMon.typeLabel.split(' ')[0]}
                  </span>
                </div>
                {/* HP bar */}
                <div
                  className="mt-1.5 h-2 w-full border rounded-xs overflow-hidden"
                  style={{
                    backgroundColor: theme.screenMid,
                    borderColor: theme.screenDark,
                  }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${enemyHpPercent}%`,
                      backgroundColor:
                        enemyHpPercent > 50
                          ? theme.screenDark
                          : enemyHpPercent > 20
                          ? '#e67e22'
                          : '#c0392b',
                    }}
                  />
                </div>
                <div className="text-[10px] font-bold text-right mt-0.5">
                  HP: {enemyMon.hp}/{enemyMon.maxHp}
                </div>
              </div>

              {/* Enemy Sprite */}
              <div
                className={`text-5xl drop-shadow-sm select-none transition-transform ${
                  enemyShake ? 'animate-damage' : 'animate-idle'
                }`}
              >
                {enemyMon.sprite}
              </div>
            </>
          ) : (
            /* Professor Oak / NPC stage */
            <div className="flex items-center gap-2">
              <div
                className="px-2 py-1 text-xs font-bold rounded border-2 shadow-xs"
                style={{
                  backgroundColor: theme.screenLight,
                  borderColor: theme.screenDark,
                }}
              >
                大木研究所
              </div>
              <div className="text-5xl animate-idle">👴</div>
            </div>
          )}
        </div>

        {/* Bottom/Player Zone */}
        <div className="flex justify-start items-center gap-3">
          {playerMon ? (
            <>
              {/* Player Sprite */}
              <div
                className={`text-5xl drop-shadow-sm select-none transition-transform ${
                  playerShake ? 'animate-damage' : 'animate-idle'
                }`}
              >
                {playerMon.sprite}
              </div>

              {/* Player Info Box */}
              <div
                className={`p-2 rounded border-2 min-w-[155px] shadow-sm transition-transform ${
                  playerShake ? 'animate-shake' : ''
                }`}
                style={{
                  backgroundColor: theme.screenLight,
                  borderColor: theme.screenDark,
                  color: theme.screenDark,
                }}
              >
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="truncate max-w-[100px]">{playerMon.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded border" style={{ borderColor: theme.screenDark }}>
                    {playerMon.typeLabel.split(' ')[0]}
                  </span>
                </div>
                {/* HP bar */}
                <div
                  className="mt-1.5 h-2 w-full border rounded-xs overflow-hidden"
                  style={{
                    backgroundColor: theme.screenMid,
                    borderColor: theme.screenDark,
                  }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${playerHpPercent}%`,
                      backgroundColor:
                        playerHpPercent > 50
                          ? theme.screenDark
                          : playerHpPercent > 20
                          ? '#e67e22'
                          : '#c0392b',
                    }}
                  />
                </div>
                <div className="text-[10px] font-bold text-right mt-0.5">
                  HP: {playerMon.hp}/{playerMon.maxHp}
                </div>
              </div>
            </>
          ) : (
            /* Player Trainer Cap */
            <div className="flex items-center gap-2">
              <div className="text-5xl animate-idle">🧢</div>
              <div
                className="px-2 py-1 text-xs font-bold rounded border-2 shadow-xs"
                style={{
                  backgroundColor: theme.screenLight,
                  borderColor: theme.screenDark,
                }}
              >
                新人訓練家
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message / Dialog Box */}
      <div
        className="px-3 py-2 border-t-2 text-xs sm:text-[13px] font-bold leading-snug min-h-[72px] sm:min-h-[82px] flex items-center relative z-10"
        style={{
          backgroundColor: '#f6f8eb',
          borderColor: theme.screenDark,
          color: theme.screenDark,
        }}
      >
        <p className="w-full tracking-wide">
          {dialogText}
          <span className="inline-block ml-1 animate-pulse font-black text-amber-700">▼</span>
        </p>
      </div>

      {/* Action Buttons Panel */}
      <div
        className="p-2 border-t-2 grid grid-cols-2 gap-1.5 z-10 min-h-[96px]"
        style={{
          backgroundColor: theme.screenLight,
          borderColor: theme.screenDark,
        }}
      >
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            disabled={btn.disabled}
            onClick={() => {
              sound.sfxSelect();
              btn.onClick();
            }}
            className="relative px-2 py-2 text-xs font-black rounded border-2 shadow-[2px_2px_0px_rgba(15,56,15,0.9)] hover:shadow-[3px_3px_0px_rgba(15,56,15,0.9)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center justify-center text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.screenBg,
              borderColor: theme.screenDark,
              color: theme.screenDark,
            }}
          >
            <span className="truncate w-full font-bold">{btn.text}</span>
            {btn.subText && (
              <span className="text-[9px] opacity-75 font-normal truncate">{btn.subText}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
