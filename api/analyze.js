export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageData, mediaType } = req.body;
  if (!imageData) return res.status(400).json({ error: "이미지가 없습니다" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API 키가 설정되지 않았습니다" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
            { type: "text", text: "이 음식 사진을 분석해서 JSON만 응답해줘. 다른 텍스트 절대 포함하지 마. 형식: {\"foodName\":\"이름\",\"category\":\"종류\",\"servingSize\":\"1인분\",\"calories\":숫자,\"nutrients\":{\"carbs\":숫자,\"protein\":숫자,\"fat\":숫자,\"fiber\":숫자,\"sodium\":숫자},\"description\":\"설명\",\"healthTips\":\"팁\",\"healthScore\":숫자}" }
          ]
        }]
      })
    });
    const data = await response.json();
    const text = (data.content || []).map(i => i.text || "").join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: "분석 오류: " + err.message });
  }
}
