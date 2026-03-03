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
      i
