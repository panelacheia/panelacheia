"use client";

import { useEffect, useRef, useState } from "react";

export function WeightSelector({
  value,
  onChange,
  min = 0.1,
}: {
  value: number;
  onChange: (kg: number) => void;
  min?: number;
}) {
  const kgWhole = Math.floor(value);
  const grams = Math.round((value - kgWhole) * 1000);

  const [kgText, setKgText] = useState(String(kgWhole));
  const [gText, setGText] = useState(String(grams));
  const kgFocado = useRef(false);
  const gFocado = useRef(false);

  // Mantém os campos sincronizados com o valor vindo de fora (ex: pai resetando
  // o peso), mas só quando o campo não está sendo digitado no momento — senão o
  // texto do usuário seria apagado no meio da digitação.
  useEffect(() => {
    if (!kgFocado.current) setKgText(String(kgWhole));
    if (!gFocado.current) setGText(String(grams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function commit(newKgWhole: number, newGrams: number) {
    const kgPart = Math.max(0, Math.floor(newKgWhole) || 0);
    const gPart = Math.max(0, Math.min(999, Math.floor(newGrams) || 0));
    const total = Math.max(min, Math.round((kgPart + gPart / 1000) * 1000) / 1000);
    onChange(total);
  }

  const inputClass =
    "w-14 rounded-lg border border-neutral-300 px-2 py-2 text-center text-base focus:border-brand-primary focus:outline-none";

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={kgText}
        onFocus={(e) => {
          kgFocado.current = true;
          e.target.select();
        }}
        onBlur={() => {
          kgFocado.current = false;
          const n = parseInt(kgText, 10);
          setKgText(String(Number.isNaN(n) ? 0 : n));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setKgText(raw);
          commit(raw === "" ? 0 : parseInt(raw, 10), grams);
        }}
        aria-label="Quilos"
        className={inputClass}
      />
      <span className="text-xs text-neutral-500">kg</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={gText}
        onFocus={(e) => {
          gFocado.current = true;
          e.target.select();
        }}
        onBlur={() => {
          gFocado.current = false;
          const n = parseInt(gText, 10);
          setGText(String(Math.min(999, Number.isNaN(n) ? 0 : n)));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          setGText(raw);
          commit(kgWhole, raw === "" ? 0 : parseInt(raw, 10));
        }}
        aria-label="Gramas"
        className={`${inputClass} w-16`}
      />
      <span className="text-xs text-neutral-500">g</span>
    </div>
  );
}
