'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SpinnerWheelProps {
  names: string[];
  onSpinComplete: (name: string, index: number) => void;
  isSpinning: boolean;
  onSpinStart: () => void;
}

// Muted, professional color palette — greens, teals, sage, gold
const SEGMENT_COLORS = [
  '#3d6b59', '#8fbc94', '#c5d9a4', '#e8c86a',
  '#5a9e7a', '#b5d4a0', '#dce4a0', '#d4a843',
  '#4a8a6e', '#a2cc8f', '#f0db8a', '#7ab88a',
  '#6aab7f', '#cce09e', '#e5cf6d', '#468465',
  '#94c49c', '#d8dfa0', '#ccb84e', '#5b9a75',
];

export default function SpinnerWheel({ names, onSpinComplete, isSpinning, onSpinStart }: SpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationRef = useRef(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSpunOnce, setHasSpunOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(460);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const size = Math.min(containerWidth - 16, 520);
        setCanvasSize(Math.max(300, size));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = canvasSize;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const radius = displaySize / 2 - 8;
    const sliceAngle = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, displaySize, displaySize);

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Draw segments
    for (let i = 0; i < names.length; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();

      // Separator
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(startAngle) * radius,
        centerY + Math.sin(startAngle) * radius
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);

      const fontSize = names.length <= 6 ? 18 : names.length <= 10 ? 15 : names.length <= 16 ? 12 : 10;
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const textRadius = radius - (names.length <= 6 ? 40 : names.length <= 12 ? 30 : 22);
      const displayName = names[i].length > 12 ? names[i].substring(0, 10) + '…' : names[i];
      ctx.fillText(displayName, textRadius, 0);
      ctx.restore();
    }

    // Center button
    const centerRadius = names.length <= 6 ? 42 : names.length <= 12 ? 36 : 28;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius + 2, 0, 2 * Math.PI);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(
      centerX - centerRadius * 0.15, centerY - centerRadius * 0.15, 0,
      centerX, centerY, centerRadius
    );
    grad.addColorStop(0, '#475569');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const spinFontSize = centerRadius * 0.45;
    ctx.font = `700 ${spinFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText('SPIN', centerX, centerY + 1);

    // Pointer
    const pointerW = 18;
    const pointerH = 22;
    ctx.beginPath();
    ctx.moveTo(centerX, 1);
    ctx.lineTo(centerX - pointerW / 2, pointerH + 1);
    ctx.lineTo(centerX + pointerW / 2, pointerH + 1);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
  }, [names, canvasSize]);

  useEffect(() => {
    drawWheel(currentRotation);
  }, [currentRotation, drawWheel]);

  const spin = useCallback(() => {
    if (names.length === 0 || isSpinning) return;

    onSpinStart();
    setShowResult(false);
    setSelectedName(null);
    setHasSpunOnce(true);

    const extraSpins = 5 + Math.random() * 3;
    const targetAngle = extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const startRotation = rotationRef.current;
    const totalRotation = targetAngle;
    const duration = 4000 + Math.random() * 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newRotation = startRotation + totalRotation * eased;

      rotationRef.current = newRotation;
      setCurrentRotation(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const sliceAngle = (2 * Math.PI) / names.length;
        const normalizedRotation = ((newRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (3 * Math.PI / 2 - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        const selectedIndex = Math.floor(pointerAngle / sliceAngle) % names.length;

        setSelectedName(names[selectedIndex]);
        setShowResult(true);

        setTimeout(() => {
          onSpinComplete(names[selectedIndex], selectedIndex);
        }, 1800);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [names, isSpinning, onSpinStart, onSpinComplete]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (names.length === 0) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center p-8 w-full">
        <div className="w-64 h-64 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center px-6">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium text-sm">All students called</p>
            <p className="text-gray-400 text-xs mt-1">Reset the cycle to spin again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <div className="relative">
        {!hasSpunOnce && !isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-white/60 text-2xl sm:text-3xl font-semibold tracking-wide rotate-[-12deg] select-none"
               style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Click to Spin
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onClick={!isSpinning ? spin : undefined}
        />
      </div>

      {/* Result — clean, minimal card */}
      {showResult && selectedName && (
        <div className="mt-6 animate-slide-up">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-8 py-5 text-center">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Selected</p>
            <p className="text-2xl font-bold text-gray-900">{selectedName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
