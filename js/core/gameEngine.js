// 游戏引擎 - 协调状态管理和AI交互
export class GameEngine {
    constructor(stateManager, aiManager) {
        this.stateManager = stateManager;
        this.aiManager = aiManager;
        this.eventHandlers = new Map();
        
        // 注册事件处理器
        this.registerEventHandlers();
    }
    
    // 注册事件处理器
    registerEventHandlers() {
        // 动态注册所有事件处理器
        this.registerAllEventHandlers();
    }
    
    // 动态注册所有事件处理器
    registerAllEventHandlers() {
        // 开始注册事件处理器
        
        // 清空现有的事件处理器
        this.eventHandlers.clear();
        
        const events = this.stateManager.gameData?.events || {};
        // 可用事件数据
        
        if (Object.keys(events).length === 0) {
            console.error('⚠️ 警告：events数据为空，可能是gameData加载问题');
            // 尝试重新获取gameData
            
            // 尝试重新导入gameData
            import('../data/gameData.js').then(module => {
                if (module.events) {
                    this.stateManager.gameData = {
                        chapters: module.chapters,
                        events: module.events,
                        items: module.items
                    };
                    // 递归调用重新注册
                    this.registerAllEventHandlers();
                }
            }).catch(error => {
                console.error('重新导入gameData失败:', error);
            });
            return;
        }
        
        Object.entries(events).forEach(([eventName, eventData]) => {
            // 注册事件
            if (eventData.type === 'choice_event') {
                this.eventHandlers.set(eventName, this.createChoiceEventHandler(eventName));
            } else if (eventData.type === 'dialogue_event') {
                this.eventHandlers.set(eventName, this.createDialogueEventHandler(eventName));
            } else if (eventData.type === 'check_event') {
                this.eventHandlers.set(eventName, this.createCheckEventHandler(eventName));
            }
        });
        
        // 保留向后兼容性
        this.eventHandlers.set('acceptChallenge', this.createChoiceEventHandler('choice_event1'));
        
        // 事件处理器注册完成
        
        // 验证关键事件是否注册成功
        const keyEvents = ['dialogue_event2', 'choice_event1', 'check_event1'];
        keyEvents.forEach(eventName => {
            if (this.eventHandlers.has(eventName)) {
                // 关键事件注册成功
            } else {
                console.error(`✗ 关键事件 ${eventName} 注册失败`);
            }
        });
    }
    
    // 通用选择事件处理器
    createChoiceEventHandler(eventName) {
        return (gameState) => {
            // 检查章节限制
            const eventData = this.stateManager.gameData?.events?.[eventName];
            if (!eventData || eventData.type !== 'choice_event') {
                return { trigger: false };
            }
            
            // 检查当前章节是否匹配
            if (eventData.chapter && gameState.chapter !== eventData.chapter) {
                return { trigger: false };
            }
            
            // 检查事件是否已触发
            if (this.stateManager.eventStates?.[eventName]?.triggered) {
                return { trigger: false };
            }
            
            // 标记事件已触发
            this.stateManager.triggerEvent(eventName);
            
            // 触发场景切换（如果配置了）
            if (window.gameInstance?.sceneManager) {
                const currentChapter = gameState.chapter || 1;
                window.gameInstance.sceneManager.triggerSceneChange(eventName, currentChapter);
            }
            
            return {
                trigger: true,
                id: eventData.id,
                title: eventData.title,
                type: eventData.type,
                description: eventData.description,
                choices: Object.entries(eventData.options).map(([key, option]) => ({
                    key,
                    text: option.text,
                    consequences: option.consequences,
                    requirements: option.requirements,
                    available: this.evaluateChoiceRequirements(option.requirements, gameState),
                    successText: option.successText,
                    failureText: option.failureText,
                    resultText: option.resultText
                }))
            };
        };
    }
    
    // 评估选择事件选项需求
    evaluateChoiceRequirements(requirements, gameState) {
        if (!requirements || requirements.length === 0) {
            return true; // 无需求则可用
        }
        
        return requirements.every(requirement => {
            if (requirement.startsWith('item:')) {
                // 检查是否拥有道具
                const itemId = requirement.substring(5);
                return gameState.items && gameState.items[itemId] === true;
            } else if (requirement.startsWith('usedItem:')) {
                // 检查是否已使用过道具
                const itemId = requirement.substring(9);
                return gameState.usedItems && gameState.usedItems[itemId] === true;
            } else if (requirement.includes('.')) {
                // 处理属性条件，如 "zhouYu.suspicion<50"
                const match = requirement.match(/^([^.]+)\.([^<>=!]+)\s*([<>=!]+)\s*(\d+)$/);
                if (match) {
                    const [, entity, attribute, operator, value] = match;
                    const currentValue = gameState[entity]?.[attribute];
                    return this.compareValues(currentValue, operator, parseInt(value));
                }
            }
            
            return false; // 未知需求类型默认不满足
        });
    }
        
    // 通用对话事件处理器
    createDialogueEventHandler(eventName) {
        return (gameState) => {
            // 检查章节限制
            const eventData = this.stateManager.gameData?.events?.[eventName];
            if (!eventData || eventData.type !== 'dialogue_event') {
                return { trigger: false };
            }
            
            // 检查当前章节是否匹配
            if (eventData.chapter && gameState.chapter !== eventData.chapter) {
                return { trigger: false };
            }
            
            // 检查事件是否已触发
            if (this.stateManager.eventStates?.[eventName]?.triggered) {
                return { trigger: false };
            }
            
            // 标记事件已触发
            this.stateManager.triggerEvent(eventName);
            
            // 触发场景切换（如果配置了）
            if (window.gameInstance?.sceneManager) {
                const currentChapter = gameState.chapter || 1;
                window.gameInstance.sceneManager.triggerSceneChange(eventName, currentChapter);
            }
            
            return {
                trigger: true,
                id: eventData.id,
                title: eventData.title,
                type: eventData.type,
                content: eventData.content
            };
        };
    }
        
    // 通用检定事件处理器
    createCheckEventHandler(eventName) {
        return (gameState) => {
            // 检查章节限制
            const eventData = this.stateManager.gameData?.events?.[eventName];
            if (!eventData || eventData.type !== 'check_event') {
                return { trigger: false };
            }
            
            // 检查当前章节是否匹配
            if (eventData.chapter && gameState.chapter !== eventData.chapter) {
                return { trigger: false };
            }
            
            // 检查事件是否已触发
            if (this.stateManager.eventStates?.[eventName]?.triggered) {
                return { trigger: false };
            }
            
            // 标记事件已触发
            this.stateManager.triggerEvent(eventName);
            
            // 返回检定事件信息，由UI处理检定流程
            return {
                trigger: true,
                id: eventData.id,
                title: eventData.title,
                type: eventData.type,
                description: eventData.description,
                checkType: eventData.checkType,
                successThreshold: eventData.successThreshold,
                formula: eventData.formula,
                additionalCondition: eventData.additionalCondition,
                successEffects: eventData.successEffects,
                successText: eventData.successText,
                failureEffects: eventData.failureEffects,
                failureText: eventData.failureText,
                // 添加检定完成后的处理回调
                onCheckComplete: (checkResult) => this.handleCheckEventResult(eventName, eventData, checkResult)
            };
        };
    }
    
    /**
     * 处理检定事件结果
     * @param {string} eventName - 事件名称
     * @param {Object} eventData - 事件数据
     * @param {Object} checkResult - 检定结果
     */
    handleCheckEventResult(eventName, eventData, checkResult) {
        // 记录检定结果状态
        const resultEventName = eventName + (checkResult.success ? '_success' : '_failure');
        this.stateManager.triggerEvent(resultEventName);
        
        // 如果是大成功，额外记录大成功状态
        if (checkResult.success && checkResult.roll >= 90) {
            this.stateManager.triggerEvent(eventName + '_great_success');
        }
        
        // 成功时触发场景切换
        if (checkResult.success && window.gameInstance?.sceneManager) {
            const currentChapter = this.stateManager.getState().chapter || 1;
            window.gameInstance.sceneManager.triggerSceneChange(eventName, currentChapter);
        }
                
        // 应用检定结果的效果
        const effects = checkResult.success ? eventData.successEffects : eventData.failureEffects;
        if (effects) {
            effects.forEach(effect => {
                if (effect.type === 'change') {
                    // 处理数值变化
                    const [target, attribute] = effect.target.split('.');
                    const changes = {};
                    changes[target] = {};
                    changes[target][attribute] = effect.value;
                    this.stateManager.applyValueChanges(changes);
                } else if (effect.type === 'gainItem') {
                    // 处理道具获得
                    const itemChanges = {};
                    itemChanges[effect.value] = true;
                    this.stateManager.applyValueChanges({
                        items: itemChanges
                    });
                }
            });
        }
        
        // 返回处理结果
        return {
            success: checkResult.success,
            resultText: checkResult.success ? eventData.successText : eventData.failureText,
            checkResult: checkResult
        };
    }
    
    // 通用道具触发检查
    checkItemTriggers(gameState) {
        const gameData = this.stateManager.gameData;
        if (!gameData?.items) {
            return [];
        }
        
        const triggeredItems = [];
        
        Object.entries(gameData.items).forEach(([itemId, itemData]) => {
            // 检查是否已获得该道具
            if (gameState.items && gameState.items[itemId]) {
                return;
            }
            
            // 对于消耗性道具，还需检查是否已经使用过（避免重复获得）
            if (itemData.consumable && gameState.usedItems && gameState.usedItems[itemId]) {
                return; // 消耗性道具已使用过，不再触发获得
            }
            
            // 解析触发条件
            const shouldTrigger = this.evaluateItemTriggerCondition(itemData.triggerCondition, gameState, itemId);
            
            if (shouldTrigger) {
                triggeredItems.push({
                    id: itemId,
                    name: itemData.name,
                    effect: itemData.effect,
                    usage: itemData.usage
                });
            }
        });
        
        return triggeredItems;
    }
    
    // 评估道具触发条件
    evaluateItemTriggerCondition(triggerCondition, gameState, itemId) {
        if (!triggerCondition) {
            return false;
        }
        
        const condition = triggerCondition.toLowerCase();
        
        // 初始携带道具
        if (condition === "初始携带") {
            return gameState.chapter === 1 && !gameState.items?.[itemId];
        }
        
        // 对话事件后获得
        if (condition.includes("dialogue_event") && condition.includes("触发后获得")) {
            const eventId = condition.match(/dialogue_event\d+/)?.[0];
            return this.stateManager.isEventTriggered(eventId);
        }
        
        // 检定事件成功后获得
        if (condition.includes("check_event") && condition.includes("成功后获得")) {
            const eventId = condition.match(/check_event\d+/)?.[0];
            return this.stateManager.isEventTriggered(eventId + "_success");
        }
        
        // 检定事件大成功时获得
        if (condition.includes("check_event") && condition.includes("大成功时获得")) {
            const eventId = condition.match(/check_event\d+/)?.[0];
            return this.stateManager.isEventTriggered(eventId + "_great_success");
        }
        
        // 基于数值条件的触发
        if (condition.includes("preparationprogress")) {
            const threshold = parseInt(condition.match(/\d+/)?.[0] || 0);
            return gameState.preparationProgress >= threshold;
        }
        
        // 复合条件：检定成功且属性满足条件
        if (condition.includes("成功且")) {
            const parts = condition.split("且");
            if (parts.length === 2) {
                const eventPart = parts[0];
                const attributePart = parts[1];
                
                // 检查事件是否成功
                const eventId = eventPart.match(/check_event\d+/)?.[0];
                const eventSuccess = this.stateManager.isEventTriggered(eventId + "_success");
                
                // 检查属性条件
                const attributeMatch = attributePart.match(/(\w+)\.(\w+)\s*([<>=!]+)\s*(\d+)/);
                if (attributeMatch && eventSuccess) {
                    const [, entity, attribute, operator, value] = attributeMatch;
                    const currentValue = gameState[entity]?.[attribute];
                    return this.compareValues(currentValue, operator, parseInt(value));
                }
            }
        }
        
        // 特定条件下获得（暂时返回false，需要具体实现）
        if (condition === "特定条件下获得") {
            // 这里可以根据具体游戏逻辑实现
            return false;
        }
        
        return false;
    }
    
    // 数值比较辅助方法
    compareValues(currentValue, operator, targetValue) {
        switch (operator) {
            case '>=':
                return currentValue >= targetValue;
            case '<=':
                return currentValue <= targetValue;
            case '>':
                return currentValue > targetValue;
            case '<':
                return currentValue < targetValue;
            case '==':
            case '=':
                return currentValue == targetValue;
            case '!=':
                return currentValue != targetValue;
            default:
                return false;
        }
    }
    
    // 检查章节结束条件
    checkChapterEnd(gameState) {
        const currentChapter = gameState.chapter || 1;
        const gameData = this.stateManager.gameData;
        
        if (!gameData?.chapters) {
            return null;
        }
        
        const chapterKey = `chapter${currentChapter}`;
        const chapterData = gameData.chapters[chapterKey];
        
        if (!chapterData) {
            return null;
        }
        
        // 特殊处理第三章的endings结构
        if (currentChapter === 3 && chapterData.endings) {
            return this.checkChapter3Endings(gameState, chapterData.endings);
        }
        
        // 检查成功条件
        if (this.evaluateConditions(chapterData.successConditions, gameState)) {
            return {
                success: true,
                type: 'success',
                chapter: currentChapter,
                title: chapterData.title,
                nextChapter: currentChapter + 1
            };
        }
        
        // 检查失败条件
        if (this.evaluateConditions(chapterData.failureConditions, gameState)) {
            return {
                success: false,
                type: 'failure',
                chapter: currentChapter,
                title: chapterData.title,
                retry: true
            };
        }
        
        return null;
    }
    
    // 检查第三章结局（处理endings结构）
    checkChapter3Endings(gameState, endings) {
        // 按优先级顺序检查：perfect > success > barely > failure
        const endingOrder = ['perfect', 'success', 'barely', 'failure'];
        
        for (const endingType of endingOrder) {
            const endingData = endings[endingType];
            if (endingData && this.evaluateConditions(endingData.conditions, gameState)) {
                return {
                    success: endingType !== 'failure',
                    type: endingType,
                    chapter: 3,
                    ending: endingType,
                    title: endingData.title,
                    description: endingData.description,
                    narrative: endingData.narrative
                };
            }
        }
        
        // 如果没有任何结局条件满足，返回null继续游戏
        return null;
    }
    
    // 确定第三章的具体结局类型（用于AI成功判定）
    determineChapter3EndingType(gameState) {
        const chapterData = this.stateManager.gameData.chapters.chapter3;
        if (!chapterData.endings) return null;
        
        // 按优先级检查结局类型
        const endingOrder = ['perfect', 'success', 'barely'];
        for (const endingType of endingOrder) {
            const ending = chapterData.endings[endingType];
            if (ending && this.evaluateConditions(ending.conditions, gameState)) {
                return {
                    type: endingType,
                    title: ending.title,
                    description: ending.description
                };
            }
        }
        
        // 默认为普通成功
        return {
            type: 'success',
            title: chapterData.endings.success?.title || '任务完成',
            description: chapterData.endings.success?.description || '成功完成任务'
        };
    }
    
    // 通用条件评估方法
    evaluateConditions(conditions, gameState) {
        if (!conditions || conditions.length === 0) {
            return false;
        }
        
        // 处理单个条件对象
        if (!Array.isArray(conditions)) {
            return this.evaluateSingleCondition(conditions, gameState);
        }
        
        // 处理条件数组（默认为AND关系）
        return conditions.every(condition => this.evaluateSingleCondition(condition, gameState));
    }
    
    // 评估单个条件
    evaluateSingleCondition(condition, gameState) {
        if (!condition) {
            return false;
        }
        
        // 处理逻辑操作符
        if (condition.type === 'and') {
            return condition.conditions.every(subCondition => 
                this.evaluateSingleCondition(subCondition, gameState)
            );
        }
        
        if (condition.type === 'or') {
            return condition.conditions.some(subCondition => 
                this.evaluateSingleCondition(subCondition, gameState)
            );
        }
        
        // 处理基本条件
        const { variable, operator, value } = condition;
        
        if (!variable || !operator) {
            return false;
        }
        
        let currentValue;
        
        // 处理道具条件
        if (variable.startsWith('item:')) {
            const itemId = variable.substring(5);
            currentValue = gameState.items?.[itemId] ? true : false;
        }
        // 处理角色属性
        else if (variable.includes('.')) {
            const [entity, attribute] = variable.split('.');
            currentValue = gameState[entity]?.[attribute];
        }
        // 处理全局状态
        else {
            currentValue = gameState[variable];
        }
        
        return this.compareValues(currentValue, operator, value);
    }
    
    // 处理玩家输入
    async processPlayerInput(playerInput) {
        try {
            const currentState = this.stateManager.getState();
            
            // 只有当玩家输入不为空时才记录到对话历史
            if (playerInput && playerInput.trim() !== '') {
                this.stateManager.addDialogue('诸葛亮', playerInput, 'player');
            }
            
            // 移除基于玩家输入的事件触发逻辑
            
            // 构建玩家行动对象
            const playerAction = {
                input: playerInput,
                item: null // 道具使用在useItem方法中单独处理
            };
            
            // 构建完整的游戏状态
            const fullGameState = {
                ...currentState,
                dialogueHistory: this.stateManager.getDialogueHistory()
            };
            
            // 调用AI处理
            const aiResult = await this.aiManager.processInput(fullGameState, playerAction);
            
            if (!aiResult.success) {
                throw new Error(aiResult.error);
            }
            
            let response = aiResult.data;
            
            // 移除基于玩家输入的事件效果应用
            
            // 保存应用数值变化前的状态用于动画
            const oldStateForAnimation = response.value_changes ? 
                JSON.parse(JSON.stringify(this.stateManager.getState())) : null;
            
            // 应用数值变化到状态管理器
            if (response.value_changes) {
                // 应用数值变化
                this.stateManager.applyValueChanges(response.value_changes);
                
                // 将旧状态添加到响应中用于动画
                response.oldStateForAnimation = oldStateForAnimation;
            }
            
            // 记录NPC对话到历史
            if (response.npc_dialogue) {
                this.stateManager.addDialogue(
                    response.npc_dialogue.speaker,
                    response.npc_dialogue.content,
                    'npc'
                );
            }
            
            // 处理特殊进度值变化
            if (response.special_progress) {
                // 应用特殊进度值变化
                this.stateManager.applyValueChanges(response.special_progress);
            }
            
            // 处理AI响应中的事件建议（使用更新后的状态）
            if (response.event_suggestion && response.event_suggestion.should_trigger) {
                const aiEvents = [];
                
                // 获取应用数值变化后的最新状态
                const updatedStateForEvents = this.stateManager.getState();
                
                const eventName = response.event_suggestion.event_id;
                const reason = response.event_suggestion.reason;
                
                if (this.eventHandlers.has(eventName)) {
                    const handler = this.eventHandlers.get(eventName);
                    const eventResult = handler(updatedStateForEvents);
                    
                    if (eventResult.trigger) {
                        aiEvents.push({
                            name: eventName,
                            reason: reason,
                            ...eventResult
                        });
                    }
                } else {
                    console.warn(`警告: 事件 ${eventName} 没有对应的处理器`);
                }
                
                if (aiEvents.length > 0) {
                    response.autoEvents = aiEvents;
                }
            }
            
            // 移除自动事件检查逻辑
            
            // 处理道具授予
            if (response.item_grant && response.item_grant.should_grant) {
                const itemNotifications = [];
                
                const itemId = response.item_grant.item_id;
                const conditionMet = response.item_grant.condition_met;
                
                // 应用道具变化到状态管理器
                this.stateManager.applyValueChanges({
                    items: { [itemId]: true }
                });
                
                // 添加到通知列表
                const itemData = this.stateManager.gameData?.items?.[itemId];
                if (itemData) {
                    itemNotifications.push({
                        type: 'item_gained',
                        itemId: itemId,
                        itemName: itemData.name,
                        description: itemData.effect?.description || '获得新道具',
                        condition: conditionMet
                    });
                }
                
                // 将道具通知添加到响应中
                if (itemNotifications.length > 0) {
                    response.itemNotifications = itemNotifications;
                }
            }
        
        // 检查道具触发条件
        const updatedState = this.stateManager.getState();
        const triggeredItems = this.checkItemTriggers(updatedState);
        if (triggeredItems.length > 0) {
            // 道具触发检查
            
            // 应用道具获得
            const itemChanges = {};
            triggeredItems.forEach(item => {
                itemChanges[item.id] = true;
            });
            
            this.stateManager.applyValueChanges({
                items: itemChanges
            });
            
            // 添加到响应中
            if (!response.itemNotifications) {
                response.itemNotifications = [];
            }
            triggeredItems.forEach(item => {
                response.itemNotifications.push({
                    type: 'item_gained',
                    itemId: item.id,
                    itemName: item.name,
                    description: `获得道具：${item.name}`
                });
            });
        }
        
        // 处理AI的结局判定（在系统检查之前）
        const finalState = this.stateManager.getState();
        if (response.gameEnd && response.gameEnd.isEnd) {
            // AI判定游戏结束
            const aiEndResult = {
                success: response.gameEnd.endType === 'Success',
                type: response.gameEnd.endType === 'Success' ? 'ai_success' : 'ai_failure',
                chapter: finalState.chapter,
                reason: response.gameEnd.reason,
                isAIJudged: true // 标记这是AI判定的结局
            };
            
            // 如果AI判定成功，还需要检查具体的结局类型（对于第三章）
            if (finalState.chapter === 3 && aiEndResult.success) {
                const detailedEnding = this.determineChapter3EndingType(finalState);
                if (detailedEnding) {
                    aiEndResult.ending = detailedEnding.type;
                    aiEndResult.title = detailedEnding.title;
                    aiEndResult.description = detailedEnding.description;
                }
            }
            
            response.chapterEnd = aiEndResult;
        } else {
            // 系统结局判定（失败条件检查）
            const chapterEndResult = this.checkChapterEnd(finalState);
            if (chapterEndResult) {
                response.chapterEnd = chapterEndResult;
            }
        }
        
        // 4. 是否成功解析并更新（事件、道具、数值）
        const updateStatus = {
            事件更新: response.event_suggestion?.should_trigger || false,
            道具更新: response.item_grant?.should_grant || (response.itemNotifications && response.itemNotifications.length > 0) || false,
            数值更新: response.value_changes ? Object.keys(response.value_changes).length > 0 : false
        };
        console.log('\n=== 4. 是否成功解析并更新（事件、道具、数值）===');
        console.log(updateStatus);
        
        return {
            success: true,
            data: response
        };
            
        } catch (error) {
            console.error('\n=== 游戏引擎处理失败 ===');
            console.error('错误信息:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 清理完成：已删除所有无用的事件处理方法
    
    // 使用道具
    async useItem(itemName) {
        try {
            const currentState = this.stateManager.getState();
            
            // 检查道具是否可用
            const itemCheck = this.checkItemAvailability(itemName, currentState);
            if (!itemCheck.available) {
                return {
                    success: false,
                    error: itemCheck.reason
                };
            }
            
            // 使用道具（更新状态）
            const useResult = this.stateManager.useItem(itemName);
            if (!useResult.success) {
                return {
                    success: false,
                    error: useResult.message
                };
            }
            
            // 调用AI处理道具使用
            const aiResult = await this.aiManager.processItemUse(itemName, {
                ...this.stateManager.getState(),
                dialogueHistory: this.stateManager.getDialogueHistory()
            });
            
            if (!aiResult.success) {
                // 如果AI处理失败，回滚道具使用
                this.rollbackItemUse(itemName);
                throw new Error(aiResult.error);
            }
            
            // 道具使用不需要记录到对话历史中，因为已经在道具使用信息部分处理
            // 只在控制台记录即可
            console.log(`道具使用成功：${this.getItemDisplayName(itemName)}`);
            
            return {
                success: true,
                data: aiResult.data
            };
            
        } catch (error) {
            console.error('使用道具失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 检查道具可用性
    checkItemAvailability(itemId, gameState) {
        // 检查是否拥有道具
        if (!this.stateManager.hasItem(itemId)) {
            return {
                available: false,
                reason: '道具不存在或未拥有'
            };
        }
        
        // 检查是否已经使用过（对于某些道具）
        const itemData = this.stateManager.gameData?.items?.[itemId];
        if (!itemData) {
            return {
                available: false,
                reason: '道具数据不存在'
            };
        }
        
        // 消耗性道具检查是否已使用
        if (itemData.consumable && this.stateManager.isItemUsed(itemId)) {
            return {
                available: false,
                reason: `${itemData.name}已经使用过了`
            };
        }
        
        return { available: true };
    }
    
    // 回滚道具使用（用于错误恢复）
    rollbackItemUse(itemId) {
        // 如果是消耗性道具，需要恢复到items中
        const itemData = this.stateManager.gameData?.items?.[itemId];
        if (itemData && itemData.consumable) {
            // 恢复消耗性道具
            this.stateManager.setState({
                ...this.stateManager.getState(),
                items: {
                    ...this.stateManager.getState().items,
                    [itemId]: true
                }
            });
        }
        
        // 移除使用记录
        const currentState = this.stateManager.getState();
        if (currentState.usedItems && currentState.usedItems[itemId]) {
            delete currentState.usedItems[itemId];
        }
        
        console.log(`已回滚道具使用: ${itemId}`);
    }
    
    // 获取道具显示名称
    getItemDisplayName(itemId) {
        const itemData = this.stateManager.gameData?.items?.[itemId];
        return itemData?.name || itemId;
    }
    
    // 获取游戏状态
    getGameState() {
        return this.stateManager.getState();
    }
    
    // 重置游戏
    resetGame() {
        this.stateManager.reset();
        // 游戏已重置
    }
    
    // 保存游戏状态
    saveGame(slotName = 'default') {
        try {
            const gameData = {
                state: this.stateManager.getState(),
                dialogueHistory: this.stateManager.getDialogueHistory(),
                timestamp: Date.now()
            };
            
            localStorage.setItem(`savegame_${slotName}`, JSON.stringify(gameData));
            return { success: true, message: '游戏保存成功' };
        } catch (error) {
            console.error('保存游戏失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 加载游戏状态
    loadGame(slotName = 'default') {
        try {
            const savedData = localStorage.getItem(`savegame_${slotName}`);
            if (!savedData) {
                return { success: false, error: '没有找到存档' };
            }
            
            const gameData = JSON.parse(savedData);
            this.stateManager.setState(gameData.state);
            this.stateManager.dialogueHistory = gameData.dialogueHistory || [];
            
            return { success: true, message: '游戏加载成功' };
        } catch (error) {
            console.error('加载游戏失败:', error);
            return { success: false, error: error.message };
        }
    }
}