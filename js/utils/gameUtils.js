/**
 * 草船借箭游戏工具类
 * 整合状态管理中的通用逻辑，避免代码重复
 */

export class GameUtils {
    /**
     * 解析数值变化字符串（如"zhouYu.suspicion+5", "arrows-10"）
     * @param {string} changeStr - 数值变化字符串
     * @returns {Object|null} 解析后的对象 {path, value} 或 null
     */
    static parseValueChange(changeStr) {
        if (typeof changeStr !== 'string') {
            return null;
        }
        
        const str = changeStr.trim();
        let match;
        
        // 匹配格式：path+value 或 path-value
        if ((match = str.match(/^([a-zA-Z][a-zA-Z0-9.]*)(\+|\-)([0-9]+)$/))) {
            const path = match[1];
            const operator = match[2];
            const value = parseInt(match[3]);
            
            // 验证路径格式
            if (path.includes('.')) {
                const parts = path.split('.');
                if (parts.length !== 2) return null;
                // 验证角色名和属性名
                const validCharacters = ['zhouYu', 'luSu', 'ganNing', 'zhugeLiang'];
                if (!validCharacters.includes(parts[0])) return null;
            } else {
                // 验证全局属性名
                const validGlobals = ['arrows', 'timeProgress', 'preparationProgress', 'dangerLevel', 'soldierMorale', 'shipLoss'];
                if (!validGlobals.includes(path)) return null;
            }
            
            return {
                path: path,
                value: operator === '+' ? value : -value
            };
        }
        
        return null;
    }

    /**
     * 检查条件是否满足
     * @param {string} condition - 条件表达式
     * @param {Object} state - 游戏状态对象
     * @returns {boolean} 是否满足
     */
    static checkCondition(condition, state) {
        try {
            const evaluateExpression = (expr) => {
                const path = expr.trim();
                if (path.includes('.')) {
                    const parts = path.split('.');
                    if (parts.length === 2) {
                        return state[parts[0]]?.[parts[1]];
                    }
                }
                return state[path];
            };
            
            if (condition.includes('>=')) {
                const [left, right] = condition.split('>=').map(s => s.trim());
                return evaluateExpression(left) >= parseFloat(right);
            }
            if (condition.includes('<=')) {
                const [left, right] = condition.split('<=').map(s => s.trim());
                return evaluateExpression(left) <= parseFloat(right);
            }
            if (condition.includes('>')) {
                const [left, right] = condition.split('>').map(s => s.trim());
                return evaluateExpression(left) > parseFloat(right);
            }
            if (condition.includes('<')) {
                const [left, right] = condition.split('<').map(s => s.trim());
                return evaluateExpression(left) < parseFloat(right);
            }
            if (condition.includes('==')) {
                const [left, right] = condition.split('==').map(s => s.trim());
                return evaluateExpression(left) == parseFloat(right);
            }
            return false;
        } catch (error) {
            console.warn(`条件检查失败: ${condition}`, error);
            return false;
        }
    }

    /**
     * 验证数值范围
     * @param {number} value - 要验证的数值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制在范围内的数值
     */
    static clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 深度克隆对象
     * @param {Object} obj - 要克隆的对象
     * @returns {Object} 克隆后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        
        return cloned;
    }

    /**
     * 格式化显示文本
     * @param {string} text - 原始文本
     * @param {Object} variables - 变量替换对象
     * @returns {string} 格式化后的文本
     */
    static formatText(text, variables = {}) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 调试日志输出
     * @param {string} category - 日志分类
     * @param {string} message - 日志消息
     * @param {any} data - 附加数据
     */
    static debugLog(category, message, data = null) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`[${category}] ${message}`, data || '');
        }
    }
}