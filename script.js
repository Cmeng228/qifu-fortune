const data = {
  constellation: { suffix: "", options: ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"] },
  zodiac: { suffix: "生肖", options: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"] },
};

const summaries = [
  "今天适合稳住自己的节奏，先把手头的事情推进一小步，好消息会从细节里冒出来。",
  "今天的人际能量不错，适合主动表达想法，也适合把好运分享给朋友一起沾沾喜气。",
  "今天越认真越容易被看见，适合处理积压事务，也适合给自己安排一点小奖励。",
  "今天的关键词是取舍。少被情绪带走，把时间放到真正值得的人和事上。",
  "今天容易收到新消息，但不用急着跟风，先观察再出手会更容易接住好运。"
];
const lotteryPool = [
  { title: "今日适合抽身份皮肤", text: "活动池气场更亮，适合小抽试水，见好就收最稳。", level: "小吉", quote: "小抽怡情，别让欧气从指缝里溜走。" },
  { title: "今日适合攒钥匙", text: "抽奖波动偏大，先完成任务攒资源，晚上再看更好。", level: "平", quote: "忍住也是一种高级好运。" },
  { title: "今日有稀有闪光", text: "幸运位在高光奖励附近，适合抽保底进度接近的卡池。", level: "大吉", quote: "今天的手气有点会发光。" },
  { title: "今日适合抽头像框", text: "装扮类奖励更顺，皮肤池可以少量尝试，不宜上头。", level: "中吉", quote: "先把排面拿下，好运自然跟上。" },
  { title: "今日先祈福再抽", text: "基础运势还没完全打开，点灯后再抽会更有仪式感。", level: "待改运", quote: "仪式感到位，抽奖才有灵魂。" }
];
const goods = ["整理计划、主动沟通、学习充电", "签收好消息、复盘账目、早睡", "见朋友、做决定、清理桌面", "写下目标、运动散步、点灯祈愿"];
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

function getName() {
  return userNameInput.value.trim() || "神秘玩家";
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
  $("#lotteryTitle").textContent = `${getName()}，${item.title}`;
  $("#lotteryText").textContent = blessingBoost > 0 ? `${item.text} 祈福已生效，今日建议抽奖次数 +1。` : item.text;
  $("#lotteryLevel").textContent = blessingBoost > 0 && item.level === "平" ? "改运小吉" : item.level;
  $("#lotteryRate").textContent = `${rate}%`;
  $("#lotteryHint").textContent = blessingBoost > 0 ? "祈福已修改" : "点灯后可改运";
  $("#lotteryCard").classList.toggle("boosted", blessingBoost > 0);
}
function renderFortune() {
  const seed = hashValue(select.value);
  const name = getName();
  const typeName = `${select.value}${data[mode].suffix}`;
  const keyword = keywords[seed % keywords.length];
  const color = colors[seed % colors.length];
  const number = (seed % 9) + 1;
  $("#personalTitle").textContent = `${name}的今日好运签`;
  $("#resultTitle").textContent = `${typeName} · ${name}专属今日运势`;
  $("#summaryText").textContent = `${name}，${summaries[seed % summaries.length]}`;
  $("#scoreText").textContent = stars(seed, 1);
  $("#careerText").textContent = stars(seed, 2);
  $("#moneyText").textContent = stars(seed, 3);
  $("#loveText").textContent = stars(seed, 4);
  $("#healthText").textContent = stars(seed, 5);
  $("#goodText").textContent = goods[seed % goods.length];
  $("#avoidText").textContent = avoids[seed % avoids.length];
  $("#colorText").textContent = color;
  $("#numberText").textContent = number;
  $("#directionText").textContent = directions[seed % directions.length];
  renderLottery(seed);
  $("#shareTitle").textContent = `${name}的今日好运卡`;
  $("#shareText").textContent = `我抽到了「${name}的今日好运签」：${typeName}，关键词是「${keyword}」。狼人杀抽奖运势 ${$("#lotteryLevel").textContent}，气场 ${$("#lotteryRate").textContent}。${currentLottery.quote}`;
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
    renderFortune();
  });
});
function showResultScreen() {
  $("#startScreen").classList.add("hidden");
  $("#resultScreen").classList.remove("hidden");
  renderFortune();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("#startForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showResultScreen();
});
$("#startButton").addEventListener("click", showResultScreen);
$("#resetButton").addEventListener("click", () => {
  $("#resultScreen").classList.add("hidden");
  $("#startScreen").classList.remove("hidden");
  userNameInput.focus();
});
$("#drawFortune").addEventListener("click", () => {
  resetBlessing();
  renderFortune();
  showToast("专属运势已刷新");
});
select.addEventListener("change", () => {
  resetBlessing();
  renderFortune();
});
$("#lampButton").addEventListener("click", () => {
  blessingBoost = 18;
  $("#lampButton").classList.add("lit");
  $("#lampText").textContent = "已改运";
  renderFortune();
  showToast("抽奖运势已改");
});
$("#copyShare").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(`${$("#shareTitle").textContent}\n${$("#shareText").textContent}`);
    showToast("分享文案已复制");
  } catch {
    showToast("可手动复制分享文案");
  }
});
$("#todayText").textContent = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });
populateSelect();
