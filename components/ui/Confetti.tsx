'use client';

import { useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

interface Props {
  trigger: boolean;
}

export function Confetti({ trigger }: Props) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      canvasConfetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
      });
      canvasConfetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    canvasConfetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
    });

    frame();
  }, [trigger]);

  return null;
}
