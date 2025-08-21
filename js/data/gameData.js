// 草船借箭 - 游戏数据配置文件

// 全局状态管理
const globalState = {
  timeProgress: { current: 1, max: 3, description: "当前日期/总共3日" },
  arrows: { current: 0, max: 120000, description: "当前箭支数量" }
};

// 数据类型定义
const dataTypes = {
  effectTypes: {
    checkBonus: "检定加成",
    attributeChange: "属性修改", 
    special: "特殊效果",
    multiple: "复合效果"
  },
  usageTypes: {
    automatic: "自动生效",
    manual: "手动使用",
    conditional: "条件触发"
  },
  timingTypes: {
    beforeCheck: "检定前",
    duringEvent: "事件中",
    afterEvent: "事件后"
  }
};

// 角色数据
const characters = {
  // 玩家角色
  zhugeLiang: {
    name: "诸葛亮",
    description: "字孔明，号卧龙。刘备军师，羽扇纶巾，飘然若仙。胸藏天地，腹隐兵机。善观天象，能察人心。",
    isPlayer: true,
    attributes: {
      intelligence: 95,  // 智谋值
      eloquence: 90,    // 口才值
      stamina: 100      // 体力值
    }
  },
  
  // NPC角色
  zhouYu: {
    name: "周瑜",
    description: "字公瑾，东吴大都督。姿质风流，雅量高致。然器量偏狭，见贤思齐而又妒贤嫉能。猜忌值越高，越对诸葛亮刁难。",
    isPlayer: false,
    attributes: {
      intelligence: 92,  // 智谋值
      suspicion: 50      // 猜忌值（兼任警觉功能）
    }
  },
  
  luSu: {
    name: "鲁肃",
    description: "字子敬，东吴谋臣。为人方正，宽厚长者。识才爱才，常为善类。信任值越高，越愿意帮助诸葛亮。",
    isPlayer: false,
    attributes: {
      trust: 50          // 信任值（兼任说服进度）
    }
  },
  
  ganNing: {
    name: "甘宁",
    description: "字兴霸，东吴大将。性烈如火，忠勇过人。奉公瑾之命，暗中监视。机警值越高，对玩家越刁难。",
    isPlayer: false,
    attributes: {
      intelligence: 65,  // 智谋值
      alertness: 75      // 机警值
    }
  }
};

// 章节数据
const chapters = {
  chapter1: {
    id: 1,
    title: "三日之约",
    openingText: "建安十三年冬，曹操率八十万大军南下，兵锋直指江东。孙刘联盟初成，共御强敌。时诸葛孔明奉刘玄德之命，留驻东吴襄助破曹。然东吴大都督周公瑾，虽英姿勃发，才略过人，却心胸偏狭，见孔明智谋超群，恐日后为东吴之患，遂生妒贤之心。",
    plotSummary: "建安十三年冬，曹操大军压境，诸葛亮奉刘备之命留驻东吴协助抗曹。军议之上，周瑜心生妒忌，故意刁难诸葛亮，要求其在三日内造箭十万支。面对挑衅，诸葛亮需要做出选择。【此处触发抉择事件1-应对挑衅】若选择接受挑战，诸葛亮将立下军令状，以性命担保三日交箭。【此处触发对话事件2-立下军令，完成后AI应给予道具：军令状(militaryOrder)】当夜，诸葛亮独坐军帐，等待鲁肃来访。鲁肃悄然而至，诸葛亮需要说服他提供帮助。【此处触发检定事件1-说服鲁肃】若成功说服，鲁肃将交付东吴虎符。【检定成功后AI应给予道具：东吴虎符(dongwuTiger)】若失败，则需要使用玄德亲笔信来增加说服力。整章的核心是在第一日内获得鲁肃的帮助承诺，同时要注意不能让周瑜的猜忌值过高，否则会导致失败。",
    successConditions: [
      { variable: "item:dongwuTiger", operator: "==", value: true }
    ],
    failureConditions: [
      { type: "or", conditions: [
        { variable: "timeProgress", operator: ">", value: 3 },
        { variable: "zhouYu.suspicion", operator: ">=", value: 100 }
      ]}
    ],
    
    // 章节结束文本
    chapterEndTexts: {
      success: {
        title: "第一章：智取东吴",
        description: "成功说服鲁肃，获得了东吴虎符，为草船借箭做好了准备。",
        narrative: "第一章的目标已经达成。"
      },
      failure: {
        title: "第一章：功败垂成",
        description: "周瑜的猜忌达到顶点，你被逐出东吴。",
        narrative: "计划败露，任务失败。"
      }
    }
  },
  
  chapter2: {
    id: 2,
    title: "暗度陈仓",
    openingText: "次日拂晓，晨光熹微。你在鲁肃引领下，来到江边僻静之处，开始筹谋大计。然公瑾虽表面不动声色，暗中却遣人四处窥探，欲知你如何造箭。",
    plotSummary: "次日清晨，诸葛亮在鲁肃引领下来到江边筹划借箭大计。诸葛亮向鲁肃索要船只和草人等物资，但不透露真实用途。【此处触发对话事件3-索要物资】此时甘宁突然到访，质疑诸葛亮的行动。【此处触发抉择事件2-应对甘宁】若选择虚言掩饰，需要进行智谋对决。【此处触发检定事件2-智谋对决】检定成功后甘宁退去，若甘宁机警值较低，其亲兵会赠送迷魂香。【条件满足时AI应给予道具：迷魂香(confusionIncense)】午夜时分，诸葛亮登上观星台观察天象，预测到第三日必有大雾。【此处触发对话事件4-天机预测，完成后AI应给予道具：司南(sima)】随后需要在夜间秘密准备草人等物资。【此处触发检定事件3-夜间准备】准备成功可获得草人道具。【检定成功后AI应给予道具：草人(grassman)】鲁肃见诸葛亮筹划有方，写下举荐信以备不时之需。【此处AI应给予道具：鲁肃举荐信(luSuLetter)】若准备失败且周瑜警觉过高，可能触发甘宁夜查的突发事件。",
    chapterState: {
      preparationProgress: { current: 0, max: 100, description: "准备进度" }
    },
    successConditions: [
      { type: "and", conditions: [
        { variable: "preparationProgress", operator: ">=", value: 100 }
      ]}
    ],
    failureConditions: [
      { type: "or", conditions: [
        { type: "and", conditions: [
          { variable: "timeProgress", operator: ">", value: 2 },
          { variable: "preparationProgress", operator: "<", value: 80 }
        ]}
      ]}
    ],
    
    // 章节结束文本
    chapterEndTexts: {
      success: {
        title: "第二章：深入敌营",
        description: "成功潜入曹营，巧妙地完成了草船借箭的关键步骤。",
        narrative: "第二章的目标已经达成。"
      },
      failure: {
        title: "第二章：计划败露",
        description: "在曹营中被发现，计划失败，面临重大危机。",
        narrative: "第二章计划失败。"
      }
    }
  },
  
  chapter3: {
    id: 3,
    title: "雾夜借箭",
    openingText: "第三日子时，大雾弥天，长江之上白茫茫一片，对面不见人。正如你所料，天公作美，助你成事。",
    plotSummary: "第三日子时，大雾弥漫长江，正如诸葛亮所料。诸葛亮在船首动员士兵，说明今夜只需擂鼓呐喊，不必真正作战。【此处触发对话事件5-出发前动员】船队出发后遇到巡江哨船阻拦。【此处触发抉择事件3-突破封锁】若有东吴虎符可顺利通过，否则需要强闯并承受损失。抵达曹营水寨附近后，开始擂鼓借箭的关键行动。【此处触发检定事件4-擂鼓借箭】根据检定结果决定借箭数量，大成功可获得顺风符。【大成功时AI应给予道具：顺风符(windTalisman)】曹操听闻江上鼓声，疑有埋伏，下令万箭齐发。天将破晓，雾气渐散，需要紧急撤退。【此处触发检定事件5-紧急撤退】若撤退失败，追兵将至，需要做最后抉择。【失败时触发抉择事件4-最后危机】最终返回东吴，周瑜见十万余箭，不得不承认诸葛亮的才能。【此处触发对话事件7-周瑜认输，并进行最终结局判定】",
    chapterState: {
      dangerLevel: { current: 0, max: 100, description: "危险等级，满100任务失败" },
      soldierMorale: { current: 80, max: 100, description: "士兵士气，低于30会溃散" },
      shipLoss: { current: 0, max: 20, description: "损失的船只数量" }
    },
    endings: {
      perfect: {
        conditions: {
          type: "and",
          conditions: [
          { variable: "arrows", operator: ">=", value: 100000 },
          { variable: "dangerLevel", operator: "<", value: 50 },
          { variable: "shipLoss", operator: "==", value: 0 }
        ]
        },
        title: "神机妙算",
        description: "箭支充足，无人伤亡，完美完成任务。",
        narrative: "你的计策完美成功，获得了所有人的敬佩。"
      },
      success: {
        conditions: {
          type: "and",
          conditions: [
          { variable: "arrows", operator: ">=", value: 80000 },
          { variable: "dangerLevel", operator: "<", value: 80 }
        ]
        },
        title: "智计过人",
        description: "成功借得足够箭支，证明了自己的能力。",
        narrative: "虽有波折，但最终成功完成了任务。"
      },
      barely: {
        conditions: {
          type: "and",
          conditions: [
          { variable: "arrows", operator: ">=", value: 50000 }
        ]
        },
        title: "险中求胜",
        description: "虽然过程惊险，但最终还是完成了任务。",
        narrative: "险象环生，勉强完成了任务。"
      },
      failure: {
        conditions: {
          type: "or",
          conditions: [
            { variable: "arrowProgress", operator: "<", value: 70000 },
            { variable: "dangerLevel", operator: "==", value: 100 },
            { variable: "timeProgress", operator: ">", value: 3 }
          ]
        },
        title: "功败垂成",
        description: "未能完成任务，面临军法处置。",
        narrative: "计划失败，面临严重后果。",
        consequences: ["被周瑜处死", "全军覆没", "功败垂成"]
      }
    },
    
    // 章节结束文本
    chapterEndTexts: {
      success: {
        title: "第三章：雾夜借箭",
        description: "成功完成草船借箭，获得足够的箭支。",
        narrative: "第三章的目标已经达成。"
      },
      failure: {
        title: "第三章：计划败露", 
        description: "在最后关头功败垂成，计划失败。",
        narrative: "第三章计划失败。"
      }
    }
  }
};

// 事件数据
const events = {
  // 对话事件
  
  dialogue_event2: {
    id: "dialogue_event2",
    type: "dialogue_event",
    chapter: 1,
    title: "立下军令",
    content: "公瑾闻言，佯作惊诧，实则心中窃喜。即令左右取军令状来，白绢黑字，森然可畏。其上写明：限三日内交箭十万，如违期限，甘当军法。你提笔濡墨，从容书名，印上朱泥。公瑾收起军令，与你约定三日为期。"
  },
  
  dialogue_event3: {
    id: "dialogue_event3",
    type: "dialogue_event",
    chapter: 2,
    title: "索要物资",
    content: "你微微一笑：'子敬勿忧。烦请为亮备快船二十艘，每船用军士三十人，船皆用青布为幔，各束草千余个，分布两厢。吾别有妙用。'子敬愕然：'莫非先生欲往曹营劫寨？'你摇首不语，只道：'但依此行，勿令公瑾得知。'"
  },
  
  dialogue_event4: {
    id: "dialogue_event4",
    type: "dialogue_event",
    chapter: 2,
    title: "天机预测",
    content: "高台之上，夜风料峭。你负手而立，仰望苍穹。但见箕星东指，毕星西垂，心中暗自推算。忽而抚掌而笑：'善哉！善哉！'原来你夜观天象，已知三日后长江之上必有大雾。此正天助我也！"
  },
  
  dialogue_event5: {
    id: "dialogue_event5",
    type: "dialogue_event",
    chapter: 3,
    title: "出发前动员",
    content: "子时已至，大雾弥天。你立于船首，见将士面有忧色。遂扬声励众，言明今夜只需擂鼓呐喊，不必真个厮杀。曹贼生性多疑，雾中必不敢轻出。待得功成，人人有赏。众军闻言，渐觉心安。"
  },
  
  dialogue_event7: {
    id: "dialogue_event7",
    type: "dialogue_event",
    chapter: 3,
    title: "周瑜认输",
    content: "但见船船箭支如林，军士搬运不绝。有司清点，共得箭十万三千有余。公瑾面色数变，强颜笑道：'先生真神人也！瑜不及远矣！'"
  },
  
  // 抉择事件
  choice_event1: {
    id: "choice_event1",
    type: "choice_event",
    chapter: 1,
    title: "应对挑衅",
    description: "面对周瑜的刁难，你如何应对？",
    options: {
      A: {
        text: "慨然应诺：'三日足矣，亮愿立军令状。'",
        consequences: "接受挑战，开启三日倒计时，触发dialogue_event2（立下军令）。"
      },
      B: {
        text: "推辞婉拒：'此事重大，容亮思虑。'",
        consequences: "直接触发失败结局。",
        additionalText: "公瑾拍案而起，厉声道：'先生莫非轻视东吴？既无良策，何必在此空谈！'众将肃然，气氛凝重。你的推辞彻底激怒了周瑜，被当场逐出军议。"
      }
    }
  },
  
  choice_event2: {
    id: "choice_event2",
    type: "choice_event",
    chapter: 2,
    title: "应对甘宁",
    description: "甘宁冷笑：'准备船只作甚？莫非要临阵脱逃？'",
    options: {
      A: {
        text: "虚言掩饰：'训练水军阵法。'",
        consequences: "选择此项将触发check_event2（智谋对决），需要与甘宁进行智谋检定。"
      },
      B: {
        text: "反客为主：'甘将军为何如此关心？'",
        consequences: "甘宁机警值+15。甘宁会根据当前对话情况和你的表现选择退去或恼羞成怒。如果恼羞成怒，可能引发物理对峻。"
      }
    }
  },
  
  choice_event3: {
    id: "choice_event3",
    type: "choice_event",
    chapter: 3,
    title: "突破封锁",
    description: "巡江将领：'都督有令，夜间不得出江！'",
    options: {
      A: {
        text: "出示鲁肃授权：'奉子敬将军之命。'",
        requirements: ["usedItem:dongwuTiger"],
        consequences: "若已在之前对话中向鲁肃出示过东吴虎符并获得授权，成功通过无损失。若未获得授权，危险等级+20，可能被扣留。",
        successText: "巡江将领验看授权令牌，恭敬行礼：'原来是子敬将军安排，末将这就放行。'船队顺利通过。",
        failureText: "你摸索半天，竟无相关授权。巡江将领疑心大起：'无凭无据，焉能放行？来人，扣下此船！'",
        resultText: "你向巡江将领出示了鲁肃的授权令牌。"
      },
      B: {
        text: "强闯：'军情紧急，后果我担！'",
        consequences: "触发武力冲突，损失2艘船，士兵士气-15，但能冲出封锁。",
        resultText: "你当机立断：'军情如火，延误战机罪责谁担？'强行突围。巡江军仓促应战，你损失两艘船，士兵士气下降，但终究冲出封锁。"
      }
    }
  },
  
  choice_event4: {
    id: "choice_event4",
    type: "choice_event",
    chapter: 3,
    title: "最后危机",
    description: "追兵将至，船因载箭过重行动缓慢",
    options: {
      A: {
        text: "抛弃部分箭支加速",
        consequences: "箭支数量-20000支，士兵士气-10，但成功逃脱。",
        resultText: "你忍痛下令：'抛箭保命！'士兵们将部分箭支推入江中，船速立时加快。虽有损失，总算保全性命。"
      },
      B: {
        text: "祈求顺风",
        requirements: ["usedItem:windTalisman"],
        consequences: "若已获得顺风符的庇佑，箭支数量不变，完美逃脱。否则需要其他方式。",
        resultText: "你想起之前获得的顺风符庇佑，高声祈祷。忽然江风大作，助船疾行。曹军追之不及，只能望江兴叹。"
      }
    }
  },
  
  // 检定事件
  check_event1: {
    id: "check_event1",
    type: "check_event",
    chapter: 1,
    title: "说服鲁肃",
    description: "夜深人静，子敬悄然来访。烛光摇曳间，故人相对而坐。你需巧言说服，方得其助。",
    checkTarget: "eloquence",
    successThreshold: 60,
    additionalCondition: "若鲁肃信任值未达到80，需要使用玄德亲笔增加说服力",
    successResult: "成功说服鲁肃，获得东吴虎符。鲁肃信任值显著提高。",
    successText: "子敬听罢，沉吟良久，终于下定决心。他从怀中取出一枚虎符，郑重交与你手：'此乃调兵虎符，先生持此可调船只。但切记，此事万不可让公瑾知晓。'",
    failureResult: "鲁肃信任值下降。需要使用玄德亲笔增加说服力。",
    failureText: "子敬面露雾色：'先生之事，肃定当相助。容我明日再做安排。'言罢匆匆离去。"
  },
  
  check_event2: {
    id: "check_event2",
    type: "check_event",
    chapter: 2,
    title: "智谋对决",
    description: "甘将军目光如炬，疑窦丛生。你需以智谋相抗，瞒天过海。",
    checkTarget: "intelligence",
    successThreshold: 60,
    additionalCondition: "若智谋值超过甘宁机警值20点以上，且甘宁机警值低于65，则额外获得迷魂香",
    successResult: "成功误导甘宁，可继续准备工作。根据情况可能获得迷魂香。",
    successText: "甘宁虽有疑虑，但无实据，只得悻悻而去。临行前，其亲兵悄悄塞给你一包香料，低声道：'将军虽严，亦知先生非常人，此物或有用处。'",
    failureResult: "被甘宁识破，直接触发失败结局",
    failureText: "甘宁冷笑：'先生之言，皆为谎言！你必有异图，不可湁走！'"
  },
  
  check_event3: {
    id: "check_event3",
    type: "check_event",
    chapter: 2,
    title: "夜间准备",
    description: "月黑风高，正宜行事。你需暗中调度，不露行迹。",
    checkTarget: "intelligence",
    successThreshold: 60,
    additionalCondition: "需要智谋值加上一半的体力值达到80才能成功",
    successResult: "准备进度大幅提高，获得草人，体力值下降。",
    successText: "你躬亲督导，指挥如定。将士们连夜加紧制作草人，准备工作进展顺利。",
    failureResult: "准备进度较少，体力值显著下降。可能被甘宁发现异常。",
    failureText: "你竭尽全力，却无奈人手不足，进展缓慢。此时已近天明，只得先作罢手。"
  },
  
  check_event4: {
    id: "check_event4",
    type: "check_event",
    chapter: 3,
    title: "擂鼓借箭",
    description: "雾锁长江，万籁俱寂。你需审时度势，引箭入彀。",
    checkTarget: "intelligence",
    successThreshold: 60,
    environmentFactors: "无草人-30加成，低士气-10加成，高危险-10加成",
    itemBonuses: "战鼓+15加成，草人+30加成",
    successResult: "正常成功：箭支10万支，士兵士气提高，危险等级提高。大成功（成功率非常高）：箭支12万支，士兵士气大幅提高，危险等级适度提高，额外获得顺风符。",
    successText: "你指挥如定，将士擂鼓如雷。曹贼隔雾听得声威，不敢轻动，只以千箭万箭射向江心。",
    failureResult: "失败：箭支7万支，士兵士气下降，危险等级大幅提高。大失败（成功率非常低）：箭支4万支，士兵士气大幅下降，危险等级大幅提高。",
    failureText: "雾较预期早散，曹军渐见形迹。你急令撤退，可惜箭支不足，功不全成。"
  },
  
  check_event5: {
    id: "check_event5",
    type: "check_event",
    chapter: 3,
    title: "紧急撤退",
    description: "天将破晓，雾渐消散。你需当机立断，全身而退。",
    checkTarget: "intelligence",
    successThreshold: 60,
    additionalCondition: "需要智谋值加上一半的士兵士气达到100才能成功",
    successResult: "安全撤离，箭支数量不变，士兵士气提高。",
    successText: "你当机立断，令船队迅速撤离。将士们执行如风，顺利脱险。",
    failureResult: "箭支数量损失，士兵士气大幅下降。撤退过程中有损失。",
    failureText: "你略显迟疑，曹军已觉异常。撤退中有部分箭支散落，将士们亦颇有缩疑。"
  },
  
  // 突发事件
  emergency_event1: {
    id: "emergency_event1",
    type: "emergency_event",
    chapter: 2,
    title: "甘宁夜查",
    description: "三更时分，甘宁率兵突至。火把照如白昼，将你等围在当中。'深夜至此，所为何事？'甘宁目光如电，手按剑柄。",
    triggerCondition: "当夜间准备失败且时间进度达到第2日时触发",
    checkTarget: "intelligence",
    successThreshold: 80,
    failureResult: "计划暴露，直接失败"
  }
};

// 道具数据
const items = {
  // === 剧情道具 ===
  militaryOrder: {
    id: "militaryOrder",
    name: "军令状",
    type: "plot",
    consumable: false,
    description: "白绢黑字，森然可畏。其上书明：限三日内交箭十万，如违期限，甘当军法。孔明亲手所书，印上朱泥。",
    effect: "纯剧情道具，无实际作用"
  },
  
  dongwuTiger: {
    id: "dongwuTiger", 
    name: "东吴虎符",
    type: "plot",
    consumable: false,
    description: "青铜铸就，虎首威严。此乃调兵遣将之信物，持此符者可调动东吴船只。鲁肃郑重相交，切记勿让公瑾知晓。",
    effect: "在对话中使用可获得鲁肃的船只调用授权，第三章抉择事件中可用此授权通过检查",
    usage: {
      timing: "对话中选择使用",
      description: "向鲁肃出示此符，获得船只调用授权。授权后在第三章遇到巡江时可出示"
    },
    triggerCondition: "check_event1成功后获得"
  },

  // === 检定道具 ===
  kongMingFan: {
    id: "kongMingFan",
    name: "孔明羽扇",
    type: "check",
    consumable: false,
    description: "鹅毛为骨，素绢为面。轻摇生风，静握蕴智。孔明常持此扇，运筹帷幄，决胜千里。",
    effect: {
      type: "checkBonus",
      target: "eloquence", 
      value: 10
    }
  },
  
  sima: {
    id: "sima",
    name: "司南",
    type: "check", 
    consumable: false,
    description: "磁石制成，指向分明。古人观天察地之器，能辨方位，识阴阳。孔明观星时所得，蕴含天机奥秘。",
    effect: {
      type: "checkBonus",
      target: "intelligence",
      value: 20
    }
  },
  
  grassman: {
    id: "grassman",
    name: "草人",
    type: "check",
    consumable: true,
    description: "稻草扎制，形如真人。披甲戴盔，手执刀枪。虽是草料所成，却能惑敌视听，引箭入彀。用后即毁。",
    effect: {
      type: "multiple",
      effects: [
        { type: "checkBonus", target: "intelligence", value: 30 },
        { type: "special", target: "arrowEfficiencyMultiplier", value: 2 }
      ]
    }
  },
  
  warDrum: {
    id: "warDrum",
    name: "战鼓",
    type: "check",
    consumable: false,
    description: "牛皮蒙面，铜环镶边。鼓声如雷，震慑敌胆。军中必备之器，能鼓舞士气，协调进退。",
    effect: {
      type: "multiple", 
      effects: [
        { type: "checkBonus", target: "intelligence", value: 15 },
        { type: "special", target: "arrowEfficiencyMultiplier", value: 1.5 }
      ]
    }
  },
  
  windTalisman: {
    id: "windTalisman",
    name: "顺风符",
    type: "check",
    consumable: true,
    description: "黄纸朱砂，符文密布。此乃道家秘传，能召唤江风，助船疾行。孔明精通奇门遁甲，偶得此符。用后化灰。",
    effect: {
      type: "multiple",
      effects: [
        { type: "checkBonus", target: "intelligence", value: 25 },
        { type: "special", target: "retreatAutoSuccess", value: true }
      ]
    }
  },
  
  confusionIncense: {
    id: "confusionIncense", 
    name: "迷魂香",
    type: "check",
    consumable: true,
    description: "异域香料，气味清雅。燃之能令人神思恍惚，难辨真假。甘宁亲兵暗中相赠，或有奇用。一次燃尽。",
    effect: {
      type: "special",
      target: "ganNingNightCheckAutoSuccess", 
      value: true
    }
  },

  // === 对话道具 ===
  xuanDeBrush: {
    id: "xuanDeBrush",
    name: "玄德亲笔",
    type: "dialogue",
    consumable: false,
    description: "刘备亲笔所书，墨迹犹新。纸上情真意切，言辞恳切。子敬见此，必忆故人之情，愿助一臂之力。",
    effect: "出示此信能够显著增加鲁肃对你的信任，鲁肃信任值+30"
  },
  
  luSuLetter: {
    id: "luSuLetter", 
    name: "鲁肃举荐信",
    type: "dialogue",
    consumable: false,
    description: "鲁肃亲笔举荐，言辞恳切。信中盛赞孔明才德，力劝公瑾重用。有此信在手，可缓解周瑜疑虑。",
    effect: "向周瑜出示此信能够显著降低其猜忌，周瑜猜忌值-30"
  }
};

// 检定机制配置
const checkMechanics = {
  baseFormula: "(character.attribute + item.checkBonus - event.difficulty)",
  successCalculation: "Math.random() * 100 < successRate",
  arrowEfficiency: {
    baseRate: 10000, // 支/小时
    modifiers: {
      grassman: { multiplier: 2, description: "草人效果：箭支效率×2" },
      warDrum: { multiplier: 1.5, description: "战鼓效果：箭支效率×1.5" },
      morale: { formula: "soldierMorale/100", description: "士气影响效率" }
    }
  },
  checkBonusTypes: {
    eloquence: "口才检定加成",
    intelligence: "智谋检定加成"
  },
  effectTypes: {
    set: "直接设置数值",
    change: "增减数值",
    gainItem: "获得道具",
    loseItem: "失去道具",
    trigger: "触发事件",
    condition: "条件判断",
    risk: "风险事件"
  },
  shipArrowCapacity: 5000, // 每艘船载箭数量
  retreatDifficultyModifier: {
    highDanger: 20, // 高危险等级增加撤退难度
    lowMorale: 15,  // 低士气增加撤退难度
    heavyLoad: 10   // 重载增加撤退难度
  }
};

// 人物数值变化规则
const reactionRules = {
  // 第一章人物规则
  
  // 周瑜的反应规则
  zhouYu: "【- 玩家谦逊示弱：suspicion -5到-10\n  例如：\"在下才疏学浅\"、\"都督高见\"\n- 玩家显示才能：suspicion +5到+15\n  例如：提及功绩、表现自信\n- 玩家讽刺挑衅：suspicion +15到+25\n  例如：质疑周瑜能力、言语轻慢\n- 玩家推辞任务：suspicion +20到+30\n  例如：拒绝造箭、找借口】",
  
  // 鲁肃的反应规则（第一章）
  luSu: "【- 玩家以大义劝说：trust +5到+10\n  例如：\"抗曹大业\"、\"孙刘联盟\"\n- 玩家展现真诚：trust +10到+15\n  例如：坦诚相告、推心置腹\n- 玩家欺骗威胁：trust -10到-20\n  例如：编造谎言、恐吓威胁\n- 玩家提及刘备：trust +5\n  例如：\"玄德兄托我\"、\"刘皇叔\"】",
  
  // 第二章人物规则
  
  // 甘宁的反应规则
  ganNing: "【- 玩家强硬对抗：alertness +5到+10\n  例如：言语冲突、拒绝配合\n- 玩家巧言应对：alertness -5\n  例如：转移话题、合理解释\n- 玩家露出破绽：alertness +10到+15\n  例如：言语矛盾、紧张慌乱】",
  
  // 鲁肃的反应规则（第二章延续）
  luSuChapter2: "【- 玩家请求帮助：trust +5\n  例如：详细说明需求\n- 玩家表现焦虑：trust -5\n  例如：催促鲁肃、言语急切】"
};

// 章节特殊数值规则
const dialogueRules = {
  // 第一章特殊数值
  chapter1: {
    // 说服进度（仅用于AI判断，不在gameData中）
    persuasionProgress: "【- 每次与鲁肃对话：+5\n- 提及\"曹操大军\"、\"八十万\"：+10\n- 提及\"东吴安危\"、\"江东\"：+15\n- 展示计划\"我有妙计\"、\"三日可成\"：+20\n- 提及\"子敬兄\"、\"故人\"：+10\n- 对话偏离主题：+0\n- 冒犯鲁肃：-10到-20】",
    

  },
  
  // 第二章特殊数值
  chapter2: {
    // preparationProgress（章节变量）
    preparationProgress: "【- 每次准备行动：+5\n- 成功获取物资：+20到+30\n- 鲁肃全力支持：+15到+25\n- 遭遇阻碍：+5或不变\n- 检定事件3成功：+60（固定值）】",
    

  },
  
  // 第三章特殊数值
  chapter3: {
    // arrows（全局变量）
    arrows: "【- 检定事件4结果决定：\n  大成功：设为120000\n  成功：设为100000\n  失败：设为70000\n  大失败：设为40000\n- 抉择事件4选A：-20000\n- 检定事件5失败：-15000】",
    
    // dangerLevel（章节变量）
    dangerLevel: "【- 每次行动基础：+10\n- 遭遇巡逻：+15到+20\n- 擂鼓声过大：+10到+15\n- 曹军起疑：+20到+30\n- 成功规避：+5或不变】",
    
    // soldierMorale（章节变量）
    soldierMorale: "【- 玩家鼓舞（\"必胜\"、\"重赏\"）：+10到+20\n- 看到成效：+15到+25\n- 遭遇危险：-10到-20\n- 损失船只：-15\n- 玩家慌张：-10到-20】",
    
    // shipLoss（章节变量）
    shipLoss: "【- 抉择事件3选B（强闯）：+2\n- 其他损失事件：+1到+3\n- 每损失1艘船，箭支容量-5000】"
  }
};

// 导出所有游戏数据
// 数据验证配置
const dataValidation = {
  requiredFields: {
    character: ['name', 'attributes'],
    item: ['id', 'name', 'effect', 'usage'],
    event: ['id', 'type', 'chapter', 'title'],
    checkEvent: ['checkType', 'baseSuccessRate', 'formula']
  },
  attributeRanges: {
    intelligence: { min: 0, max: 100 },
    eloquence: { min: 0, max: 100 },
    stamina: { min: 0, max: 100 },
    trust: { min: 0, max: 100 },
    suspicion: { min: 0, max: 100 },
    alertness: { min: 0, max: 100 }
  },
  gameStateRanges: {
    timeProgress: { min: 1, max: 3 },
    arrows: { min: 0, max: 120000 },
    preparationProgress: { min: 0, max: 100 },
    dangerLevel: { min: 0, max: 100 },
    soldierMorale: { min: 0, max: 100 },
    shipLoss: { min: 0, max: 20 }
  }
};

export {
  globalState,
  dataTypes,
  characters,
  chapters,
  events,
  items,
  checkMechanics,
  dataValidation,
  reactionRules,
  dialogueRules
};

// 默认导出
export default {
  globalState,
  dataTypes,
  characters,
  chapters,
  events,
  items,
  checkMechanics,
  dataValidation,
  reactionRules,
  dialogueRules
};