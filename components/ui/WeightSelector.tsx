"use client";

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

  function set(newKgWhole: number, newGrams: number) {
    const kgPart = Math.max(0, Math.floor(newKgWhole) || 0);
    const gPart = Math.max(0, Math.min(999, Math.floor(newGrams) || 0));
    const total = Math.max(min, Math.round((kgPart + gPart / 1000) * 1000) / 1000);
    onChange(total);
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={kgWhole}
        onChange={(e) => set(Number(e.target.value), grams)}
        aria-label="Quilos"
        className="w-14 rounded-lg border border-neutral-300 px-2 py-1 text-center text-sm focus:border-brand-primary focus:outline-none"
      />
      <span className="text-xs text-neutral-500">kg</span>
      <input
        type="number"
        min={0}
        max={999}
        step={50}
        value={grams}
        onChange={(e) => set(kgWhole, Number(e.target.value))}
        aria-label="Gramas"
        className="w-16 rounded-lg border border-neutral-300 px-2 py-1 text-center text-sm focus:border-brand-primary focus:outline-none"
      />
      <span className="text-xs text-neutral-500">g</span>
    </div>
  );
}
