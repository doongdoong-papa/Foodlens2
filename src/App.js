import { useState, useRef } from "react";

const GREEN = "#3D7A5A";
const ACCENT = "#F4A261";
const TEXT = "#1A1A1A";
const MUTED = "#7A7A7A";

function NutrientBar({ label, value, max, unit, color }) {
  const pct = Math.min(100, (parseFloat(value) / max) * 100);
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.85rem", color: MUTED }}>{label}</span>
        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: TEXT }}>{value}{unit}</span>
      </div>
      <div style={{ background: "#eee", borderRadius: "99px", height: "7px", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color || GREEN, borderRadius: "99px", transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

export default function App() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null); setError(null);
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64({ data: e.target.result.split(",")[1], mediaType: file.type });
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: imageBase64.data, mediaType: imageBase64.mediaType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "failed");
      setResult(data);
    } catch (err) {
      setError("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setImage(null); setImageBase64(null); setError(null); };
  const scoreColor = (s) => s >= 8 ? "#3D7A5A" : s >= 5 ? "#F4A261" : "#e07070";

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", fontFamily: "Georgia, serif", color: TEXT, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{ width: "100%", background: GREEN, padding: "18px 0 14px 0", textAlign: "center" }}>
        <div style={{ color: "#fff", fontSize: "1.55rem", fontWeight: "bold" }}>🥗 푸드 렌즈</div>
        <div style={{ color: "#b6e0c8", fontSize: "0.82rem", marginTop: "3px" }}>AI 음식 영양소 분석기</div>
      </header>
      <main style={{ width: "100%", maxWidth: "480px", padding: "28px 16px 40px 16px", display: "flex", flexDirection: "column", gap: "22px" }}>
        {!result && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px 22px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div onClick={() => fileRef.current.click()} style={{ width: "100%", border: "2.5px dashed #3D7A5A", borderRadius: "14px", background: "#E8F4EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "160px", cursor: "pointer", padding: "18px", gap: "10px" }}>
              {image
                ? <img src={image} alt="food" style={{ width: "100%", borderRadius: "12px", maxHeight: "240px", objectFit: "cover" }} />
                : <><div style={{ fontSize: "2.5rem" }}>📷</div><div style={{ color: GREEN, fontWeight: "bold" }}>음식 사진을 업로드하세요</div><div style={{ color: MUTED, fontSize: "0.8rem" }}>클릭하거나 카메라로 촬영하세요</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {image && <button onClick={analyze} disabled={loading} style={{ width: "100%", background: GREEN, color: "#fff", border: "none", borderRadius: "50px", padding: "14px 0", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>🔍 영양소 분석하기</button>}
            {!image && <div style={{ fontSize: "0.8rem", color: MUTED, textAlign: "center" }}>사진 한 장으로 칼로리, 영양소를 바로 확인하세요!</div>}
          </div>
        )}
        {loading && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "30px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", border: "4px solid #E8F4EE", borderTop: "4px solid #3D7A5A", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <div style={{ color: GREEN, fontWeight: "bold" }}>AI가 음식을 분석하고 있어요...</div>
          </div>
        )}
        {error && (
          <div style={{ background: "#fff0f0", border: "1.5px solid #e07070", borderRadius: "12px", padding: "14px 16px", color: "#b03030" }}>
            ⚠️ {error}<br />
            <button onClick={() => setError(null)} style={{ marginTop: "12px", background: "transparent", border: "2px solid #3D7A5A", color: GREEN, borderRadius: "50px", padding: "8px 20px", fontWeight: "bold", cursor: "pointer" }}>다시 시도</button>
          </div>
        )}
        {result && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {image && <img src={image} alt="food" style={{ width: "100%", borderRadius: "12px", maxHeight: "240px", objectFit: "cover" }} />}
            <div>
              <span style={{ display: "inline-block", background: ACCENT, color: "#fff", borderRadius: "50px", padding: "3px 14px", fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px" }}>{result.category}</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{result.foodName}</div>
              <div style={{ color: MUTED, fontSize: "0.82rem", marginTop: "2px" }}>{result.servingSize} 기준</div>
            </div>
            <div style={{ fontSize: "0.9rem", color: MUTED, lineHeight: "1.6" }}>{result.description}</div>
            <div>
              <div style={{ fontWeight: "bold", color: GREEN, borderBottom: "2px solid #E8F4EE", paddingBottom: "8px", marginBottom: "8px" }}>🔥 칼로리</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: ACCENT }}>{result.calories} <span style={{ fontSize: "1rem", color: MUTED }}>kcal</span></div>
            </div>
            <div>
              <div style={{ fontWeight: "bold", color: GREEN, borderBottom: "2px solid #E8F4EE", paddingBottom: "8px", marginBottom: "8px" }}>🧬 영양소 분석</div>
              <NutrientBar label="탄수화물" value={result.nutrients.carbs} max={100} unit="g" color="#F4A261" />
              <NutrientBar label="단백질" value={result.nutrients.protein} max={60} unit="g" color="#3D7A5A" />
              <NutrientBar label="지방" value={result.nutrients.fat} max={60} unit="g" color="#e07070" />
              <NutrientBar label="식이섬유" value={result.nutrients.fiber} max={30} unit="g" color="#7ec8a0" />
              <NutrientBar label="나트륨" value={result.nutrients.sodium} max={2000} unit="mg" color="#8888cc" />
            </div>
            <div>
              <div style={{ fontWeight: "bold", color: GREEN, borderBottom: "2px solid #E8F4EE", paddingBottom: "8px", marginBottom: "8px" }}>💚 건강 점수</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: scoreColor(result.healthScore) }}>{result.healthScore}<span style={{ fontSize: "1rem", color: MUTED }}>/10</span></div>
                <div style={{ color: MUTED, fontSize: "0.85rem" }}>{result.healthScore >= 8 ? "매우 건강한 음식! 🌟" : result.healthScore >= 5 ? "균형 잡힌 음식 👍" : "가끔 즐기세요 ⚠️"}</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: "bold", color: GREEN, borderBottom: "2px solid #E8F4EE", paddingBottom: "8px", marginBottom: "8px" }}>💡 건강 팁</div>
              <div style={{ background: "#FFF8F0", border: "1.5px solid #F4A261", borderRadius: "12px", padding: "13px 15px", fontSize: "0.88rem", color: "#7a4a1e", lineHeight: "1.65" }}>{result.healthTips}</div>
            </div>
            <button onClick={reset} style={{ background: "transparent", border: "2px solid #3D7A5A", color: GREEN, borderRadius: "50px", padding: "11px 0", width: "100%", fontWeight: "bold", cursor: "pointer" }}>📷 다른 음식 분석하기</button>
          </div>
        )}
      </main>
    </div>
  );
}
