/**
 * 测试工具类 - 用于游戏功能测试
 * 将测试逻辑从main.js中分离出来，保持代码结构清晰
 */

// 测试AI响应的函数
window.testAIResponse = function(jsonString) {
    try {
        const response = JSON.parse(jsonString);
        console.log('测试AI响应:', response);
        
        if (!gameInstance) {
            console.error('游戏实例未初始化');
            return;
        }
        
        // 保存旧状态用于动画
        const oldState = JSON.parse(JSON.stringify(gameInstance.stateManager.getState()));
        
        // 处理特殊进度
        if (response.special_progress) {
            console.log('处理特殊进度:', response.special_progress);
            gameInstance.gameEngine.handleSpecialProgress(response.special_progress);
        }
        
        // 处理事件建议
        if (response.event_suggestion) {
            console.log('处理事件建议:', response.event_suggestion);
            gameInstance.gameEngine.handleEventSuggestion(response.event_suggestion);
        }
        
        // 处理道具授予
        if (response.item_grant) {
            console.log('处理道具授予:', response.item_grant);
            
            const itemNotifications = [];
            
            for (const itemGrant of response.item_grant) {
                const itemId = itemGrant.item_id;
                const itemData = gameData.items[itemId];
                
                if (!itemData) {
                    console.warn(`道具不存在: ${itemId}`);
                    continue;
                }
                
                // 检查条件
                let conditionMet = true;
                if (itemGrant.condition) {
                    conditionMet = gameInstance.stateManager.checkCondition(itemGrant.condition);
                }
                
                if (conditionMet) {
                    // 添加道具到状态
                    gameInstance.stateManager.addItem(itemId);
                    console.log(`✅ 获得道具: ${itemData.name}`);
                    
                    // 创建道具通知
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
        }
        
        // 显示数值变化动画
        if (response.value_changes) {
            const newState = gameInstance.stateManager.getState();
            gameInstance.showValueChangeAnimations(oldState, newState);
        }
        
        // 处理UI显示
        gameInstance.handleGameResponse(response);
    } catch (error) {
        console.error('JSON格式错误:', error);
        console.error('输入的内容:', jsonString);
    }
};

// 快速测试函数
window.quickTest = function(templateName) {
    const templates = window.getTestTemplates();
    if (templates[templateName]) {
        window.testAIResponse(templates[templateName]);
    } else {
        console.error('模板不存在:', templateName, '\n可用模板:', Object.keys(templates));
    }
};

// AI控制函数
window.disableAI = function() {
    if (typeof aiDisabled !== 'undefined') {
        aiDisabled = true;
        console.log('✅ AI回复已禁用，现在可以专注使用控制台测试功能');
    } else {
        console.warn('AI控制变量未定义');
    }
};

window.enableAI = function() {
    if (typeof aiDisabled !== 'undefined') {
        aiDisabled = false;
        console.log('✅ AI回复已启用');
    } else {
        console.warn('AI控制变量未定义');
    }
};

window.getAIStatus = function() {
    if (typeof aiDisabled !== 'undefined') {
        console.log('AI状态:', aiDisabled ? '已禁用' : '已启用');
        return !aiDisabled;
    } else {
        console.warn('AI控制变量未定义');
        return true;
    }
};

// 调试工具函数
window.debugGameState = function() {
    if (gameInstance) {
        console.log('当前游戏状态:', gameInstance.stateManager.getState());
    } else {
        console.error('游戏实例未初始化');
    }
};

window.debugEventHandlers = function() {
    if (gameInstance && gameInstance.gameEngine) {
        console.log('已注册的事件处理器:', gameInstance.gameEngine.eventHandlers);
        console.log('事件处理器数量:', gameInstance.gameEngine.eventHandlers.size);
    } else {
        console.error('游戏引擎未初始化');
    }
};

console.log('测试工具已加载');