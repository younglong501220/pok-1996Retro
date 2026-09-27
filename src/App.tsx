import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { GameBoyCase } from './components/GameBoyCase';
import { BattleScreen } from './components/BattleScreen';
import { TypeChartModal } from './components/TypeChartModal';
import { QuizModal } from './components/QuizModal';
import { sound } from './utils/audio';
import {
  ActionButtonConfig,
  GameStage,
  Move,
  Pokemon,
  ScreenPalette,
} from './types/pokemon';
import {
  STARTERS,
  BROCK_GEODUDE,
  RIVAL_CHARIZARD,
  getTypeMultiplier,
  SCREEN_PALETTES,
} from './data/pokemonData';

export default function App() {
  const [, startTransition] = useTransition();

  // Settings
  const [currentPalette, setCurrentPalette] = useState<ScreenPalette>('dmg');
  const [isMuted, setIsMuted] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);
  const [isTypeChartOpen, setIsTypeChartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Core Game State
  const [stage, setStage] = useState<GameStage>('STAGE_1_OAK');
  const [locationTitle, setLocationTitle] = useState('真新鎮 - 大木研究所');
  const [potions, setPotions] = useState(2);
  const [playerMon, setPlayerMon] = useState<Pokemon | null>(null);
  const [enemyMon, setEnemyMon] = useState<Pokemon | null>(null);
  const [dialogText, setDialogText] = useState(
    '大木博士：「歡迎來到寶可夢世界！請在桌上挑選一隻夥伴開始冒險吧！」'
  );
  const [buttons, setButtons] = useState<ActionButtonConfig[]>([]);

  // Battle dynamics
  const [turnLocked, setTurnLocked] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [combatFloater, setCombatFloater] = useState<{
    text: string;
    type: 'super' | 'weak' | 'normal' | 'heal';
  } | null>(null);

  // Adventure Stats & Badges
  const [gymBadges, setGymBadges] = useState<string[]>([]);
  const [battleTurnCount, setBattleTurnCount] = useState(0);

  const theme = SCREEN_PALETTES[currentPalette];

  const triggerFloater = (text: string, type: 'super' | 'weak' | 'normal' | 'heal') => {
    setCombatFloater({ text, type });
    setTimeout(() => {
      setCombatFloater(null);
    }, 1100);
  };

  /* ============================================================
     1. Stage 1: Pallet Town - Oak's Lab
     ============================================================ */
  const initStage1 = useCallback(() => {
    setStage('STAGE_1_OAK');
    setLocationTitle('真新鎮 - 大木研究所');
    setPlayerMon(null);
    setEnemyMon(null);
    setPotions(2);
    setGymBadges([]);
    setBattleTurnCount(0);
    setTurnLocked(false);

    setDialogText('大木博士：「這裡有三顆精靈球，選擇一隻作為你踏上旅程的夥伴吧！」');

    setButtons([
      {
        text: '🔥 小火龍 (火)',
        subText: '火花特攻 / 熱情冒險',
        onClick: () => chooseStarter('charmander'),
      },
      {
        text: '💧 傑尼龜 (水)',
        subText: '水槍噴射 / 防禦穩健',
        onClick: () => chooseStarter('squirtle'),
      },
      {
        text: '🍃 妙蛙種子 (草)',
        subText: '藤鞭打擊 / 均衡發展',
        onClick: () => chooseStarter('bulbasaur'),
      },
      {
        text: '📖 查閱屬性相剋圖鑑',
        subText: '了解禦三家屬性優劣勢',
        onClick: () => setIsTypeChartOpen(true),
      },
    ]);
  }, []);

  const chooseStarter = (id: string) => {
    const selected = JSON.parse(JSON.stringify(STARTERS[id])) as Pokemon;
    setPlayerMon(selected);
    sound.sfxStarterChosen();

    setDialogText(
      `太棒了！你獲得了【${selected.name}】！大木博士給了你 2 瓶傷藥，前往深灰市挑戰岩石道館吧！`
    );

    setButtons([
      {
        text: '前往深灰道館挑戰 ➔',
        subText: '挑戰道館館主小剛',
        onClick: () => enterStage2(selected),
      },
      {
        text: '🎒 檢查寶可夢招式',
        subText: `${selected.moves.map((m) => m.name).join(' / ')}`,
        onClick: () => {
          setDialogText(
            `【${selected.name}】屬性：${selected.typeLabel}，目前擁有技能：${selected.moves
              .map((m) => `${m.name}(威力${m.pwr})`)
              .join('、')}。`
          );
        },
      },
    ]);
  };

  /* ============================================================
     2. Stage 2: Pewter Gym - Brock & Geodude
     ============================================================ */
  const enterStage2 = (currentPokemon: Pokemon) => {
    setStage('STAGE_2_GYM');
    setLocationTitle('深灰道館 - 館主小剛');

    const geodude = JSON.parse(JSON.stringify(BROCK_GEODUDE)) as Pokemon;
    setEnemyMon(geodude);

    setDialogText(
      `道館館主小剛派出了【小拳石】！小拳石是岩石屬性。你的【${currentPokemon.name}】準備應戰！`
    );

    renderStage2Options(currentPokemon, geodude);
  };

  const renderStage2Options = (curMon: Pokemon, curEnemy: Pokemon) => {
    const isFire = curMon.type === 'FIRE';

    if (!isFire) {
      // Water or Grass Starter -> Clear Super Effective advantage!
      const specialMove = curMon.moves.find((m) => m.isSpecial) || curMon.moves[1];
      setButtons([
        {
          text: `💥 釋放【${specialMove.name}】`,
          subText: `${curMon.type === 'WATER' ? '水剋岩石' : '草剋岩石'} (2.0x 剋制)`,
          onClick: () => executeSuperEffectiveStrike(curMon),
        },
        {
          text: `👊 一般撞擊 (一般)`,
          subText: '威力 7 / 無屬性加成',
          onClick: () => executeNormalStrike(curMon, curEnemy),
        },
        {
          text: `🧪 使用傷藥 (剩餘 ${potions})`,
          subText: '回復 18 點生命值',
          disabled: potions <= 0 || curMon.hp >= curMon.maxHp,
          onClick: () => handleUsePotion(() => renderStage2Options(curMon, curEnemy)),
        },
        {
          text: '📖 查看相剋指南',
          subText: '確認岩石屬性弱點',
          onClick: () => setIsTypeChartOpen(true),
        },
      ]);
    } else {
      // Fire Starter -> Rock resists Fire (0.5x)! Provide strategic branching!
      setButtons([
        {
          text: '🔥 強行使用【火花】',
          subText: '火打岩石效果減半 (0.5x)',
          onClick: () => tryFireDisadvantage(curMon, curEnemy),
        },
        {
          text: '⛰️ 繞道月見山尋求對策',
          subText: '探尋水之石或強大招式',
          onClick: () => exploreMtMoonBranch(curMon),
        },
        {
          text: '🥋 在 3 號道路特訓金屬爪',
          subText: '領悟鋼系招式 (剋制岩石)',
          onClick: () => learnMetalClawBranch(curMon),
        },
        {
          text: `🧪 使用傷藥 (剩餘 ${potions})`,
          subText: '回復 18 HP',
          disabled: potions <= 0 || curMon.hp >= curMon.maxHp,
          onClick: () => handleUsePotion(() => renderStage2Options(curMon, curEnemy)),
        },
      ]);
    }
  };

  // Water/Grass Super Effective instant break
  const executeSuperEffectiveStrike = (curMon: Pokemon) => {
    sound.sfxSuperEffective();
    setEnemyShake(true);
    triggerFloater('2.0x 效果絕佳！！', 'super');
    setTimeout(() => setEnemyShake(false), 400);

    setEnemyMon((prev) => (prev ? { ...prev, hp: 0 } : null));
    setGymBadges(['灰色徽章']);
    sound.sfxBadgeObtained();

    const moveName = curMon.moves.find((m) => m.isSpecial)?.name || '屬性特攻';
    setDialogText(
      `效果絕佳！${moveName}打在岩石上造成了致命屬性剋制！小拳石倒下了！成功奪得深灰道館【灰色徽章】！🏅`
    );

    setButtons([
      {
        text: '進軍石英高原（冠軍決賽）➔',
        subText: '挑戰宿敵小茂的冠軍隊伍',
        onClick: () => enterStage3(curMon),
      },
    ]);
  };

  // Normal strike
  const executeNormalStrike = (curMon: Pokemon, curEnemy: Pokemon) => {
    sound.sfxHit();
    setEnemyShake(true);
    triggerFloater('-5 傷害', 'normal');
    setTimeout(() => setEnemyShake(false), 400);

    const newHp = Math.max(0, curEnemy.hp - 5);
    const updatedEnemy = { ...curEnemy, hp: newHp };
    setEnemyMon(updatedEnemy);

    if (newHp <= 0) {
      executeSuperEffectiveStrike(curMon);
    } else {
      setDialogText(
        `撞擊造成了 5 點傷害，但岩石護甲非常堅固！建議使用水槍或藤鞭等效果絕佳的屬性特攻！`
      );
      renderStage2Options(curMon, updatedEnemy);
    }
  };

  // Fire Starter vs Rock disadvantage scenario
  const tryFireDisadvantage = (curMon: Pokemon, curEnemy: Pokemon) => {
    sound.sfxNotEffective();
    setEnemyShake(true);
    triggerFloater('0.5x 效果不理想...', 'weak');
    setTimeout(() => setEnemyShake(false), 300);

    const dmgDealt = 4;
    const enemyNewHp = Math.max(0, curEnemy.hp - dmgDealt);
    const updatedEnemy = { ...curEnemy, hp: enemyNewHp };
    setEnemyMon(updatedEnemy);

    // Geodude counter-attacks with Rock Throw
    setTimeout(() => {
      sound.sfxHit();
      setPlayerShake(true);
      triggerFloater('落石命中！-12 HP', 'weak');
      setTimeout(() => setPlayerShake(false), 400);

      const playerNewHp = Math.max(1, curMon.hp - 12);
      const updatedPlayer = { ...curMon, hp: playerNewHp };
      setPlayerMon(updatedPlayer);

      setDialogText(
        `效果不理想！岩石極耐火系，小拳石反擊使出【落石】，小火龍遭受 12 點重創！建議前往月見山尋找水之石或特訓鋼系金屬爪！`
      );

      setButtons([
        {
          text: '⛰️ 決定繞道月見山尋寶',
          subText: '尋找水屬性力量',
          onClick: () => exploreMtMoonBranch(updatedPlayer),
        },
        {
          text: '🥋 在 3 號道路特訓金屬爪',
          subText: '習得鋼系剋制招式',
          onClick: () => learnMetalClawBranch(updatedPlayer),
        },
        {
          text: `🧪 喝傷藥繼續硬拼 (剩餘 ${potions})`,
          subText: '恢復 18 HP',
          disabled: potions <= 0,
          onClick: () => handleUsePotion(() => renderStage2Options(updatedPlayer, updatedEnemy)),
        },
      ]);
    }, 700);
  };

  // Branch A: Explore Mt. Moon to find Water Stone and learn Aqua Tail
  const exploreMtMoonBranch = (curMon: Pokemon) => {
    sound.sfxVictory();
    setStage('STAGE_2_MT_MOON');
    setLocationTitle('月見山 - 深處秘境');

    const newMove: Move = {
      id: 'aqua_tail',
      name: '水流尾 (水)',
      type: 'WATER',
      typeLabel: '水系',
      pwr: 16,
      accuracy: 95,
      isSpecial: true,
      description: '神秘水之石引發的水屬性招式，剋制火系、岩石系與地面系！',
    };

    const updatedMoves = [...curMon.moves, newMove];
    const updatedMon: Pokemon = { ...curMon, moves: updatedMoves };
    setPlayerMon(updatedMon);

    setDialogText(
      '【驚喜支線】在月見山深處拾獲了【神秘水之石】！小火龍奇蹟般領悟了水屬性招式【水流尾】！'
    );

    setButtons([
      {
        text: '🌊 返回道館用【水流尾】迎戰小拳石！',
        subText: '水剋岩石 (2.0x 致命剋制)',
        onClick: () => {
          sound.sfxSuperEffective();
          setEnemyShake(true);
          triggerFloater('2.0x 效果絕佳！！', 'super');
          setTimeout(() => setEnemyShake(false), 400);

          setEnemyMon((prev) => (prev ? { ...prev, hp: 0 } : null));
          setGymBadges(['灰色徽章']);
          sound.sfxBadgeObtained();

          setDialogText(
            '不可思議！小火龍使出水屬性【水流尾】，水剋岩石，瞬間擊潰小拳石！拿下深灰道館灰色徽章！🏅'
          );

          setButtons([
            {
              text: '進軍石英高原 ➔',
              subText: '挑戰聯盟冠軍',
              onClick: () => enterStage3(updatedMon),
            },
          ]);
        },
      },
    ]);
  };

  // Branch B: Master Steel-type Metal Claw
  const learnMetalClawBranch = (curMon: Pokemon) => {
    sound.sfxVictory();
    setStage('STAGE_2_TRAINING');
    setLocationTitle('3號道路 - 秘密特訓基地');

    const newMove: Move = {
      id: 'metal_claw',
      name: '金屬爪 (鋼)',
      type: 'STEEL',
      typeLabel: '鋼系',
      pwr: 15,
      accuracy: 95,
      description: '鋼系物理招式，銳利的鋼鐵利爪能劈開岩石防線！',
    };

    const updatedMoves = [...curMon.moves, newMove];
    const updatedMon: Pokemon = { ...curMon, moves: updatedMoves };
    setPlayerMon(updatedMon);

    setDialogText(
      '【特訓成果】小火龍經過刻苦鍛鍊，成功領悟了鋼系招式【金屬爪】！鋼屬性同樣剋制岩石系！'
    );

    setButtons([
      {
        text: '⚔️ 用【金屬爪】撕裂岩石！',
        subText: '鋼剋岩石 (2.0x 剋制)',
        onClick: () => {
          sound.sfxSuperEffective();
          setEnemyShake(true);
          triggerFloater('2.0x 效果絕佳！！', 'super');
          setTimeout(() => setEnemyShake(false), 400);

          setEnemyMon((prev) => (prev ? { ...prev, hp: 0 } : null));
          setGymBadges(['灰色徽章']);
          sound.sfxBadgeObtained();

          setDialogText(
            '效果絕佳！金屬爪直接劈開了小拳石的堅硬岩壁，贏得道館勝利！獲得灰色徽章！🏅'
          );

          setButtons([
            {
              text: '進軍石英高原 ➔',
              subText: '挑戰聯盟冠軍',
              onClick: () => enterStage3(updatedMon),
            },
          ]);
        },
      },
    ]);
  };

  /* ============================================================
     3. Stage 3: Indigo Plateau Champion Battle (Rival's Charizard)
     ============================================================ */
  const enterStage3 = (curMon: Pokemon) => {
    setStage('STAGE_3_CHAMPION');
    setLocationTitle('石英高原 - 冠軍之座');

    const charizard = JSON.parse(JSON.stringify(RIVAL_CHARIZARD)) as Pokemon;
    setEnemyMon(charizard);

    setDialogText(
      `宿敵小茂在冠軍頂點等候你！他派出了最強王牌【噴火龍】！能否奪冠取決於你的屬性策略！`
    );

    renderBattleLoop(curMon, charizard);
  };

  const renderBattleLoop = (curMon: Pokemon, curEnemy: Pokemon) => {
    if (curEnemy.hp <= 0) {
      victoryChampion(curMon);
      return;
    }

    if (curMon.hp <= 0) {
      defeatGameOver(curMon);
      return;
    }

    const moveBtns: ActionButtonConfig[] = curMon.moves.map((m) => {
      const mult = getTypeMultiplier(m.type, curEnemy.type, curEnemy.secondaryType);
      let note = '1.0x 普攻';
      if (mult >= 2.0) note = '2.0x 效果絕佳！';
      else if (mult < 1.0) note = `${mult}x 效果不佳`;

      return {
        text: `${m.name}`,
        subText: `威力 ${m.pwr} · ${note}`,
        onClick: () => handlePlayerAttack(m, curMon, curEnemy),
      };
    });

    // Potion Action
    moveBtns.push({
      text: `🧪 使用傷藥 (${potions})`,
      subText: '回復 18 HP',
      disabled: potions <= 0 || curMon.hp >= curMon.maxHp,
      onClick: () =>
        handleUsePotion(() => {
          // After using potion, enemy takes turn
          handleEnemyTurn(curMon, curEnemy);
        }),
    });

    setButtons(moveBtns);
  };

  const handlePlayerAttack = (move: Move, curMon: Pokemon, curEnemy: Pokemon) => {
    if (turnLocked) return;
    setTurnLocked(true);
    setBattleTurnCount((c) => c + 1);

    const mult = getTypeMultiplier(move.type, curEnemy.type, curEnemy.secondaryType);
    const baseDamage = move.pwr;
    const finalDamage = Math.max(1, Math.round(baseDamage * mult));

    const newEnemyHp = Math.max(0, curEnemy.hp - finalDamage);
    const updatedEnemy = { ...curEnemy, hp: newEnemyHp };
    setEnemyMon(updatedEnemy);

    setEnemyShake(true);
    setTimeout(() => setEnemyShake(false), 400);

    let effectMsg = '';
    if (mult >= 2.0) {
      sound.sfxSuperEffective();
      triggerFloater(`💥 -${finalDamage} 效果絕佳!!`, 'super');
      effectMsg = '效果絕佳！！造成毀滅性重擊！';
    } else if (mult < 1.0) {
      sound.sfxNotEffective();
      triggerFloater(`🛡️ -${finalDamage} 效果不佳`, 'weak');
      effectMsg = '效果不理想...傷害被屬性減免！';
    } else {
      sound.sfxHit();
      triggerFloater(`⚔️ -${finalDamage}`, 'normal');
      effectMsg = '造成了紮實的命中！';
    }

    setDialogText(
      `【${curMon.name}】使出了【${move.name}】！${effectMsg}（造成 ${finalDamage} 點傷害）`
    );

    setTimeout(() => {
      if (newEnemyHp <= 0) {
        victoryChampion(curMon);
      } else {
        handleEnemyTurn(curMon, updatedEnemy);
      }
    }, 1100);
  };

  const handleEnemyTurn = (curMon: Pokemon, curEnemy: Pokemon) => {
    setDialogText(`【噴火龍】發動震耳咆哮，準備展開兇猛的反擊！`);

    setTimeout(() => {
      // Enemy Charizard AI decision
      let chosenMoveName = '火焰漩渦';
      let moveType: 'FIRE' | 'FLYING' = 'FIRE';
      let enemyPwr = 10;

      // If player is Grass, prioritize devastating Fire Blast!
      if (curMon.type === 'GRASS') {
        chosenMoveName = '大字爆炎 (剋制草系)';
        moveType = 'FIRE';
        enemyPwr = 15;
      } else if (Math.random() > 0.4) {
        chosenMoveName = '翅膀攻擊 (飛行)';
        moveType = 'FLYING';
        enemyPwr = 10;
      }

      const mult = getTypeMultiplier(moveType, curMon.type);
      const enemyDmg = Math.max(1, Math.round(enemyPwr * mult));
      const newPlayerHp = Math.max(0, curMon.hp - enemyDmg);
      const updatedPlayer = { ...curMon, hp: newPlayerHp };
      setPlayerMon(updatedPlayer);

      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 400);

      if (mult >= 2.0) {
        sound.sfxSuperEffective();
        triggerFloater(`💥 -${enemyDmg} 效果絕佳!!`, 'super');
        setDialogText(
          `噴火龍使出【${chosenMoveName}】！屬性剋制！你的【${curMon.name}】遭受了 ${enemyDmg} 點致命重創！`
        );
      } else if (mult < 1.0) {
        sound.sfxNotEffective();
        triggerFloater(`🛡️ -${enemyDmg} 屬性抵抗`, 'weak');
        setDialogText(
          `噴火龍使出【${chosenMoveName}】！但屬性抵抗，僅受到 ${enemyDmg} 點微幅傷害！`
        );
      } else {
        sound.sfxHit();
        triggerFloater(`⚔️ -${enemyDmg}`, 'normal');
        setDialogText(`噴火龍使出【${chosenMoveName}】，造成了 ${enemyDmg} 點傷害！`);
      }

      setTimeout(() => {
        setTurnLocked(false);
        if (newPlayerHp <= 0) {
          defeatGameOver(updatedPlayer);
        } else {
          renderBattleLoop(updatedPlayer, curEnemy);
        }
      }, 1000);
    }, 900);
  };

  /* ============================================================
     4. Potion Usage
     ============================================================ */
  const handleUsePotion = (onComplete: () => void) => {
    if (potions <= 0 || !playerMon) return;
    setPotions((p) => Math.max(0, p - 1));
    sound.sfxHeal();

    const healAmount = 18;
    const newHp = Math.min(playerMon.maxHp, playerMon.hp + healAmount);
    const updated = { ...playerMon, hp: newHp };
    setPlayerMon(updated);

    triggerFloater(`+${healAmount} HP 回復!`, 'heal');
    setDialogText(`使用了傷藥！【${playerMon.name}】體力恢復了 ${healAmount} 點！`);

    setTimeout(onComplete, 800);
  };

  /* ============================================================
     5. Endings: Hall of Fame / Game Over
     ============================================================ */
  const victoryChampion = (curMon: Pokemon) => {
    sound.sfxVictory();
    setStage('HALL_OF_FAME');
    setLocationTitle('石英高原 - 名人堂');
    setEnemyMon({
      id: 'trophy',
      name: '聯盟冠軍獎盃',
      nameEn: 'Trophy',
      sprite: '🏆',
      type: 'NORMAL',
      typeLabel: '榮譽',
      maxHp: 1,
      hp: 1,
      atk: 0,
      def: 0,
      speed: 0,
      moves: [],
      description: '關都聯盟最高榮譽',
    });

    setDialogText(
      `【大捷】噴火龍失去戰鬥能力！你以出色的屬性相剋策略戰勝宿敵小茂，榮登【關都地區新任聯盟冠軍】！🏆`
    );

    setButtons([
      {
        text: '🎖️ 登入名人堂並展開新冒險',
        subText: '挑選其他禦三家再次挑戰',
        onClick: () => initStage1(),
      },
      {
        text: '🎓 參加屬性博士檢定考',
        subText: '測驗你的屬性剋制知識',
        onClick: () => setIsQuizOpen(true),
      },
      {
        text: '📖 複習屬性相剋速查寶典',
        subText: '探索 18 屬性相剋全貌',
        onClick: () => setIsTypeChartOpen(true),
      },
    ]);
  };

  const defeatGameOver = (curMon: Pokemon) => {
    sound.sfxDefeat();
    setStage('GAME_OVER');
    setTurnLocked(false);
    setDialogText(
      `【戰敗】${curMon.name} 眼前一陣漆黑...在四大天王面前倒下了。掌握屬性剋制與傷藥調配是勝負關鍵！`
    );

    setButtons([
      {
        text: '🔄 重新啟程挑戰聯盟',
        subText: '重返大木研究所選擇夥伴',
        onClick: () => initStage1(),
      },
      {
        text: '📖 臨時抱佛腳：查閱相剋圖鑑',
        subText: '研究火、水、草、岩石相剋',
        onClick: () => setIsTypeChartOpen(true),
      },
    ]);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal open, let modal handle it
      if (isTypeChartOpen || isQuizOpen) {
        if (e.key === 'Escape') {
          setIsTypeChartOpen(false);
          setIsQuizOpen(false);
        }
        return;
      }

      // Quick numbers 1 - 4
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (buttons[idx] && !buttons[idx].disabled) {
          buttons[idx].onClick();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Trigger first enabled button (A)
        const primary = buttons.find((b) => !b.disabled);
        if (primary) {
          primary.onClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttons, isTypeChartOpen, isQuizOpen]);

  // Initial stage start
  useEffect(() => {
    initStage1();
  }, [initStage1]);

  return (
    <main className="min-h-screen bg-[#111317] text-neutral-100 flex flex-col justify-between py-4 px-2 sm:px-4">
      {/* Top Bar Contract (3 zones) */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 text-xs">
        {/* Zone 1: Single text element wordmark */}
        <span className="font-bold text-sm tracking-tight text-neutral-100 flex items-center gap-1.5 font-mono">
          <span className="text-base">🎮</span>
          <span>POKÉMON RETRO 1996</span>
        </span>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden sm:flex items-center gap-5 text-neutral-400 font-medium">
          <button
            onClick={() => {
              sound.sfxSelect();
              setIsTypeChartOpen(true);
            }}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            屬性相剋圖鑑
          </button>
          <button
            onClick={() => {
              sound.sfxSelect();
              setIsQuizOpen(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            相剋博士測驗
          </button>
          <button
            onClick={() => {
              sound.sfxSelect();
              initStage1();
            }}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            重新開始冒險
          </button>
        </nav>

        {/* Zone 3: Primary Action / Sound state */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            className="px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? '🔇 靜音中' : '🔊 8-Bit 音效'}
          </button>
        </div>
      </header>

      {/* Main Gameboy Centerpiece */}
      <div className="flex-1 flex items-center justify-center my-2">
        <GameBoyCase
          theme={theme}
          currentPalette={currentPalette}
          onSelectPalette={(p) => {
            startTransition(() => {
              setCurrentPalette(p);
            });
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = sound.toggleMute();
            setIsMuted(muted);
          }}
          showScanlines={showScanlines}
          onToggleScanlines={() => setShowScanlines((s) => !s)}
          onOpenTypeChart={() => setIsTypeChartOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onPressA={() => {
            const primary = buttons.find((b) => !b.disabled);
            if (primary) primary.onClick();
          }}
          onPressB={() => {
            sound.sfxCancel();
          }}
          onPressDpad={(dir) => {
            // D-Pad feedback
            if (dir === 'up' || dir === 'left') {
              const prev = buttons[0];
              if (prev && !prev.disabled) prev.onClick();
            } else {
              const next = buttons[1] || buttons[0];
              if (next && !next.disabled) next.onClick();
            }
          }}
        >
          <BattleScreen
            locationTitle={locationTitle}
            potions={potions}
            playerMon={playerMon}
            enemyMon={enemyMon}
            dialogText={dialogText}
            buttons={buttons}
            theme={theme}
            showScanlines={showScanlines}
            enemyShake={enemyShake}
            playerShake={playerShake}
            combatFloater={combatFloater}
            onUsePotionQuick={() => {
              if (playerMon && potions > 0 && playerMon.hp < playerMon.maxHp) {
                handleUsePotion(() => {
                  if (enemyMon && enemyMon.hp > 0 && stage === 'STAGE_3_CHAMPION') {
                    handleEnemyTurn(playerMon, enemyMon);
                  }
                });
              }
            }}
            gymBadges={gymBadges}
          />
        </GameBoyCase>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 text-[11px] text-neutral-400 border-t border-neutral-900/80">
        <span>© 1996 - 2026 寶可夢屬性相剋大冒險 · 純前端 Web Audio API 晶片音頻合成 · 零外部依賴</span>
      </footer>

      {/* Type Matchup Encyclopedia Modal */}
      <TypeChartModal isOpen={isTypeChartOpen} onClose={() => setIsTypeChartOpen(false)} />

      {/* Type Master Quiz Mini-Game Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onRewardPotion={(count) => {
          setPotions((p) => p + count);
          setDialogText(`恭喜在博士檢定考表現優異！獲得額外贈送的 ${count} 瓶傷藥！🎒`);
        }}
      />
    </main>
  );
}
