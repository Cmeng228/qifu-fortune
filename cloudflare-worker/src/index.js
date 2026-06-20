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
      "只返回 JSON，不要 Markdown，不要解释。",
      "字段必须是 summary, good, avoid, lotteryTitle, lotteryText, lotteryLevel, lotteryRate, shareText。",
      `昵称：${input.name || "神秘玩家"}`,
      `类型：${input.typeName || "未选择"}`,
      `测算方式：${input.mode || "星座"}`,
      `是否祈福改运：${input.boosted ? "是" : "否"}`,
      "lotteryRate 用 45%-96% 的整数百分比字符串。",
      "summary 40 字以内，shareText 要有分享欲。"
    ].join("\n");

    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "你只输出可 JSON.parse 的 JSON 对象。" },
        { role: "user", content: prompt }
      ]
    });

    const text = aiResponse.response || "{}";
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    return json(JSON.parse(jsonText));
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
