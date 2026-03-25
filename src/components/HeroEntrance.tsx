"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode[];
};

/**
 * Wraps hero children with staggered fade-in entrance animation.
 * Each child fades up with increasing delay.
 */
export default function HeroEntrance({ children }: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: i * 0.15,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
