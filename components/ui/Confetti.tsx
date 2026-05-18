'use client';
import { useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;
    const end = Date.now() + 2200;
    const colors = ['#7b68ee', '#a89ff5', '#60a5fa', '#34d399', '#fb923c'];
    canvasConfetti({ particleCount: 90, spread: 100, origin: { y: 0.55 }, colors });
    const frame = () => {
      if (Date.now() > end) return;
      canvasConfetti({ particleCount: 2, angle: 60,  spread: 50, origin: { x: 0 }, colors });
      canvasConfetti({ particleCount: 2, angle: 120, spread: 50, origin: { x: 1 }, colors });
      requestAnimationFrame(frame);
    };
    frame();
  }, [trigger]);
  return null;
}
