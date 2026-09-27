import React from 'react';
import { Volume2, VolumeX, BookOpen, GraduationCap, Sparkles, Monitor } from 'lucide-react';
import { PaletteTheme, ScreenPalette } from '../types/pokemon';
import { sound } from '../utils/audio';

interface GameBoyCaseProps {
  children: React.ReactNode;
  theme: PaletteTheme;
  currentPalette: ScreenPalette;
  onSelectPalette: (palette: ScreenPalette) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  onOpenTypeChart: () => void;
  onOpenQuiz: () => void;
  onPressDpad?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPressA?: () => void;
  onPressB?: () => void;
}

export const GameBoyCase: React.FC<GameBoyCaseProps> = ({
  children,
  theme,
  currentPalette,
  onSelectPalette,
  isMuted,
  onToggleMute,
  showScanlines,
  onToggleScanlines,
  onOpenTypeChart,
  onOpenQuiz,
  onPressDpad,
  onPressA,
  onPressB,
}) => {
  return (
    <div className="w-full max-w-[460px] mx-auto select-none">
      {/* Top Accessory Quick Controls Bar */}
      <div className="flex items-center justify-between gap-2 px-2 py-2 mb-2 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.sfxSelect();
              onOpenTypeChart();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-emerald-400 hover:border-emerald-700/60 transition-all cursor-pointer font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>相剋圖鑑</span>
          </button>

          <button
            onClick={() => {
              sound.sfxSelect();
              onOpenQuiz();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400 hover:border-amber-700/60 transition-all cursor-pointer font-medium"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>博士測驗</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Scanline toggle */}
          <button
            onClick={() => {
              sound.sfxSelect();
              onToggleScanlines();
            }}
            title={showScanlines ? '關閉掃描線濾鏡' : '開啟復古點陣掃描線'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showScanlines
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? '取消靜音' : '靜音'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 border-rose-700 text-rose-400'
                : 'bg-neutral-900 border-neutral-800 text-emerald-400 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Game Boy Classic Handheld Shell */}
      <div
        className="relative rounded-t-2xl rounded-bl-2xl rounded-br-[65px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 transition-colors duration-300"
        style={{
          backgroundColor: currentPalette === 'dmg' ? '#c4cfa1' : currentPalette === 'pocket' ? '#c8cbd0' : currentPalette === 'color' ? '#43346d' : '#8c1d28',
          borderColor: currentPalette === 'dmg' ? '#8f9972' : currentPalette === 'pocket' ? '#8a8d94' : currentPalette === 'color' ? '#2d224b' : '#570d14',
        }}
      >
        {/* Top Edge Decorative Grooves */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-1 bg-black/20 rounded-full" />
            <div className="w-6 h-1 bg-black/20 rounded-full" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-black/50 font-bold">
            ◄ OFF · ON ►
          </span>
        </div>

        {/* Screen Bezel Section */}
        <div className="bg-[#414838] p-4 rounded-t-xl rounded-bl-xl rounded-br-[32px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] border-2 border-black/40">
          {/* Header over screen with stripes and battery led */}
          <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-mono font-black tracking-wider text-[#a0a892]">
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-[#8b1d3d] inline-block" />
              <span className="h-0.5 w-4 bg-[#2b4c80] inline-block" />
              <span className="text-[10px] tracking-tight">DOT MATRIX WITH STEREO SOUND</span>
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              <span>BATTERY</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
              </span>
            </div>
          </div>

          {/* Mounted Screen Component */}
          {children}
        </div>

        {/* Brand Inscription */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="font-extrabold tracking-wider text-xs sm:text-sm font-sans italic opacity-75 text-neutral-800 drop-shadow-xs">
            Nintendo <span className="font-mono text-sm tracking-normal font-black not-italic ml-1">GAME BOY<span className="text-[10px] align-super">TM</span></span>
          </div>

          {/* Palette Selector Dropdown */}
          <div className="flex items-center gap-1">
            {(['dmg', 'pocket', 'color', 'crimson'] as ScreenPalette[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  sound.sfxSelect();
                  onSelectPalette(p);
                }}
                title={p.toUpperCase()}
                className={`w-3.5 h-3.5 rounded-full border border-black/40 transition-transform cursor-pointer ${
                  currentPalette === p ? 'scale-125 ring-2 ring-neutral-900 ring-offset-1' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    p === 'dmg'
                      ? '#9bbc0f'
                      : p === 'pocket'
                      ? '#e6e6e6'
                      : p === 'color'
                      ? '#99e2b4'
                      : '#fcd5ce',
                }}
              />
            ))}
          </div>
        </div>

        {/* Physical Handheld Controls Zone */}
        <div className="mt-5 px-3 flex items-center justify-between">
          {/* Authentic 8-Way D-Pad */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Horizontal Bar */}
            <div className="absolute w-24 h-8 bg-[#2c323b] rounded-[4px] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)] border border-[#1b1f24] flex justify-between items-center px-1">
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressDpad?.('left');
                }}
                className="w-6 h-6 flex items-center justify-center text-[10px] text-white/30 hover:text-white/80 active:translate-x-[-1px] cursor-pointer"
              >
                ◀
              </button>
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressDpad?.('right');
                }}
                className="w-6 h-6 flex items-center justify-center text-[10px] text-white/30 hover:text-white/80 active:translate-x-[1px] cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Vertical Bar */}
            <div className="absolute w-8 h-24 bg-[#2c323b] rounded-[4px] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)] border border-[#1b1f24] flex flex-col justify-between items-center py-1">
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressDpad?.('up');
                }}
                className="w-6 h-6 flex items-center justify-center text-[10px] text-white/30 hover:text-white/80 active:translate-y-[-1px] cursor-pointer"
              >
                ▲
              </button>
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressDpad?.('down');
                }}
                className="w-6 h-6 flex items-center justify-center text-[10px] text-white/30 hover:text-white/80 active:translate-y-[1px] cursor-pointer"
              >
                ▼
              </button>
            </div>

            {/* Center Indentation */}
            <div className="absolute w-3 h-3 rounded-full bg-[#20252b] pointer-events-none" />
          </div>

          {/* Action B / A Buttons */}
          <div className="flex gap-4 -rotate-25 mt-2">
            {/* Button B */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  sound.sfxCancel();
                  onPressB?.();
                }}
                className="w-10 h-10 rounded-full bg-[#8e1b3e] active:bg-[#68112c] shadow-[2px_4px_6px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-[#520a20] active:translate-y-0.5 active:shadow-[1px_2px_3px_rgba(0,0,0,0.6)] transition-all flex items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              </button>
              <span className="text-[11px] font-black mt-1 font-mono text-neutral-800 rotate-25">
                B
              </span>
            </div>

            {/* Button A */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressA?.();
                }}
                className="w-10 h-10 rounded-full bg-[#8e1b3e] active:bg-[#68112c] shadow-[2px_4px_6px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-[#520a20] active:translate-y-0.5 active:shadow-[1px_2px_3px_rgba(0,0,0,0.6)] transition-all flex items-center justify-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              </button>
              <span className="text-[11px] font-black mt-1 font-mono text-neutral-800 rotate-25">
                A
              </span>
            </div>
          </div>
        </div>

        {/* Select & Start Rubber Buttons + Bottom Right Speaker Slits */}
        <div className="mt-8 flex items-end justify-between px-6">
          <div className="flex gap-4 -rotate-25">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onOpenTypeChart();
                }}
                className="w-11 h-3.5 bg-[#69727d] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#444a52] active:translate-y-px cursor-pointer"
              />
              <span className="text-[9px] font-black text-neutral-700 tracking-wider mt-1 rotate-25 font-mono">
                SELECT
              </span>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  sound.sfxSelect();
                  onPressA?.();
                }}
                className="w-11 h-3.5 bg-[#69727d] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#444a52] active:translate-y-px cursor-pointer"
              />
              <span className="text-[9px] font-black text-neutral-700 tracking-wider mt-1 rotate-25 font-mono">
                START
              </span>
            </div>
          </div>

          {/* Speaker Slits */}
          <div className="flex gap-2 rotate-[-30deg] mb-1">
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
            <div className="w-1.5 h-12 bg-black/40 rounded-full" />
          </div>
        </div>

        {/* Bottom Headphone Outline */}
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-1 text-[9px] font-mono text-black/40 font-bold">
            <span>PHONES</span>
            <div className="w-2.5 h-2.5 rounded-full bg-black/40 border border-black/60" />
          </div>
        </div>
      </div>

      {/* Keyboard Controls Hint */}
      <div className="mt-3 text-center text-xs text-neutral-400">
        <span className="font-mono text-neutral-400">鍵盤快捷鍵支援：</span>
        <span className="font-mono text-emerald-400 font-semibold">[數字鍵 1-4]</span> 選擇選項 ·{' '}
        <span className="font-mono text-amber-400 font-semibold">[Enter / 空白鍵]</span> 確認 (A) ·{' '}
        <span className="font-mono text-rose-400 font-semibold">[Esc]</span> 返回 (B)
      </div>
    </div>
  );
};
