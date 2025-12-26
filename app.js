import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js";
    import nacl from "https://esm.run/tweetnacl";
    import { sha256 } from "https://esm.run/@noble/hashes/sha256.js";
    import { bytesToHex } from "https://esm.run/@noble/hashes/utils.js";
    import { joinRoom } from "https://esm.run/trystero/torrent";
    import { selfId } from "https://esm.run/trystero";

    // ============================================================
    // i18n (6 languages: EN, ZH, HI, ES, FR, CA)
    // ============================================================
    const GAME_TITLE = "Shardwalk: Isometric Chronicles";

    const FLAG = {
      en: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1fa-1f1f8.svg", // US
      zh: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1e8-1f1f3.svg", // CN
      hi: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ee-1f1f3.svg", // IN
      es: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1f8.svg", // ES
      fr: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1eb-1f1f7.svg", // FR
      ca: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Catalonia.svg"        // Senyera
    };

    const I18N = {
      en: {
        ui: { close: "Close", language: "Language" },
        hud: { room: "Room", peers: "Peers", you: "You", weight: "Wt" },
        btn: { quests: "Quests", skills: "Skills", craft: "Craft", world: "World", credits: "Credits", export: "Export", import: "Import", action: "Action (E)", attack: "Attack (␣)" },
        login: {
          tagline: "Procedural isometric world + survival + P2P (WebRTC) + signed append-only ledger.",
          shareHint: "(share link with)",
          nameLabel: "Character name",
          passLabel: "Passphrase (stays on device)",
          lifestyleLabel: "Lifestyle",
          optionsLabel: "Options",
          enterWorld: "Enter the world",
          copyLink: "Copy link",
          controls: "Controls: WASD/Arrows, E action, Space attack, Enter chat",
          ledgerNote: "The shared ledger is readable by everyone, but nobody can sign as you—so they can't modify what you own."
        },
        sel: {
          rememberNo: "Don't remember passphrase",
          rememberYes: "Remember passphrase (NOT recommended)"
        },
        life: {
          Explorer: "Explorer (exploration + endurance)",
          Crafter: "Crafter (crafting + building)",
          Hunter: "Hunter (combat + loot)",
          Scholar: "Scholar (runes + lore)",
          Merchant: "Merchant (social + utility)",
          Mystic: "Mystic (rituals + night)"
        },
        modal: {
          language: "Language",
          quests: "Quests (progress)",
          skills: "Skills + Lifestyle",
          world: "Shared world (ledger)",
          credits: "Credits & licenses",
          craft: "Craft (tools, gear, building)",
          sign: "Signpost",
          author: "Author",
          removeMine: "Remove (only you)",
          summary: "Summary",
          ranking: "Ranking (shrines)",
          tip: "Tip: shared objects are immutable; only the owner can remove them (by signing).",
          recipesBasic: "Recipes (basic)",
          recipesAdv: "Advanced (requires Workbench nearby)",
          materials: "Materials",
          currentEquip: "Current equipment",
          position: "Position"
        },
        common: { progress: "Progress", completed: "completed", reward: "Reward" },
        names: {
          biomes: { Water:"Water", Swamp:"Swamp", Forest:"Forest", Grass:"Grassland", Stone:"Stone", Sand:"Sand", Mount:"Mountains", Snow:"Snow" },
          monsters: { Slime:"Slime", Wolf:"Wolf", Bandit:"Bandit", Wisp:"Wisp" },
          items: {
            Axe:"Axe", Pickaxe:"Pickaxe", Campfire:"Campfire", Workbench:"Workbench", Signpost:"Signpost",
            Spear:"Spear", Sword:"Sword", Cloak:"Cloak", Leather:"Leather armor", Lantern:"Lantern"
          },
          decor: { Tree:"Tree", Rock:"Rock", Bush:"Bush", Ore:"Ore vein", Herb:"Herbs", Bones:"Bones", Ruins:"Ruins", Shrine:"Shrine" }
        },
        toast: {
          linkCopied: "Link copied",
          p2pOffline: "P2P unavailable (offline + export/import)",
          importOk: "Import OK",
          importFail: "Import failed",
          chooseName: "Choose a name",
          choosePass: "Enter a passphrase",
          welcome: "Welcome to Shardwalk!",
          deepWater: "Deep water: you can't pass",
          newBiome: "New biome: {biome}",
          spawned: "Spawned: {monster}",
          mining: "Mining PoW… tap Action to cancel",
          miningCancelled: "Mining cancelled",
          shrineClaimed: "Shrine claimed!",
          rest: "You rest by the campfire",
          benchNeeded: "You need a Workbench nearby",
          ruinsAlready: "You already searched these ruins",
          ruinsLoot: "Ruins loot: {loot}",
          needPickaxe: "You need a Pickaxe to mine ore",
          nothing: "Nothing to do here",
          noEnemies: "No enemies nearby",
          hit: "Hit! -{dmg}",
          enemyDefeated: "Enemy defeated! Loot: {loot}",
          youFell: "You fell… respawning at the origin",
          notEnough: "Not enough materials",
          equipped: "Equipped: {item}",
          placedShared: "Placed (shared): {item}",
          ateBerry: "You eat a berry",
          msgSent: "Message sent"
        },
        prompt: {
          signText: "Sign text (max 160):",
          signDefault: "The road is long—let the shard guide you.",
          chat: "Say (P2P, ephemeral):",
          chatDefault: "Hello!"
        },
        quest: {
          cartoTitle: "Cartographer",
          cartoDesc: "Discover {n} new biomes (cumulative).",
          gatherTitle: "Survival",
          gatherDesc: "Gather {n} resources (trees/rocks/ore/herbs/ruins).",
          valorTitle: "Trial of Valor",
          valorDesc: "Defeat {n} enemies.",
          shrineTitle: "Ancient Rune",
          shrineDesc: "Claim {n} shrine (PoW).",
          benchTitle: "Carpentry",
          benchDesc: "Build a Workbench (shared).",
          toolTitle: "Tools",
          toolDesc: "Craft a tool (Axe or Pickaxe)."
        }
      },

      es: {
        ui: { close: "Cerrar", language: "Idioma" },
        hud: { room: "Sala", peers: "Jugadores", you: "Tú", weight: "Peso" },
        btn: { quests: "Misiones", skills: "Habilidades", craft: "Crafteo", world: "Mundo", credits: "Créditos", export: "Exportar", import: "Importar", action: "Acción (E)", attack: "Atacar (␣)" },
        login: {
          tagline: "Mundo isométrico procedural + supervivencia + P2P (WebRTC) + ledger firmado (append-only).",
          shareHint: "(comparte el enlace con)",
          nameLabel: "Nombre del personaje",
          passLabel: "Frase clave (se queda en el dispositivo)",
          lifestyleLabel: "Estilo de vida",
          optionsLabel: "Opciones",
          enterWorld: "Entrar al mundo",
          copyLink: "Copiar enlace",
          controls: "Controles: WASD/Flechas, E acción, Espacio atacar, Enter chat",
          ledgerNote: "El ledger compartido es legible por todos, pero nadie puede firmar como tú—no pueden modificar lo que es tuyo."
        },
        sel: { rememberNo: "No recordar frase", rememberYes: "Recordar frase (NO recomendado)" },
        life: {
          Explorer: "Explorador (exploración + resistencia)",
          Crafter: "Artesano (crafteo + construcción)",
          Hunter: "Cazador (combate + botín)",
          Scholar: "Erudito (runas + saber)",
          Merchant: "Mercader (social + utilidad)",
          Mystic: "Místico (rituales + noche)"
        },
        modal: {
          language: "Idioma", quests: "Misiones (progreso)", skills: "Habilidades + Estilo", world: "Mundo compartido (ledger)",
          credits: "Créditos y licencias", craft: "Crafteo (herramientas, equipo, construcción)", sign: "Cartel",
          author: "Autor", removeMine: "Eliminar (solo tú)", summary: "Resumen", ranking: "Ranking (santuarios)",
          tip: "Consejo: los objetos compartidos son inmutables; solo el propietario puede retirarlos (firmando).",
          recipesBasic: "Recetas (básicas)", recipesAdv: "Avanzado (requiere Banco de trabajo cerca)",
          materials: "Materiales", currentEquip: "Equipo actual", position: "Posición"
        },
        common: { progress: "Progreso", completed: "completada", reward: "Recompensa" },
        names: {
          biomes: { Water:"Agua", Swamp:"Pantano", Forest:"Bosque", Grass:"Pradera", Stone:"Piedra", Sand:"Arena", Mount:"Montañas", Snow:"Nieve" },
          monsters: { Slime:"Baba", Wolf:"Lobo", Bandit:"Bandido", Wisp:"Fuego fatuo" },
          items: {
            Axe:"Hacha", Pickaxe:"Pico", Campfire:"Hoguera", Workbench:"Banco de trabajo", Signpost:"Cartel",
            Spear:"Lanza", Sword:"Espada", Cloak:"Capa", Leather:"Armadura de cuero", Lantern:"Linterna"
          },
          decor: { Tree:"Árbol", Rock:"Roca", Bush:"Arbusto", Ore:"Veta", Herb:"Hierbas", Bones:"Huesos", Ruins:"Ruinas", Shrine:"Santuario" }
        },
        toast: {
          linkCopied: "Enlace copiado",
          p2pOffline: "P2P no disponible (offline + export/import)",
          importOk: "Importación OK",
          importFail: "Fallo al importar",
          chooseName: "Elige un nombre",
          choosePass: "Escribe una frase clave",
          welcome: "¡Bienvenido/a a Shardwalk!",
          deepWater: "Agua profunda: no puedes pasar",
          newBiome: "Nuevo bioma: {biome}",
          spawned: "Aparece: {monster}",
          mining: "Minando PoW… toca Acción para cancelar",
          miningCancelled: "Minería cancelada",
          shrineClaimed: "¡Santuario reclamado!",
          rest: "Descansas junto a la hoguera",
          benchNeeded: "Necesitas un Banco de trabajo cerca",
          ruinsAlready: "Ya registraste estas ruinas",
          ruinsLoot: "Botín de ruinas: {loot}",
          needPickaxe: "Necesitas un Pico para minar",
          nothing: "Nada que hacer aquí",
          noEnemies: "No hay enemigos cerca",
          hit: "¡Golpe! -{dmg}",
          enemyDefeated: "Enemigo derrotado. Botín: {loot}",
          youFell: "Has caído… reapareces en el origen",
          notEnough: "No tienes materiales",
          equipped: "Equipado: {item}",
          placedShared: "Colocado (compartido): {item}",
          ateBerry: "Comes una baya",
          msgSent: "Mensaje enviado"
        },
        prompt: {
          signText: "Texto del cartel (máx 160):",
          signDefault: "El camino es largo; la esquirla guía.",
          chat: "Decir (P2P, efímero):",
          chatDefault: "¡Hola!"
        },
        quest: {
          cartoTitle: "Cartógrafo/a",
          cartoDesc: "Descubre {n} biomas nuevos (acumulado).",
          gatherTitle: "Supervivencia",
          gatherDesc: "Recolecta {n} recursos (árbol/roca/veta/hierbas/ruinas).",
          valorTitle: "Prueba de valor",
          valorDesc: "Derrota {n} enemigos.",
          shrineTitle: "Runa ancestral",
          shrineDesc: "Reclama {n} santuario (PoW).",
          benchTitle: "Carpintería",
          benchDesc: "Construye un Banco de trabajo (compartido).",
          toolTitle: "Herramientas",
          toolDesc: "Craftea una herramienta (Hacha o Pico)."
        }
      },

      fr: {
        ui: { close: "Fermer", language: "Langue" },
        hud: { room: "Salle", peers: "Joueurs", you: "Vous", weight: "Poids" },
        btn: { quests: "Quêtes", skills: "Compétences", craft: "Craft", world: "Monde", credits: "Crédits", export: "Exporter", import: "Importer", action: "Action (E)", attack: "Attaquer (␣)" },
        login: {
          tagline: "Monde isométrique procédural + survie + P2P (WebRTC) + registre signé (append-only).",
          shareHint: "(partagez le lien avec)",
          nameLabel: "Nom du personnage",
          passLabel: "Phrase secrète (reste sur l'appareil)",
          lifestyleLabel: "Style de vie",
          optionsLabel: "Options",
          enterWorld: "Entrer dans le monde",
          copyLink: "Copier le lien",
          controls: "Contrôles : WASD/Flèches, E action, Espace attaquer, Entrée chat",
          ledgerNote: "Le registre partagé est lisible par tous, mais personne ne peut signer à votre place—ils ne peuvent pas modifier ce qui vous appartient."
        },
        sel: { rememberNo: "Ne pas mémoriser", rememberYes: "Mémoriser (NON recommandé)" },
        life: {
          Explorer: "Explorateur (exploration + endurance)",
          Crafter: "Artisan (craft + construction)",
          Hunter: "Chasseur (combat + butin)",
          Scholar: "Savant (runes + savoir)",
          Merchant: "Marchand (social + utilité)",
          Mystic: "Mystique (rituels + nuit)"
        },
        modal: {
          language: "Langue", quests: "Quêtes (progression)", skills: "Compétences + Style", world: "Monde partagé (registre)",
          credits: "Crédits et licences", craft: "Craft (outils, équipement, construction)", sign: "Panneau",
          author: "Auteur", removeMine: "Retirer (vous seul)", summary: "Résumé", ranking: "Classement (sanctuaires)",
          tip: "Astuce : les objets partagés sont immuables ; seul le propriétaire peut les retirer (en signant).",
          recipesBasic: "Recettes (de base)", recipesAdv: "Avancé (établi requis à proximité)",
          materials: "Matériaux", currentEquip: "Équipement actuel", position: "Position"
        },
        common: { progress: "Progression", completed: "terminée", reward: "Récompense" },
        names: {
          biomes: { Water:"Eau", Swamp:"Marais", Forest:"Forêt", Grass:"Prairie", Stone:"Pierre", Sand:"Sable", Mount:"Montagnes", Snow:"Neige" },
          monsters: { Slime:"Gluant", Wolf:"Loup", Bandit:"Bandit", Wisp:"Feu follet" },
          items: {
            Axe:"Hache", Pickaxe:"Pioche", Campfire:"Feu de camp", Workbench:"Établi", Signpost:"Panneau",
            Spear:"Lance", Sword:"Épée", Cloak:"Cape", Leather:"Armure de cuir", Lantern:"Lanterne"
          },
          decor: { Tree:"Arbre", Rock:"Rocher", Bush:"Buisson", Ore:"Filon", Herb:"Herbes", Bones:"Os", Ruins:"Ruines", Shrine:"Sanctuaire" }
        },
        toast: {
          linkCopied: "Lien copié",
          p2pOffline: "P2P indisponible (hors-ligne + export/import)",
          importOk: "Import OK",
          importFail: "Échec de l'import",
          chooseName: "Choisissez un nom",
          choosePass: "Entrez une phrase secrète",
          welcome: "Bienvenue sur Shardwalk !",
          deepWater: "Eau profonde : impossible de passer",
          newBiome: "Nouveau biome : {biome}",
          spawned: "Apparition : {monster}",
          mining: "Minage PoW… touchez Action pour annuler",
          miningCancelled: "Minage annulé",
          shrineClaimed: "Sanctuaire revendiqué !",
          rest: "Vous vous reposez au feu de camp",
          benchNeeded: "Un établi est requis à proximité",
          ruinsAlready: "Vous avez déjà fouillé ces ruines",
          ruinsLoot: "Butin des ruines : {loot}",
          needPickaxe: "Il faut une pioche pour miner",
          nothing: "Rien à faire ici",
          noEnemies: "Aucun ennemi proche",
          hit: "Coup ! -{dmg}",
          enemyDefeated: "Ennemi vaincu. Butin : {loot}",
          youFell: "Vous êtes tombé… retour à l'origine",
          notEnough: "Matériaux insuffisants",
          equipped: "Équipé : {item}",
          placedShared: "Placée (partagée) : {item}",
          ateBerry: "Vous mangez une baie",
          msgSent: "Message envoyé"
        },
        prompt: {
          signText: "Texte du panneau (max 160) :",
          signDefault: "La route est longue — que l'éclat vous guide.",
          chat: "Dire (P2P, éphémère) :",
          chatDefault: "Salut !"
        },
        quest: {
          cartoTitle: "Cartographe",
          cartoDesc: "Découvrez {n} nouveaux biomes (cumulé).",
          gatherTitle: "Survie",
          gatherDesc: "Récoltez {n} ressources (arbre/rocher/filon/herbes/ruines).",
          valorTitle: "Épreuve de bravoure",
          valorDesc: "Vainquez {n} ennemis.",
          shrineTitle: "Rune ancestrale",
          shrineDesc: "Revendiquez {n} sanctuaire (PoW).",
          benchTitle: "Menuiserie",
          benchDesc: "Construisez un établi (partagé).",
          toolTitle: "Outils",
          toolDesc: "Fabriquez un outil (Hache ou Pioche)."
        }
      },

      zh: {
        ui: { close: "关闭", language: "语言" },
        hud: { room: "房间", peers: "玩家", you: "你", weight: "负重" },
        btn: { quests: "任务", skills: "技能", craft: "制作", world: "世界", credits: "鸣谢", export: "导出", import: "导入", action: "行动 (E)", attack: "攻击 (空格)" },
        login: {
          tagline: "程序生成等距世界 + 生存 + P2P（WebRTC）+ 签名追加式账本。",
          shareHint: "（用以下参数分享）",
          nameLabel: "角色名",
          passLabel: "口令（仅保存在本机）",
          lifestyleLabel: "生活方式",
          optionsLabel: "选项",
          enterWorld: "进入世界",
          copyLink: "复制链接",
          controls: "操作：WASD/方向键，E 行动，空格 攻击，回车 聊天",
          ledgerNote: "共享账本所有人可读，但没人能“替你签名”，因此无法篡改你的所有物。"
        },
        sel: { rememberNo: "不记住口令", rememberYes: "记住口令（不推荐）" },
        life: {
          Explorer: "探险者（探索+耐力）",
          Crafter: "工匠（制作+建造）",
          Hunter: "猎人（战斗+掉落）",
          Scholar: "学者（符文+知识）",
          Merchant: "商人（社交+实用）",
          Mystic: "秘术师（仪式+夜晚）"
        },
        modal: {
          language: "语言", quests: "任务（进度）", skills: "技能+风格", world: "共享世界（账本）",
          credits: "鸣谢与许可", craft: "制作（工具/装备/建造）", sign: "告示牌",
          author: "作者", removeMine: "移除（仅你）", summary: "概览", ranking: "排行（圣坛）",
          tip: "提示：共享物体不可更改；只有拥有者才能签名移除。",
          recipesBasic: "基础配方", recipesAdv: "高级（需附近有工作台）",
          materials: "材料", currentEquip: "当前装备", position: "位置"
        },
        common: { progress: "进度", completed: "已完成", reward: "奖励" },
        names: {
          biomes: { Water:"水域", Swamp:"沼泽", Forest:"森林", Grass:"草原", Stone:"石地", Sand:"沙地", Mount:"山地", Snow:"雪原" },
          monsters: { Slime:"史莱姆", Wolf:"狼", Bandit:"强盗", Wisp:"鬼火" },
          items: {
            Axe:"斧", Pickaxe:"镐", Campfire:"篝火", Workbench:"工作台", Signpost:"告示牌",
            Spear:"长矛", Sword:"剑", Cloak:"斗篷", Leather:"皮甲", Lantern:"灯笼"
          },
          decor: { Tree:"树", Rock:"岩石", Bush:"灌木", Ore:"矿脉", Herb:"草药", Bones:"骨骸", Ruins:"遗迹", Shrine:"圣坛" }
        },
        toast: {
          linkCopied: "链接已复制",
          p2pOffline: "P2P 不可用（离线 + 导出/导入）",
          importOk: "导入成功",
          importFail: "导入失败",
          chooseName: "请输入名字",
          choosePass: "请输入口令",
          welcome: "欢迎来到 Shardwalk！",
          deepWater: "深水：无法通过",
          newBiome: "发现新地形：{biome}",
          spawned: "出现：{monster}",
          mining: "正在挖矿 PoW… 点击行动取消",
          miningCancelled: "已取消",
          shrineClaimed: "已占领圣坛！",
          rest: "你在篝火旁休息",
          benchNeeded: "需要附近有工作台",
          ruinsAlready: "这里的遗迹已搜过",
          ruinsLoot: "遗迹战利品：{loot}",
          needPickaxe: "需要镐才能采矿",
          nothing: "这里没什么可做",
          noEnemies: "附近没有敌人",
          hit: "命中！-{dmg}",
          enemyDefeated: "击败敌人！战利品：{loot}",
          youFell: "你倒下了… 回到起点",
          notEnough: "材料不足",
          equipped: "已装备：{item}",
          placedShared: "已放置（共享）：{item}",
          ateBerry: "你吃了一颗莓果",
          msgSent: "消息已发送"
        },
        prompt: {
          signText: "告示牌内容（最多160）：",
          signDefault: "路途漫长，让碎片指引你。",
          chat: "说点什么（P2P，临时）：",
          chatDefault: "你好！"
        },
        quest: {
          cartoTitle: "制图师",
          cartoDesc: "累计发现 {n} 种新地形。",
          gatherTitle: "生存者",
          gatherDesc: "收集 {n} 次资源（树/石/矿/草药/遗迹）。",
          valorTitle: "勇气试炼",
          valorDesc: "击败 {n} 个敌人。",
          shrineTitle: "远古符文",
          shrineDesc: "占领 {n} 个圣坛（PoW）。",
          benchTitle: "木工",
          benchDesc: "建造一个工作台（共享）。",
          toolTitle: "工具",
          toolDesc: "制作一个工具（斧或镐）。"
        }
      },

      hi: {
        ui: { close: "बंद करें", language: "भाषा" },
        hud: { room: "कक्ष", peers: "खिलाड़ी", you: "आप", weight: "भार" },
        btn: { quests: "क्वेस्ट", skills: "स्किल्स", craft: "क्राफ्ट", world: "दुनिया", credits: "क्रेडिट्स", export: "एक्सपोर्ट", import: "इम्पोर्ट", action: "एक्शन (E)", attack: "अटैक (␣)" },
        login: {
          tagline: "प्रोसीजरल आइसोमेट्रिक दुनिया + सर्वाइवल + P2P (WebRTC) + साइन किया हुआ append-only लेजर।",
          shareHint: "(इस तरह शेयर करें)",
          nameLabel: "किरदार का नाम",
          passLabel: "पासफ़्रेज़ (डिवाइस पर ही रहता है)",
          lifestyleLabel: "लाइफस्टाइल",
          optionsLabel: "विकल्प",
          enterWorld: "दुनिया में प्रवेश",
          copyLink: "लिंक कॉपी",
          controls: "कंट्रोल: WASD/एरो, E एक्शन, स्पेस अटैक, एंटर चैट",
          ledgerNote: "शेयर किया हुआ लेजर सब पढ़ सकते हैं, लेकिन कोई भी आपके नाम से साइन नहीं कर सकता—इसलिए आपकी चीज़ें नहीं बदल सकता।"
        },
        sel: { rememberNo: "पासफ़्रेज़ याद न रखें", rememberYes: "पासफ़्रेज़ याद रखें (अनुशंसित नहीं)" },
        life: {
          Explorer: "एक्सप्लोरर (खोज + सहनशक्ति)",
          Crafter: "क्राफ्टर (क्राफ्ट + निर्माण)",
          Hunter: "हंटर (लड़ाई + लूट)",
          Scholar: "स्कॉलर (रून्स + ज्ञान)",
          Merchant: "मर्चेंट (सोशल + उपयोगिता)",
          Mystic: "मिस्टिक (रिचुअल + रात)"
        },
        modal: {
          language: "भाषा", quests: "क्वेस्ट (प्रगति)", skills: "स्किल्स + स्टाइल", world: "साझा दुनिया (लेजर)",
          credits: "क्रेडिट्स व लाइसेंस", craft: "क्राफ्ट (टूल/गियर/बिल्ड)", sign: "साइनबोर्ड",
          author: "लेखक", removeMine: "हटाएँ (सिर्फ आप)", summary: "सार", ranking: "रैंकिंग (श्राइन)",
          tip: "टिप: साझा ऑब्जेक्ट बदल नहीं सकते; केवल मालिक साइन करके हटा सकता है।",
          recipesBasic: "बेसिक रेसिपी", recipesAdv: "एडवांस (पास में वर्कबेंच चाहिए)",
          materials: "सामग्री", currentEquip: "वर्तमान उपकरण", position: "स्थिति"
        },
        common: { progress: "प्रगति", completed: "पूर्ण", reward: "इनाम" },
        names: {
          biomes: { Water:"पानी", Swamp:"दलदल", Forest:"जंगल", Grass:"घासभूमि", Stone:"पत्थर", Sand:"रेत", Mount:"पहाड़", Snow:"बर्फ" },
          monsters: { Slime:"स्लाइम", Wolf:"भेड़िया", Bandit:"डाकू", Wisp:"विस्प" },
          items: {
            Axe:"कुल्हाड़ी", Pickaxe:"कुदाल/पिक", Campfire:"अलाव", Workbench:"वर्कबेंच", Signpost:"साइनबोर्ड",
            Spear:"भाला", Sword:"तलवार", Cloak:"क्लोक", Leather:"चमड़े का कवच", Lantern:"लालटेन"
          },
          decor: { Tree:"पेड़", Rock:"चट्टान", Bush:"झाड़ी", Ore:"अयस्क", Herb:"जड़ी-बूटी", Bones:"हड्डियाँ", Ruins:"खंडहर", Shrine:"श्राइन" }
        },
        toast: {
          linkCopied: "लिंक कॉपी हुआ",
          p2pOffline: "P2P उपलब्ध नहीं (ऑफलाइन + एक्सपोर्ट/इम्पोर्ट)",
          importOk: "इम्पोर्ट OK",
          importFail: "इम्पोर्ट फेल",
          chooseName: "नाम चुनें",
          choosePass: "पासफ़्रेज़ लिखें",
          welcome: "Shardwalk में स्वागत है!",
          deepWater: "गहरा पानी: आगे नहीं जा सकते",
          newBiome: "नया बायोम: {biome}",
          spawned: "आ गया: {monster}",
          mining: "PoW माइनिंग… एक्शन दबाकर रद्द करें",
          miningCancelled: "रद्द किया",
          shrineClaimed: "श्राइन क्लेम हो गया!",
          rest: "आप अलाव के पास आराम करते हैं",
          benchNeeded: "पास में वर्कबेंच चाहिए",
          ruinsAlready: "ये खंडहर पहले ही खोजे गए",
          ruinsLoot: "खंडहर लूट: {loot}",
          needPickaxe: "अयस्क के लिए पिक चाहिए",
          nothing: "यहाँ कुछ नहीं",
          noEnemies: "पास में दुश्मन नहीं",
          hit: "हिट! -{dmg}",
          enemyDefeated: "दुश्मन हारा! लूट: {loot}",
          youFell: "आप गिर गए… शुरुआत पर लौटे",
          notEnough: "सामग्री कम है",
          equipped: "इक्विप: {item}",
          placedShared: "रखा गया (साझा): {item}",
          ateBerry: "आपने बेरी खाई",
          msgSent: "मैसेज भेजा"
        },
        prompt: {
          signText: "साइनबोर्ड टेक्स्ट (अधिकतम 160):",
          signDefault: "रास्ता लंबा है—शार्ड रास्ता दिखाए।",
          chat: "कहें (P2P, अस्थायी):",
          chatDefault: "नमस्ते!"
        },
        quest: {
          cartoTitle: "मानचित्रकार",
          cartoDesc: "{n} नए बायोम खोजें (कुल).",
          gatherTitle: "सर्वाइवल",
          gatherDesc: "{n} संसाधन इकट्ठा करें (पेड़/चट्टान/अयस्क/जड़ी-बूटी/खंडहर).",
          valorTitle: "साहस परीक्षा",
          valorDesc: "{n} दुश्मनों को हराएँ.",
          shrineTitle: "प्राचीन रूण",
          shrineDesc: "{n} श्राइन क्लेम करें (PoW).",
          benchTitle: "कारपेंट्री",
          benchDesc: "वर्कबेंच बनाएँ (साझा).",
          toolTitle: "टूल्स",
          toolDesc: "एक टूल बनाएँ (कुल्हाड़ी या पिक)."
        }
      },

      ca: {
        ui: { close: "Tanca", language: "Idioma" },
        hud: { room: "Sala", peers: "Jugadors", you: "Tu", weight: "Pes" },
        btn: { quests: "Quests", skills: "Skills", craft: "Craft", world: "Món", credits: "Crèdits", export: "Export", import: "Import", action: "Acció (E)", attack: "Atacar (␣)" },
        login: {
          tagline: "Món isomètric procedural + supervivència + P2P (WebRTC) + ledger signat (append-only).",
          shareHint: "(comparteix l’enllaç amb)",
          nameLabel: "Nom de personatge",
          passLabel: "Clau de pas (no surt del dispositiu)",
          lifestyleLabel: "Estil de vida",
          optionsLabel: "Opcions",
          enterWorld: "Entrar al món",
          copyLink: "Copia link",
          controls: "Controls: WASD/Fletxes, E acció, Espai atacar, Enter xat",
          ledgerNote: "El ledger compartit és llegible per tothom, però ningú pot “signar com tu”: no poden modificar el que és teu."
        },
        sel: { rememberNo: "No recordar clau", rememberYes: "Recordar clau (NO recomanat)" },
        life: {
          Explorer: "Explorer (exploració + resistència)",
          Crafter: "Crafter (crafting + construcció)",
          Hunter: "Hunter (combat + loot)",
          Scholar: "Scholar (runes + coneixement)",
          Merchant: "Merchant (social + utilitat)",
          Mystic: "Mystic (rituals + nit)"
        },
        modal: {
          language: "Idioma", quests: "Quests (progrés)", skills: "Skills + Lifestyle", world: "Món compartit (ledger)",
          credits: "Crèdits i llicències", craft: "Craft (eines, equips, construcció)", sign: "Cartell",
          author: "Autor", removeMine: "Eliminar (només tu)", summary: "Resum", ranking: "Rànquing (santuaris)",
          tip: "Tip: els objectes compartits són inmutables; només el propietari els pot retirar (signant).",
          recipesBasic: "Receptes (bàsiques)", recipesAdv: "Avançat (requereix Banc de Treball a prop)",
          materials: "Materials", currentEquip: "Equip actual", position: "Posició"
        },
        common: { progress: "Progrés", completed: "completada", reward: "Recompensa" },
        names: {
          biomes: { Water:"Aigua", Swamp:"Pantà", Forest:"Bosc", Grass:"Prat", Stone:"Pedra", Sand:"Sorra", Mount:"Muntanya", Snow:"Neu" },
          monsters: { Slime:"Slime", Wolf:"Llop", Bandit:"Bandit", Wisp:"Foc follet" },
          items: {
            Axe:"Destral", Pickaxe:"Pic", Campfire:"Foguera", Workbench:"Banc de Treball", Signpost:"Cartell",
            Spear:"Llança", Sword:"Espasa", Cloak:"Capa", Leather:"Armadura de cuir", Lantern:"Llanterna"
          },
          decor: { Tree:"Arbre", Rock:"Roca", Bush:"Arbust", Ore:"Veta", Herb:"Herbes", Bones:"Restes", Ruins:"Ruïnes", Shrine:"Santuari" }
        },
        toast: {
          linkCopied: "Link copiat",
          p2pOffline: "P2P no disponible (offline + export/import)",
          importOk: "Import OK",
          importFail: "Import fallit",
          chooseName: "Tria un nom",
          choosePass: "Escriu una clau de pas",
          welcome: "Benvingut/da a Shardwalk!",
          deepWater: "Aigua profunda: no pots passar",
          newBiome: "Nou biome: {biome}",
          spawned: "Apareix: {monster}",
          mining: "Minant PoW… toca Acció per cancel·lar",
          miningCancelled: "Mining cancel·lat",
          shrineClaimed: "Santuari reclamat!",
          rest: "Descanses a la foguera",
          benchNeeded: "Necessites un Banc de Treball a prop",
          ruinsAlready: "Ja has escorcollat aquestes ruïnes",
          ruinsLoot: "Loot de ruïnes: {loot}",
          needPickaxe: "Necessites un Pic per minar",
          nothing: "Res a fer aquí",
          noEnemies: "No hi ha enemics a prop",
          hit: "Cop! -{dmg}",
          enemyDefeated: "Enemic derrotat! Loot: {loot}",
          youFell: "Has caigut… reapareixes a l'origen",
          notEnough: "No tens materials",
          equipped: "Equipat: {item}",
          placedShared: "Col·locat (compartit): {item}",
          ateBerry: "Menges una baia",
          msgSent: "Missatge enviat"
        },
        prompt: {
          signText: "Text del cartell (max 160):",
          signDefault: "El camí és llarg; la shard guia.",
          chat: "Dir (P2P, efímer):",
          chatDefault: "Hola!"
        },
        quest: {
          cartoTitle: "Cartògraf/a",
          cartoDesc: "Descobreix {n} biomes nous (acumulat).",
          gatherTitle: "Supervivència",
          gatherDesc: "Recol·lecta {n} recursos (arbre/roca/veta/herbes/ruïnes).",
          valorTitle: "Prova de Valor",
          valorDesc: "Derrota {n} enemics.",
          shrineTitle: "Runa Ancestral",
          shrineDesc: "Reclama {n} santuari (PoW).",
          benchTitle: "Fusteria",
          benchDesc: "Construeix un Banc de Treball (compartit).",
          toolTitle: "Eines",
          toolDesc: "Crafteja una eina (Destral o Pic)."
        }
      }
    };

    const LANGS = [
      { code:"en", label:"English", flag: FLAG.en },
      { code:"zh", label:"中文",    flag: FLAG.zh },
      { code:"hi", label:"हिन्दी", flag: FLAG.hi },
      { code:"es", label:"Español",flag: FLAG.es },
      { code:"fr", label:"Français",flag: FLAG.fr },
      { code:"ca", label:"Català", flag: FLAG.ca }
    ];

    function deepGet(obj, path){
      return path.split(".").reduce((o,k)=> (o && o[k] != null) ? o[k] : null, obj);
    }

    function t(key, vars){
      const lang = I18N[currentLang] || I18N.en;
      let s = deepGet(lang, key) ?? deepGet(I18N.en, key) ?? key;
      if (vars){
        s = s.replace(/\{(\w+)\}/g, (_,k)=> (vars[k] != null ? String(vars[k]) : `{${k}}`));
      }
      return s;
    }

    function applyI18n(){
      document.querySelectorAll("[data-i18n]").forEach(el=>{
        el.textContent = t(el.getAttribute("data-i18n"));
      });
    }

    function renderLifestyleOptions(){
      const lifeEl = document.getElementById("life");
      const keys = ["Explorer","Crafter","Hunter","Scholar","Merchant","Mystic"];
      lifeEl.innerHTML = keys.map(k=> `<option value="${k}">${escapeHtml(t("life."+k))}</option>`).join("");
    }

    function renderRememberOptions(){
      const rememberEl = document.getElementById("remember");
      rememberEl.innerHTML = `
        <option value="0">${escapeHtml(t("sel.rememberNo"))}</option>
        <option value="1">${escapeHtml(t("sel.rememberYes"))}</option>
      `;
    }

    function renderLangPicker(containerId){
      const el = document.getElementById(containerId);
      el.innerHTML = LANGS.map(L => `
        <button class="langbtn" data-lang="${L.code}" aria-pressed="${L.code===currentLang}" title="${escapeHtml(L.label)}" aria-label="${escapeHtml(L.label)}">
          <img class="flag" src="${L.flag}" alt="${escapeHtml(L.label)}" />
        </button>
      `).join("");

      el.querySelectorAll("button[data-lang]").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          setLanguage(btn.getAttribute("data-lang"));
          // refresh pressed state
          renderLangPicker(containerId);
        });
      });
    }

    function setLanguage(lang){
      if (!I18N[lang]) lang = "en";
      currentLang = lang;
      localStorage.setItem("sw_lang", currentLang);
      document.documentElement.lang = currentLang;
      document.title = GAME_TITLE;

      // flag on HUD button
      const langIcon = document.getElementById("langIcon");
      if (langIcon) langIcon.src = FLAG[currentLang];

      applyI18n();
      renderLifestyleOptions();
      renderRememberOptions();

      // refresh dynamic labels
      refreshHud();
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      })[c]);
    }

    // initial language
    let currentLang = (new URLSearchParams(location.search).get("lang") || localStorage.getItem("sw_lang") || "").toLowerCase();
    if (!I18N[currentLang]){
      const nav = (navigator.language || "en").toLowerCase();
      if (nav.startsWith("ca")) currentLang = "ca";
      else if (nav.startsWith("es")) currentLang = "es";
      else if (nav.startsWith("fr")) currentLang = "fr";
      else if (nav.startsWith("zh")) currentLang = "zh";
      else if (nav.startsWith("hi")) currentLang = "hi";
      else currentLang = "en";
    }

    // ============================================================
    // Existing game code (unchanged logic) + translated strings
    // ============================================================
    const te = new TextEncoder();

    const toastEl = document.getElementById("toast");
    function toast(msg, ms=1200){
      toastEl.textContent = msg;
      toastEl.style.display = "block";
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(()=> toastEl.style.display="none", ms);
    }

    function u8cat(a,b){
      const out = new Uint8Array(a.length + b.length);
      out.set(a,0); out.set(b,a.length);
      return out;
    }

    function toBase64(u8){
      let s = "";
      const chunk = 0x8000;
      for (let i=0; i<u8.length; i+=chunk){
        s += String.fromCharCode(...u8.subarray(i, i+chunk));
      }
      return btoa(s);
    }
    function fromBase64(b64){
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i=0; i<bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }

    function stableStringify(obj){ return JSON.stringify(sortKeys(obj)); }
    function sortKeys(x){
      if (x === null || typeof x !== "object") return x;
      if (Array.isArray(x)) return x.map(sortKeys);
      const out = {};
      for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
      return out;
    }

    function hashHexFromBodyAndSig(bodyStr, sigU8){
      const msgU8 = te.encode(bodyStr);
      return bytesToHex(sha256(u8cat(msgU8, sigU8)));
    }

    function randCode(){ return Math.random().toString(36).slice(2, 8); }
    function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
    function mod(n,m){ return ((n%m)+m)%m; }

    function seedU32FromStr(str){
      const b = sha256(te.encode(str));
      return ((b[0]<<24) | (b[1]<<16) | (b[2]<<8) | (b[3])) >>> 0;
    }

    function hash2D01(seedU32, x, y){
      let h = (seedU32 ^ (x * 374761393) ^ (y * 668265263)) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      h = (h ^ (h >>> 16)) >>> 0;
      return h / 4294967296;
    }

    // Room
    const params = new URLSearchParams(location.search);
    const roomId = params.get("room") || localStorage.getItem("sw_last_room") || randCode();
    localStorage.setItem("sw_last_room", roomId);
    document.getElementById("roomLabel").textContent = roomId;

    // Modal
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    document.getElementById("closeModal").onclick = () => modal.style.display = "none";
    modal.addEventListener("click", (e)=>{ if (e.target === modal) modal.style.display = "none"; });
    function showModal(title, html){
      modalTitle.textContent = title;
      modalBody.innerHTML = html;
      modal.style.display = "flex";
    }

    // Language modal (any time)
    document.getElementById("btnLang").onclick = () => {
      showModal(t("modal.language"), `
        <div class="card" style="display:flex;gap:8px;flex-wrap:wrap">
          ${LANGS.map(L=>`
            <button class="langbtn" data-lang="${L.code}">
              <img class="flag" src="${L.flag}" alt="${escapeHtml(L.label)}" />
              <span>${escapeHtml(L.label)}</span>
            </button>
          `).join("")}
        </div>
      `);
      setTimeout(()=>{
        modalBody.querySelectorAll("button[data-lang]").forEach(b=>{
          b.onclick = ()=> {
            setLanguage(b.getAttribute("data-lang"));
            modal.style.display = "none";
          };
        });
      },0);
    };

    // Copy link
    document.getElementById("copyLink").onclick = async () => {
      const url = new URL(location.href);
      url.searchParams.set("room", roomId);
      await navigator.clipboard.writeText(url.toString());
      toast(t("toast.linkCopied"));
    };

    // Identity
    const loginEl = document.getElementById("login");
    const nameEl = document.getElementById("name");
    const passEl = document.getElementById("pass");
    const lifeEl = document.getElementById("life");
    const rememberEl = document.getElementById("remember");

    const lastName = localStorage.getItem(`sw_${roomId}_name`) || `Traveler-${randCode()}`;
    const lastLife = localStorage.getItem(`sw_${roomId}_life`) || "Explorer";
    nameEl.value = lastName;

    // Shared ledger
    const LEDGER_KEY = `sw_${roomId}_ledger_v2`;
    const LOCAL_KEY = (pub) => `sw_${roomId}_local_v2_${pub}`;

    function loadLedgerRaw(){
      try { return JSON.parse(localStorage.getItem(LEDGER_KEY) || "null"); }
      catch { return null; }
    }
    function saveLedgerRaw(raw){
      localStorage.setItem(LEDGER_KEY, JSON.stringify(raw));
    }
    function loadLocal(pub){
      try { return JSON.parse(localStorage.getItem(LOCAL_KEY(pub)) || "null"); }
      catch { return null; }
    }
    function saveLocal(pub, obj){
      localStorage.setItem(LOCAL_KEY(pub), JSON.stringify(obj));
    }

    const ledger = {
      raw: loadLedgerRaw() || { v:1, room: roomId, authors: {} },
      byId: new Map(),
      byAuthor: new Map(),
      profiles: new Map(),
      objects: new Map(),
      objectsByPos: new Map(),
      shrineClaims: new Map(),
      score: new Map()
    };

    function powHashHex(shrineId, pubB64, nonceStr){
      const u8 = te.encode(`pow:${shrineId}:${pubB64}:${nonceStr}`);
      return bytesToHex(sha256(u8));
    }
    function meetsPowBits(hexHash, bits){
      const fullNibbles = Math.floor(bits / 4);
      const remBits = bits % 4;
      for (let i=0; i<fullNibbles; i++){
        if (hexHash[i] !== "0") return false;
      }
      if (remBits === 0) return true;
      const nibble = parseInt(hexHash[fullNibbles], 16);
      return (nibble >> (4 - remBits)) === 0;
    }

    function verifyEventBasic(ev){
      try {
        if (!ev || ev.v !== 1 || ev.room !== roomId) return { ok:false };
        if (!ev.author || !ev.sig || !ev.id) return { ok:false };

        const sigU8 = fromBase64(ev.sig);
        const pubU8 = fromBase64(ev.author);
        const { id, sig, ...body } = ev;
        const bodyStr = stableStringify(body);
        const id2 = hashHexFromBodyAndSig(bodyStr, sigU8);
        if (id2 !== ev.id) return { ok:false };

        const msgU8 = te.encode(bodyStr);
        const okSig = nacl.sign.detached.verify(msgU8, sigU8, pubU8);
        if (!okSig) return { ok:false };

        if (ev.type === "PROFILE"){
          const p = ev.payload || {};
          if (!p.name || !p.lifestyle) return { ok:false };
        }
        if (ev.type === "PLACE_OBJECT"){
          const p = ev.payload || {};
          if (!p.objectId || !p.kind) return { ok:false };
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return { ok:false };
        }
        if (ev.type === "REMOVE_OBJECT"){
          const p = ev.payload || {};
          if (!p.objectId) return { ok:false };
        }
        if (ev.type === "CLAIM_SHRINE"){
          const p = ev.payload || {};
          if (!p.shrineId || !p.powNonce || !p.powHash) return { ok:false };
          const bits = clamp(p.powBits|0, 8, 22);
          const chk = powHashHex(p.shrineId, ev.author, String(p.powNonce));
          if (chk !== String(p.powHash)) return { ok:false };
          if (!meetsPowBits(chk, bits)) return { ok:false };
        }
        return { ok:true };
      } catch { return { ok:false }; }
    }

    function rebuildLedgerIndexes(){
      ledger.byId.clear();
      ledger.byAuthor.clear();
      ledger.profiles.clear();
      ledger.objects.clear();
      ledger.objectsByPos.clear();
      ledger.shrineClaims.clear();
      ledger.score.clear();

      const cleanedAuthors = {};
      for (const [pub, eventsRaw] of Object.entries(ledger.raw.authors || {})){
        const arr = Array.isArray(eventsRaw) ? eventsRaw.slice() : [];
        arr.sort((a,b)=> (a.seq-b.seq));
        const st = { events: [], headId: null, seq: -1 };
        for (const ev of arr){
          if (!ev || ev.author !== pub) continue;
          const v = verifyEventBasic(ev);
          if (!v.ok) continue;
          if ((ev.seq|0) !== st.seq + 1) continue;
          if ((ev.prev||null) !== (st.headId||null)) continue;

          st.events.push(ev);
          st.seq = ev.seq|0;
          st.headId = ev.id;
          ledger.byId.set(ev.id, ev);
        }
        if (st.events.length){
          ledger.byAuthor.set(pub, st);
          cleanedAuthors[pub] = st.events;
        }
      }
      ledger.raw.authors = cleanedAuthors;

      const allEvents = [];
      for (const st of ledger.byAuthor.values()) for (const ev of st.events) allEvents.push(ev);

      for (const ev of allEvents){
        if (ev.type === "PROFILE"){
          const p = ev.payload || {};
          if (!ledger.profiles.has(ev.author)){
            ledger.profiles.set(ev.author, { name: String(p.name||"").slice(0,18), lifestyle: String(p.lifestyle||"Explorer") });
          }
        }
        if (ev.type === "PLACE_OBJECT"){
          const p = ev.payload || {};
          const objectId = p.objectId;
          if (!objectId) continue;
          if (!ledger.objects.has(objectId)){
            ledger.objects.set(objectId, {
              kind: p.kind, x: p.x|0, y: p.y|0, text: (p.text ? String(p.text).slice(0,160) : ""),
              ownerPub: ev.author, removed: false
            });
          }
        }
        if (ev.type === "REMOVE_OBJECT"){
          const p = ev.payload || {};
          const obj = ledger.objects.get(p.objectId);
          if (obj && obj.ownerPub === ev.author) obj.removed = true;
        }
      }

      for (const obj of ledger.objects.values()){
        if (!obj || obj.removed) continue;
        const k = `${obj.x},${obj.y}`;
        if (!ledger.objectsByPos.has(k)) ledger.objectsByPos.set(k, []);
        ledger.objectsByPos.get(k).push(obj);
      }

      for (const ev of allEvents){
        if (ev.type !== "CLAIM_SHRINE") continue;
        const p = ev.payload || {};
        if (!p.shrineId || !p.powHash) continue;
        const cur = ledger.shrineClaims.get(p.shrineId);
        if (!cur || String(p.powHash) < String(cur.bestPowHash)){
          ledger.shrineClaims.set(p.shrineId, { bestPowHash:String(p.powHash), bestEventId:ev.id, pub:ev.author, x:p.x|0, y:p.y|0 });
        }
      }
      for (const win of ledger.shrineClaims.values()){
        ledger.score.set(win.pub, (ledger.score.get(win.pub) || 0) + 1);
      }
    }

    rebuildLedgerIndexes();

    function getAuthorState(pub){
      if (!ledger.byAuthor.has(pub)) ledger.byAuthor.set(pub, { events: [], headId: null, seq: -1 });
      return ledger.byAuthor.get(pub);
    }

    function appendEventToLedger(ev){
      const st = getAuthorState(ev.author);
      if (ev.seq !== st.seq + 1) return false;
      if ((st.headId || null) !== (ev.prev || null)) return false;
      st.events.push(ev);
      st.seq = ev.seq;
      st.headId = ev.id;
      if (!ledger.raw.authors[ev.author]) ledger.raw.authors[ev.author] = [];
      ledger.raw.authors[ev.author].push(ev);
      ledger.byId.set(ev.id, ev);
      return true;
    }

    let ledgerSaveTimer = null;
    function saveLedgerDebounced(){
      if (ledgerSaveTimer) return;
      ledgerSaveTimer = setTimeout(()=>{
        ledgerSaveTimer = null;
        saveLedgerRaw(ledger.raw);
      }, 200);
    }

    // P2P
    const APP_ID = "shardwalk-iso";
    const relayUrls = [
      "wss://tracker.openwebtorrent.com",
      "wss://tracker.webtorrent.dev",
      "wss://tracker.novage.com.ua"
    ];

    let room = null;
    let net = { enabled: false, peerCount: 0 };
    let sendHello, getHello;
    let sendMove,  getMove;
    let sendEv,    getEv;
    let sendGet,   getGet;
    let sendBatch, getBatch;
    let sendSay,   getSay;

    function headsSummary(){
      const heads = {};
      for (const [pub, st] of ledger.byAuthor.entries()) heads[pub] = st.seq;
      return heads;
    }

    // World gen
    const worldSeedU32 = seedU32FromStr(`world:${roomId}`);
    const BIOMES = [
      { id:"Water", key:"t_water" },
      { id:"Swamp", key:"t_swamp" },
      { id:"Forest",key:"t_forest" },
      { id:"Grass", key:"t_grass" },
      { id:"Stone", key:"t_stone" },
      { id:"Sand",  key:"t_sand" },
      { id:"Mount", key:"t_mount" },
      { id:"Snow",  key:"t_snow" }
    ];

    function biomeAt(tx, ty){
      const n = hash2D01(worldSeedU32, tx, ty);
      if (n < 0.12) return "Water";
      if (n < 0.22) return "Swamp";
      if (n < 0.38) return "Forest";
      if (n < 0.52) return "Grass";
      if (n < 0.66) return "Stone";
      if (n < 0.78) return "Sand";
      if (n < 0.90) return "Mount";
      return "Snow";
    }

    function decorAt(tx, ty, biome){
      const r0 = hash2D01(worldSeedU32 ^ 0xA5A5A5A5, tx, ty);
      if (biome !== "Water" && r0 < 0.0018) return "Ruins";

      const r = hash2D01(worldSeedU32 ^ 0x9e3779b9, tx, ty);
      if ((biome === "Stone" || biome === "Mount") && r < 0.12) return "Ore";
      if ((biome === "Grass" || biome === "Forest" || biome === "Swamp") && r < 0.10) return "Herb";
      if (biome === "Sand" && r < 0.08) return "Bones";
      if (biome === "Forest" && r < 0.22) return "Tree";
      if ((biome === "Stone" || biome === "Mount") && r < 0.22) return "Rock";
      if ((biome === "Grass" || biome === "Swamp") && r < 0.18) return "Bush";
      return null;
    }

    function shrineAt(tx, ty, biome){
      if (biome === "Water") return null;
      const r = hash2D01(worldSeedU32 ^ 0xBADC0FFE, tx, ty);
      if (r < 0.0055) {
        const shrineId = bytesToHex(sha256(te.encode(`shrine:${roomId}:${tx}:${ty}`)));
        return { shrineId, x: tx|0, y: ty|0 };
      }
      return null;
    }

    function tileKeyFromBiome(b){
      const entry = BIOMES.find(x=> x.id === b);
      return entry ? entry.key : "t_grass";
    }

    // Lifestyle + local state
    const LIFESTYLES = {
      Explorer: { mult: {Athletics:1.25, Survival:1.20, Lore:1.00, Crafting:1.00, Combat:1.00, Gathering:1.10}, start:{wood:1, stone:0, berry:2, fiber:1} },
      Crafter:  { mult: {Crafting:1.35, Gathering:1.20, Athletics:1.00, Survival:1.00, Combat:0.95, Lore:1.00}, start:{wood:3, stone:1, berry:0, fiber:0} },
      Hunter:   { mult: {Combat:1.35, Survival:1.15, Athletics:1.05, Crafting:0.95, Gathering:1.05}, start:{wood:1, stone:1, berry:1, hide:1} },
      Scholar:  { mult: {Lore:1.40, Crafting:1.05, Survival:0.95, Combat:0.90, Gathering:1.00}, start:{wood:0, stone:0, berry:3, shard:0} },
      Merchant: { mult: {Social:1.45, Crafting:1.05, Athletics:1.00, Survival:1.00}, start:{wood:2, stone:0, berry:1, fiber:1} },
      Mystic:   { mult: {Lore:1.25, Survival:1.05, Combat:1.00, Crafting:1.00, Gathering:1.00}, start:{wood:0, stone:1, berry:2, shard:0} }
    };

    function skillLevel(xp){ return Math.floor(Math.sqrt(Math.max(0, xp) / 110)); }

    function calcWeight(m){
      return (m.wood||0)*1 + (m.stone||0)*2 + (m.ore||0)*2 + (m.fiber||0)*1 + (m.hide||0)*1 + (m.berry||0)*0.5 + (m.shard||0)*0.2;
    }
    function calcCapacity(){
      const ath = skillLevel(local.skills.Athletics||0);
      return 30 + ath*6;
    }

    let me = { name:"", lifestyle:"Explorer", pub:"", secretKey:null, peerId:(selfId||"").slice(0,8) };
    let local = null;

    function defaultLocalState(){
      return {
        v:2,
        player: { x: 0, y: 0 },
        stats: { hp:100, stamina:100, hunger:0 },
        mats: { wood:0, stone:0, ore:0, fiber:0, hide:0, shard:0, berry:0 },
        equip: { tool:null, weapon:null, armor:null, accessory:null },
        skills: { Athletics:0, Survival:0, Gathering:0, Crafting:0, Combat:0, Lore:0, Social:0 },
        quests: { done: 0, active: [] },
        discovered: { biomes: {}, ruins: {} },
        meta: { lastTick: Date.now() },
        _kit: false
      };
    }

    function persistLocalDebounced(){
      clearTimeout(persistLocalDebounced._t);
      persistLocalDebounced._t = setTimeout(()=> saveLocal(me.pub, local), 200);
    }

    function addXp(skill, amount){
      const mult = (LIFESTYLES[me.lifestyle]?.mult?.[skill] ?? 1.0);
      local.skills[skill] = (local.skills[skill] || 0) + Math.round(amount * mult);
    }

    // Translation helpers for game nouns
    function trBiome(b){ return t("names.biomes."+b); }
    function trMonster(k){ return t("names.monsters."+k); }
    function trItemName(k){ return t("names.items."+k) || k; }

    // Quests
    function generateQuests(){
      const base = seedU32FromStr(`quests:${roomId}:${me.pub}:${local.quests.done}`);
      const qs = [];
      qs.push({ id:`QEXP-${base}`, title:t("quest.cartoTitle"), desc:t("quest.cartoDesc",{n:4}), kind:"EXPLORE_BIOMES", need:4, prog:0, reward:{ berry:2, fiber:1 } });
      qs.push({ id:`QGAT-${base^0x1234}`, title:t("quest.gatherTitle"), desc:t("quest.gatherDesc",{n:12}), kind:"GATHER", need:12, prog:0, reward:{ wood:2, stone:1 } });
      qs.push({ id:`QKILL-${base^0xBEEF}`, title:t("quest.valorTitle"), desc:t("quest.valorDesc",{n:4}), kind:"DEFEAT", need:4, prog:0, reward:{ hide:2, berry:1 } });

      const pick = base % 3;
      qs.push(pick===0
        ? { id:`QSHR-${base^0xCAFE}`, title:t("quest.shrineTitle"), desc:t("quest.shrineDesc",{n:1}), kind:"CLAIM_SHRINE", need:1, prog:0, reward:{ shard:1, ore:1 } }
        : pick===1
          ? { id:`QWBN-${base^0xCAFE}`, title:t("quest.benchTitle"), desc:t("quest.benchDesc"), kind:"PLACE_WORKBENCH", need:1, prog:0, reward:{ ore:1, fiber:1 } }
          : { id:`QTL-${base^0xCAFE}`, title:t("quest.toolTitle"), desc:t("quest.toolDesc"), kind:"CRAFT_TOOL", need:1, prog:0, reward:{ wood:2, stone:1 } }
      );

      local.quests.active = qs;
      persistLocalDebounced();
    }

    function questProgress(kind, amount=1){
      for (const q of local.quests.active){
        if (q.kind !== kind) continue;
        q.prog = clamp(q.prog + amount, 0, q.need);
      }
      checkQuestComplete();
    }

    function checkQuestComplete(){
      let completedAny = false;
      for (const q of local.quests.active){
        if (q.prog >= q.need && !q._done){
          q._done = true;
          completedAny = true;
          for (const [k,v] of Object.entries(q.reward || {})){
            if (local.mats[k] != null) local.mats[k] += v;
          }
          toast(`${t("btn.quests")}: ${q.title}`);
        }
      }
      if (completedAny){
        local.quests.done += 1;
        generateQuests();
      }
      persistLocalDebounced();
      refreshHud();
    }

    // Signed events
    async function createSignedEvent(type, payload){
      const st = getAuthorState(me.pub);
      const body = { v:1, room:roomId, type, author:me.pub, seq:st.seq+1, prev:st.headId, time:Date.now(), payload };
      const bodyStr = stableStringify(body);
      const msgU8 = te.encode(bodyStr);
      const sigU8 = nacl.sign.detached(msgU8, me.secretKey);
      const sigB64 = toBase64(sigU8);
      const id = hashHexFromBodyAndSig(bodyStr, sigU8);
      return { ...body, sig:sigB64, id };
    }

    async function minePow(shrineId, bits, cancelRef){
      let nonce = 0;
      while (true){
        if (cancelRef.cancel) throw new Error("cancel");
        const h = powHashHex(shrineId, me.pub, String(nonce));
        if (meetsPowBits(h, bits)) return { nonce: String(nonce), hash: h };
        nonce++;
        if (nonce % 650 === 0) await new Promise(requestAnimationFrame);
      }
    }

    function publishEvent(ev){
      const v = verifyEventBasic(ev);
      if (!v.ok){ toast("Event invalid"); return; }
      const ok = appendEventToLedger(ev);
      if (!ok){ toast("Event out-of-order"); return; }
      saveLedgerDebounced();
      rebuildLedgerIndexes();
      repaintVisible();
      refreshHud();
      if (net.enabled) sendEv(ev);
    }

    // Phaser (isometric)
    const TILE_W = 64, TILE_H = 32, VIEW_W = 19, VIEW_H = 19;

    function isoToScreenTop(tx, ty){
      return { x: (tx - ty) * (TILE_W / 2), y: (tx + ty) * (TILE_H / 2) };
    }

    const touch = { up:false, down:false, left:false, right:false };
    function bindPad(id, setFn){
      const b = document.getElementById(id);
      b.addEventListener("pointerdown", ()=> setFn(true));
      b.addEventListener("pointerup", ()=> setFn(false));
      b.addEventListener("pointerout", ()=> setFn(false));
      b.addEventListener("pointercancel", ()=> setFn(false));
    }
    bindPad("btnUp",   v => touch.up = v);
    bindPad("btnDown", v => touch.down = v);
    bindPad("btnLeft", v => touch.left = v);
    bindPad("btnRight",v => touch.right = v);

    function getMoveDir(keys){
      const up    = keys.UP.isDown   || keys.W.isDown || touch.up;
      const down  = keys.DOWN.isDown || keys.S.isDown || touch.down;
      const left  = keys.LEFT.isDown || keys.A.isDown || touch.left;
      const right = keys.RIGHT.isDown|| keys.D.isDown || touch.right;

      let dx=0, dy=0;
      if (up)    { dx -= 1; dy -= 1; }
      if (down)  { dx += 1; dy += 1; }
      if (left)  { dx -= 1; dy += 1; }
      if (right) { dx += 1; dy -= 1; }
      if (dx !== 0 && dy !== 0) return {dx,dy};
      if (dx !== 0) return {dx,dy:0};
      if (dy !== 0) return {dx:0,dy};
      return {dx:0,dy:0};
    }

    function makeDiamondTexture(scene, key, w, h, fill){
      const g = scene.make.graphics({x:0,y:0,add:false});
      g.fillStyle(fill, 1);
      g.lineStyle(2, 0x000000, 0.25);
      g.beginPath();
      g.moveTo(w/2, 0); g.lineTo(w, h/2); g.lineTo(w/2, h); g.lineTo(0, h/2);
      g.closePath();
      g.fillPath(); g.strokePath();
      g.generateTexture(key, w, h);
      g.destroy();
    }
    function makeRectTexture(scene, key, w, h, fill){
      const g = scene.make.graphics({x:0,y:0,add:false});
      g.fillStyle(fill, 1);
      g.fillRoundedRect(0, 0, w, h, 7);
      g.lineStyle(2, 0x000000, 0.25);
      g.strokeRoundedRect(0, 0, w, h, 7);
      g.generateTexture(key, w, h);
      g.destroy();
    }
    function makeIcon(scene, key, w, h, fill, stroke=0x000000){
      const g = scene.make.graphics({x:0,y:0,add:false});
      g.fillStyle(fill, 1);
      g.lineStyle(2, stroke, 0.35);
      g.fillRoundedRect(0,0,w,h,8);
      g.strokeRoundedRect(0,0,w,h,8);
      g.lineStyle(2, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(w*0.20,h*0.58); g.lineTo(w*0.50,h*0.22); g.lineTo(w*0.80,h*0.58); g.lineTo(w*0.50,h*0.82);
      g.closePath();
      g.strokePath();
      g.generateTexture(key,w,h);
      g.destroy();
    }

    let gameScene = null;
    let tileSprites = [];
    let decorSprites = [];
    let worldObjectSprites = new Map();
    let remotePlayers = new Map();
    let centerTile = { x: 0, y: 0 };
    let lastMoveAt = 0;
    let stepCount = 0;

    const monsters = new Map();
    function monsterId(tx,ty,step){ return `m:${tx}:${ty}:${step}`; }

    function isNight(){
      const t0 = Math.floor(Date.now()/1000);
      const cycle = 240;
      const phase = (t0 % cycle) / cycle;
      return (phase > 0.62 || phase < 0.10);
    }

    function nightAlpha(){
      const t0 = Math.floor(Date.now()/1000);
      const cycle = 240;
      const phase = (t0 % cycle) / cycle;
      const d = Math.sin((phase * Math.PI * 2) - Math.PI/2);
      const base = clamp((d + 1) / 2, 0, 1);
      let a = base * 0.55;
      if (local?.equip?.accessory === "Lantern") a *= 0.55;
      return a;
    }

    class Main extends Phaser.Scene {
      constructor(){ super("Main"); }
      create(){
        gameScene = this;

        makeDiamondTexture(this, "t_grass", TILE_W, TILE_H, 0x2ecc71);
        makeDiamondTexture(this, "t_forest",TILE_W, TILE_H, 0x1e9b4f);
        makeDiamondTexture(this, "t_stone", TILE_W, TILE_H, 0x95a5a6);
        makeDiamondTexture(this, "t_sand",  TILE_W, TILE_H, 0xe4c36a);
        makeDiamondTexture(this, "t_swamp", TILE_W, TILE_H, 0x7d5aa6);
        makeDiamondTexture(this, "t_snow",  TILE_W, TILE_H, 0xdfe8f2);
        makeDiamondTexture(this, "t_water", TILE_W, TILE_H, 0x4aa3ff);
        makeDiamondTexture(this, "t_mount", TILE_W, TILE_H, 0x8b6b4f);

        makeRectTexture(this, "p_me",    26, 38, 0xf1c40f);
        makeRectTexture(this, "p_other", 26, 38, 0x4aa3ff);

        makeRectTexture(this, "m_slime", 22, 22, 0xff5c5c);
        makeRectTexture(this, "m_wolf",  22, 22, 0xc2c2c2);
        makeRectTexture(this, "m_bandit",22, 22, 0xffb703);
        makeRectTexture(this, "m_wisp",  22, 22, 0xffffff);

        makeIcon(this, "d_tree",  22, 30, 0x2ecc71);
        makeIcon(this, "d_rock",  26, 22, 0x95a5a6);
        makeIcon(this, "d_bush",  22, 22, 0xe67e22);
        makeIcon(this, "d_ore",   26, 22, 0xadb5bd);
        makeIcon(this, "d_herb",  22, 22, 0x90be6d);
        makeIcon(this, "d_bones", 26, 22, 0xf8f9fa);
        makeIcon(this, "d_ruins", 26, 30, 0x8d99ae);
        makeIcon(this, "d_shrine",22, 34, 0xffffff);

        makeIcon(this, "o_fire",  26, 26, 0xffd166);
        makeIcon(this, "o_sign",  26, 26, 0xb08968);
        makeIcon(this, "o_bench", 26, 26, 0x9b5de5);

        tileSprites = [];
        decorSprites = [];
        for (let i=0; i<VIEW_W*VIEW_H; i++){
          const t0 = this.add.image(0,0,"t_grass").setOrigin(0.5,0);
          tileSprites.push(t0);
          const d0 = this.add.image(0,0,"d_tree").setOrigin(0.5,1);
          d0.setVisible(false);
          decorSprites.push(d0);
        }

        this.playerSprite = this.add.sprite(0,0,"p_me").setOrigin(0.5,1);
        this.cameras.main.startFollow(this.playerSprite, true, 0.14, 0.14);

        this.dark = this.add.rectangle(0,0,this.scale.width,this.scale.height,0x000000,0).setOrigin(0).setScrollFactor(0).setDepth(999999);
        this.scale.on("resize", (s)=>{ this.dark.width = s.width; this.dark.height = s.height; });

        this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER");

        this.input.on("pointerdown", (p)=>{ if (p.downY < 90) return; doAction(); });

        centerTile.x = Math.round(local.player.x);
        centerTile.y = Math.round(local.player.y);
        syncLocalPlayerSprite();
        repaintVisible();
        refreshHud();
      }

      update(time, delta){
        const dt = delta/1000;
        tickSurvival(dt);
        this.dark.setAlpha(nightAlpha());

        const dir = getMoveDir(this.keys);
        const wt = calcWeight(local.mats), cap = calcCapacity();
        const over = wt > cap;
        const baseCd = local.stats.stamina <= 0 ? 270 : 120;
        const moveCooldown = over ? baseCd + 70 : baseCd;

        if ((dir.dx !== 0 || dir.dy !== 0) && time - lastMoveAt > moveCooldown){
          attemptMove(dir.dx, dir.dy);
          lastMoveAt = time;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) doAction();
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) doAttack();

        tickMonsters(time);

        const cx = Math.round(local.player.x);
        const cy = Math.round(local.player.y);
        if (cx !== centerTile.x || cy !== centerTile.y){
          centerTile.x = cx; centerTile.y = cy;
          repaintVisible();
        }

        for (const rp of remotePlayers.values()){
          if (!rp.sprite) continue;
          const p = isoToScreenTop(rp.x, rp.y);
          rp.sprite.x = p.x;
          rp.sprite.y = p.y + TILE_H/2;
          rp.sprite.setDepth(rp.sprite.y);
          if (rp.bubble){
            rp.bubble.x = rp.sprite.x;
            rp.bubble.y = rp.sprite.y - 48;
            rp.bubble.setDepth(rp.sprite.y + 1);
          }
        }
      }
    }

    function repaintVisible(){
      if (!gameScene) return;
      for (const spr of worldObjectSprites.values()) spr.destroy();
      worldObjectSprites.clear();

      const halfW = Math.floor(VIEW_W/2);
      const halfH = Math.floor(VIEW_H/2);

      let idx = 0;
      for (let j=0; j<VIEW_H; j++){
        for (let i=0; i<VIEW_W; i++){
          const tx = centerTile.x + (i - halfW);
          const ty = centerTile.y + (j - halfH);

          const b = biomeAt(tx, ty);
          const tile = tileSprites[idx];
          const deco = decorSprites[idx];
          idx++;

          const p = isoToScreenTop(tx, ty);
          tile.setTexture(tileKeyFromBiome(b));
          tile.x = p.x;
          tile.y = p.y;
          tile.tx = tx; tile.ty = ty;
          tile.setDepth(tile.y);

          const s = shrineAt(tx, ty, b);
          const claimed = s && ledger.shrineClaims.has(s.shrineId);

          if (s && !claimed){
            deco.setTexture("d_shrine");
            deco.setVisible(true);
            deco.x = p.x; deco.y = p.y + TILE_H/2 + 18;
          } else {
            const d = decorAt(tx, ty, b);
            if (d === "Tree"){ deco.setTexture("d_tree"); deco.setVisible(true); }
            else if (d === "Rock"){ deco.setTexture("d_rock"); deco.setVisible(true); }
            else if (d === "Bush"){ deco.setTexture("d_bush"); deco.setVisible(true); }
            else if (d === "Ore"){ deco.setTexture("d_ore"); deco.setVisible(true); }
            else if (d === "Herb"){ deco.setTexture("d_herb"); deco.setVisible(true); }
            else if (d === "Bones"){ deco.setTexture("d_bones"); deco.setVisible(true); }
            else if (d === "Ruins"){ deco.setTexture("d_ruins"); deco.setVisible(true); }
            else deco.setVisible(false);

            if (deco.visible){ deco.x = p.x; deco.y = p.y + TILE_H/2 + 18; }
          }
          deco.setDepth(tile.y + TILE_H + 10);

          const objs = (ledger.objectsByPos.get(`${tx},${ty}`) || []).filter(o=>o && !o.removed);
          for (const obj of objs){
            const icon = obj.kind === "Campfire" ? "o_fire" : obj.kind === "Workbench" ? "o_bench" : "o_sign";
            const spr = gameScene.add.image(p.x, p.y + TILE_H/2 + 18, icon).setOrigin(0.5,1);
            spr.setDepth(tile.y + TILE_H + 12);
            spr._obj = obj;
            worldObjectSprites.set(`${obj.kind}:${obj.ownerPub}:${obj.x}:${obj.y}:${obj.text}`, spr);
          }
        }
      }

      syncLocalPlayerSprite();
      refreshHud();
    }

    function syncLocalPlayerSprite(){
      if (!gameScene) return;
      const p = isoToScreenTop(local.player.x, local.player.y);
      gameScene.playerSprite.x = p.x;
      gameScene.playerSprite.y = p.y + TILE_H/2;
      gameScene.playerSprite.setDepth(gameScene.playerSprite.y);
    }

    function getObjectsAt(tx,ty){
      return (ledger.objectsByPos.get(`${tx},${ty}`) || []).filter(o=>o && !o.removed);
    }

    function isNearWorkbench(tx,ty){
      for (let dy=-1; dy<=1; dy++){
        for (let dx=-1; dx<=1; dx++){
          const objs = getObjectsAt(tx+dx, ty+dy);
          if (objs.some(o=> o.kind === "Workbench")) return true;
        }
      }
      return false;
    }

    function currentContext(){
      const tx = local.player.x|0;
      const ty = local.player.y|0;
      const b = biomeAt(tx,ty);
      const deco = decorAt(tx,ty,b);
      const shrine = shrineAt(tx,ty,b);
      const shrineClaimed = shrine && ledger.shrineClaims.has(shrine.shrineId);
      const objs = getObjectsAt(tx,ty);
      const objHere = objs.length ? objs[0] : null;
      return { tx, ty, b, deco, shrine, shrineClaimed, objHere, nearWorkbench: isNearWorkbench(tx,ty) };
    }

    let mining = { active:false, cancel:false };

    async function doAction(){
      if (!gameScene) return;
      const c = currentContext();

      if (mining.active){ mining.cancel = true; return; }

      if (c.shrine && !c.shrineClaimed){
        mining.active = true; mining.cancel = false;
        const bits = 16;
        toast(t("toast.mining"), 1600);
        try{
          const pow = await minePow(c.shrine.shrineId, bits, mining);
          const ev = await createSignedEvent("CLAIM_SHRINE", { shrineId:c.shrine.shrineId, x:c.tx, y:c.ty, powBits:bits, powNonce:pow.nonce, powHash:pow.hash });
          publishEvent(ev);
          questProgress("CLAIM_SHRINE", 1);
          toast(t("toast.shrineClaimed"));
        } catch {
          toast(t("toast.miningCancelled"));
        } finally {
          mining.active = false;
          persistLocalDebounced();
          rebuildLedgerIndexes();
          repaintVisible();
          refreshHud();
        }
        return;
      }

      if (c.objHere?.kind === "Campfire"){
        local.stats.stamina = 100;
        local.stats.hp = clamp(local.stats.hp + 30, 0, 100);
        local.stats.hunger = clamp(local.stats.hunger - 18, 0, 100);
        addXp("Survival", 20);
        toast(t("toast.rest"));
        persistLocalDebounced(); refreshHud();
        return;
      }

      if (c.objHere?.kind === "Workbench"){
        openCraft(true);
        return;
      }

      if (c.objHere?.kind === "Signpost"){
        const owner = ledger.profiles.get(c.objHere.ownerPub)?.name || c.objHere.ownerPub.slice(0,8);
        showModal(t("modal.sign"), `
          <div class="card">
            <div class="muted">${escapeHtml(t("modal.author"))}: <b>${escapeHtml(owner)}</b> <span class="mono">(${c.objHere.ownerPub.slice(0,10)}…)</span></div>
            <p style="white-space:pre-wrap;margin:8px 0 0 0">${escapeHtml(c.objHere.text || "(empty)")}</p>
          </div>
          ${c.objHere.ownerPub === me.pub ? `<div style="margin-top:10px"><button id="rmSign">${escapeHtml(t("modal.removeMine"))}</button></div>` : ``}
        `);
        setTimeout(()=>{
          const rm = document.getElementById("rmSign");
          if (rm) rm.onclick = async ()=>{
            const obj = c.objHere;
            let objectId = null;
            for (const [id,o] of ledger.objects.entries()){
              if (!o || o.removed) continue;
              if (o.ownerPub === obj.ownerPub && o.kind === obj.kind && o.x === obj.x && o.y === obj.y && o.text === obj.text){
                objectId = id; break;
              }
            }
            if (!objectId) return;
            const ev = await createSignedEvent("REMOVE_OBJECT", { objectId });
            publishEvent(ev);
            modal.style.display = "none";
          };
        },0);
        return;
      }

      const tool = local.equip.tool;

      if (c.deco === "Ruins"){
        const key = `${c.tx},${c.ty}`;
        if (local.discovered.ruins[key]){
          toast(t("toast.ruinsAlready"));
          return;
        }
        local.discovered.ruins[key] = true;
        const lootShard = (Math.random() < 0.55) ? 1 : 0;
        const lootOre = 1 + (Math.random() < 0.35 ? 1 : 0);
        const lootHide = (Math.random() < 0.30) ? 1 : 0;

        local.mats.ore += lootOre;
        local.mats.shard += lootShard;
        local.mats.hide += lootHide;
        addXp("Lore", 18);
        addXp("Survival", 10);
        questProgress("GATHER", 2);

        const lootTxt = `⛓+${lootOre}${lootShard?` ✧+${lootShard}`:""}${lootHide?` 🐾+${lootHide}`:""}`;
        toast(t("toast.ruinsLoot",{loot:lootTxt}), 1600);

        persistLocalDebounced(); refreshHud();
        return;
      }

      if (c.deco === "Tree"){
        let gain = 1 + (Math.random() < 0.30 ? 1 : 0);
        if (tool === "Axe") gain += 1;
        local.mats.wood += gain;
        addXp("Gathering", 18);
        questProgress("GATHER", 1);
        toast(`🪵 +${gain}`);
      } else if (c.deco === "Rock"){
        let gain = 1 + (Math.random() < 0.25 ? 1 : 0);
        if (tool === "Pickaxe") gain += 1;
        local.mats.stone += gain;
        addXp("Gathering", 18);
        questProgress("GATHER", 1);
        toast(`⛏ +${gain}`);
      } else if (c.deco === "Ore"){
        if (tool !== "Pickaxe"){
          toast(t("toast.needPickaxe"));
          return;
        }
        let gain = 1 + (Math.random() < 0.35 ? 1 : 0);
        local.mats.ore += gain;
        if (Math.random() < 0.08) local.mats.shard += 1;
        addXp("Gathering", 22);
        questProgress("GATHER", 1);
        toast(`⛓ +${gain}${(Math.random()<0.08)?" ✧+1":""}`, 1200);
      } else if (c.deco === "Herb"){
        let gain = 1 + (Math.random() < 0.40 ? 1 : 0);
        local.mats.fiber += gain;
        addXp("Survival", 10);
        addXp("Gathering", 10);
        questProgress("GATHER", 1);
        toast(`🧵 +${gain}`);
      } else if (c.deco === "Bones"){
        local.mats.hide += 1;
        addXp("Survival", 12);
        questProgress("GATHER", 1);
        toast(`🐾 +1`);
      } else if (c.deco === "Bush"){
        let gain = 1 + (Math.random() < 0.30 ? 1 : 0);
        local.mats.berry += gain;
        local.stats.hunger = clamp(local.stats.hunger - 9, 0, 100);
        addXp("Survival", 10);
        questProgress("GATHER", 1);
        toast(`🍓 +${gain}`);
      } else {
        toast(t("toast.nothing"));
        return;
      }

      persistLocalDebounced();
      refreshHud();
    }

    function weaponBonus(){
      const w = local.equip.weapon;
      if (w === "Spear") return 4;
      if (w === "Sword") return 6;
      return 0;
    }

    function armorBonus(){
      const a = local.equip.armor;
      if (a === "Cloak") return { hungerReduce: 0.18, dmgReduce: 0.05 };
      if (a === "Leather") return { hungerReduce: 0.0, dmgReduce: 0.12 };
      return { hungerReduce: 0.0, dmgReduce: 0.0 };
    }

    function doAttack(){
      const px = local.player.x|0, py = local.player.y|0;

      let targetId = null;
      let bestDist = 999;
      for (const [id, m] of monsters.entries()){
        const dist = Math.abs(m.x - px) + Math.abs(m.y - py);
        if (dist <= 1 && dist < bestDist){
          bestDist = dist;
          targetId = id;
        }
      }
      if (!targetId){ toast(t("toast.noEnemies")); return; }

      const combatLv = skillLevel(local.skills.Combat || 0);
      const dmg = 6 + combatLv*2 + weaponBonus();

      const m = monsters.get(targetId);
      m.hp -= dmg;
      addXp("Combat", 18);

      toast(t("toast.hit",{dmg}));

      if (m.hp <= 0){
        m.sprite.destroy();
        monsters.delete(targetId);

        const drop = m.drop || {};
        for (const [k,v] of Object.entries(drop)){
          local.mats[k] = (local.mats[k]||0) + v;
        }
        if (Math.random() < 0.22) local.mats.berry += 1;

        questProgress("DEFEAT", 1);
        toast(t("toast.enemyDefeated",{loot:fmtLoot(drop)}), 1500);
      }

      persistLocalDebounced();
      refreshHud();
    }

    function fmtLoot(d){
      const parts = [];
      if (d.hide) parts.push(`🐾x${d.hide}`);
      if (d.ore) parts.push(`⛓x${d.ore}`);
      if (d.wood) parts.push(`🪵x${d.wood}`);
      if (d.shard) parts.push(`✧x${d.shard}`);
      return parts.length ? parts.join(" ") : "(small loot)";
    }

    function monsterData(kind){
      if (kind === "Wolf") return { tex:"m_wolf", hp: 22, atk: 6, ms: 520, drop:{ hide: 1 + (Math.random()<0.45?1:0) } };
      if (kind === "Bandit") return { tex:"m_bandit", hp: 26, atk: 7, ms: 560, drop:{ ore: (Math.random()<0.55?1:0), wood: (Math.random()<0.35?1:0) } };
      if (kind === "Wisp") return { tex:"m_wisp", hp: 18, atk: 5, ms: 480, drop:{ shard: (Math.random()<0.45?1:0) } };
      return { tex:"m_slime", hp: 20, atk: 5, ms: 600, drop:{ } };
    }

    function maybeSpawnMonster(){
      const tx = local.player.x|0;
      const ty = local.player.y|0;
      const b = biomeAt(tx,ty);
      const r = hash2D01(worldSeedU32 ^ 0xDEADBEEF, tx, ty);

      let chance = 0.10;
      if (b === "Forest") chance = 0.15;
      if (b === "Swamp") chance = 0.16;
      if (b === "Mount") chance = 0.14;
      if (b === "Snow")  chance = 0.13;
      if (isNight()) chance *= 1.35;

      if (r < chance){
        const id = monsterId(tx,ty,stepCount);
        if (monsters.has(id) || !gameScene) return;

        const kind =
          (b === "Forest") ? "Wolf" :
          (b === "Swamp")  ? "Slime" :
          (b === "Snow")   ? "Wisp" :
          (b === "Sand")   ? "Bandit" :
          (b === "Mount" || b === "Stone") ? (Math.random()<0.6 ? "Bandit" : "Wisp") :
          "Slime";

        const data = monsterData(kind);
        const spawnX = tx + 1, spawnY = ty;

        const p = isoToScreenTop(spawnX, spawnY);
        const spr = gameScene.add.sprite(p.x, p.y + TILE_H/2, data.tex).setOrigin(0.5,1);
        spr.setDepth(spr.y);

        monsters.set(id, { kind, x:spawnX, y:spawnY, hp:data.hp, atk:data.atk, ms:data.ms, drop:data.drop, sprite:spr, nextMove:0, hitAt:0 });
        toast(t("toast.spawned",{monster: trMonster(kind)}));
      }
    }

    function tickMonsters(time){
      if (!gameScene) return;
      for (const [id, m] of monsters.entries()){
        if (!m.sprite) continue;

        if (time >= (m.nextMove||0)){
          m.nextMove = time + m.ms;
          const dx = clamp((local.player.x|0) - m.x, -1, 1);
          const dy = clamp((local.player.y|0) - m.y, -1, 1);
          const nx = m.x + dx, ny = m.y + dy;
          if (biomeAt(nx, ny) !== "Water"){ m.x = nx; m.y = ny; }
        }

        const dist = Math.abs(m.x - (local.player.x|0)) + Math.abs(m.y - (local.player.y|0));
        if (dist === 0 && time >= (m.hitAt||0)){
          m.hitAt = time + 720;
          const armor = armorBonus();
          const dmg = Math.max(1, Math.round(m.atk * (1 - armor.dmgReduce)));
          local.stats.hp = clamp(local.stats.hp - dmg, 0, 100);
          persistLocalDebounced();
        }

        const p = isoToScreenTop(m.x, m.y);
        m.sprite.x = p.x;
        m.sprite.y = p.y + TILE_H/2;
        m.sprite.setDepth(m.sprite.y);
      }
      refreshHud();
    }

    function attemptMove(dx, dy){
      const nx = (local.player.x|0) + dx;
      const ny = (local.player.y|0) + dy;

      const b = biomeAt(nx, ny);
      if (b === "Water"){ toast(t("toast.deepWater")); return; }

      let cost = 2;
      if (b === "Swamp") cost = 4;
      if (b === "Sand") cost = 3;
      if (b === "Mount") cost = 5;
      if (b === "Snow") cost = 4;

      const wt = calcWeight(local.mats);
      const cap = calcCapacity();
      if (wt > cap) cost += 1;

      const ath = skillLevel(local.skills.Athletics || 0);
      cost = Math.max(1, cost - Math.floor(ath / 2));

      local.player.x = nx;
      local.player.y = ny;
      local.stats.stamina = clamp(local.stats.stamina - cost, 0, 100);

      const surv = skillLevel(local.skills.Survival || 0);
      const armor = armorBonus();
      const hungerInc = Math.max(0.22, (isNight()?0.70:0.55) - surv * 0.06) * (1 - armor.hungerReduce);
      local.stats.hunger = clamp(local.stats.hunger + hungerInc, 0, 100);

      addXp("Athletics", 6);
      addXp("Survival", 3);

      if (!local.discovered.biomes[b]){
        local.discovered.biomes[b] = true;
        questProgress("EXPLORE_BIOMES", 1);
        toast(t("toast.newBiome",{biome: trBiome(b)}));
      }

      stepCount++;
      if (hash2D01(worldSeedU32 ^ 0x11111111, nx, ny) < 0.75) maybeSpawnMonster();

      if (net.enabled) sendMove({ pub: me.pub, x: nx, y: ny, name: me.name, life: me.lifestyle });

      syncLocalPlayerSprite();
      persistLocalDebounced();
      refreshHud();
    }

    function tickSurvival(dt){
      const wt = calcWeight(local.mats);
      const cap = calcCapacity();
      const over = wt > cap;

      const stRegen = over ? 0.6 : 1.2;
      local.stats.stamina = clamp(local.stats.stamina + dt*stRegen, 0, 100);

      if (local.stats.hunger > 85){
        local.stats.hp = clamp(local.stats.hp - dt*2.8, 0, 100);
      }
      if (isNight() && local.stats.hunger > 60){
        local.stats.hp = clamp(local.stats.hp - dt*0.6, 0, 100);
      }

      if (local.stats.hp <= 0){
        local.stats.hp = 100;
        local.stats.stamina = 60;
        local.stats.hunger = 40;
        local.player.x = 0;
        local.player.y = 0;
        toast(t("toast.youFell"), 1600);
        syncLocalPlayerSprite();
        repaintVisible();
        persistLocalDebounced();
      }
    }

    // UI panels
    function iconFor(k){
      return ({ wood:"🪵", stone:"⛏", ore:"⛓", fiber:"🧵", hide:"🐾", shard:"✧", berry:"🍓" })[k] || k;
    }
    function fmtReward(r){
      if (!r) return "(none)";
      const parts = [];
      for (const k of ["wood","stone","ore","fiber","hide","shard","berry"]){
        if (r[k]) parts.push(`${iconFor(k)} x${r[k]}`);
      }
      return parts.join(" ");
    }

    function openQuests(){
      const rows = local.quests.active.map(q => `
        <div class="card">
          <b>${escapeHtml(q.title)}</b>
          <div class="muted">${escapeHtml(q.desc)}</div>
          <div style="margin-top:6px">${escapeHtml(t("common.progress"))}: <b>${q.prog}/${q.need}</b> ${q._done?`<span class="muted">(${escapeHtml(t("common.completed"))})</span>`:""}</div>
          <div class="muted" style="margin-top:6px">${escapeHtml(t("common.reward"))}: ${fmtReward(q.reward)}</div>
        </div>
      `).join("");
      showModal(t("modal.quests"), `<div class="grid2">${rows}</div>`);
    }

    function openSkills(){
      const sk = local.skills;
      const items = Object.keys(sk).map(k=>{
        const xp = sk[k]||0;
        const lv = skillLevel(xp);
        return `<li><b>${escapeHtml(k)}</b>: lvl <b>${lv}</b> <span class="muted">(xp ${xp})</span></li>`;
      }).join("");

      const eq = local.equip;
      showModal(t("modal.skills"), `
        <div class="grid2">
          <div class="card">
            <b>${escapeHtml(t("btn.skills"))}</b>
            <ul style="margin:8px 0 0 18px">${items}</ul>
          </div>
          <div class="card">
            <b>${escapeHtml(t("login.lifestyleLabel"))}: ${escapeHtml(t("life."+me.lifestyle))}</b>
            <div class="muted" style="margin-top:10px">${escapeHtml(t("modal.currentEquip"))}</div>
            <ul style="margin:8px 0 0 18px">
              <li>Tool: <b>${escapeHtml(eq.tool ? trItemName(eq.tool) : "—")}</b></li>
              <li>Weapon: <b>${escapeHtml(eq.weapon ? trItemName(eq.weapon) : "—")}</b></li>
              <li>Armor: <b>${escapeHtml(eq.armor ? trItemName(eq.armor) : "—")}</b></li>
              <li>Accessory: <b>${escapeHtml(eq.accessory ? trItemName(eq.accessory) : "—")}</b></li>
            </ul>
          </div>
        </div>
      `);
    }

    function openWorld(){
      const list = [...ledger.score.entries()]
        .sort((a,b)=> (b[1]-a[1]) || String(a[0]).localeCompare(String(b[0])))
        .slice(0, 20)
        .map(([pub, wins])=>{
          const name = ledger.profiles.get(pub)?.name || pub.slice(0,8);
          return `<li><b>${escapeHtml(name)}</b> — ${wins}</li>`;
        }).join("") || `<li class="muted">(empty)</li>`;

      const totalObj = [...ledger.objects.values()].filter(o=>o && !o.removed).length;
      const totalShr = ledger.shrineClaims.size;

      showModal(t("modal.world"), `
        <div class="grid2">
          <div class="card">
            <b>${escapeHtml(t("modal.summary"))}</b>
            <ul style="margin:8px 0 0 18px">
              <li>Objects: <b>${totalObj}</b></li>
              <li>Shrines: <b>${totalShr}</b></li>
              <li>Authors: <b>${Object.keys(ledger.raw.authors||{}).length}</b></li>
            </ul>
            <p class="muted" style="margin-top:10px">${escapeHtml(t("modal.tip"))}</p>
          </div>
          <div class="card">
            <b>${escapeHtml(t("modal.ranking"))}</b>
            <ol style="margin:8px 0 0 18px">${list}</ol>
          </div>
        </div>
      `);
    }

    function openCredits(){
      showModal(t("modal.credits"), `
        <div class="card">
          <ul style="margin:8px 0 0 18px">
            <li><b>Phaser</b> — MIT</li>
            <li><b>Trystero</b> — MIT</li>
            <li><b>tweetnacl</b> — Ed25519</li>
            <li><b>@noble/hashes</b> — MIT</li>
            <li><b>Flags</b> — Twemoji via jsDelivr + Senyera via Wikimedia</li>
          </ul>
        </div>
        <div class="card" style="margin-top:10px">
          <b>Assets</b>
          <p class="muted" style="margin:6px 0 0 0">
            This demo uses code-generated placeholders. When you add CC0 packs (e.g., Kenney), list pack names here.
          </p>
        </div>
      `);
    }

    function openCraft(){
      const c = currentContext();
      const canPlaceHere = (biomeAt(c.tx,c.ty) !== "Water");
      const hasBench = c.nearWorkbench;

      const eq = local.equip;
      showModal(t("modal.craft"), `
        <div class="grid2">
          <div class="card">
            <b>${escapeHtml(t("modal.recipesBasic"))}</b>
            <ul style="margin:8px 0 0 18px">
              <li><button id="mkAxe">${escapeHtml(trItemName("Axe"))}</button> <span class="muted">cost: 🪵2 ⛏1</span></li>
              <li><button id="mkPick">${escapeHtml(trItemName("Pickaxe"))}</button> <span class="muted">cost: 🪵2 ⛏2</span></li>
              <li><button id="mkFire">${escapeHtml(trItemName("Campfire"))}</button> <span class="muted">cost: 🪵2 ⛏1</span></li>
              <li><button id="mkBench">${escapeHtml(trItemName("Workbench"))}</button> <span class="muted">cost: 🪵4 ⛏2</span></li>
              <li><button id="mkSign">${escapeHtml(trItemName("Signpost"))}</button> <span class="muted">cost: 🪵1</span></li>
              <li><button id="eatB">🍓</button> <span class="muted">cost: 🍓1</span></li>
            </ul>

            <div class="muted" style="margin-top:10px">${escapeHtml(t("modal.recipesAdv"))}: ${hasBench ? "✅" : "❌"}</div>
            <ul style="margin:8px 0 0 18px">
              <li><button id="mkSpear">${escapeHtml(trItemName("Spear"))}</button> <span class="muted">cost: 🪵2 🐾1</span></li>
              <li><button id="mkSword">${escapeHtml(trItemName("Sword"))}</button> <span class="muted">cost: ⛓3 🪵1</span></li>
              <li><button id="mkCloak">${escapeHtml(trItemName("Cloak"))}</button> <span class="muted">cost: 🧵3 🐾1</span></li>
              <li><button id="mkLeather">${escapeHtml(trItemName("Leather"))}</button> <span class="muted">cost: 🐾3</span></li>
              <li><button id="mkLantern">${escapeHtml(trItemName("Lantern"))}</button> <span class="muted">cost: ✧1 ⛓2</span></li>
            </ul>
          </div>

          <div class="card">
            <b>${escapeHtml(t("modal.materials"))}</b>
            <ul style="margin:8px 0 0 18px">
              <li>🪵 ${local.mats.wood}</li>
              <li>⛏ ${local.mats.stone}</li>
              <li>⛓ ${local.mats.ore}</li>
              <li>🧵 ${local.mats.fiber}</li>
              <li>🐾 ${local.mats.hide}</li>
              <li>✧ ${local.mats.shard}</li>
              <li>🍓 ${local.mats.berry}</li>
            </ul>

            <div class="muted" style="margin-top:10px">${escapeHtml(t("modal.currentEquip"))}</div>
            <ul style="margin:8px 0 0 18px">
              <li>Tool: <b>${escapeHtml(eq.tool ? trItemName(eq.tool) : "—")}</b></li>
              <li>Weapon: <b>${escapeHtml(eq.weapon ? trItemName(eq.weapon) : "—")}</b></li>
              <li>Armor: <b>${escapeHtml(eq.armor ? trItemName(eq.armor) : "—")}</b></li>
              <li>Accessory: <b>${escapeHtml(eq.accessory ? trItemName(eq.accessory) : "—")}</b></li>
            </ul>

            <p class="muted" style="margin-top:10px">${escapeHtml(t("modal.position"))}: (${c.tx},${c.ty}) — ${escapeHtml(trBiome(c.b))}</p>
          </div>
        </div>
      `);

      setTimeout(()=> wireCraftButtons(canPlaceHere, hasBench), 0);
    }

    async function wireCraftButtons(canPlaceHere, hasBench){
      const $ = (id)=> document.getElementById(id);

      function needMat(cond){ if (!cond){ toast(t("toast.notEnough")); return true; } return false; }
      function needBench(){ if (!hasBench){ toast(t("toast.benchNeeded")); return true; } return false; }

      $("mkAxe").onclick = ()=>{
        if (needMat(local.mats.wood >= 2 && local.mats.stone >= 1)) return;
        local.mats.wood -= 2; local.mats.stone -= 1;
        local.equip.tool = "Axe";
        addXp("Crafting", 35);
        questProgress("CRAFT_TOOL", 1);
        toast(t("toast.equipped",{item: trItemName("Axe")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkPick").onclick = ()=>{
        if (needMat(local.mats.wood >= 2 && local.mats.stone >= 2)) return;
        local.mats.wood -= 2; local.mats.stone -= 2;
        local.equip.tool = "Pickaxe";
        addXp("Crafting", 45);
        questProgress("CRAFT_TOOL", 1);
        toast(t("toast.equipped",{item: trItemName("Pickaxe")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkFire").onclick = async ()=>{
        if (!canPlaceHere){ toast(t("toast.deepWater")); return; }
        if (needMat(local.mats.wood >= 2 && local.mats.stone >= 1)) return;
        local.mats.wood -= 2; local.mats.stone -= 1;
        addXp("Crafting", 30);
        const c = currentContext();
        const objectId = bytesToHex(sha256(te.encode(`obj:${me.pub}:${Date.now()}:${Math.random()}`)));
        const ev = await createSignedEvent("PLACE_OBJECT", { objectId, kind:"Campfire", x:c.tx, y:c.ty, text:"" });
        publishEvent(ev);
        toast(t("toast.placedShared",{item: trItemName("Campfire")}));
        persistLocalDebounced(); modal.style.display="none";
      };

      $("mkBench").onclick = async ()=>{
        if (!canPlaceHere){ toast(t("toast.deepWater")); return; }
        if (needMat(local.mats.wood >= 4 && local.mats.stone >= 2)) return;
        local.mats.wood -= 4; local.mats.stone -= 2;
        addXp("Crafting", 55);
        const c = currentContext();
        const objectId = bytesToHex(sha256(te.encode(`obj:${me.pub}:${Date.now()}:${Math.random()}`)));
        const ev = await createSignedEvent("PLACE_OBJECT", { objectId, kind:"Workbench", x:c.tx, y:c.ty, text:"" });
        publishEvent(ev);
        questProgress("PLACE_WORKBENCH", 1);
        toast(t("toast.placedShared",{item: trItemName("Workbench")}));
        persistLocalDebounced(); modal.style.display="none";
      };

      $("mkSign").onclick = async ()=>{
        if (!canPlaceHere){ toast(t("toast.deepWater")); return; }
        if (needMat(local.mats.wood >= 1)) return;
        const text = prompt(t("prompt.signText"), t("prompt.signDefault"));
        if (text == null) return;
        local.mats.wood -= 1;
        addXp("Crafting", 25);
        addXp("Social", 12);
        const c = currentContext();
        const objectId = bytesToHex(sha256(te.encode(`obj:${me.pub}:${Date.now()}:${Math.random()}`)));
        const ev = await createSignedEvent("PLACE_OBJECT", { objectId, kind:"Signpost", x:c.tx, y:c.ty, text: String(text).slice(0,160) });
        publishEvent(ev);
        toast(t("toast.placedShared",{item: trItemName("Signpost")}));
        persistLocalDebounced(); modal.style.display="none";
      };

      $("eatB").onclick = ()=>{
        if (needMat(local.mats.berry >= 1)) return;
        local.mats.berry -= 1;
        local.stats.hunger = clamp(local.stats.hunger - 22, 0, 100);
        local.stats.hp = clamp(local.stats.hp + 10, 0, 100);
        addXp("Survival", 12);
        toast(t("toast.ateBerry"));
        persistLocalDebounced(); refreshHud();
      };

      $("mkSpear").onclick = ()=>{
        if (needBench()) return;
        if (needMat(local.mats.wood >= 2 && local.mats.hide >= 1)) return;
        local.mats.wood -= 2; local.mats.hide -= 1;
        local.equip.weapon = "Spear";
        addXp("Crafting", 40);
        toast(t("toast.equipped",{item: trItemName("Spear")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkSword").onclick = ()=>{
        if (needBench()) return;
        if (needMat(local.mats.ore >= 3 && local.mats.wood >= 1)) return;
        local.mats.ore -= 3; local.mats.wood -= 1;
        local.equip.weapon = "Sword";
        addXp("Crafting", 60);
        toast(t("toast.equipped",{item: trItemName("Sword")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkCloak").onclick = ()=>{
        if (needBench()) return;
        if (needMat(local.mats.fiber >= 3 && local.mats.hide >= 1)) return;
        local.mats.fiber -= 3; local.mats.hide -= 1;
        local.equip.armor = "Cloak";
        addXp("Crafting", 45);
        toast(t("toast.equipped",{item: trItemName("Cloak")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkLeather").onclick = ()=>{
        if (needBench()) return;
        if (needMat(local.mats.hide >= 3)) return;
        local.mats.hide -= 3;
        local.equip.armor = "Leather";
        addXp("Crafting", 55);
        toast(t("toast.equipped",{item: trItemName("Leather")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };

      $("mkLantern").onclick = ()=>{
        if (needBench()) return;
        if (needMat(local.mats.shard >= 1 && local.mats.ore >= 2)) return;
        local.mats.shard -= 1; local.mats.ore -= 2;
        local.equip.accessory = "Lantern";
        addXp("Lore", 25);
        addXp("Crafting", 35);
        toast(t("toast.equipped",{item: trItemName("Lantern")}));
        persistLocalDebounced(); refreshHud(); modal.style.display="none";
      };
    }

    // HUD wiring
    const elRoom = document.getElementById("room");
    const elPeers = document.getElementById("peers");
    const elMe = document.getElementById("me");
    const elHp = document.getElementById("hp");
    const elSt = document.getElementById("stam");
    const elHu = document.getElementById("hunger");
    const elWt = document.getElementById("wt");
    const elCap = document.getElementById("cap");

    const elWood = document.getElementById("wood");
    const elStone = document.getElementById("stone");
    const elOre = document.getElementById("ore");
    const elFiber = document.getElementById("fiber");
    const elHide = document.getElementById("hide");
    const elShard = document.getElementById("shard");
    const elBerry = document.getElementById("berry");

    document.getElementById("btnQuests").onclick = openQuests;
    document.getElementById("btnSkills").onclick = openSkills;
    document.getElementById("btnCraft").onclick = ()=> openCraft();
    document.getElementById("btnWorld").onclick = openWorld;
    document.getElementById("btnCredits").onclick = openCredits;

    document.getElementById("btnAction").onclick = doAction;
    document.getElementById("btnAttack").onclick = doAttack;

    document.getElementById("btnExport").onclick = () => {
      const payload = { v:1, room: roomId, ledger: ledger.raw };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `shardwalk-${roomId}-ledger.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };

    document.getElementById("import").addEventListener("change", async (e)=>{
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const txt = await f.text();
        const payload = JSON.parse(txt);
        if (!payload?.ledger?.authors) throw new Error("bad");

        for (const [pub, arr] of Object.entries(payload.ledger.authors)){
          if (!Array.isArray(arr)) continue;
          if (!ledger.raw.authors[pub]) ledger.raw.authors[pub] = [];
          const have = new Set(ledger.raw.authors[pub].map(x=>x.id));
          for (const ev of arr){
            if (!ev?.id || have.has(ev.id)) continue;
            ledger.raw.authors[pub].push(ev);
            have.add(ev.id);
          }
        }

        rebuildLedgerIndexes();
        saveLedgerRaw(ledger.raw);
        repaintVisible();
        toast(t("toast.importOk"));
      } catch {
        toast(t("toast.importFail"));
      } finally {
        e.target.value = "";
      }
    });

    function refreshHud(){
      if (!local) return;
      elRoom.textContent = roomId;
      elPeers.textContent = String(net.peerCount || 0);
      elMe.textContent = `${me.name} (${me.pub ? me.pub.slice(0,8) : "…"})`;

      elHp.textContent = String(Math.round(local.stats.hp));
      elSt.textContent = String(Math.round(local.stats.stamina));
      elHu.textContent = String(Math.round(local.stats.hunger));

      const wt = Math.round(calcWeight(local.mats)*10)/10;
      const cap = calcCapacity();
      elWt.textContent = String(wt);
      elCap.textContent = String(cap);

      elWood.textContent = String(local.mats.wood|0);
      elStone.textContent = String(local.mats.stone|0);
      elOre.textContent = String(local.mats.ore|0);
      elFiber.textContent = String(local.mats.fiber|0);
      elHide.textContent = String(local.mats.hide|0);
      elShard.textContent = String(local.mats.shard|0);
      elBerry.textContent = String(local.mats.berry|0);

      document.getElementById("btnAction").textContent = mining.active ? t("toast.mining") : t("btn.action");
      document.getElementById("btnAttack").textContent = t("btn.attack");
    }

    function setupNetworking(){
      try {
        room = joinRoom({ appId: APP_ID, relayUrls, relayRedundancy: 2 }, roomId);
        net.enabled = true;

        [sendHello, getHello] = room.makeAction("hello");
        [sendMove,  getMove ] = room.makeAction("move");
        [sendEv,    getEv   ] = room.makeAction("ev");
        [sendGet,   getGet  ] = room.makeAction("get");
        [sendBatch, getBatch] = room.makeAction("batch");
        [sendSay,   getSay  ] = room.makeAction("say");

        room.onPeerJoin((peerId)=>{
          sendHello({ pub: me.pub, name: me.name, life: me.lifestyle, heads: headsSummary() }, peerId);
          net.peerCount++;
          refreshHud();
        });

        room.onPeerLeave(()=> {
          net.peerCount = Math.max(0, net.peerCount - 1);
          refreshHud();
        });

        getHello((msg, peerId)=>{
          if (!msg?.pub) return;
          ensureRemote(msg.pub, msg.name, msg.life);

          const theirHeads = msg.heads || {};
          for (const [pub, seq] of Object.entries(theirHeads)){
            const st = getAuthorState(pub);
            if ((st.seq|0) < (seq|0)){
              sendGet({ author: pub, fromSeq: st.seq + 1, limit: 250 }, peerId);
            }
          }
          sendHello({ pub: me.pub, name: me.name, life: me.lifestyle, heads: headsSummary() }, peerId);
        });

        getGet((req, peerId)=>{
          const author = req?.author;
          const fromSeq = req?.fromSeq|0;
          const limit = clamp(req?.limit|0 || 200, 1, 400);
          if (!author) return;

          const st = getAuthorState(author);
          const slice = st.events.filter(e => (e.seq|0) >= fromSeq).slice(0, limit);
          if (slice.length) sendBatch({ author, events: slice }, peerId);
        });

        getBatch((msg)=>{
          const author = msg?.author;
          const arr = msg?.events;
          if (!author || !Array.isArray(arr)) return;

          arr.sort((a,b)=> (a.seq-b.seq));
          let any = false;
          for (const ev of arr){
            const v = verifyEventBasic(ev);
            if (!v.ok) continue;
            const st = getAuthorState(ev.author);
            if (ev.seq === st.seq + 1 && (ev.prev||null) === (st.headId||null)){
              if (appendEventToLedger(ev)) any = true;
            }
          }

          if (any){
            saveLedgerDebounced();
            rebuildLedgerIndexes();
            repaintVisible();
            refreshHud();
          }
        });

        getEv((ev, peerId)=>{
          const v = verifyEventBasic(ev);
          if (!v.ok) return;

          const st = getAuthorState(ev.author);
          if (ev.seq === st.seq + 1 && (ev.prev||null) === (st.headId||null)){
            if (appendEventToLedger(ev)){
              saveLedgerDebounced();
              rebuildLedgerIndexes();
              repaintVisible();
              refreshHud();
            }
          } else {
            sendGet({ author: ev.author, fromSeq: st.seq + 1, limit: 250 }, peerId);
          }
        });

        getMove((m)=>{
          if (!m?.pub) return;
          ensureRemote(m.pub, m.name, m.life);
          const rp = remotePlayers.get(m.pub);
          rp.x = m.x|0; rp.y = m.y|0;
        });

        getSay((m)=>{
          if (!m?.pub || !m?.text) return;
          ensureRemote(m.pub, m.name, m.life);
          bubbleSay(m.pub, String(m.text).slice(0,60));
        });

      } catch {
        net.enabled = false;
        toast(t("toast.p2pOffline"));
      }
    }

    function ensureRemote(pub, name, life){
      if (!pub || pub === me.pub) return;
      if (!remotePlayers.has(pub)){
        let sprite = null;
        if (gameScene) sprite = gameScene.add.sprite(0,0,"p_other").setOrigin(0.5,1);
        remotePlayers.set(pub, { x:0, y:0, sprite, name: name||pub.slice(0,8), life: life||"?", bubble:null });
      } else {
        const rp = remotePlayers.get(pub);
        rp.name = name || rp.name;
        rp.life = life || rp.life;
        if (!rp.sprite && gameScene) rp.sprite = gameScene.add.sprite(0,0,"p_other").setOrigin(0.5,1);
      }
    }

    function bubbleSay(pub, text){
      const rp = remotePlayers.get(pub);
      if (!rp || !gameScene) return;

      if (rp.bubble) rp.bubble.destroy();
      rp.bubble = gameScene.add.text(0,0,text,{
        fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial",
        fontSize:"12px",
        color:"#fff",
        backgroundColor:"rgba(0,0,0,.45)",
        padding:{x:8,y:4}
      }).setOrigin(0.5,1);

      setTimeout(()=>{
        if (rp.bubble){
          rp.bubble.destroy();
          rp.bubble = null;
        }
      }, 1400);
    }

    // Start flow
    document.getElementById("start").onclick = async ()=>{
      const name = (nameEl.value || "").trim().slice(0,18);
      const pass = passEl.value || "";
      const lifestyle = lifeEl.value;

      if (!name) return toast(t("toast.chooseName"));
      if (!pass) return toast(t("toast.choosePass"));

      const seed = sha256(te.encode(`key:${roomId}:${name}:${pass}`)).slice(0,32);
      const kp = nacl.sign.keyPair.fromSeed(seed);

      me.name = name;
      me.lifestyle = lifestyle;
      me.pub = toBase64(kp.publicKey);
      me.secretKey = kp.secretKey;

      localStorage.setItem(`sw_${roomId}_name`, name);
      localStorage.setItem(`sw_${roomId}_life`, lifestyle);

      local = loadLocal(me.pub) || defaultLocalState();

      const start = LIFESTYLES[lifestyle]?.start || {};
      if (!local._kit){
        for (const [k,v] of Object.entries(start)){
          if (local.mats[k] != null) local.mats[k] += v|0;
        }
        local._kit = true;
      }

      if (!local.quests.active || !local.quests.active.length){
        generateQuests();
      }

      const profileKnown = (ledger.raw.authors[me.pub]?.length || 0) > 0;
      if (!profileKnown){
        const ev = await createSignedEvent("PROFILE", { name: me.name, lifestyle: me.lifestyle });
        if (verifyEventBasic(ev).ok){
          appendEventToLedger(ev);
          saveLedgerDebounced();
          rebuildLedgerIndexes();
        }
      }

      loginEl.style.display = "none";
      document.getElementById("hud").style.display = "";
      document.getElementById("pad").style.display = "";
      document.getElementById("actions").style.display = "";

      setupNetworking();

      new Phaser.Game({
        type: Phaser.AUTO,
        parent: "game",
        backgroundColor: "#0e0e10",
        pixelArt: true,
        antialias: false,
        scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [Main]
      });

      if (net.enabled){
        sendMove({ pub: me.pub, x: local.player.x|0, y: local.player.y|0, name: me.name, life: me.lifestyle });
        sendHello({ pub: me.pub, name: me.name, life: me.lifestyle, heads: headsSummary() });
      }

      centerTile.x = Math.round(local.player.x);
      centerTile.y = Math.round(local.player.y);

      toast(t("toast.welcome"));
      refreshHud();
    };

    // Chat (ephemeral)
    window.addEventListener("keydown", (e)=>{
      if (e.key === "Enter" && document.getElementById("hud").style.display !== "none"){
        const msg = prompt(t("prompt.chat"), t("prompt.chatDefault"));
        if (!msg) return;
        if (net.enabled) sendSay({ pub: me.pub, name: me.name, life: me.lifestyle, text: msg });
        toast(t("toast.msgSent"));
      }
    });

    // Login picker render + initial apply
    renderLangPicker("langPickerLogin");
    setLanguage(currentLang);

    // Default life selection after i18n build
    lifeEl.value = lastLife;

    // HUD flag
    document.getElementById("langIcon").src = FLAG[currentLang];
  