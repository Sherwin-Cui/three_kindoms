// 调试日志工具
class DebugLogger {
    static isEnabled = true;
    
    static log(category, message, data = null) {
        if (!this.isEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] 🎮 [${category}]`;
        
        if (data) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }
    
    static error(category, message, error = null) {
        if (!this.isEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] ❌ [${category}]`;
        
        if (error) {
            console.error(prefix, message, error);
        } else {
            console.error(prefix, message);
        }
    }
    
    static warn(category, message, data = null) {
        if (!this.isEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] ⚠️ [${category}]`;
        
        if (data) {
            console.warn(prefix, message, data);
        } else {
            console.warn(prefix, message);
        }
    }
    
    static success(category, message, data = null) {
        if (!this.isEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] ✅ [${category}]`;
        
        if (data) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }
    
    static info(category, message, data = null) {
        if (!this.isEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] ℹ️ [${category}]`;
        
        if (data) {
            console.info(prefix, message, data);
        } else {
            console.info(prefix, message);
        }
    }
    
    // 显示AI连接状态
    static logAIStatus(status, details = null) {
        const statusIcon = status === 'connected' ? '🟢' : 
                          status === 'connecting' ? '🟡' : 
                          status === 'error' ? '🔴' : '⚪';
        
        this.log('AI连接', `${statusIcon} 状态: ${status}`, details);
    }
    
    // 显示游戏事件
    static logGameEvent(eventType, description, data = null) {
        const eventIcon = eventType === 'user_input' ? '👤' :
                         eventType === 'ai_response' ? '🤖' :
                         eventType === 'state_change' ? '🔄' :
                         eventType === 'error' ? '💥' : '🎯';
        
        this.log('游戏事件', `${eventIcon} ${eventType}: ${description}`, data);
    }
    
    // 切换调试模式
    static toggle() {
        this.isEnabled = !this.isEnabled;
        console.log(`🔧 调试模式: ${this.isEnabled ? '开启' : '关闭'}`);
    }
}

// 全局快捷方式
window.debugToggle = () => DebugLogger.toggle();
window.debugStatus = () => console.log('🔧 调试模式状态:', DebugLogger.isEnabled);

console.log('🔧 调试工具已加载! 使用 debugToggle() 切换调试模式，debugStatus() 查看状态');