'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#061408]">
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(166, 215, 168, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(166, 215, 168, 0.3) 1px, transparent 1px)`,
          backgroundSize: '3.5rem 3.5rem',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 25, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-1/4 w-[32rem] h-[32rem] bg-[#66BC6A]/15 rounded-full blur-[130px]"
      />

      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-1/4 w-[36rem] h-[36rem] bg-[#145E1A]/25 rounded-full blur-[150px]"
      />
    </div>
  );
}
