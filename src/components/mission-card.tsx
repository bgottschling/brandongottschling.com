// src/components/mission-card.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import MissionCanvas from "./MissionCanvas";

const quote = "Build useful things, tell honest stories, and show up for people.";

const body =
  "Share what I\u2019m learning so others can move with more courage, clarity, and hope. I want this work to be more than output. I\u2019m learning to be the kind of person who shows up, steady at home and useful in the world. That looks like working hard, seeking peace, and making things that genuinely help.";

export default function MissionCard() {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.18 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  const Wrapper = reduced ? "div" : motion.div;
  const Item = reduced ? "div" : motion.div;

  return (
    <section
      className="not-prose relative my-8 overflow-hidden rounded-md border border-black/5 bg-white shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)]
                 dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Full-bleed canvas background */}
      <MissionCanvas className="absolute inset-0 h-full w-full" />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/40 dark:from-zinc-900/95 dark:via-zinc-900/80 dark:to-zinc-900/40" />

      {/* Content overlay with animated reveal */}
      <Wrapper
        className="relative z-10 px-6 py-8 md:px-10 md:py-12"
        {...(!reduced && {
          variants: container,
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: "-60px" },
        })}
      >
        {/* Label */}
        <Item
          className="mb-4"
          {...(!reduced && { variants: item })}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700/70 dark:text-amber-400/70">
            Mission
          </span>
        </Item>

        {/* Pull quote */}
        <Item
          {...(!reduced && { variants: item })}
        >
          <blockquote className="m-0 border-none p-0">
            <p className="m-0 text-xl font-bold leading-snug tracking-[-0.01em] text-neutral-900 sm:text-2xl md:text-[1.75rem] md:leading-[1.3] dark:text-white">
              {quote}
            </p>
          </blockquote>
        </Item>

        {/* Decorative accent line */}
        <Item
          className="my-5"
          {...(!reduced && { variants: item })}
        >
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-200 dark:from-amber-500 dark:to-amber-700" />
        </Item>

        {/* Supporting body text */}
        <Item
          {...(!reduced && { variants: item })}
        >
          <p className="m-0 max-w-[58ch] text-[15px] leading-7 text-neutral-700 dark:text-neutral-300">
            {body}
          </p>
        </Item>
      </Wrapper>
    </section>
  );
}
