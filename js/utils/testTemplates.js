/**
 * 测试模板集合
 * 用于快速测试各种游戏功能
 */

window.getTestTemplates = function() {
    return {
        // 测试弹窗时序：打字机动画完成后，先显示事件，再显示道具
        popup_sequence: JSON.stringify({
            "npc_dialogue": {
                "speaker": "周瑜",
                "content": "孔明先生，这次任务完成得不错。本都督有赏！"
            },
            "value_changes": {
                "zhouYuSuspicion": -10,
                "luSuTrust": 5
            },
            "autoEvents": [
                {
                    "type": "choice_event",
                    "id": "test_choice",
                    "title": "选择奖励",
                    "description": "周瑜要赏赐你，请选择：",
                    "choices": [
                        {"text": "要军令状"},
                        {"text": "要东吴虎符"}
                    ]
                }
            ],
            "itemNotifications": [
                {
                    "type": "item_gained",
                    "itemId": "militaryOrder",
                    "itemName": "军令状",
                    "description": "获得了军令状，可以调动军队"
                }
            ]
        }),
        
        // 测试多个事件和道具
        multiple_popups: JSON.stringify({
            "npc_dialogue": {
                "speaker": "鲁肃",
                "content": "先生神机妙算，这些东西或许对您有用。"
            },
            "autoEvents": [
                {
                    "type": "dialogue_event",
                    "id": "test_dialogue",
                    "title": "重要消息",
                    "content": "曹军已经开始调动，请做好准备。"
                },
                {
                    "type": "check_event",
                    "id": "test_check",
                    "title": "智力检定",
                    "description": "检定结果",
                    "success": true,
                    "baseValue": 80,
                    "modifier": 10,
                    "randomValue": 5
                }
            ],
            "itemNotifications": [
                {
                    "type": "item_gained",
                    "itemId": "sima",
                    "itemName": "司马罗盘",
                    "description": "可以预测天气变化"
                },
                {
                    "type": "item_gained",
                    "itemId": "windTalisman",
                    "itemName": "风符",
                    "description": "可以改变风向"
                }
            ]
        }),
        
        // 原有的测试模板
        dialogue_event2: JSON.stringify({
            "npc_dialogue": {
                "speaker": "周瑜",
                "content": "既然孔明先生如此自信，那就请立下军令状吧！"
            },
            "autoEvents": [
                {
                    "type": "dialogue_event",
                    "id": "dialogue_event2",
                    "title": "立下军令",
                    "content": "公瑾闻言，佯作惊诧，实则心中窃喜。即令左右取军令状来..."
                }
            ]
        }),
        
        choice_event1: JSON.stringify({
            "npc_dialogue": {
                "speaker": "周瑜",
                "content": "孔明先生真是好大的口气！三日造箭十万支，你可敢立军令状？"
            },
            "autoEvents": [
                {
                    "type": "choice_event",
                    "id": "choice_event1",
                    "title": "应对挑衅",
                    "description": "面对周瑜的刁难，你如何应对？",
                    "choices": [
                        {"text": "从容接受挑战"},
                        {"text": "委婉推辞"}
                    ]
                }
            ]
        }),
        
        multiple_items: JSON.stringify({
            "npc_dialogue": {
                "speaker": "鲁肃",
                "content": "先生，这些是我为您准备的物资。"
            },
            "itemNotifications": [
                {
                    "type": "item_gained",
                    "itemId": "militaryOrder",
                    "itemName": "军令状",
                    "description": "获得了军令状"
                },
                {
                    "type": "item_gained",
                    "itemId": "dongwuTiger",
                    "itemName": "东吴虎符",
                    "description": "获得了东吴虎符"
                },
                {
                    "type": "item_gained",
                    "itemId": "sima",
                    "itemName": "司马罗盘",
                    "description": "获得了司马罗盘"
                }
            ]
        }),
        
        check_event1_success: JSON.stringify({
            "npc_dialogue": {
                "speaker": "鲁肃",
                "content": "先生高见！子敬愿助先生一臂之力！"
            },
            "value_changes": {
                "luSuTrust": 20,
                "zhugeIntelligence": 5
            },
            "autoEvents": [
                {
                    "type": "check_event",
                    "id": "check_event1",
                    "title": "说服鲁肃",
                    "description": "成功说服了鲁肃",
                    "success": true,
                    "baseValue": 70,
                    "modifier": 15,
                    "randomValue": 8
                }
            ]
        })
    };
};

console.log('✅ 测试模板已加载');