import type { Variants } from "framer-motion";

/** Shared easing curve — snappy feel */
const ease = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT = { once: true, margin: "-60px" };

/* ── Entrance variants ────────────────────────────────── */

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
};

export const slideInStart: Variants = {
  hidden:  { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
};

export const slideInEnd: Variants = {
  hidden:  { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
};

/* ── Stagger container ────────────────────────────────── */

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

/* ── Hero specific ────────────────────────────────────── */

export const heroText: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export const heroImage: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease, delay: 0.2 },
  },
};

/* ── Card hover (for motion.div animate prop) ─────────── */

export const cardHoverProps = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: "easeOut" } },
  whileTap:   { scale: 0.985 },
};

/* ── Accordion ────────────────────────────────────────── */

export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease } },
  expanded:  {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease },
  },
};
