// 草船借箭 - AI提示词构建器
// 根据游戏状态动态构建发送给AI的Prompt

import { globalState, characters, chapters, events, items, reactionRules, dialogueRules } from './data/gameData.js';

/**
 * AI提示词构建器
 */
class PromptBuilder {
  constructor() {
    this.systemPrompt = this.getSystemPrompt();
    this.gameBackground = this.getGameBackground();
  }

  /**
   * 构建完整的AI提示词
   * @param {Object} gameState - 当前游戏状态
   * @param {Object} playerAction - 玩家行动
   * @returns {string} 完整的提示词
   */
  buildPrompt(gameState, playerAction) {
    const chapter = chapters[`chapter${gameState.chapter}`];
    const activeNPCs = this.getChapterNPCs(gameState.chapter);
    
    let prompt = this.systemPrompt;
    
    // 添加当前章节信息
    prompt += `\n\n## 当前章节：第${chapter.id}章 ${chapter.title}`;
    prompt += `\n\n### 章节梗概\n${chapter.plotSummary}`;
    
    // 添加本章可触发的事件和道具ID列表
    prompt += this.buildChapterEventsAndItemsSimple(chapter.id);
    
    // 添加当前场景出场人物
    prompt += this.buildCharacterSection(gameState, activeNPCs);
    
    // 添加数值变化规则
    prompt += this.buildReactionRules(activeNPCs, gameState.chapter);
    
    // 添加当前游戏状态
    prompt += this.buildGameStateSection(gameState, chapter);
    
    // 添加游戏进度状态
    prompt += this.buildGameProgressStatus(gameState);
    
    // 添加对话历史
    prompt += this.buildDialogueHistory(gameState.dialogueHistory);
    
    // 添加玩家道具使用信息
    prompt += this.buildPlayerItemUsage(playerAction);
    
    // 添加玩家最新行动
    prompt += this.buildPlayerAction(playerAction);
    
    // 添加输出要求
    prompt += this.getOutputRequirements();
    
    return prompt;
  }

  /**
   * 获取系统设定
   */
  getSystemPrompt() {
    return `## 系统设定
你是文字冒险游戏《草船借箭》的游戏主持人。你需要：
1. 扮演所有NPC角色，保持其性格特征
2. 根据玩家（诸葛亮）的言行判断NPC属性值的变化
3. 根据章节规则更新特殊进度值
4. 推进剧情发展，营造紧张氛围
5. 识别何时应该触发特定事件，并按照格式输出`;
  }

  /**
   * 获取游戏背景
   */
  getGameBackground() {
    return `建安十三年冬，曹操率八十万大军南下，兵锋直指江东。孙刘联盟初成，共御强敌。时诸葛孔明奉刘玄德之命，留驻东吴襄助破曹。然东吴大都督周公瑾，虽英姿勃发，才略过人，却心胸偏狭，见孔明智谋超群，恐日后为东吴之患，遂生妒贤之心。`;
  }

  /**
   * 根据章节获取主要NPC列表
   * @param {number} chapterNumber - 章节号
   * @returns {Array} NPC ID列表
   */
  getChapterNPCs(chapterNumber) {
    const chapterNPCs = {
      1: ["zhouYu", "luSu"],      // 第一章：周瑜、鲁肃
      2: ["luSu", "ganNing"],     // 第二章：鲁肃、甘宁  
      3: ["ganNing"]              // 第三章：甘宁（主要）
    };
    return chapterNPCs[chapterNumber] || [];
  }

  /**
   * 根据场景获取活跃的NPC列表（保留兼容性）
   * @param {string} scene - 当前场景
   * @returns {Array} NPC ID列表
   */
  getActiveNPCs(scene) {
    const sceneNPCs = {
      "东吴军营": ["zhouYu", "luSu"],
      "江边": ["luSu", "ganNing"],
      "船上": ["ganNing"],
      "军议厅": ["zhouYu", "luSu", "ganNing"],
      "观星台": [],
      "水寨": ["ganNing"]
    };
    return sceneNPCs[scene] || [];
  }

  /**
   * 构建角色信息部分
   * @param {Object} gameState - 游戏状态
   * @param {Array} activeNPCs - 活跃NPC列表
   * @returns {string} 角色信息文本
   */
  buildCharacterSection(gameState, activeNPCs) {
    let section = `\n\n### 当前场景出场人物`;
    
    // 添加玩家角色
    const playerAttrs = gameState.characters?.zhugeLiang?.attributes || characters.zhugeLiang.attributes;
    section += `\n\n**诸葛亮（玩家角色）**\n- 当前属性：智谋值${playerAttrs.intelligence}，口才值${playerAttrs.eloquence}，体力值${playerAttrs.stamina}`;
    
    // 添加当前场景NPC
    activeNPCs.forEach(npcId => {
      const npc = characters[npcId];
      const attrs = gameState.characters?.[npcId]?.attributes || npc.attributes;
      section += `\n\n**${npc.name}（NPC）**\n- 身份：${npc.description.split('。')[0]}\n- 性格：${npc.description.split('。')[1]}\n- 当前属性：${this.formatAttributes(attrs)}`;
    });
    
    return section;
  }

  /**
   * 构建反应规则部分
   * @param {Array} activeNPCs - 活跃NPC列表
   * @returns {string} 反应规则文本
   */

  /**
   * 构建简化的章节事件和道具ID列表
   * @param {number} chapterId - 章节ID
   * @returns {string} 简化的事件道具列表
   */
  buildChapterEventsAndItemsSimple(chapterId) {
    const chapterData = {
      1: {
        events: ["choice_event1", "dialogue_event2", "check_event1"],
        items: ["militaryOrder", "dongwuTiger"]
      },
      2: {
        events: ["dialogue_event3", "choice_event2", "check_event2", "dialogue_event4", "check_event3"],
        items: ["sima", "confusionIncense", "grassman", "warDrum", "luSuLetter"]
      },
      3: {
        events: ["dialogue_event5", "choice_event3", "check_event4", "check_event5", "choice_event4", "dialogue_event7"],
        items: ["windTalisman"]
      }
    };
    
    const data = chapterData[chapterId];
    if (!data) return '';
    
    let section = `\n\n### 本章可触发内容`;
    section += `\n**事件ID列表：** ${data.events.join(', ')}`;
    section += `\n**道具ID列表：** ${data.items.join(', ')}`;
    
    return section;
  }

  buildReactionRules(activeNPCs, chapterNumber) {
    let section = `\n\n### 数值变化规则`;
    
    if (!activeNPCs || activeNPCs.length === 0) {
      section += `\n暂无特定NPC规则`;
      return section;
    }
    
    activeNPCs.forEach(npcId => {
      // 处理基本NPC规则
      if (reactionRules[npcId]) {
        section += `\n\n**${characters[npcId].name}的反应规则：**\n${reactionRules[npcId]}`;
      }
      
      // 处理第二章鲁肃的特殊规则
      if (npcId === 'luSu' && chapterNumber === 2 && reactionRules.luSuChapter2) {
        section += `\n\n**${characters[npcId].name}的第二章特殊规则：**\n${reactionRules.luSuChapter2}`;
      }
    });
    
    return section;
  }

  /**
   * 构建简洁的游戏进度状态
   * @param {Object} gameState - 游戏状态
   * @returns {string} 游戏进度状态文本
   */
  buildGameProgressStatus(gameState) {
    let section = `\n\n### 游戏进度状态`;
    
    // 已触发事件
    section += `\n\n**已触发事件：**`;
    if (gameState.triggeredEvents && gameState.triggeredEvents.length > 0) {
      section += `\n${gameState.triggeredEvents.join(', ')}`;
    } else {
      section += `\n暂无`;
    }
    
    // 已使用道具
    section += `\n\n**已使用道具：**`;
    if (gameState.usedItems && Object.keys(gameState.usedItems).length > 0) {
      const usedItems = Object.keys(gameState.usedItems).filter(itemId => gameState.usedItems[itemId]);
      section += `\n${usedItems.join(', ')}`;
    } else {
      section += `\n暂无`;
    }
    
    // 当前拥有道具
    section += `\n\n**当前拥有道具：**`;
    if (gameState.items && Object.keys(gameState.items).length > 0) {
      const ownedItems = Object.keys(gameState.items).filter(itemId => gameState.items[itemId]);
      section += `\n${ownedItems.join(', ')}`;
    } else {
      section += `\n暂无`;
    }
    
    return section;
  }


  /**
   * 构建游戏状态部分
   * @param {Object} gameState - 游戏状态
   * @param {Object} chapter - 章节信息
   * @returns {string} 游戏状态文本
   */
  buildGameStateSection(gameState, chapter) {
    let section = `\n\n### 当前游戏状态\n全局状态：`;
    
    // 全局状态
    const globalStateData = gameState.globalState || globalState;

    section += `\n- 时间进度(timeProgress)：第${globalStateData.timeProgress.current}日/共${globalStateData.timeProgress.max}日`;
    section += `\n- 箭支数量(arrows)：${globalStateData.arrows.current}支`;
    
    // 章节特有状态
    if (chapter.chapterState) {
      section += `\n\n章节状态：`;
      Object.entries(chapter.chapterState).forEach(([key, value]) => {
        const currentValue = gameState.chapterState?.[key]?.current || value.current;
        section += `\n- ${value.description}(${key})：${currentValue}/${value.max}`;
      });
    }
    
    return section;
  }

  /**
   * 构建对话历史部分
   * @param {Array} dialogueHistory - 对话历史
   * @returns {string} 对话历史文本
   */
  buildDialogueHistory(dialogueHistory) {
    let section = `\n\n### 对话历史`;
    
    if (!dialogueHistory || dialogueHistory.length === 0) {
      section += `\n暂无对话历史`;
      return section;
    }
    
    // 取最近10条对话
    const recentDialogue = dialogueHistory.slice(-10);
    recentDialogue.forEach(dialogue => {
      // 只过滤掉明显异常的记录
      if (dialogue && dialogue.speaker && dialogue.content && 
          dialogue.speaker !== 'null' && dialogue.speaker !== 'undefined') {
        section += `\n${dialogue.speaker}：${dialogue.content}`;
      }
    });
    
    return section;
  }


  /**
   * 构建玩家道具使用信息
   * @param {Object} playerAction - 玩家行动
   * @returns {string} 道具使用信息文本
   */
  buildPlayerItemUsage(playerAction) {
    let section = `\n\n### 玩家使用道具信息`;
    
    if (!playerAction.item) {
      section += `\n本轮未使用道具`;
      return section;
    }
    
    const item = items[playerAction.item];
    if (!item) {
      section += `\n错误：道具 ${playerAction.item} 不存在`;
      return section;
    }
    
    section += `\n**使用道具：${item.name}**`;
    section += `\n- 道具ID：${item.id}`;
    section += `\n- 效果：${this.formatItemEffect(item.effect)}`;
    section += `\n- 类型：${item.consumable ? '消耗性道具（使用后移除）' : '可重复使用道具'}`;
    section += `\n- 使用时机：${item.usage?.timing || '未定义'}`;
    section += `\n- 描述：${item.usage?.description || '无描述'}`;
    
    // 具体的数值影响说明
    if (item.effect) {
      section += `\n\n**AI应用此道具效果到数值变化：**`;
      switch (item.effect.type) {
        case 'checkBonus':
          section += `\n- 为本次${item.effect.target}检定提供+${item.effect.value}加成`;
          break;
        case 'attributeChange':
          section += `\n- 直接修改${item.effect.target}数值：${item.effect.value > 0 ? '+' : ''}${item.effect.value}`;
          break;
        case 'special':
          section += `\n- 特殊效果：${item.effect.description}`;
          break;
        default:
          section += `\n- 其他效果：${JSON.stringify(item.effect)}`;
      }
    }
    
    return section;
  }

  /**
   * 获取事件类型中文名称
   * @param {string} eventType - 事件类型
   * @returns {string} 中文名称
   */
  getEventTypeName(eventType) {
    const typeNames = {
      'dialogue_event': '对话事件',
      'choice_event': '抉择事件', 
      'check_event': '检定事件',
      'emergency_event': '突发事件'
    };
    return typeNames[eventType] || eventType;
  }

  /**
   * 构建玩家行动部分
   * @param {Object} playerAction - 玩家行动
   * @returns {string} 玩家行动文本
   */
  buildPlayerAction(playerAction) {
    let section = `\n\n### 玩家最新发言`;
    
    // 只显示玩家发言，道具使用信息已在前面的专门部分处理
    section += `\n玩家发言：${playerAction.input || '（无发言）'}`;
    
    return section;
  }

  /**
   * 获取输出要求
   */
  getOutputRequirements() {
    return `\n\n## 输出要求\n**根据当前的对话历史判断，你应该如何安排旁白和出场人物的发言顺序和内容以及数值变化。**\n请根据当前情况，以JSON格式输出：\n{\n  "narrative": "环境描述和剧情推进的叙述文本",\n  "npc_dialogue": {\n    "speaker": "NPC名字",\n    "content": "对话内容"\n  },\n  "value_changes": {\n    "npcName": {\n      "attribute": "±数值"\n    }\n  },\n  "special_progress": {\n    "progressName": "±数值"\n  },\n  "event_suggestion": {\n    "should_trigger": true/false,\n    "event_id": "事件ID",\n    "reason": "触发理由"\n  },\n  "item_grant": {\n    "should_grant": true/false,\n    "item_id": "道具ID",\n    "condition_met": "条件说明"\n  },\n  "gameEndJudgment": {\n    "isEnd": true/false,\n    "endType": "Success或Failure",\n    "reason": "结局判定的详细原因"\n  }\n}\n\n**重要说明：**\n- event_suggestion字段：当需要触发事件时，设置should_trigger为true，并提供事件ID和触发理由\n- item_grant字段：当需要获得道具时，设置should_grant为true，并提供道具ID和条件说明\n- special_progress字段：用于更新特殊进度值，如preparationProgress等\n- gameEndJudgment字段：**你负责成功结局的判定！**当剧情自然发展到可以成功结束时，必须输出成功结局判定\n  * 系统只负责失败条件的检查（如数值过低、时间耗尽等）\n  * 成功结局必须由你来判定，特别是第三章，当草船借箭任务成功完成时\n  * 判定成功时设置isEnd=true, endType="Success"，并详细说明成功的原因\n- 如果不需要触发事件或获得道具，对应字段可以省略或设为null`;
  }

  /**
   * 格式化属性显示
   * @param {Object} attrs - 属性对象
   * @returns {string} 格式化的属性文本
   */
  formatAttributes(attrs) {
    const attrNameMap = {
      intelligence: "智谋值",
      suspicion: "猜忌值",
      trust: "信任值",
      alertness: "机警值",
      eloquence: "口才值",
      stamina: "体力值"
    };
    
    return Object.entries(attrs)
      .map(([key, value]) => {
        const attrName = attrNameMap[key] || key;
        return `${attrName}${value}`;
      })
      .join('，');
  }

  /**
   * 格式化道具效果
   * @param {Object} effect - 道具效果
   * @returns {string} 格式化的效果文本
   */
  formatItemEffect(effect) {
    if (effect.type === 'attributeChange') {
      return `${effect.target}+${effect.value}`;
    } else if (effect.type === 'checkBonus') {
      return `${effect.target}检定+${effect.value}`;
    } else if (effect.type === 'special') {
      return effect.target;
    } else if (effect.type === 'multiple') {
      return effect.effects.map(e => this.formatItemEffect(e)).join('，');
    }
    return "特殊效果";
  }
}

/**
 * API调用函数示例
 * @param {string} prompt - 构建的提示词
 * @returns {Promise} API响应
 */
async function callDeepSeekAPI(prompt) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-f3ebd7b147f648c99f24ba9ee9e07550'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// 导出
export { PromptBuilder, callDeepSeekAPI };
export default PromptBuilder;