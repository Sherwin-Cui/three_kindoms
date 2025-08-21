// 状态管理器 - 管理游戏状态和数值变化
import { globalState, characters, chapters, events, items } from '../data/gameData.js';
import { GameUtils } from '../utils/gameUtils.js';

export class StateManager {
    constructor() {
        this.state = this.initializeChapter1State();
        this.dialogueHistory = [];
        this.eventStates = {}; // 事件触发状态管理
        this.gameData = { chapters, events, items }; // 提供完整的gameData访问
    }
    
    initializeChapter1State() {
        return {
            // 章节信息
            chapter: 1,
            chapterName: "三日之约",
            
            // 全局状态
            timeProgress: 1, // 1=第1日, 2=第2日, 3=第3日
            
            // 角色状态（基于gameData.js）
            zhouYu: {
                suspicion: 50   // 猜忌值
            },
            luSu: {
                trust: 50       // 信任值
            },
            
            // 新的道具系统
            items: {
                kongMingFan: true,  // 初始携带
                xuanDeBrush: true   // 初始携带
            },
            
            // 物品状态（兼容旧系统）
            hasXuanDeBrush: true,   // 玄德亲笔
            hasDongwuTiger: false,  // 东吴虎符
            
            // 事件标记
            events: {
                acceptChallenge: false,     // 接受挑战
                signMilitaryOrder: false,   // 立军令状
                convinceLuSu: false,        // 说服鲁肃
                borrowArrows: false         // 借箭成功
            },
            
            // 已触发事件列表（用于事件系统）
            triggeredEvents: [],
            
            // 活跃NPC列表
            activeNPCs: ['zhouYu', 'luSu']
        };
    }
    
    initializeChapter2State() {
        return {
            // 章节信息
            chapter: 2,
            chapterName: "暗度陈仓",
            
            // 全局状态
            timeProgress: 2, // 第2日
            
            // 第二章专属状态
            preparationProgress: 0, // 准备进度
            
            // 角色状态（第二章不再使用猜忌值和信任值）
            ganNing: {
                alertness: 75   // 机警值
            },
            luSu: {
                trust: 60       // 信任值（延续第一章）
            },
            
            // 道具系统（继承第一章获得的道具）
            items: {
                kongMingFan: true,      // 初始携带
                dongwuTiger: true,      // 第一章获得
                militaryOrder: true     // 第一章获得
            },
            
            // 事件标记
            events: {
                requestSupplies: false,     // 索要物资
                confrontGanNing: false,    // 应对甘宁
                intelligenceDuel: false,   // 智谋对决
                predictWeather: false,     // 天机预测
                nightPreparation: false   // 夜间准备
            },
            
            // 已触发事件列表
            triggeredEvents: [],
            
            // 活跃NPC列表
            activeNPCs: ['luSu', 'ganNing']
        };
    }
    
    initializeChapter3State() {
        return {
            // 章节信息
            chapter: 3,
            chapterName: "雾夜借箭",
            
            // 全局状态
            timeProgress: 3, // 第3日
            arrows: 0,       // 箭支数量
            
            // 第三章专属状态
            dangerLevel: 0,     // 危险等级
            soldierMorale: 80,  // 士兵士气
            shipLoss: 0,        // 损失船只
            
            // 道具系统（继承前两章获得的道具）
            items: {
                kongMingFan: true,      // 初始携带
                dongwuTiger: true,      // 第一章获得
                militaryOrder: true,    // 第一章获得
                sima: true,             // 第二章获得
                grassman: true,         // 第二章获得
                luSuLetter: true        // 第二章获得
            },
            
            // 事件标记
            events: {
                mobilizeTroops: false,      // 出发前动员
                breakBlockade: false,       // 突破封锁
                borrowArrows: false,        // 擂鼓借箭
                emergencyRetreat: false,    // 紧急撤退
                finalCrisis: false          // 最后危机
            },
            
            // 已触发事件列表
            triggeredEvents: [],
            
            // 活跃NPC列表
            activeNPCs: ['soldiers', 'caoCao']
        };
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
    
    // 触发事件
    triggerEvent(eventName) {
        if (!this.eventStates[eventName]) {
            this.eventStates[eventName] = {};
        }
        this.eventStates[eventName].triggered = true;
        this.eventStates[eventName].timestamp = Date.now();
        
        // 同时更新state中的triggeredEvents数组
        if (!this.state.triggeredEvents.includes(eventName)) {
            this.state.triggeredEvents.push(eventName);
        }
        
        // 事件已触发
    }
    
    // 检查事件是否已触发
    isEventTriggered(eventName) {
        return this.eventStates[eventName]?.triggered || false;
    }
    
    // 应用数值变化
    applyValueChanges(changes) {
        // 处理周瑜数值变化 (支持中文和英文键名)
        const zhouYuChanges = changes.zhouYu || changes.周瑜;
        if (zhouYuChanges) {
            Object.entries(zhouYuChanges).forEach(([attr, value]) => {
                // 处理中文属性名映射
                const attrMap = {
                    '猜忌值': 'suspicion',
                    'suspicion': 'suspicion'
                };
                const mappedAttr = attrMap[attr] || attr;
                const oldValue = this.state.zhouYu[mappedAttr];
                const delta = this.parseValueChange(value);
                const newValue = this.clampValue(oldValue + delta, 0, 100);
                this.state.zhouYu[mappedAttr] = newValue;
            });
        }
        
        // 处理鲁肃数值变化 (支持中文和英文键名)
        const luSuChanges = changes.luSu || changes.鲁肃;
        if (luSuChanges) {
            Object.entries(luSuChanges).forEach(([attr, value]) => {
                // 处理中文属性名映射
                const attrMap = {
                    '信任值': 'trust',
                    'trust': 'trust'
                };
                const mappedAttr = attrMap[attr] || attr;
                const oldValue = this.state.luSu[mappedAttr];
                const delta = this.parseValueChange(value);
                const newValue = this.clampValue(oldValue + delta, 0, 100);
                this.state.luSu[mappedAttr] = newValue;
            });
        }
        
        // 处理全局状态变化
        if (changes.global) {
            Object.entries(changes.global).forEach(([attr, value]) => {
                const delta = this.parseValueChange(value);
                if (attr === 'timeProgress') {
                    this.state.timeProgress = this.clampValue(
                        this.state.timeProgress + delta, 1, 3
                    );
                }
            });
        }
        
        // 处理物品变化
        if (changes.items) {
            if (!this.state.items) {
                this.state.items = {};
            }
            Object.entries(changes.items).forEach(([itemId, status]) => {
                this.state.items[itemId] = status;
                
                // 兼容旧的状态键
                if (itemId === 'xuanDeBrush') {
                    this.state.hasXuanDeBrush = status;
                } else if (itemId === 'dongwuTiger') {
                    this.state.hasDongwuTiger = status;
                }
            });
        }
        
        // 处理特殊进度值 (第二章准备进度等)
        if (changes.preparationProgress) {
            const delta = this.parseValueChange(changes.preparationProgress);
            if (!this.state.preparationProgress) {
                this.state.preparationProgress = 0;
            }
            this.state.preparationProgress = this.clampValue(
                this.state.preparationProgress + delta, 0, 100
            );
        }
        
        // 处理其他章节特殊数值
        if (changes.dangerLevel) {
            const delta = this.parseValueChange(changes.dangerLevel);
            if (!this.state.dangerLevel) {
                this.state.dangerLevel = 0;
            }
            this.state.dangerLevel = this.clampValue(
                this.state.dangerLevel + delta, 0, 100
            );
        }
        
        if (changes.soldierMorale) {
            const delta = this.parseValueChange(changes.soldierMorale);
            if (!this.state.soldierMorale) {
                this.state.soldierMorale = 50;
            }
            this.state.soldierMorale = this.clampValue(
                this.state.soldierMorale + delta, 0, 100
            );
        }
        
        if (changes.shipLoss) {
            const delta = this.parseValueChange(changes.shipLoss);
            if (!this.state.shipLoss) {
                this.state.shipLoss = 0;
            }
            this.state.shipLoss = this.clampValue(
                this.state.shipLoss + delta, 0, 100
            );
        }
        
        if (changes.arrowCount) {
            const delta = this.parseValueChange(changes.arrowCount);
            if (!this.state.arrowCount) {
                this.state.arrowCount = 0;
            }
            this.state.arrowCount = Math.max(0, this.state.arrowCount + delta);
        }

        // 处理事件标记
        if (changes.events) {
            Object.entries(changes.events).forEach(([event, status]) => {
                if (this.state.events.hasOwnProperty(event)) {
                    this.state.events[event] = status;
                }
            });
        }
        
        // 状态更新完成
    }
    
    // 解析数值变化字符串（如"+5", "-10", "15"）
    parseValueChange(value) {
        if (typeof value !== 'string') {
            return 0;
        }
        
        const str = value.trim();
        
        // 处理 +10, -5 这样的格式
        if (str.match(/^[+\-]\d+$/)) {
            return parseInt(str);
        }
        
        // 处理纯数字
        if (str.match(/^\d+$/)) {
            return parseInt(str);
        }
        
        return 0;
    }
    
    // 限制数值范围
    clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // 添加对话历史
    addDialogue(speaker, content, type = 'dialogue') {
        // 简单验证和去重
        if (!speaker || !content) return;
        
        // 检查是否与最近一条对话重复
        const lastDialogue = this.dialogueHistory[this.dialogueHistory.length - 1];
        if (lastDialogue && 
            lastDialogue.speaker === speaker && 
            lastDialogue.content === content) {
            return; // 跳过重复对话
        }
        
        this.dialogueHistory.push({
            speaker,
            content,
            type,
            timestamp: Date.now()
        });
        
        // 保持历史记录在合理范围内
        if (this.dialogueHistory.length > 20) {
            this.dialogueHistory = this.dialogueHistory.slice(-15);
        }
    }
    
    // 获取对话历史
    getDialogueHistory() {
        return [...this.dialogueHistory];
    }
    
    // 使用道具
    useItem(itemName) {
        switch (itemName) {
            case 'xuande-brush':
                if (this.state.hasXuanDeBrush) {
                    this.state.hasXuanDeBrush = false;
                    // 玄德亲笔的效果：鲁肃信任+20，周瑜猜忌-10
                    this.applyValueChanges({
                        luSu: { trust: '+20' },
                        zhouYu: { suspicion: '-10' }
                    });
                    return { success: true, message: '使用玄德亲笔成功' };
                } else {
                    return { success: false, message: '玄德亲笔已经使用过了' };
                }
            default:
                return { success: false, message: '未知道具' };
        }
    }
    
    // 检查第一章结束条件
    checkChapter1End() {
        // 成功条件：获得东吴虎符
        if (this.state.hasDongwuTiger) {
            return {
                success: true,
                reason: "成功获得东吴虎符！你巧妙地说服了鲁肃，借到了足够的船只和箭矢。"
            };
        }
        
        // 失败条件1：时间耗尽
        if (this.state.timeProgress > 3) {
            return {
                success: false,
                reason: "三日期限已到，你未能完成造箭任务。任务失败。"
            };
        }
        
        // 失败条件2：周瑜猜忌过高
        if (this.state.zhouYu.suspicion >= 100) {
            return {
                success: false,
                reason: "周瑜对你极度不满，决定提前结束合作。任务失败。"
            };
        }
        
        // 检查特殊成功条件：鲁肃信任度足够高且完成关键事件
        if (this.state.luSu.trust >= 80 && this.state.events.convinceLuSu) {
            // 触发借箭成功事件
            this.state.events.borrowArrows = true;
            this.state.hasDongwuTiger = true;
            return this.checkChapter1End(); // 递归检查成功条件
        }
        
        return null; // 游戏继续
    }
    
    // 检查第二章结束条件
    checkChapter2End() {
        const currentState = this.getState();
        
        // 成功条件：准备进度≥100
        if (currentState.preparationProgress >= 100) {
            return {
                success: true,
                reason: "成功完成所有准备工作，草船借箭计划已就绪！"
            };
        }
        
        // 失败条件：时间进度>2且准备进度<80
        if (currentState.timeProgress > 2 && currentState.preparationProgress < 80) {
            return {
                success: false,
                reason: "时间不够，准备工作未能及时完成。任务失败。"
            };
        }
        
        return null; // 游戏继续
    }
    
    // 检查第三章结束条件（系统失败条件检查）
    checkChapter3End() {
        const currentState = this.getState();
        
        // 检查系统失败条件（数值阈值）
        if (currentState.dangerLevel >= 100) {
            return {
                success: false,
                reason: "危险等级过高，计划暴露，任务失败。"
            };
        }
        
        if (currentState.soldierMorale <= 30) {
            return {
                success: false,
                reason: "士兵士气低落，无法继续执行任务。"
            };
        }
        
        if (currentState.arrows < 50000) {
            return {
                success: false,
                reason: "箭支数量不足，未能完成十万支箭的任务。"
            };
        }
        
        // 如果没有系统失败条件，返回null让AI进行成功结局判定
        return null;
    }
    
    // 更新主结局检查方法
    checkGameEnd() {
        const chapter = this.state.chapter;
        
        switch(chapter) {
            case 1:
                return this.checkChapter1End();
            case 2:
                return this.checkChapter2End();
            case 3:
                return this.checkChapter3End();
            default:
                return null;
        }
    }
    
    // 获取当前游戏状态摘要
    getGameSummary() {
        const timeText = ['', '第1日', '第2日', '第3日'][this.state.timeProgress] || '未知';
        
        return {
            chapter: this.state.chapter,
            chapterName: this.state.chapterName,
            timeProgress: timeText,
            zhouYuSuspicion: this.state.zhouYu.suspicion,
            luSuTrust: this.state.luSu.trust,
            hasXuanDeBrush: this.state.hasXuanDeBrush,
            hasDongwuTiger: this.state.hasDongwuTiger,
            events: { ...this.state.events }
        };
    }
    
    /**
     * 执行检定
     * @param {string} checkType - 检定类型 (intelligence, eloquence)
     * @param {number} difficulty - 难度值
     * @param {Array} itemBonuses - 道具加成列表
     * @returns {Object} 检定结果
     */
    performCheck(checkType, difficulty = 0, itemBonuses = []) {
        // 获取角色属性（诸葛亮的属性）
        const playerAttribute = this.getCharacterAttribute('zhugeLiang', checkType);
        let totalBonus = 0;

        // 计算道具加成
        itemBonuses.forEach(itemId => {
            if (this.hasItem(itemId) && !this.state.items[itemId]?.used) {
                const item = items[itemId];
                if (item && item.effect.includes(checkType)) {
                    // 简单的加成计算，实际应该根据道具效果解析
                    totalBonus += 10; // 默认加成
                }
            }
        });

        const successRate = Math.max(0, Math.min(100, playerAttribute + totalBonus - difficulty));
        const randomValue = Math.random() * 100;
        const success = randomValue < successRate;

        const result = {
            success,
            playerAttribute,
            totalBonus,
            difficulty,
            successRate,
            randomValue,
            roll: randomValue
        };

        // 检定结果
        return result;
    }

    /**
     * 获取角色属性
     * @param {string} characterId - 角色ID
     * @param {string} attribute - 属性名
     * @returns {number} 属性值
     */
    getCharacterAttribute(characterId, attribute) {
        // 从 gameData 中获取角色基础属性
        const character = characters[characterId];
        if (character && character[attribute] !== undefined) {
            return character[attribute];
        }
        
        // 默认属性值
        const defaultAttributes = {
            intelligence: 80,
            eloquence: 75,
            strategy: 85,
            leadership: 70
        };
        
        return defaultAttributes[attribute] || 50;
    }

    /**
     * 检查是否拥有道具
     * @param {string} itemId - 道具ID
     * @returns {boolean} 是否拥有
     */
    hasItem(itemId) {
        return this.state.items && this.state.items[itemId] === true;
    }
    
    /**
     * 添加道具（防止重复获得）
     * @param {string} itemId - 道具ID
     * @returns {boolean} 是否成功添加（false表示已拥有）
     */
    addItem(itemId) {
        if (!this.state.items) {
            this.state.items = {};
        }
        
        if (this.state.items[itemId]) {
            // 道具已拥有，不重复添加
            return false; // 已拥有，不重复添加
        }
        
        this.state.items[itemId] = true;
        // 获得道具
        return true; // 成功添加
    }
    
    /**
     * 使用道具
     * @param {string} itemId - 道具ID
     * @returns {boolean} 是否成功使用
     */
    useItem(itemId) {
        if (!this.hasItem(itemId)) {
            return { success: false, message: '道具不存在或未拥有' };
        }
        
        const itemData = this.gameData.items[itemId];
        if (!itemData) {
            return { success: false, message: '道具数据不存在' };
        }
        
        // 记录道具使用历史
        if (!this.state.usedItems) {
            this.state.usedItems = {};
        }
        this.state.usedItems[itemId] = true;
        
        // 如果是消耗性道具，使用后移除
        if (itemData.consumable) {
            if (this.state.items && this.state.items[itemId]) {
                delete this.state.items[itemId];
            }
            console.log(`消耗性道具 ${itemData.name} 已使用并被移除`);
        } else {
            console.log(`可重复使用道具 ${itemData.name} 已使用`);
        }
        
        return { success: true, message: `成功使用 ${itemData.name}` };
    }
    
    /**
     * 检查道具是否已使用
     * @param {string} itemId - 道具ID
     * @returns {boolean} 是否已使用
     */
    isItemUsed(itemId) {
        return this.state.usedItems && this.state.usedItems[itemId] === true;
    }
    
    /**
     * 切换到指定章节
     * @param {number} chapterNumber - 章节号
     */
    switchToChapter(chapterNumber) {
        // 保存当前状态中需要继承的数据
        const inheritedData = {
            usedItems: this.state.usedItems || {},
            dialogueHistory: this.dialogueHistory || [],
            // 保存所有已获得的道具（除了已使用的消耗性道具）
            items: this.state.items || {}
        };
        
        // 切换章节
        switch (chapterNumber) {
            case 1:
                this.state = this.initializeChapter1State();
                break;
            case 2:
                this.state = this.initializeChapter2State();
                break;
            case 3:
                this.state = this.initializeChapter3State();
                break;
            default:
                console.warn(`未知章节: ${chapterNumber}`);
                return;
        }
        
        // 继承之前的道具使用历史
        this.state.usedItems = inheritedData.usedItems;
        
        // 继承可重复道具和未使用的消耗性道具
        Object.entries(inheritedData.items).forEach(([itemId, owned]) => {
            if (owned) {
                const itemData = this.gameData?.items?.[itemId];
                const isUsed = inheritedData.usedItems[itemId];
                
                // 如果是消耗性道具且已使用，则不继承
                if (itemData?.consumable && isUsed) {
                    // 消耗性道具已使用，不继承到新章节
                    return;
                }
                
                // 继承可重复道具或未使用的消耗性道具
                if (!this.state.items) {
                    this.state.items = {};
                }
                this.state.items[itemId] = true;
            }
        });
        
        // 继承对话历史（可以选择性继承重要对话）
        this.dialogueHistory = inheritedData.dialogueHistory;
        
        // 重置事件状态（每章独立）
        this.eventStates = {};
        
        console.log(`已切换到第${chapterNumber}章，继承了道具和历史数据`);
    }

    // 重置游戏状态
    reset() {
        this.state = this.initializeChapter1State();
        this.dialogueHistory = [];
        this.eventStates = {}; // 重置事件状态
    }
    
    // 调试方法：设置特定状态
    debugSetState(changes) {
        // 在开发环境中允许调试
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.setState(changes);
        }
    }
}