// AI管理器 - 处理与DeepSeek API的交互
import { PromptBuilder } from '../promptBuilder.js';

export class AIManager {
    constructor() {
        this.apiKey = 'sk-86ecf7c3ebde4205b70e67413565d917'; // 直接设置API密钥
        this.promptBuilder = new PromptBuilder();
        this.apiEndpoint = 'https://api.deepseek.com/chat/completions';
        this.model = 'deepseek-chat';
        
        console.log('\n=== AI连接状态 ===');
        console.log('DeepSeek API已配置，密钥:', this.apiKey.substring(0, 10) + '...');
        console.log('API端点:', this.apiEndpoint);
        console.log('模型:', this.model);
    }
    
    initializeApiKey() {
        // 从本地存储获取API密钥
        this.apiKey = localStorage.getItem('deepseek_api_key');
        
        if (this.apiKey) {
            console.log('已加载DeepSeek API密钥');
        } else {
            console.warn('未设置DeepSeek API密钥，将使用模拟响应模式');
            console.log('提示：可以通过控制台调用 game.aiManager.setApiKey("your_api_key") 来设置API密钥');
        }
    }
    
    // 处理玩家输入
    async processInput(gameState, playerAction) {
        try {
            // 构建提示词
            const prompt = this.promptBuilder.buildPrompt(gameState, playerAction);
            
            console.log('\n=== 1. 系统发给AI的完整提示词 ===');
            console.log(prompt);
            
            // 调用AI API
            const response = await this.callAI(prompt);
            
            console.log('\n=== 2. AI响应的结果 ===');
            console.log(response);
            
            // 解析响应
            const parsedResponse = this.parseAIResponse(response);
            
            console.log('\n=== 3. 解析后的结果 ===');
            console.log(parsedResponse);
            
            return {
                success: true,
                data: parsedResponse
            };
            
        } catch (error) {
            console.error('AI处理失败:', error.message);
            return {
                success: false,
                error: error.message,
                data: this.getFallbackResponse(playerAction.input, gameState)
            };
        }
    }
    
    // 调用AI API
    async callAI(prompt) {
        if (!this.apiKey) {
            console.log('AI连接状态: 使用模拟响应');
            return this.getSimulatedResponse(prompt);
        }
        
        console.log('AI连接状态: 正在连接DeepSeek API...');
        
        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI连接状态: 连接失败 -', response.status, response.statusText);
            console.error('错误详情:', errorText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('AI连接状态: 连接成功，已获取响应');
        
        return data.choices[0].message.content;
    }
    
    // 解析AI响应
    parseAIResponse(response) {
        try {
            // 提取JSON部分
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('解析失败: 响应中未找到JSON格式');
                throw new Error('响应中未找到JSON格式');
            }
            
            let jsonStr = jsonMatch[0];
            
            // 清理JSON字符串中的+号（如 "+10" -> "10"）
            jsonStr = jsonStr.replace(/:\s*\+(\d+)/g, ': $1');
            
            const parsed = JSON.parse(jsonStr);
            
            // 验证必要字段
            if (!parsed.narrative && !parsed.npc_dialogue) {
                console.error('解析失败: 响应缺少必要的叙述或对话内容');
                throw new Error('响应缺少必要的叙述或对话内容');
            }
            

            
            return {
                narrative: parsed.narrative || '',
                npc_dialogue: parsed.npc_dialogue || null,
                value_changes: parsed.value_changes || {},
                event_suggestion: parsed.event_suggestion || null,
                item_grant: parsed.item_grant || null,
                special_progress: parsed.special_progress || null,
                gameEnd: parsed.gameEndJudgment || parsed.gameEnd || null
            };
            
        } catch (error) {
            console.error('解析状态: 失败 -', error.message);
            throw new Error(`解析AI响应失败: ${error.message}`);
        }
    }
    
    // 获取模拟响应（用于测试）
    getSimulatedResponse(prompt) {
        // 检查是否是空的玩家发言（自动触发），如果是则触发抉择事件1
        if (prompt.includes('玩家发言：（无发言）') || prompt.includes('玩家发言：')) {
            const initialResponse = {
                narrative: "你来到了东吴军营，面对即将到来的挑战。周瑜正在等待你的回应。",
                npc_dialogue: {
                    speaker: "周瑜",
                    content: "孔明先生，既然你如此自信，不如我们来个约定如何？"
                },
                value_changes: {
                    zhouYu: { suspicion: "+10" }
                },
                events: {
                    acceptChallenge: true
                },
                items: {}
            };
            return JSON.stringify(initialResponse);
        }
        
        // 检查是否提到鲁肃相关内容，触发检定事件1
        if (prompt.includes('鲁肃') || prompt.includes('子敬') || prompt.includes('说服') || prompt.includes('夜访')) {
            
            const luSuResponse = {
                narrative: "夜深人静，鲁肃悄然来到你的住处。烛光摇曳间，故人相对而坐。",
                npc_dialogue: {
                    speaker: "鲁肃",
                    content: "孔明先生，公瑾此举实在过分。你我故交，我愿助你一臂之力。"
                },
                value_changes: {
                    luSu: { trust: "+15" }
                },
                events: {
                    check_event1: true
                },
                items: {}
            };
            return JSON.stringify(luSuResponse);
        }
        
        // 简单的模拟逻辑，基于提示词内容
        const responses = [
            {
                narrative: "周瑜眼中闪过一丝精光，似乎在思考你的话语。",
                npc_dialogue: {
                    speaker: "周瑜",
                    content: "先生所言有理，不过三日造箭十万，恐怕..."
                },
                value_changes: {
                    zhouYu: { suspicion: "-5" }
                },
                events: {},
                items: {}
            },
            {
                narrative: "鲁肃听了你的话，神色有所松动。",
                npc_dialogue: {
                    speaker: "鲁肃",
                    content: "孔明先生，此事关系重大，你可有把握？"
                },
                value_changes: {
                    luSu: { trust: "+10" }
                },
                events: {},
                items: {}
            },
            {
                narrative: "军帐内气氛变得更加紧张。",
                npc_dialogue: {
                    speaker: "周瑜",
                    content: "既然先生如此自信，那就请立下军令状吧！"
                },
                value_changes: {
                    global: { timeProgress: "+0" }
                },
                events: {
                    signMilitaryOrder: true
                },
                items: {}
            }
        ];
        
        // 随机选择一个响应
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return JSON.stringify(randomResponse);
    }
    
    // 获取后备响应
    getFallbackResponse(playerInput, gameState) {
        return {
            narrative: "（系统处理中，请稍候...）",
            npc_dialogue: {
                speaker: "周瑜",
                content: "先生请稍等，容我思考一下。"
            },
            value_changes: {}
        };
    }
    
    // 处理道具使用
    async processItemUse(itemName, gameState) {
        try {
            const itemPrompt = this.buildItemUsePrompt(itemName, gameState);
            const response = await this.callAI(itemPrompt);
            const parsedResponse = this.parseAIResponse(response);
            
            return {
                success: true,
                data: parsedResponse
            };
            
        } catch (error) {
            console.error('处理道具使用失败:', error);
            return {
                success: false,
                error: error.message,
                data: this.getItemUseFallback(itemName)
            };
        }
    }
    
    // 构建道具使用提示词
    buildItemUsePrompt(itemName, gameState) {
        const basePrompt = this.promptBuilder.buildPrompt(gameState, `使用道具：${itemName}`);
        
        // 添加道具使用的特殊说明
        const itemInstructions = {
            'xuande-brush': '玩家使用了刘备的亲笔信。这会显著提高鲁肃的信任度，并可能降低周瑜的猜忌。请描述鲁肃看到信件后的反应。'
        };
        
        const instruction = itemInstructions[itemName] || '玩家使用了一个道具。';
        
        return basePrompt + '\n\n特殊说明：' + instruction;
    }
    
    // 道具使用后备响应
    getItemUseFallback(itemName) {
        const fallbacks = {
            'xuande-brush': {
                narrative: "你拿出了刘备的亲笔信，鲁肃接过仔细阅读。",
                npc_dialogue: {
                    speaker: "鲁肃",
                    content: "这确实是主公的笔迹...孔明先生，我愿意相信你。"
                },
                value_changes: {
                    luSu: { trust: "+20" },
                    zhouYu: { suspicion: "-10" }
                }
            }
        };
        
        return fallbacks[itemName] || {
            narrative: "你使用了道具，但似乎没有产生明显效果。",
            npc_dialogue: null,
            value_changes: {}
        };
    }
    
    // 设置API密钥
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('deepseek_api_key', apiKey);
        console.log('API密钥已更新');
    }
    
    // 清除API密钥
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('deepseek_api_key');
        console.log('API密钥已清除');
    }
    
    // 测试API连接
    async testConnection() {
        try {
            const testPrompt = "请回复'连接成功'";
            const response = await this.callAI(testPrompt);
            return {
                success: true,
                message: '连接测试成功',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                message: '连接测试失败',
                error: error.message
            };
        }
    }
}