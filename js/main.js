// 草船借箭 - 主入口文件
import { StateManager } from './core/stateManager.js';
import { AIManager } from './core/aiManager.js';
import { GameEngine } from './core/gameEngine.js';
import { UserInterfaceManager } from './ui/UserInterfaceManager.js';
import { PromptBuilder } from './promptBuilder.js';

// 全局变量
let gameInstance = null;
let selectedItem = 'none'; // 当前选中的道具
let aiDisabled = false; // AI禁用开关

// 测试功能已移至 testUtils.js 文件

// 游戏主类
class Game {
    constructor() {
        this.stateManager = new StateManager();
        this.aiManager = new AIManager();
        this.gameEngine = new GameEngine(this.stateManager, this.aiManager);
        this.uiManager = new UserInterfaceManager(this.stateManager, this.gameEngine);
        this.sceneManager = new SceneManager();
        this.pageManager = new PageManager();
        this.musicManager = new MusicManager();
        this.typewriterManager = new TypewriterManager();
        
        this.isProcessing = false;
        this.gameStarted = false;
        
        // 设置全局游戏实例，供控制台测试使用
        gameInstance = this;
    }
    
    async initialize() {
        console.log('初始化草船借箭游戏...');
        
        // 确保gameData完全加载后重新注册事件处理器
        this.gameEngine.registerAllEventHandlers();
        console.log('事件处理器注册完成，数量:', this.gameEngine.eventHandlers.size);
        
        // 初始化UI
        this.uiManager.initialize();
        
        // 初始化页面管理器
        this.pageManager.init();
        
        // 初始化音乐管理器
        this.musicManager.init();
        
        // 设置全局引用
        window.uiManager = this.uiManager;
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 显示开始页面并播放开场音乐
        this.pageManager.showStartScreen();
        this.musicManager.playOpeningMusic();
        
        console.log('游戏初始化完成');
    }
    
    // 开始游戏
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        
        // 先显示章节开幕页面
        this.showChapterOpening();
    }
    
    // 显示章节开幕页面
    showChapterOpening() {
        const currentChapter = this.stateManager.state.chapter || 1;
        const chapterData = this.stateManager.gameData?.chapters[`chapter${currentChapter}`];
        
        if (chapterData) {
            // 将数字转换为中文数字
            const chapterNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
            const chapterChinese = chapterNames[currentChapter] || currentChapter;
            
            const openingContent = chapterData.openingText || "游戏开始";
            
            // 显示章节开幕页面
            this.pageManager.showChapterTransition(
                'opening',
                chapterChinese,
                openingContent,
                () => {
                    // 开幕页面完成后进入主游戏
                    this.enterMainGame();
                }
            );
        } else {
            // 如果没有章节数据，直接进入主游戏
            this.enterMainGame();
        }
    }
    
    // 进入主游戏界面
    enterMainGame() {
        // 切换到主游戏页面
        this.pageManager.showMainGame();
        
        // 切换到游戏音乐
        this.musicManager.playIngameMusic();
        
        // 显示开场对话
        this.showOpeningDialogue();
        
        // 设置默认道具选择
        setTimeout(() => {
            window.selectItem('none');
        }, 100);
    }
    
    // 取消选中道具
    cancelSelectedItem() {
        selectedItem = 'none';
        const tag = document.getElementById('selected-item-tag');
        if (tag) {
            tag.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        // 回车键发送消息
        const playerInput = document.getElementById('player-input');
        playerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.sendMessage();
            }
        });
        
        // 使用事件委托处理所有按钮点击
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) {
                // 检查角色头像点击
                const characterAvatar = e.target.closest('.character-avatar');
                if (characterAvatar) {
                    const characterName = characterAvatar.dataset.character;
                    if (characterName && this.uiManager) {
                        this.uiManager.showCharacterInfo(characterName);
                    }
                }
                return;
            }
            
            // 处理按钮操作
            switch (action) {
                case 'send-message':
                    if (!this.isProcessing) {
                        this.sendMessage();
                    }
                    break;
                case 'open-items':
                    if (window.openItemsModal) {
                        window.openItemsModal();
                    }
                    break;
                case 'cancel-item':
                    this.cancelSelectedItem();
                    break;
            }
        });
    }
    
    showOpeningDialogue() {
        const currentChapter = this.stateManager.state.chapter;
        
        // 更新页面标题和header
        this.uiManager.updateChapterHeader(currentChapter);
        
        // 初始化场景背景
        this.sceneManager.initScene(currentChapter);
        
        // 直接自动调用AI进行第一次响应，不重复显示开场文字
        this.autoCallAI();
    }
    
    async autoCallAI() {
        try {
            this.isProcessing = true;
            
            // 显示AI思考气泡
            if (typeof this.uiManager.showAIThinking === 'function') {
                this.uiManager.showAIThinking(true);
            } else {
                this.uiManager.showLoading(true);
            }
            
            // 调用AI，不传入玩家发言（自动触发）
            const result = await this.gameEngine.processPlayerInput('');
            
            // 隐藏AI思考气泡
            if (typeof this.uiManager.showAIThinking === 'function') {
                this.uiManager.showAIThinking(false);
            } else {
                this.uiManager.showLoading(false);
            }
            
            // 显示AI响应
            if (result.success) {
                this.handleGameResponse(result.data);
            } else {
                this.handleError(result.error);
            }
            
        } catch (error) {
            console.error('\n=== 自动调用AI失败 ===');
            console.error('错误信息:', error.message);
            if (typeof this.uiManager.showAIThinking === 'function') {
                this.uiManager.showAIThinking(false);
            } else {
                this.uiManager.showLoading(false);
            }
            this.handleError('系统出现错误，请稍后重试');
        } finally {
            this.isProcessing = false;
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('player-input');
        const message = input.value.trim();
        
        if (!message) {
            return;
        }
        
        // 防止重复提交
        if (this.isProcessing) {
            return;
        }
        
        try {
            this.isProcessing = true;
            
            // 显示玩家输入
            this.uiManager.addDialogue('player', '诸葛亮', message);
            input.value = '';
            
            // 显示AI思考气泡
            this.uiManager.showAIThinking(true);
            

            
            let result;
            if (aiDisabled) {
                // AI禁用时，返回空响应
                console.log('AI已禁用，跳过AI调用');
                result = {
                    success: true,
                    data: {
                        narrative: "AI回复已禁用，请使用控制台测试功能。",
                        npc_dialogue: null
                    }
                };
            } else {
                // 先处理道具使用（如果有选择道具）
                if (selectedItem !== 'none') {
                    console.log(`正在使用道具: ${selectedItem}`);
                    const itemUseResult = await this.gameEngine.useItem(selectedItem);
                    
                    if (itemUseResult.success) {
                        // 道具使用成功，显示道具使用反馈
                        if (itemUseResult.data && itemUseResult.data.narrative) {
                            this.uiManager.addDialogue('system', '', itemUseResult.data.narrative);
                        }
                        
                        // 更新UI状态（移除消耗性道具等）
                        this.uiManager.updateGameInfo();
                        
                        // 重置道具选择
                        window.selectItem('none');
                    } else {
                        // 道具使用失败，显示错误信息
                        this.uiManager.addDialogue('system', '', `道具使用失败：${itemUseResult.error}`);
                        this.uiManager.showAIThinking(false);
                        this.isProcessing = false;
                        return;
                    }
                }
                
                // 处理玩家输入的游戏逻辑
                result = await this.gameEngine.processPlayerInput(message);
            }
            
            // 隐藏AI思考气泡
            this.uiManager.showAIThinking(false);
            
            // 显示AI响应（数值变化动画在handleGameResponse中统一处理）
            if (result.success) {
                this.handleGameResponse(result.data);
            } else {
                this.handleError(result.error);
            }
            
        } catch (error) {
            console.error('处理消息时出错:', error);
            this.uiManager.showAIThinking(false);
            this.handleError('系统出现错误，请稍后重试');
        } finally {
            this.isProcessing = false;
        }
    }
    
    // useItem方法已移除，现在通过selectItem选择道具，在sendMessage时一起发送
    
    handleGameResponse(response) {
        // 显示叙述文本
        if (response.narrative) {
            this.uiManager.addDialogue('system', '', response.narrative);
        }
        
        // 显示NPC对话（使用打字机效果）
        if (response.npc_dialogue) {
            setTimeout(() => {
                this.uiManager.addDialogue('npc', response.npc_dialogue.speaker, response.npc_dialogue.content, true);
            }, 1000);
        }
        
        // 数值变化已在gameEngine中处理，这里只需要更新UI
        if (response.value_changes) {
            // 更新状态栏显示
            this.uiManager.updateStatusBar();
            
            // 显示数值变化动画
            if (response.oldStateForAnimation) {
                const newState = this.stateManager.getState();
                this.showValueChangeAnimations(response.oldStateForAnimation, newState);
            }
        }
        
        // 处理道具获得通知
        if (response.itemNotifications && response.itemNotifications.length > 0) {
            response.itemNotifications.forEach((notification, index) => {
                if (notification.type === 'item_gained') {
                    // 延迟显示道具获得弹窗
                    setTimeout(() => {
                        this.uiManager.showItemGainedDialog(notification);
                    }, 1500 + index * 500); // 多个道具依次显示
                }
            });
        }

        // 处理自动触发的事件
        if (response.autoEvents && response.autoEvents.length > 0) {
            response.autoEvents.forEach((event, index) => {
                if (event.type === 'choice_event') {
                    // 延迟显示抉择事件弹窗
                    const delay = 2000 + index * 500;
                    setTimeout(() => {
                        this.uiManager.showEventDialog(event);
                    }, delay);
                } else if (event.type === 'dialogue_event') {
                    // 延迟显示对话事件弹窗
                    setTimeout(() => {
                        this.uiManager.showEventDialog(event);
                    }, 2000 + index * 500);
                } else if (event.type === 'check_event') {
                    // 延迟显示检定事件弹窗
                    setTimeout(() => {
                        this.uiManager.showEventDialog(event);
                    }, 2000 + index * 500);
                }
            });
        } else {
            console.log('🎯 没有autoEvents需要处理');
            console.log('🎯 response.autoEvents:', response.autoEvents);
        }
        
        // 旧的event_suggestion处理逻辑已删除，统一使用autoEvents机制
        
        // 处理章节结束
        if (response.chapterEnd) {
            console.log('检测到章节结束:', response.chapterEnd);
            setTimeout(() => {
                this.uiManager.showChapterTransition(response.chapterEnd);
            }, 3000); // 延迟显示转场，让其他内容先显示完
        }
        
        // 更新UI状态
        this.uiManager.updateGameInfo();
    }
    
    // 显示数值变化动画
    showValueChangeAnimations(oldState, newState) {
        const currentChapter = newState.currentChapter || 1;
        
        // 第一章数值变化
        if (currentChapter === 1) {
            // 检查周瑜猜忌值变化
            const oldSuspicion = oldState.zhouYu ? oldState.zhouYu.suspicion : 0;
            const newSuspicion = newState.zhouYu ? newState.zhouYu.suspicion : 0;
            if (oldSuspicion !== newSuspicion) {
                this.uiManager.animateValueChange('suspicion', oldSuspicion, newSuspicion);
            }
            
            // 检查鲁肃信任值变化
            const oldTrust = oldState.luSu ? oldState.luSu.trust : 0;
            const newTrust = newState.luSu ? newState.luSu.trust : 0;
            if (oldTrust !== newTrust) {
                this.uiManager.animateValueChange('trust', oldTrust, newTrust);
            }
        }
        
        // 第二章数值变化
        if (currentChapter === 2) {
            // 检查准备进度变化
            const oldProgress = oldState.preparationProgress || 0;
            const newProgress = newState.preparationProgress || 0;
            if (oldProgress !== newProgress) {
                this.uiManager.animateValueChange('preparation-progress', oldProgress, newProgress);
            }
        }
        
        // 第三章数值变化
        if (currentChapter === 3) {
            // 检查危险等级变化
            const oldDanger = oldState.dangerLevel || 0;
            const newDanger = newState.dangerLevel || 0;
            if (oldDanger !== newDanger) {
                this.uiManager.animateValueChange('danger-level', oldDanger, newDanger);
            }
            
            // 检查士兵士气变化
            const oldMorale = oldState.soldierMorale || 50;
            const newMorale = newState.soldierMorale || 50;
            if (oldMorale !== newMorale) {
                this.uiManager.animateValueChange('soldier-morale', oldMorale, newMorale);
            }
            
            // 检查船只损失变化
            const oldShipLoss = oldState.shipLoss || 0;
            const newShipLoss = newState.shipLoss || 0;
            if (oldShipLoss !== newShipLoss) {
                this.uiManager.animateValueChange('ship-loss', oldShipLoss, newShipLoss);
            }
            
            // 检查箭支数量变化
            const oldArrows = oldState.arrows || 0;
            const newArrows = newState.arrows || 0;
            if (oldArrows !== newArrows) {
                this.uiManager.animateValueChange('arrow-count', oldArrows, newArrows);
            }
        }
        
        // 检查时间进度变化（所有章节通用）
        if (oldState.timeProgress !== newState.timeProgress) {
            this.uiManager.animateValueChange('time-progress', oldState.timeProgress, newState.timeProgress);
        }
        
        // 更新游戏信息显示
        this.uiManager.updateGameInfo();
    }
    
    // 旧的handleEvents方法已删除，统一使用autoEvents机制处理事件
    
    handleError(error) {
        console.error('游戏错误:', error);
        this.uiManager.addDialogue('system', '', `系统提示：${error}`);
    }
    
    handleGameEnd(result) {
        const endMessage = result.success 
            ? `🎉 恭喜！你成功完成了第一章！\n\n${result.reason}\n\n你的智慧和策略得到了验证。`
            : `💔 很遗憾，任务失败了...\n\n${result.reason}\n\n不过没关系，可以重新开始挑战！`;
        
        this.uiManager.addDialogue('system', '', endMessage);
        
        // 禁用输入
        document.getElementById('player-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
        document.getElementById('item-btn').disabled = true;
    }
    
    // 处理事件选择
    async handleEventChoice(eventId, choiceIndex) {
        try {
            // 从gameData中获取事件数据
            const eventData = this.stateManager.gameData?.events?.[eventId];
            if (!eventData || !eventData.options) {
                console.error('事件数据不存在或没有选项:', eventId);
                return;
            }
            
            // 获取选择的选项
            const optionKeys = Object.keys(eventData.options);
            const selectedKey = optionKeys[choiceIndex];
            const selectedOption = eventData.options[selectedKey];
            
            if (!selectedOption) {
                console.error('选择的选项不存在:', choiceIndex);
                return;
            }
            
            // 将选择的文本作为玩家输入
            const choiceText = selectedOption.text;
            console.log('玩家选择:', choiceText);
            
            // 显示玩家的选择
            this.uiManager.addDialogue('player', '诸葛亮', choiceText);
            
            // 设置处理状态
            this.isProcessing = true;
            
            // 显示AI思考
            if (typeof this.uiManager.showAIThinking === 'function') {
                this.uiManager.showAIThinking(true);
            } else {
                this.uiManager.showLoading(true);
            }
            

            
            // 将选择作为玩家输入处理
            const result = await this.gameEngine.processPlayerInput(choiceText);
            
            // 隐藏AI思考
            if (typeof this.uiManager.showAIThinking === 'function') {
                this.uiManager.showAIThinking(false);
            } else {
                this.uiManager.showLoading(false);
            }
            
            // 处理AI响应（数值变化动画在handleGameResponse中统一处理）
            if (result.success) {
                this.handleGameResponse(result.data);
            } else {
                this.handleError(result.error);
            }
            
        } catch (error) {
            console.error('处理事件选择时出错:', error);
            this.handleError(error.message);
        } finally {
            this.isProcessing = false;
        }
    }
}

// 全局函数（供HTML调用）
window.sendMessage = function() {
    if (gameInstance) {
        gameInstance.sendMessage();
    }
};

// 开始游戏
window.startGame = function() {
    if (gameInstance) {
        gameInstance.startGame();
    }
};

// 从过渡页面继续
window.continueFromTransition = function() {
    if (gameInstance && gameInstance.pageManager) {
        gameInstance.pageManager.continueFromTransition();
    }
};

// 选择道具函数（供初始化和重置时调用）
window.selectItem = function(itemId) {
    selectedItem = itemId || 'none';
    
    // 更新选中道具标签显示
    const tag = document.getElementById('selected-item-tag');
    if (tag) {
        if (itemId === 'none' || !itemId) {
            tag.style.display = 'none';
        } else {
            const gameData = gameInstance?.stateManager?.gameData;
            const itemData = gameData?.items?.[itemId];
            const itemName = itemData?.name || itemId;
            const nameSpan = document.getElementById('selected-item-name');
            if (nameSpan) {
                nameSpan.textContent = itemName;
                tag.style.display = 'flex';
            }
        }
    }
    
    console.log('选择道具:', itemId);
};

// 全局函数：显示角色信息
window.showCharacterInfo = function(characterName) {
    if (gameInstance && gameInstance.uiManager) {
        gameInstance.uiManager.showCharacterInfo(characterName);
    }
};

// 打开道具模态框
window.openItemsModal = function() {
    if (!gameInstance || !gameInstance.stateManager) {
        console.warn('游戏实例未初始化');
        return;
    }

    const state = gameInstance.stateManager.getState();
    const items = state.items || {};
    const usedItems = state.usedItems || {};
    const gameData = gameInstance.stateManager.gameData;

    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'items-modal';
    
    // 获取可用道具
    const availableItems = Object.entries(items).filter(([itemId, hasItem]) => 
        hasItem && !usedItems[itemId]
    );

    let itemsHTML = '';
    if (availableItems.length === 0) {
        itemsHTML = '<div class="no-items-message">暂无可用道具</div>';
    } else {
        itemsHTML = '<div class="items-grid">';
        availableItems.forEach(([itemId, hasItem]) => {
            const itemData = gameData?.items?.[itemId];
            const itemName = itemData?.name || itemId;
            const itemDesc = itemData?.description || '神秘道具';
            const isSelected = selectedItem === itemId ? 'selected' : '';
            
            const itemImage = getItemImage(itemId);
            // 将名称分成两行显示
            const nameLines = itemName.length > 2 ? 
                [itemName.substring(0, 2), itemName.substring(2)] : 
                [itemName, ''];
            
            itemsHTML += `
                <div class="item-card ${isSelected}" data-item-id="${itemId}">
                    <div class="item-image">
                        <img src="${itemImage}" alt="${itemName}" class="item-img">
                    </div>
                    <div class="item-info">
                        <div class="item-name-line1">${nameLines[0]}</div>
                        <div class="item-name-line2">${nameLines[1]}</div>
                    </div>
                </div>
            `;
        });
        itemsHTML += '</div>';
    }

    modal.innerHTML = `
        <div class="items-modal-content">
            <div class="modal-header">
                <h3>选择道具</h3>
                <button class="close-btn" onclick="closeItemsModal()">&times;</button>
            </div>
            <div class="items-modal-body">
                <div class="items-section">
                    ${itemsHTML}
                </div>
                <div class="item-details-section">
                    <div class="item-details-header">道具详情</div>
                    <div class="item-details-content" id="item-details-content">
                        <div class="no-selection-message">请选择一个道具查看详情</div>
                    </div>
                </div>
            </div>
            <div class="items-modal-buttons">
                <button class="modal-btn secondary" onclick="closeItemsModal()">取消</button>
                <button class="modal-btn primary" onclick="confirmItemSelection()">选择使用</button>
            </div>
        </div>
    `;

    // 添加点击事件
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeItemsModal();
        }
    });

    // 为道具卡片添加点击事件
    modal.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
            // 移除其他选中状态
            modal.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));
            // 添加选中状态
            card.classList.add('selected');
            // 保存临时选择
            window.tempSelectedItem = card.dataset.itemId;
            
            // 更新详情显示
            const itemId = card.dataset.itemId;
            const itemData = gameData?.items?.[itemId];
            updateItemDetailsDisplay(itemId, itemData);
        });
    });

    document.body.appendChild(modal);
};

// 关闭道具模态框
window.closeItemsModal = function() {
    const modal = document.querySelector('.items-modal');
    if (modal) {
        modal.remove();
    }
    window.tempSelectedItem = null;
};

// 确认道具选择
window.confirmItemSelection = function() {
    if (window.tempSelectedItem) {
        selectItemForUse(window.tempSelectedItem);
    }
    closeItemsModal();
};

// 选择道具使用
function selectItemForUse(itemId) {
    if (!gameInstance || !gameInstance.stateManager) return;
    
    const gameData = gameInstance.stateManager.gameData;
    const itemData = gameData?.items?.[itemId];
    const itemName = itemData?.name || itemId;
    
    // 更新全局选中状态
    selectedItem = itemId;
    
    // 显示选中标签
    const tag = document.getElementById('selected-item-tag');
    const nameSpan = document.getElementById('selected-item-name');
    if (tag && nameSpan) {
        nameSpan.textContent = itemName;
        tag.style.display = 'flex';
    }
}

// 取消选中道具
window.cancelSelectedItem = function() {
    selectedItem = 'none';
    const tag = document.getElementById('selected-item-tag');
    if (tag) {
        tag.style.display = 'none';
    }
};

// 更新道具详情显示
function updateItemDetailsDisplay(itemId, itemData) {
    const detailsContent = document.getElementById('item-details-content');
    if (!detailsContent) return;
    
    if (!itemData) {
        detailsContent.innerHTML = '<div class="no-selection-message">请选择一个道具查看详情</div>';
        return;
    }
    
    const effectDescription = getItemEffectDescription(itemData);
    
    detailsContent.innerHTML = `
        <div class="item-detail-info">
            <div class="item-detail-name">${itemData.name || itemId}</div>
            <div class="item-detail-block">
                <div class="item-detail-label">描述</div>
                <div class="item-detail-text">${itemData.description || '神秘道具'}</div>
            </div>
            <div class="item-detail-block">
                <div class="item-detail-label">效果</div>
                <div class="item-detail-text">${effectDescription}</div>
            </div>
            ${itemData.usage ? `
                <div class="item-detail-block">
                    <div class="item-detail-label">使用方法</div>
                    <div class="item-detail-text">${itemData.usage}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// 获取道具图片
function getItemImage(itemId) {
    const itemImageMap = {
        'militaryOrder': 'military_order.png',
        'dongwuTiger': 'dongwu_tiger.png',
        'kongMingFan': 'kongming_fan.png',
        'sima': 'sima_compass.png',
        'grassman': 'grass_man.png',
        'warDrum': 'war_drum.png',
        'windTalisman': 'wind_talisman.png',
        'confusionIncense': 'confusion_incense.png',
        'xuanDeBrush': 'xuande_letter.png',
        'luSuLetter': 'lusu_letter.png'
    };
    
    const imageName = itemImageMap[itemId] || 'default.png';
    return `assets/images/items/${imageName}`;
}

// 获取道具效果描述
function getItemEffectDescription(itemData) {
    if (!itemData) {
        return '暂无特殊效果';
    }
    
    // 直接返回道具的effect字段，这是道具的作用描述
    if (itemData.effect) {
        return itemData.effect;
    }
    
    // 如果没有effect字段，尝试从effects对象构建描述
    if (itemData.effects) {
        let description = '';
        const effects = itemData.effects;
        
        if (effects.persuasion_boost) {
            description += `增加说服力 +${effects.persuasion_boost}`;
        }
        if (effects.wisdom_boost) {
            if (description) description += '，';
            description += `增加智慧 +${effects.wisdom_boost}`;
        }
        if (effects.trust_boost) {
            if (description) description += '，';
            description += `增加信任 +${effects.trust_boost}`;
        }
        if (effects.special_effect) {
            if (description) description += '，';
            description += effects.special_effect;
        }
        
        return description || '暂无特殊效果';
    }
    
    return '暂无特殊效果';
}


// 设置全局uiManager引用
window.uiManager = null;



// 处理事件选择
window.selectEventChoice = function(eventId, choiceIndex) {
    console.log('选择事件选项:', eventId, choiceIndex);
    
    // 关闭事件弹窗
    const overlay = document.querySelector('.event-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // 处理选择结果
    if (gameInstance) {
        gameInstance.handleEventChoice(eventId, choiceIndex);
    }
};

// 关闭事件对话框并添加到历史记录
window.closeEventDialog = function(eventId, eventType) {
    // 移除弹窗
    const overlay = document.querySelector('.event-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // 如果是对话事件，将内容添加到历史记录
    if (eventType === 'dialogue_event' && gameInstance) {
        const eventData = gameInstance.stateManager.gameData?.events?.[eventId];
        if (eventData && eventData.content) {
            // 添加到对话历史
            gameInstance.stateManager.addDialogue('system', eventData.content, 'dialogue_event');
            // 同时在UI中显示
            gameInstance.uiManager.addDialogue('system', null, eventData.content);
            
            // 触发AI自动响应
            setTimeout(() => {
                gameInstance.autoCallAI();
            }, 1000);
        }
    }
};

// 打字机效果管理器
class TypewriterManager {
    constructor() {
        this.activeAnimations = new Set();
    }
    
    // 打字机效果
    async typeText(element, text, speed = 50) {
        // 如果是HTML元素，直接使用；如果是选择器，先查找元素
        const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
        if (!targetElement) return;
        
        // 清空元素内容
        targetElement.textContent = '';
        
        // 创建动画标识
        const animationId = Symbol('typewriter');
        this.activeAnimations.add(animationId);
        
        return new Promise((resolve) => {
            let i = 0;
            const typeChar = () => {
                // 检查动画是否被取消
                if (!this.activeAnimations.has(animationId)) {
                    resolve();
                    return;
                }
                
                if (i < text.length) {
                    targetElement.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeChar, speed);
                } else {
                    this.activeAnimations.delete(animationId);
                    resolve();
                }
            };
            typeChar();
        });
    }
    
    // 停止所有打字机动画
    stopAll() {
        this.activeAnimations.clear();
    }
}

// 音乐管理器
class MusicManager {
    constructor() {
        this.currentTrack = null;
        this.openingMusic = null;
        this.ingameMusic = null;
        this.currentMode = 'none';
    }
    
    // 初始化音频
    init() {
        this.openingMusic = new Audio('assets/bgm/opening.mp3');
        this.ingameMusic = new Audio('assets/bgm/ingame.mp3');
        
        this.openingMusic.loop = true;
        this.ingameMusic.loop = true;
        
        // 设置音量
        this.openingMusic.volume = 0.7;
        this.ingameMusic.volume = 0.5;
        
        console.log('音乐管理器初始化完成');
    }
    
    // 播放过渡页面音乐（开始页面、章节过渡等）
    playOpeningMusic() {
        if (this.currentMode === 'opening') return;
        
        this.stopAll();
        this.currentTrack = this.openingMusic;
        this.currentMode = 'opening';
        
        // 检查音频文件是否加载成功
        if (this.openingMusic.readyState === 0) {
            console.log('音频文件正在加载中...');
            this.openingMusic.addEventListener('loadeddata', () => {
                this.tryPlayOpeningMusic();
            }, { once: true });
            this.openingMusic.load(); // 强制加载
        } else {
            this.tryPlayOpeningMusic();
        }
        
        console.log('播放开场音乐');
    }
    
    // 尝试播放开场音乐
    tryPlayOpeningMusic() {
        this.openingMusic.currentTime = 2; // 从第2秒开始播放
        
        // 尝试播放音乐
        this.openingMusic.play().then(() => {
            console.log('开场音乐播放成功');
        }).catch(e => {
            console.warn('播放开场音乐失败，等待用户交互:', e);
            // 静默等待用户交互，不显示弹窗
            this.setupAudioInteractionListeners();
        });
    }
    
    // 设置用户交互监听器
    setupAudioInteractionListeners() {
        const enableAudioOnInteraction = () => {
            this.openingMusic.currentTime = 2; // 确保从第2秒开始播放
            this.openingMusic.play().then(() => {
                console.log('用户交互后音乐播放成功');
                document.removeEventListener('click', enableAudioOnInteraction);
                document.removeEventListener('keydown', enableAudioOnInteraction);
                document.removeEventListener('touchstart', enableAudioOnInteraction);
            }).catch(e => {
                console.warn('用户交互后音乐播放仍失败:', e);
            });
        };
        
        document.addEventListener('click', enableAudioOnInteraction);
        document.addEventListener('keydown', enableAudioOnInteraction);
        document.addEventListener('touchstart', enableAudioOnInteraction);
    }
    
    // 播放游戏音乐（对话界面）
    playIngameMusic() {
        if (this.currentMode === 'ingame') return;
        
        this.stopAll();
        this.currentTrack = this.ingameMusic;
        this.currentMode = 'ingame';
        
        this.ingameMusic.currentTime = 0;
        this.ingameMusic.play().catch(e => {
            console.warn('播放游戏音乐失败:', e);
        });
        
        console.log('播放游戏音乐');
    }
    
    // 停止所有音乐
    stopAll() {
        if (this.openingMusic) {
            this.openingMusic.pause();
        }
        if (this.ingameMusic) {
            this.ingameMusic.pause();
        }
        this.currentTrack = null;
        this.currentMode = 'none';
    }
    
    // 设置音量
    setVolume(volume) {
        if (this.openingMusic) this.openingMusic.volume = volume * 0.7;
        if (this.ingameMusic) this.ingameMusic.volume = volume * 0.5;
    }
}

// 页面管理器
class PageManager {
    constructor() {
        this.currentPage = 'start';
        this.fadeOverlay = null;
    }
    
    // 初始化
    init() {
        // 创建黑幕过渡层
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.className = 'fade-overlay';
        document.querySelector('.game-container').appendChild(this.fadeOverlay);
    }
    
    // 显示开始页面
    showStartScreen() {
        const startScreen = document.getElementById('start-screen');
        const mainGame = document.getElementById('main-game');
        
        if (startScreen) startScreen.style.display = 'flex';
        if (mainGame) mainGame.style.display = 'none';
        
        this.currentPage = 'start';
    }
    
    // 显示主游戏页面
    showMainGame() {
        const startScreen = document.getElementById('start-screen');
        const mainGame = document.getElementById('main-game');
        
        if (startScreen) startScreen.style.display = 'none';
        if (mainGame) mainGame.style.display = 'flex';
        
        this.currentPage = 'main';
    }
    
    // 显示章节过渡页面
    showChapterTransition(type, chapterNum, content, onComplete) {
        const transitionHtml = `
            <div class="chapter-transition" id="chapter-transition">
                <div class="chapter-content">
                    <div class="chapter-title">${type === 'opening' ? `第${chapterNum}章 开始` : `第${chapterNum}章 结束`}</div>
                    <div class="chapter-text" id="chapter-text-content"></div>
                    <button class="continue-btn" onclick="continueFromTransition()" style="display: none;">继续</button>
                </div>
            </div>
        `;
        
        document.querySelector('.game-container').insertAdjacentHTML('beforeend', transitionHtml);
        
        // 切换到过渡音乐
        if (window.gameInstance?.musicManager) {
            window.gameInstance.musicManager.playOpeningMusic();
        }
        
        // 启动打字机效果
        const textElement = document.getElementById('chapter-text-content');
        const continueBtn = document.querySelector('#chapter-transition .continue-btn');
        
        if (window.gameInstance?.typewriterManager && textElement) {
            window.gameInstance.typewriterManager.typeText(textElement, content, 80).then(() => {
                // 打字完成后显示继续按钮
                if (continueBtn) {
                    continueBtn.style.display = 'block';
                }
            });
        } else {
            // 如果没有打字机管理器，直接显示文字
            if (textElement) textElement.textContent = content;
            if (continueBtn) continueBtn.style.display = 'block';
        }
        
        this.onTransitionComplete = onComplete;
        this.currentPage = 'transition';
    }
    
    // 从过渡页面继续
    continueFromTransition() {
        const transition = document.getElementById('chapter-transition');
        if (transition) {
            transition.remove();
        }
        
        // 切换回游戏音乐
        if (window.gameInstance?.musicManager) {
            window.gameInstance.musicManager.playIngameMusic();
        }
        
        if (this.onTransitionComplete) {
            this.onTransitionComplete();
            this.onTransitionComplete = null;
        }
        
        this.currentPage = 'main';
    }
    
    // 黑幕过渡效果
    async fadeTransition(duration = 500) {
        return new Promise((resolve) => {
            this.fadeOverlay.classList.add('active');
            
            setTimeout(() => {
                this.fadeOverlay.classList.remove('active');
                resolve();
            }, duration);
        });
    }
}

// 场景管理器
class SceneManager {
    constructor() {
        this.dialogueArea = null; // 将在初始化时设置
        this.currentScene = null;
        
        // 场景映射：章节 -> 默认场景 -> 事件触发场景
        this.sceneMap = {
            1: {
                default: 'chapter1_council_hall.png',
                events: {
                    'check_event1': 'chapter1_tent_night.png'  // 说服鲁肃后切换到夜晚帐篷
                }
            },
            2: {
                default: 'chapter2_observatory_night.png',
                events: {
                    'check_event2': 'chapter2_riverside_dawn.png'  // 智谋对决后切换到河边黎明
                }
            },
            3: {
                default: 'chapter3_river_fog.png',
                events: {
                    'check_event4': 'chapter3_cao_camp.png',      // 掌控时机后切换到曹营
                    'check_event5': 'chapter3_arrow_borrowing.png' // 安全撤退后切换到借箭场景
                }
            }
        };
    }
    
    // 初始化场景
    initScene(chapter) {
        console.log(`初始化第${chapter}章场景`);
        
        // 确保对话区域已找到
        if (!this.dialogueArea) {
            this.dialogueArea = document.getElementById('dialogue-area');
        }
        
        const chapterMap = this.sceneMap[chapter];
        if (chapterMap && chapterMap.default) {
            console.log(`设置默认场景: ${chapterMap.default}`);
            this.setScene(chapterMap.default);
        } else {
            console.warn(`第${chapter}章的场景配置未找到`);
        }
    }
    
    // 设置场景背景
    setScene(sceneName) {
        if (this.currentScene === sceneName) return;
        
        // 确保对话区域已找到
        if (!this.dialogueArea) {
            this.dialogueArea = document.getElementById('dialogue-area');
        }
        
        if (!this.dialogueArea) {
            console.warn('对话区域未找到，无法设置场景背景');
            return;
        }
        
        const scenePath = `assets/images/scenes/${sceneName}`;
        this.dialogueArea.style.backgroundImage = `url('${scenePath}')`;
        this.dialogueArea.style.backgroundSize = 'cover';
        this.dialogueArea.style.backgroundPosition = 'center';
        this.dialogueArea.style.backgroundRepeat = 'no-repeat';
        this.currentScene = sceneName;
        
        console.log(`场景切换到: ${sceneName}`);
    }
    
    // 基于事件触发场景切换
    triggerSceneChange(eventId, chapter) {
        const chapterMap = this.sceneMap[chapter];
        if (chapterMap && chapterMap.events && chapterMap.events[eventId]) {
            this.setScene(chapterMap.events[eventId]);
        }
    }
    
    // 清除场景背景
    clearScene() {
        if (this.dialogueArea) {
            this.dialogueArea.style.backgroundImage = '';
        }
        this.currentScene = null;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', async () => {
    try {
        gameInstance = new Game();
        await gameInstance.initialize();
        console.log('\n=== 游戏初始化完成 ===');
        
        // 将游戏实例暴露到全局，用于调试
        window.game = gameInstance;
        window.gameInstance = gameInstance; // 为了兼容UI中的引用
        window.sceneManager = gameInstance.sceneManager; // 暴露场景管理器
        window.pageManager = gameInstance.pageManager; // 暴露页面管理器
        window.musicManager = gameInstance.musicManager; // 暴露音乐管理器
        window.typewriterManager = gameInstance.typewriterManager; // 暴露打字机管理器
        console.log('游戏实例已暴露到 window.game 和 window.gameInstance');
        
        console.log('\n=== 草船借箭游戏启动成功！ ===');
        console.log('\n🎮 === 草船借箭 控制台测试功能 ===');
        console.log('\n📋 可用的全局函数:');
        console.log('• sendMessage() - 发送消息');
        console.log('• showCharacterInfo(name) - 显示角色信息');
        console.log('• selectItem(name) - 选择道具');
        console.log('• selectEventChoice(eventId, choiceIndex) - 选择事件选项');
        console.log('• closeEventDialog(eventId, eventType) - 关闭事件对话框');
        
        console.log('\n🧪 控制台测试功能:');
        console.log('• testAIResponse(jsonString) - 直接测试AI响应JSON');
        console.log('• getTestTemplates() - 获取所有测试模板');
        console.log('• quickTest(templateName) - 快速测试指定模板');
        console.log('• disableAI() - 禁用AI回复');
        console.log('• enableAI() - 启用AI回复');
        console.log('• getAIStatus() - 查看AI状态');
        
        console.log('\n🚀 快速测试命令:');
        console.log('• quickTest("dialogue_event2") - 测试立下军令状事件');
        console.log('• quickTest("dialogue_event4") - 测试天机预测事件');
        console.log('• quickTest("check_event1_success") - 测试说服鲁肃成功');
        console.log('• quickTest("check_event2_success") - 测试智谋对决成功');
        console.log('• quickTest("check_event3_success") - 测试夜间准备成功');
        console.log('• quickTest("check_event4_great_success") - 测试擂鼓借箭大成功');
        console.log('• quickTest("choice_event1") - 测试应对挑衅抉择事件');
        console.log('• quickTest("multiple_items") - 测试多道具获得');
        
        console.log('\n💡 使用提示:');
        console.log('1. 建议先执行 disableAI() 禁用AI回复，专注测试');
        console.log('2. 使用 getTestTemplates() 查看所有可用模板');
        console.log('3. 使用 quickTest(模板名) 快速测试');
        console.log('4. 使用 testAIResponse(自定义JSON) 测试自定义响应');
        console.log('5. 所有测试都会触发完整的游戏流程，包括弹窗和状态更新');
        console.log('6. 测试完成后可用 enableAI() 重新启用AI回复');
        
    } catch (error) {
        console.error('\n=== 游戏初始化失败 ===');
        console.error('错误信息:', error.message);
        alert('游戏初始化失败，请刷新页面重试');
    }
});