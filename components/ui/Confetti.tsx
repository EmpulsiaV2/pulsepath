'use client';
import { useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return;
    const colors = ['#D4612A','#C87C10','#4D7C2A','#2460A8','#E8784A'];
    canvasConfetti({ particleCount:90, spread:110, origin:{ y:0.55 }, colors });
    const end = Date.now() + 2000;
    const frame = () => {
      if (Date.now() > end) return;
      canvasConfetti({ particleCount:2, angle:60,  spread:52, origin:{ x:0 }, colors });
      canvasConfetti({ particleCount:2, angle:120, spread:52, origin:{ x:1 }, colors });
      requestAnimationFrame(frame);
    };
    frame();
  }, [trigger]);
  return null;
}
