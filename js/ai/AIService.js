// AI服务
class AIService {
    constructor() {
        this.config = GameConfig.api;
        this.promptBuilder = new PromptBuilder();
        this.responseParser = new ResponseParser();
    }
    
    // 生成AI响应
    async generateResponse(gameState, userMessage) {
        console.log('🚀 [AIService] 开始生成AI响应');
        console.log('💬 [AIService] 用户输入:', userMessage);
        
        const messages = this.promptBuilder.buildMessages(gameState, userMessage);
        
        // 输出完整的prompt信息
        console.log('📝 [AIService] 发送给AI的完整Prompt:');
        console.log('=' .repeat(50));
        messages.forEach((msg, index) => {
            console.log(`消息 ${index + 1} [${msg.role}]:`);
            console.log(msg.content);
            console.log('-'.repeat(30));
        });
        console.log('=' .repeat(50));
        
        try {
            console.log('🌐 [AIService] 发送API请求...');
            const response = await fetch(this.config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.key}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                console.error('❌ [AIService] API请求失败:', response.status, response.statusText);
                throw new Error(`API错误: ${response.status}`);
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            console.log('📨 [AIService] 收到AI原始响应:', content);
            
            // 先尝试解析为JSON
            let jsonResponse;
            try {
                jsonResponse = this.responseParser.parse(content);
            } catch (error) {
                console.error('❌ [AIService] JSON解析失败:', error);
                throw error;
            }
            
            console.log('✅ [AIService] JSON解析成功:', jsonResponse);
            return jsonResponse;
            
        } catch (error) {
            console.error('❌ [AIService] AI服务错误:', error);
            console.log('🔄 [AIService] 使用模拟响应进行测试');
            // 返回模拟响应用于测试
            return this.getMockResponse(gameState);
        }
    }
    
    // 模拟响应（测试用）
    getMockResponse(gameState) {
        const responses = [
            {
                character: "曹操",
                template: "（眼神锐利地看着贾诩）文和，你的计谋确实毒辣有效。【心声：这贾诩智谋过人，必须提防】",
                attributeChanges: { "疑心": 5 }
            },
            {
                character: "司马懿",
                template: "（微微一笑）主公英明，贾兄之计确实高明。【心声：这贾诩太危险了，得想办法除掉他】",
                attributeChanges: { "伪装": 5 }
            },
            {
                character: "荀彧",
                template: "（神色黯然）诸位所言甚是...【心声：大汉江山要亡于曹氏之手了吗】",
                attributeChanges: { "绝望值": 10 }
            }
        ];
        
        const selected = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            plotContinuation: {
                dialogue: [
                    {
                        speaker: selected.character,
                        content: selected.template.split('【')[0].replace(/（.*?）/g, '').trim(),
                        action: selected.template.match(/（(.*?)）/)?.[1] || '',
                        innerThought: selected.template.match(/【心声：(.*?)】/)?.[1] || ''
                    }
                ]
            },
            npcStates: gameState.npcStates.map(npc => {
                if (npc.name === selected.character && selected.attributeChanges) {
                    const newAttributes = {...npc.attributes};
                    const changes = {};
                    for (const [key, change] of Object.entries(selected.attributeChanges)) {
                        if (newAttributes[key] !== undefined) {
                            newAttributes[key] = Math.max(0, Math.min(100, newAttributes[key] + change));
                            changes[key] = change;
                        }
                    }
                    return { 
                        name: npc.name, 
                        attributes: newAttributes,
                        changes: changes,
                        changeReason: '模拟响应测试'
                    };
                }
                return npc;
            }),
            playerState: {
                attributes: {
                    ...gameState.playerState.attributes,
                    "野心": Math.min(100, gameState.playerState.attributes["野心"] + 5)
                },
                changes: {
                    "野心": 5
                },
                changeReason: '模拟响应测试'
            },
            itemJudgment: {
                obtained: false,
                itemName: '',
                reason: '模拟响应中未获得道具'
            },
            gameEndJudgment: {
                isEnd: false,
                endType: null,
                reason: '游戏继续进行'
            }
        };
    }
}