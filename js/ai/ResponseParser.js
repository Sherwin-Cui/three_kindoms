// js/utils/responseParser.js
class ResponseParser {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * 解析AI返回的JSON响应
     * @param {Object} response - AI返回的JSON对象
     * @returns {Object} 处理后的游戏数据
     */
    parseResponse(response) {
        try {
            // 验证响应格式
            this.validateResponse(response);
            
            // 解析各部分数据
            const result = {
                dialogue: this.parseDialogue(response.plotContinuation),
                npcChanges: this.parseNPCStates(response.npcStates),
                playerChanges: this.parsePlayerState(response.playerState),
                itemObtained: this.parseItemJudgment(response.itemJudgment),
                gameEnd: this.parseGameEnd(response.gameEndJudgment)
            };
            
            return result;
        } catch (error) {
            console.error('Response parsing error:', error);
            throw new Error('AI响应格式错误');
        }
    }
    
    /**
     * 验证响应格式是否正确
     */
    validateResponse(response) {
        const requiredFields = [
            'plotContinuation',
            'npcStates',
            'playerState',
            'itemJudgment',
            'gameEndJudgment'
        ];
        
        for (const field of requiredFields) {
            if (!response.hasOwnProperty(field)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
    
    /**
     * 解析对话内容
     * @returns {Array} 对话数组
     */
    parseDialogue(plotContinuation) {
        const dialogues = [];
        
        // 解析对话
        if (plotContinuation.dialogue && Array.isArray(plotContinuation.dialogue)) {
            plotContinuation.dialogue.forEach(d => {
                dialogues.push({
                    speaker: d.speaker,
                    content: d.content,
                    action: d.action || null,
                    innerThought: d.innerThought,
                    type: 'dialogue'
                });
            });
        }
        
        // 解析旁白
        if (plotContinuation.narration) {
            dialogues.push({
                speaker: '旁白',
                content: plotContinuation.narration,
                type: 'narration'
            });
        }
        
        return dialogues;
    }
    
    /**
     * 解析NPC状态变化
     * @returns {Object} NPC变化映射
     */
    parseNPCStates(npcStates) {
        const changes = {};
        
        if (!npcStates || !Array.isArray(npcStates)) {
            return changes;
        }
        
        npcStates.forEach(npc => {
            changes[npc.name] = {
                attributes: npc.attributes || {},
                changes: npc.changes || {},
                changeReason: npc.changeReason || '',
                // 计算显示用的变化提示
                displayChanges: this.formatChanges(npc.changes || {})
            };
        });
        
        return changes;
    }
    
    /**
     * 解析玩家状态变化
     */
    parsePlayerState(playerState) {
        if (!playerState) {
            return {
                attributes: {},
                changes: {},
                changeReason: '',
                displayChanges: []
            };
        }
        
        return {
            attributes: playerState.attributes || {},
            changes: playerState.changes || {},
            changeReason: playerState.changeReason || '',
            displayChanges: this.formatChanges(playerState.changes || {})
        };
    }
    
    /**
     * 解析道具判定
     */
    parseItemJudgment(itemJudgment) {
        if (!itemJudgment || !itemJudgment.obtained) {
            return null;
        }
        
        return {
            itemName: itemJudgment.itemName,
            reason: itemJudgment.reason,
            itemInfo: typeof ItemConfig !== 'undefined' && ItemConfig.items ? 
                      (ItemConfig.items[itemJudgment.itemName] || {}) : {}
        };
    }
    
    /**
     * 解析游戏结束判定
     */
    parseGameEnd(gameEndJudgment) {
        if (!gameEndJudgment) {
            return {
                isEnd: false,
                endType: null,
                reason: '继续游戏'
            };
        }
        
        return {
            isEnd: gameEndJudgment.isEnd || false,
            endType: gameEndJudgment.endType || null,
            reason: gameEndJudgment.reason || ''
        };
    }
    
    /**
     * 格式化数值变化显示
     */
    formatChanges(changes) {
        const formatted = [];
        
        if (!changes || typeof changes !== 'object') {
            return formatted;
        }
        
        for (const [attr, value] of Object.entries(changes)) {
            if (value === 0) continue;
            
            const sign = value > 0 ? '+' : '';
            const color = value > 0 ? 'green' : 'red';
            formatted.push({
                attribute: attr,
                value: `${sign}${value}`,
                color: color
            });
        }
        
        return formatted;
    }
    
    /**
     * 修复JSON字符串中的格式问题
     */
    fixJsonString(jsonString) {
        // 修复数字前的+号
        let fixed = jsonString.replace(/":\s*\+(\d+)/g, '": $1');
        
        // 修复可能的其他格式问题
        fixed = fixed.replace(/,\s*}/g, '}'); // 移除尾随逗号
        fixed = fixed.replace(/,\s*]/g, ']'); // 移除数组中的尾随逗号
        
        return fixed;
    }
    
    /**
     * 解析原始AI响应内容（兼容旧版本）
     * @param {string} content - AI返回的原始字符串
     * @returns {Object} 解析后的JSON对象
     */
    parse(content) {
        console.log('🔍 [ResponseParser] 开始解析AI响应');
        console.log('📄 [ResponseParser] 响应内容类型:', typeof content);
        console.log('📄 [ResponseParser] 响应内容长度:', content.length);
        console.log('📄 [ResponseParser] 前50个字符:', JSON.stringify(content.substring(0, 50)));
        
        try {
            // 尝试直接解析JSON
            const result = JSON.parse(content);
            console.log('✅ [ResponseParser] JSON解析成功:', result);
            return result;
        } catch (error) {
            console.error('❌ [ResponseParser] 直接JSON解析失败:', error.message);
            
            // 清理响应内容，移除markdown代码块标记
            let cleanContent = content.trim();
            
            // 更强力的清理：移除所有可能的markdown标记
            cleanContent = cleanContent.replace(/^```[a-zA-Z]*\s*/gi, '');
            cleanContent = cleanContent.replace(/```\s*$/g, '');
            cleanContent = cleanContent.replace(/^`+|`+$/g, '');
            cleanContent = cleanContent.trim();
            
            console.log('🧹 [ResponseParser] 第一次清理后:', JSON.stringify(cleanContent.substring(0, 100)));
            
            // 进一步清理
            cleanContent = cleanContent.replace(/^\s*\n+/g, '');
            cleanContent = cleanContent.replace(/\n+\s*$/g, '');
            cleanContent = cleanContent.replace(/^[\s\r\n]+|[\s\r\n]+$/g, '');
            
            console.log('🧹 [ResponseParser] 第二次清理后:', JSON.stringify(cleanContent.substring(0, 100)));
            
            // 修复JSON格式问题
            cleanContent = this.fixJsonString(cleanContent);
            console.log('🔧 [ResponseParser] 修复JSON格式后:', JSON.stringify(cleanContent.substring(0, 100)));
            
            try {
                const result = JSON.parse(cleanContent);
                console.log('✅ [ResponseParser] 清理后JSON解析成功:', result);
                return result;
            } catch (cleanError) {
                console.error('❌ [ResponseParser] 清理后JSON解析仍失败:', cleanError.message);
                
                // 尝试多种方法提取JSON部分
                console.log('🔍 [ResponseParser] 尝试提取JSON...');
                
                // 方法1: 寻找完整的JSON对象
                let jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    let extractedJson = jsonMatch[0];
                    extractedJson = this.fixJsonString(extractedJson);
                    console.log('🔍 [ResponseParser] 方法1 - 提取并修复JSON片段:', extractedJson.substring(0, 100) + '...');
                    try {
                        const result = JSON.parse(extractedJson);
                        console.log('✅ [ResponseParser] 方法1成功:', result);
                        return result;
                    } catch (extractError) {
                        console.error('❌ [ResponseParser] 方法1失败:', extractError.message);
                    }
                }
                
                // 方法2: 寻找第一个{到最后一个}之间的内容
                const firstBrace = cleanContent.indexOf('{');
                const lastBrace = cleanContent.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
                    let extracted = cleanContent.substring(firstBrace, lastBrace + 1);
                    extracted = this.fixJsonString(extracted);
                    console.log('🔍 [ResponseParser] 方法2 - 提取并修复内容:', extracted.substring(0, 100) + '...');
                    try {
                        const result = JSON.parse(extracted);
                        console.log('✅ [ResponseParser] 方法2成功:', result);
                        return result;
                    } catch (extractError) {
                        console.error('❌ [ResponseParser] 方法2失败:', extractError.message);
                        // 打印更详细的错误信息
                        console.error('❌ 错误位置附近的内容:', extracted.substring(Math.max(0, extractError.message.match(/position (\d+)/)?.[1] - 50 || 0), Math.min(extracted.length, (extractError.message.match(/position (\d+)/)?.[1] || 0) + 50)));
                    }
                }
                
                // 方法3: 逐行分析，寻找JSON开始
                const lines = cleanContent.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('{')) {
                        let remainingContent = lines.slice(i).join('\n');
                        remainingContent = this.fixJsonString(remainingContent);
                        console.log('🔍 [ResponseParser] 方法3 - 从第' + (i+1) + '行开始:', remainingContent.substring(0, 100) + '...');
                        try {
                            const result = JSON.parse(remainingContent);
                            console.log('✅ [ResponseParser] 方法3成功:', result);
                            return result;
                        } catch (extractError) {
                            console.error('❌ [ResponseParser] 方法3失败:', extractError.message);
                        }
                        break;
                    }
                }
                
                // 返回默认结构
                console.warn('⚠️ [ResponseParser] 使用默认响应结构');
                return this.getDefaultResponse();
            }
        }
    }
    
    /**
     * 获取默认响应结构
     */
    getDefaultResponse() {
        return {
            plotContinuation: {
                dialogue: [
                    {
                        speaker: "系统",
                        content: "AI响应解析失败，请重试。",
                        innerThought: "解析错误"
                    }
                ]
            },
            npcStates: [],
            playerState: {
                attributes: {},
                changes: {}
            },
            itemJudgment: {
                obtained: false
            },
            gameEndJudgment: {
                isEnd: false,
                endType: null,
                reason: "继续游戏"
            }
        };
    }
}