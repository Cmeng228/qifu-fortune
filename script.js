const data = {
  constellation: { suffix: "", options: ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"] },
  zodiac: { suffix: "生肖", options: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"] },
};

const summaries = [
  "今天的好运藏在一个小决定里，越清醒越容易接住机会。",
  "你今天有一种被看见的气场，适合主动表达，也适合轻轻冒险。",
  "今天先稳住节奏，再出手会更准。别急，好消息会从细节里冒出来。",
  "今日关键词是回弹。上午蓄力，下午变顺，晚上适合给自己一点奖励。",
  "你今天适合把愿望说出来，朋友缘和抽奖气场都会跟着亮一点。"
];

const lotteryPool = [
  { title: "今日适合看活动时装池", text: "高光目标放在永久时装和六星时装上，券和碎片只当保底进度，别误判成欧气。", level: "小吉", quote: "高光看时装，保底看进度。" },
  { title: "今日适合攒资源不硬抽", text: "抽奖波动偏大，拿完保底券和碎片就收，等更顺的活动池再开。", level: "平", quote: "会收手的人，运气通常不会太差。" },
  { title: "今日适合追高级装饰", text: "幸运位在头像框、聊天气泡、麦克风、弹幕和号码牌附近，适合小抽试水。", level: "大吉", quote: "今天的排面奖励有点会发光。" },
  { title: "今日适合小抽装扮池", text: "装饰目标比时装更顺，优先看头像框和聊天气泡，抽到保底资源就稳住。", level: "中吉", quote: "先拿排面，再谈高光。" },
  { title: "今日先祈福再决定", text: "基础气场还没完全打开，点灯后再看是否冲永久时装或高级装饰。", level: "待改运", quote: "仪式感到位，收手线也要到位。" }
];

const goods = ["整理计划、主动沟通、学习充电", "签到领资源、复盘账目、早点睡", "见朋友、做决定、清理桌面", "写下目标、散步、点灯祈愿"];
const avoids = ["冲动消费、临时变卦、熬夜", "口头承诺、情绪争执、拖延", "过度解释、频繁改计划、冷处理", "重仓投入、忽略细节、硬碰硬"];
const colors = ["青绿色", "暖金色", "月白色", "朱砂红", "松石蓝", "浅紫色"];
const directions = ["东南", "正南", "西北", "东北", "正东", "西南"];
const keywords = ["稳住节奏", "小抽怡情", "贵人靠近", "好运返场", "欧气微亮", "先祈后抽"];

const $ = (id) => document.querySelector(id);
const userNameInput = $("#userName");
const select = $("#fortuneSelect");
const tabs = document.querySelectorAll(".tab");
let mode = "constellation";
let blessingBoost = 0;
let currentLottery = lotteryPool[0];
let aiFortune = null;
let loadingTimer = null;
const fortuneContent = () => document.querySelectorAll(".fortune-content");

function getName() {
  return userNameInput.value.trim() || "神秘玩家";
}

function getTypeName() {
  return `${select.value}${data[mode].suffix}`;
}

function hashValue(text) {
  return [...`${new Date().toDateString()}-${mode}-${getName()}-${text}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function stars(seed, offset = 0) {
  const count = 3 + ((seed + offset) % 3);
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function populateSelect() {
  select.innerHTML = data[mode].options.map((item) => `<option value="${item}">${item}</option>`).join("");
}

function renderLottery(seed) {
  const boostedSeed = seed + blessingBoost;
  const item = lotteryPool[boostedSeed % lotteryPool.length];
  const rate = Math.min(96, 48 + (boostedSeed % 32) + blessingBoost);
  currentLottery = item;
  $("#lotteryTitle").textContent = aiFortune?.lotteryTitle || `${getName()}，${item.title}`;
  $("#lotteryText").textContent = aiFortune?.lotteryText || (blessingBoost > 0 ? `${item.text} 祈福已生效，可以小抽 1-3 次，拿到保底资源别上头。` : item.text);
  $("#lotteryLevel").textContent = aiFortune?.lotteryLevel || (blessingBoost > 0 && item.level === "平" ? "改运小吉" : item.level);
  $("#lotteryRate").textContent = aiFortune?.lotteryRate || `${rate}%`;
  $("#lotteryHint").textContent = blessingBoost > 0 ? "祈福已修改" : "点灯后可改运";
  $("#lotteryCard").classList.toggle("boosted", blessingBoost > 0);
}

function renderFortune() {
  const seed = hashValue(select.value);
  const name = getName();
  const typeName = getTypeName();
  const keyword = keywords[seed % keywords.length];
  const color = colors[seed % colors.length];
  const number = (seed % 9) + 1;
  $("#personalTitle").textContent = `${name}的今日好运签`;
  $("#profileLine").textContent = `${typeName} · 今日专属档案`;
  $("#resultTitle").textContent = `${typeName} · ${name}专属今日运势`;
  $("#summaryText").textContent = aiFortune?.summary || `${name}，${summaries[seed % summaries.length]}`;
  $("#scoreText").textContent = stars(seed, 1);
  $("#careerText").textContent = stars(seed, 2);
  $("#moneyText").textContent = stars(seed, 3);
  $("#loveText").textContent = stars(seed, 4);
  $("#healthText").textContent = stars(seed, 5);
  $("#goodText").textContent = aiFortune?.good || goods[seed % goods.length];
  $("#avoidText").textContent = aiFortune?.avoid || avoids[seed % avoids.length];
  $("#colorText").textContent = color;
  $("#numberText").textContent = number;
  $("#directionText").textContent = directions[seed % directions.length];
  renderLottery(seed);
  $("#shareTitle").textContent = `${name}的今日好运卡`;
  $("#shareText").textContent = aiFortune?.shareText || `我抽到了「${name}的今日好运签」：${typeName}，关键词是「${keyword}」。狼人杀抽奖运势 ${$("#lotteryLevel").textContent}，气场 ${$("#lotteryRate").textContent}。${currentLottery.quote}`;
}

async function fetchAiFortune() {
  const endpoint = window.AI_FORTUNE_ENDPOINT;
  if (!endpoint) return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      name: getName(),
      mode: mode === "constellation" ? "星座" : "生肖",
      typeName: getTypeName(),
      boosted: blessingBoost > 0
    })
  });
  window.clearTimeout(timeout);
  if (!response.ok) throw new Error("AI endpoint failed");
  return response.json();
}

async function generateFortune() {
  aiFortune = null;
  startLoading();
  if (window.AI_FORTUNE_ENDPOINT) {
    try {
      aiFortune = await fetchAiFortune();
    } catch {
      aiFortune = null;
    }
  }
  renderFortune();
  finishLoading(Boolean(aiFortune));
}

function startLoading() {
  const resultScreen = $("#resultScreen");
  const loadingProgress = $("#loadingProgress");
  const loadingText = $("#loadingText");
  const steps = document.querySelectorAll("[data-loading-step]");
  const messages = [
    "读取你的专属档案...",
    "点亮今日祈愿和抽奖气场...",
    "正在生成可以分享的好运签..."
  ];
  let step = 0;
  window.clearInterval(loadingTimer);
  resultScreen.classList.add("loading");
  fortuneContent().forEach((item) => item.classList.add("hidden"));
  loadingProgress.style.width = "18%";
  loadingText.textContent = messages[0];
  steps.forEach((item, index) => item.classList.toggle("active", index === 0));
  loadingTimer = window.setInterval(() => {
    step = Math.min(step + 1, messages.length - 1);
    loadingProgress.style.width = `${38 + step * 24}%`;
    loadingText.textContent = messages[step];
    steps.forEach((item, index) => item.classList.toggle("active", index <= step));
  }, 1300);
}

function finishLoading(hasAiResult) {
  window.clearInterval(loadingTimer);
  $("#loadingProgress").style.width = "100%";
  $("#loadingText").textContent = hasAiResult ? "占卜完成，今日好运已生成。" : "占卜完成，已生成今日好运。";
  window.setTimeout(() => {
    fortuneContent().forEach((item) => item.classList.remove("hidden"));
    $("#resultScreen").classList.remove("loading");
  }, 350);
}

function resetBlessing() {
  blessingBoost = 0;
  $("#lampButton").classList.remove("lit");
  $("#lampText").textContent = "点灯改运";
}

function showToast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  window.setTimeout(() => $("#toast").classList.remove("show"), 1600);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    resetBlessing();
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    populateSelect();
  });
});

$("#startForm").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#startScreen").classList.add("hidden");
  $("#resultScreen").classList.remove("hidden");
  generateFortune();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#resetButton").addEventListener("click", () => {
  window.clearInterval(loadingTimer);
  $("#resultScreen").classList.add("hidden");
  $("#startScreen").classList.remove("hidden");
  userNameInput.focus();
});

$("#lampButton").addEventListener("click", () => {
  blessingBoost = 18;
  $("#lampButton").classList.add("lit");
  $("#lampText").textContent = "已改运";
  generateFortune();
  showToast("抽奖运势已改");
});

$("#copyShare").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#shareText").textContent);
    showToast("分享文案已复制");
  } catch {
    showToast("复制失败，可长按文字手动复制");
  }
});

$("#todayText").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
populateSelect();
