export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const input = await request.json().catch(() => null);
    if (!input) return json({ error: "Invalid JSON" }, 400);

    const prompt = [
      "你是中文娱乐运势生成器，文风要像朋友间会转发的小卡片。",
      "不要恐吓，不要承诺真实收益，不要说自己是 AI。",
      "必须写今日运势，不要写本周、本月、彩票、真实投资或真钱中奖。",
      "狼人杀抽奖只指游戏内皮肤、身份、头像框、装扮等奖励。",
      "只返回 JSON，不要 Markdown，不要解释。",
      "字段必须是 summary, good, avoid, lotteryTitle, lotteryText, lotteryLevel, lotteryRate, shareText。",
      `昵称：${input.name || "神秘玩家"}`,
      `类型：${input.typeName || "未选择"}`,
      `测算方式：${input.mode || "星座"}`,
      `是否祈福改运：${input.boosted ? "是" : "否"}`,
      "lotteryRate 用 45%-96% 的整数百分比字符串，必须带 %。",
      "summary 40 字以内，shareText 要有分享欲，所有内容都要像专属当天结果。"
    ].join("\n");

    try {
      if (!env.AI) throw new Error("Workers AI binding is missing");
      const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
        messages: [
          { role: "system", content: "你只输出可 JSON.parse 的 JSON 对象。" },
          { role: "user", content: prompt }
        ]
      });

      const text = aiResponse.response || "{}";
      const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      return json(JSON.parse(jsonText));
    } catch (error) {
      return json(fallbackFortune(input, error));
    }
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function fallbackFortune(input, error) {
  const name = input.name || "神秘玩家";
  const typeName = input.typeName || "今日玩家";
  const boosted = Boolean(input.boosted);
  const seed = [...`${new Date().toDateString()}-${name}-${typeName}-${boosted}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rates = [58, 63, 69, 74, 81, 88, 92];
  const levels = ["小吉", "中吉", "大吉", "欧气微亮", "先祈后抽"];
  const rate = Math.min(96, rates[seed % rates.length] + (boosted ? 6 : 0));
  const level = boosted ? "祈福加成" : levels[seed % levels.length];

  return {
    summary: `${name}今天适合稳一点再出手，好运会从一个小选择里冒出来。`,
    good: "点灯祈愿、签到领资源、和朋友组局",
    avoid: "上头连抽、临时反悔、熬夜硬撑",
    lotteryTitle: `${name}的狼人杀抽奖气场${boosted ? "已点亮" : "待点亮"}`,
    lotteryText: boosted ? "祈福后气场更集中，适合小抽一次高光奖励。" : "当前手气偏稳，先看卡池再决定，别急着连抽。",
    lotteryLevel: level,
    lotteryRate: `${rate}%`,
    shareText: `我抽到了「${name}的今日好运签」：${typeName}，狼人杀抽奖气场 ${rate}%，${boosted ? "祈福后更顺了。" : "先祈福再抽更有仪式感。"}`
  };
}
