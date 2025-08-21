# 美术素材文件命名规范

## 📁 文件夹结构
```
assets/images/
├── items/          # 道具图标
├── scenes/         # 场景背景
├── characters/     # 人物头像
├── icons/          # 状态图标
└── ui/            # UI装饰素材
```

## 📦 道具素材命名 (items/)
1. `kongming_fan.png` - 孔明羽扇
2. `xuande_letter.png` - 玄德亲笔
3. `military_order.png` - 军令状
4. `dongwu_tiger.png` - 东吴虎符
5. `sima_compass.png` - 司南
6. `grass_man.png` - 草人
7. `war_drum.png` - 战鼓
8. `confusion_incense.png` - 迷魂香
9. `wind_talisman.png` - 顺风符
10. `lusu_letter.png` - 鲁肃举荐信

## 🏞️ 场景素材命名 (scenes/)
1. `chapter1_council_hall.png` - 第一章：东吴军议厅
2. `chapter1_tent_night.png` - 第一章：诸葛亮军帐夜景
3. `chapter2_riverside_dawn.png` - 第二章：江边清晨
4. `chapter2_observatory_night.png` - 第二章：观星台夜景
5. `chapter3_river_fog.png` - 第三章：雾中长江
6. `chapter3_arrow_borrowing.png` - 第三章：草船借箭现场
7. `chapter3_cao_camp.png` - 第三章：曹营水寨

## 👤 人物头像命名 (characters/)
1. `zhuge_liang.png` - 诸葛亮头像
2. `zhou_yu.png` - 周瑜头像
3. `lu_su.png` - 鲁肃头像
4. `gan_ning.png` - 甘宁头像

### 如需小尺寸头像（对话框用）
1. `zhuge_liang_small.png` - 诸葛亮小头像
2. `zhou_yu_small.png` - 周瑜小头像
3. `lu_su_small.png` - 鲁肃小头像
4. `gan_ning_small.png` - 甘宁小头像

## 🎯 状态图标命名 (icons/)
1. `icon_intelligence.png` - 智谋值图标
2. `icon_trust.png` - 信任值图标
3. `icon_suspicion.png` - 猜忌值图标
4. `icon_time.png` - 时间进度图标
5. `icon_preparation.png` - 准备进度图标
6. `icon_danger.png` - 危险等级图标
7. `icon_morale.png` - 士兵士气图标
8. `icon_arrows.png` - 箭支数量图标

## 🎨 UI装饰素材命名 (ui/)
1. `border_dialog.png` - 对话框边框
2. `border_status.png` - 状态栏边框
3. `btn_send_normal.png` - 发送按钮常态
4. `btn_send_pressed.png` - 发送按钮按下态
5. `btn_item_normal.png` - 道具按钮常态
6. `btn_item_pressed.png` - 道具按钮按下态
7. `bg_pattern.png` - 背景纹理

## 📐 推荐尺寸规格

### 道具图标 (items/)
- 标准尺寸：48 × 48px
- @2x：96 × 96px
- @3x：144 × 144px

### 场景背景 (scenes/)
- 移动端宽度：375 × 200px
- @2x：750 × 400px
- @3x：1125 × 600px

### 人物头像 (characters/)
- 大头像：120 × 120px
- 小头像：64 × 64px
- @2x/@3x按比例放大

### 状态图标 (icons/)
- 标准尺寸：24 × 24px
- @2x：48 × 48px
- @3x：72 × 72px

## 💡 命名规则说明
1. 全部使用小写字母
2. 单词间用下划线连接
3. 不使用中文或特殊字符
4. 保持命名简洁清晰
5. 多倍图添加后缀：`@2x`、`@3x`

## 🎯 高清屏适配示例
```
kongming_fan.png       # 1倍图 48×48
kongming_fan@2x.png    # 2倍图 96×96
kongming_fan@3x.png    # 3倍图 144×144
```

---

## 🚨 重要：需要添加的背景图片

请将提供的中式云纹背景图片保存为：
**`dialogue-background.png`**

这个文件将作为对话界面的背景图片使用，应该是刚才提供的那张漂亮的中式传统云纹图案。

推荐尺寸：建议至少 800×800px，以确保在各种屏幕上都有良好的显示效果。