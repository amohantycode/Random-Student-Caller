'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SpinnerWheelProps {
  names: string[];
  onSpinComplete: (name: string, index: number) => void;
  isSpinning: boolean;
  onSpinStart: () => void;
}

// Cheerful, classroom-friendly colors with enough contrast for white labels.
const SEGMENT_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#be185d',
  '#ea580c',
  '#b45309',
  '#15803d',
  '#0f766e',
  '#0369a1',
];

const TAU = Math.PI * 2;

function compactName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || name;

  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function fitLabel(
  ctx: CanvasRenderingContext2D,
  name: string,
  maxWidth: number,
  preferCompact: boolean,
) {
  const fullName = name.trim();
  const firstChoice = preferCompact ? compactName(fullName) : fullName;
  const choices = [firstChoice, compactName(fullName)];

  for (const choice of choices) {
    if (ctx.measureText(choice).width <= maxWidth) return choice;
  }

  const fallback = choices[choices.length - 1];
  let low = 1;
  let high = fallback.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = `${fallback.slice(0, middle)}\u2026`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return `${fallback.slice(0, Math.max(1, low))}\u2026`;
}

export default function SpinnerWheel({
  names,
  onSpinComplete,
  isSpinning,
  onSpinStart,
}: SpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canvasSize, setCanvasSize] = useState(320);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const availableWidth = Math.max(180, container.clientWidth - 32);
      setCanvasSize(Math.min(availableWidth, 520));
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = canvasSize;
    canvas.width = Math.round(displaySize * dpr);
    canvas.height = Math.round(displaySize * dpr);
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const center = displaySize / 2;
    const radius = center - 14;
    const sliceAngle = TAU / names.length;
    const centerRadius = Math.max(40, Math.min(58, displaySize * 0.11));

    ctx.clearRect(0, 0, displaySize, displaySize);

    // A layered rim keeps the wheel distinct from the page without looking heavy.
    ctx.beginPath();
    ctx.arc(center, center, radius + 9, 0, TAU);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#dbe4f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let index = 0; index < names.length; index += 1) {
      const startAngle = rotation + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + Math.cos(startAngle) * radius,
        center + Math.sin(startAngle) * radius,
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = names.length > 24 ? 1 : 1.5;
      ctx.stroke();
    }

    // A subtle highlight gives the flat colors some depth while staying crisp.
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, TAU);
    ctx.clip();
    const sheen = ctx.createRadialGradient(center, center, centerRadius, center, center, radius);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    sheen.addColorStop(0.68, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(1, 'rgba(15, 23, 42, 0.12)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, displaySize, displaySize);
    ctx.restore();

    // Keep labels upright on both halves of the wheel and abbreviate gracefully.
    const arcBasedFontSize = radius * sliceAngle * 0.22;
    const fontSize = Math.max(9, Math.min(names.length <= 8 ? 16 : 14, arcBasedFontSize));
    const textRadius = radius - Math.max(12, displaySize * 0.03);
    const maxTextWidth = Math.max(34, textRadius - centerRadius - 14);

    ctx.font = `700 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.32)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;

    names.forEach((name, index) => {
      const middleAngle = rotation + index * sliceAngle + sliceAngle / 2;
      const normalizedAngle = ((middleAngle % TAU) + TAU) % TAU;
      const isOnLeft = normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2;
      const label = fitLabel(ctx, name, maxTextWidth, names.length > 10);

      ctx.save();
      ctx.translate(
        center + Math.cos(middleAngle) * textRadius,
        center + Math.sin(middleAngle) * textRadius,
      );
      ctx.rotate(isOnLeft ? middleAngle + Math.PI : middleAngle);
      ctx.textAlign = isOnLeft ? 'left' : 'right';
      ctx.fillText(label, 0, 0, maxTextWidth);
      ctx.restore();
    });

    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, TAU);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, centerRadius, 0, TAU);
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(center, center, centerRadius, 0, TAU);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [canvasSize, names]);

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const spin = useCallback(() => {
    if (names.length === 0 || isSpinning || spinningRef.current) return;

    spinningRef.current = true;
    onSpinStart();
    setShowResult(false);
    setSelectedName(null);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const extraSpins = prefersReducedMotion ? 1 : 5 + Math.random() * 2;
    const totalRotation = extraSpins * TAU + Math.random() * TAU;
    const startRotation = rotationRef.current;
    const duration = prefersReducedMotion ? 700 : 4200 + Math.random() * 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const newRotation = startRotation + totalRotation * eased;

      rotationRef.current = newRotation;
      drawWheel(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      animationRef.current = null;
      const sliceAngle = TAU / names.length;
      const normalizedRotation = ((newRotation % TAU) + TAU) % TAU;
      const pointerAngle = ((3 * Math.PI) / 2 - normalizedRotation + TAU) % TAU;
      const selectedIndex = Math.floor(pointerAngle / sliceAngle) % names.length;
      const winner = names[selectedIndex];

      setSelectedName(winner);
      setShowResult(true);

      completionTimerRef.current = setTimeout(() => {
        spinningRef.current = false;
        onSpinComplete(winner, selectedIndex);
      }, prefersReducedMotion ? 500 : 1300);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [drawWheel, isSpinning, names, onSpinComplete, onSpinStart]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  if (names.length === 0) {
    return (
      <section
        ref={containerRef}
        className="flex w-full flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-5 py-10 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.28)]"
      >
        <div className="flex h-56 w-56 items-center justify-center rounded-full border-2 border-dashed border-sky-200 bg-sky-50/70">
          <div className="px-7 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
              ✓
            </div>
            <p className="text-sm font-semibold text-slate-800">Everyone had a turn</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Resetting the class for a fresh round.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="flex w-full flex-col items-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-4 py-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.28)] sm:px-6 sm:py-6"
      aria-labelledby="student-picker-title"
    >
      <div className="mb-5 flex w-full max-w-xl items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Random picker</p>
          <h2 id="student-picker-title" className="mt-1 text-lg font-bold text-slate-900">
            {isSpinning ? 'Choosing a student…' : 'Who’s up next?'}
          </h2>
        </div>
        <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {names.length} {names.length === 1 ? 'student' : 'students'} left
        </div>
      </div>

      <div className="relative rounded-full bg-slate-100 p-2 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.75)]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1 drop-shadow-[0_3px_2px_rgba(15,23,42,0.28)]"
        >
          <div className="h-0 w-0 border-x-[13px] border-t-[24px] border-x-transparent border-t-slate-900" />
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={isSpinning}
          aria-label={isSpinning ? 'Choosing a student' : `Spin to pick from ${names.length} students`}
          className="group relative block rounded-full outline-none transition-transform duration-200 enabled:hover:scale-[1.012] enabled:active:scale-[0.99] focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait motion-reduce:transition-none"
        >
          <canvas ref={canvasRef} className="block rounded-full" aria-hidden="true" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-slate-900">
            <svg
              viewBox="0 0 24 24"
              className={`mb-0.5 h-[24%] w-[24%] text-blue-600 ${isSpinning ? 'animate-spin' : 'transition-transform duration-300 group-hover:rotate-45'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 7v5h-5" />
              <path d="M19 12a7 7 0 1 1-2.05-4.95L20 10" />
            </svg>
            <span className="text-[clamp(0.62rem,2.4vw,0.82rem)] font-black tracking-[0.12em]">
              {isSpinning ? 'PICKING' : 'SPIN'}
            </span>
          </span>
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Tap the wheel or press Enter to choose fairly.
      </p>

      <div className="mt-5 min-h-[92px] w-full max-w-xl" aria-live="polite" aria-atomic="true">
        {showResult && selectedName ? (
          <div className="animate-slide-up rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 px-5 py-4 text-center motion-reduce:animate-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Up next</p>
            <p className="mt-1 break-words text-2xl font-black leading-tight text-slate-950 [overflow-wrap:anywhere] sm:text-3xl">
              {selectedName}
            </p>
          </div>
        ) : (
          <div className="flex min-h-[92px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center text-sm text-slate-500">
            {isSpinning ? 'Watching the wheel…' : 'The selected student’s full name will appear here.'}
          </div>
        )}
      </div>
    </section>
  );
}
