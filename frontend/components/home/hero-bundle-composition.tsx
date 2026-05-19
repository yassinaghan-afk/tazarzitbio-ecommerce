"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface HeroBundleCompositionProps {
  className?: string;
}

/** Premium Moroccan artisanal still-life — SVG composition (replace with photo later) */
export function HeroBundleComposition({ className }: HeroBundleCompositionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,28rem)]",
        className,
      )}
      role="img"
      aria-label="تشكيلة تازارزيت بيو الفاخرة: أملو لوز، أملو فستق، زيت أركان، عسل ومكسرات على طاولة خشبية"
    >
      <div className="frame-premium relative overflow-hidden rounded-[1.75rem] shadow-warm-xl ring-1 ring-white/40 md:rounded-[2rem]">
        {/* Cinematic backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3d2814]/90 via-[#5c3d1e]/95 to-[#2a1810]" />

        {/* Warm key light */}
        <div
          aria-hidden
          className="absolute -top-[20%] start-[15%] h-[70%] w-[75%] rounded-full bg-[radial-gradient(ellipse,hsl(45_90%_62%/0.45)_0%,transparent_68%)] blur-md"
        />
        <div
          aria-hidden
          className="absolute top-[10%] end-[5%] h-[40%] w-[45%] rounded-full bg-[radial-gradient(ellipse,hsl(35_70%_48%/0.2)_0%,transparent_70%)] blur-lg"
        />

        {/* Scene */}
        <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] md:aspect-[4/5]">
          <svg
            viewBox="0 0 400 500"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="wood" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="45%" stopColor="#4a2f18" />
                <stop offset="100%" stopColor="#2d1a0e" />
              </linearGradient>
              <linearGradient id="woodGrain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7a4e28" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3d2512" stopOpacity="0" />
                <stop offset="100%" stopColor="#6b4423" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="jarBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5e6c8" />
                <stop offset="40%" stopColor="#e8c99a" />
                <stop offset="100%" stopColor="#c49a5c" />
              </linearGradient>
              <linearGradient id="jarPistachio" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8f0d8" />
                <stop offset="35%" stopColor="#b8c98a" />
                <stop offset="100%" stopColor="#7a8f4e" />
              </linearGradient>
              <linearGradient id="oilGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3d5c28" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#1a2e12" />
                <stop offset="100%" stopColor="#0f1a0a" />
              </linearGradient>
              <linearGradient id="oilLiquid" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#c4a035" />
                <stop offset="100%" stopColor="#e8d078" />
              </linearGradient>
              <linearGradient id="honey" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f0c040" />
                <stop offset="100%" stopColor="#a86b18" />
              </linearGradient>
              <linearGradient id="goldLid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8c96a" />
                <stop offset="50%" stopColor="#c48a24" />
                <stop offset="100%" stopColor="#8a5a18" />
              </linearGradient>
              <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a3520" />
                <stop offset="100%" stopColor="#2a1810" />
              </linearGradient>
              <linearGradient id="boxRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a5a18" />
                <stop offset="50%" stopColor="#e8c96a" />
                <stop offset="100%" stopColor="#8a5a18" />
              </linearGradient>
              <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.45" />
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="vignette" cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
              </radialGradient>
            </defs>

            {/* Table surface */}
            <ellipse cx="200" cy="420" rx="185" ry="28" fill="#000" opacity="0.35" />
            <path d="M20 380 Q200 340 380 380 L400 500 L0 500 Z" fill="url(#wood)" />
            <path d="M0 395 L400 395" stroke="url(#woodGrain)" strokeWidth="80" opacity="0.5" />

            {/* Linen cloth */}
            <path
              d="M60 360 Q200 330 340 355 L360 400 Q200 385 50 395 Z"
              fill="#e8dcc8"
              opacity="0.15"
            />

            {/* Gift bundle box — back center */}
            <g filter="url(#softShadow)" transform="translate(118, 195)">
              <path d="M0 80 L164 80 L164 0 L0 0 Z" fill="url(#boxFront)" rx="4" />
              <path d="M0 0 L164 0 L150 -25 L14 -25 Z" fill="#3d2818" />
              <path d="M72 0 L92 0 L92 80 L72 80 Z" fill="url(#boxRibbon)" opacity="0.9" />
              <path d="M0 38 L164 38 L164 48 L0 48 Z" fill="url(#boxRibbon)" opacity="0.85" />
              <text
                x="82"
                y="52"
                textAnchor="middle"
                fill="#e8c96a"
                fontSize="11"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                opacity="0.95"
              >
                TAZARZIT BIO
              </text>
              <text
                x="82"
                y="68"
                textAnchor="middle"
                fill="#c4a880"
                fontSize="8"
                fontFamily="system-ui, sans-serif"
              >
                مجموعة سوس الفاخرة
              </text>
            </g>

            {/* Argan oil bottle — back right */}
            <g filter="url(#softShadow)" transform="translate(268, 120)">
              <ellipse cx="28" cy="118" rx="22" ry="6" fill="#000" opacity="0.3" />
              <path
                d="M12 35 L44 35 L40 115 Q28 122 16 115 Z"
                fill="url(#oilGlass)"
              />
              <rect x="10" y="28" width="36" height="12" rx="3" fill="url(#goldLid)" />
              <path d="M14 42 L40 42 L38 95 Q28 100 18 95 Z" fill="url(#oilLiquid)" opacity="0.85" />
              <ellipse cx="28" cy="42" rx="12" ry="3" fill="#fff" opacity="0.2" />
              <text x="28" y="72" textAnchor="middle" fill="#e8d078" fontSize="7" fontWeight="600">
                أركان
              </text>
            </g>

            {/* Almond amlou jar — front left */}
            <g filter="url(#softShadow)" transform="translate(42, 248)">
              <ellipse cx="48" cy="108" rx="42" ry="10" fill="#000" opacity="0.35" />
              <path
                d="M18 32 Q48 22 78 32 L82 95 Q48 108 14 95 Z"
                fill="url(#jarBody)"
              />
              <ellipse cx="48" cy="32" rx="32" ry="8" fill="url(#goldLid)" />
              <ellipse cx="48" cy="34" rx="28" ry="5" fill="#fff" opacity="0.25" />
              <path d="M22 50 Q48 58 74 50" stroke="#c49a5c" strokeWidth="1" fill="none" opacity="0.5" />
              <rect x="22" y="62" width="52" height="28" rx="2" fill="#f8f0e4" opacity="0.9" />
              <text x="48" y="78" textAnchor="middle" fill="#4a3520" fontSize="9" fontWeight="700">
                أملو لوز
              </text>
              <text x="48" y="90" textAnchor="middle" fill="#8a6a40" fontSize="7">
                250 غ
              </text>
            </g>

            {/* Pistachio amlou jar — front right (hero focus) */}
            <g filter="url(#glow)" transform="translate(198, 228)">
              <ellipse cx="52" cy="118" rx="46" ry="11" fill="#000" opacity="0.4" />
              <path
                d="M14 28 Q52 14 90 28 L96 102 Q52 118 8 102 Z"
                fill="url(#jarPistachio)"
              />
              <ellipse cx="52" cy="28" rx="36" ry="10" fill="url(#goldLid)" />
              <ellipse cx="52" cy="30" rx="32" ry="6" fill="#fff" opacity="0.3" />
              <rect x="18" y="58" width="68" height="32" rx="2" fill="#f5f8ee" opacity="0.92" />
              <text x="52" y="76" textAnchor="middle" fill="#2d3a18" fontSize="10" fontWeight="700">
                أملو فستق
              </text>
              <text x="52" y="90" textAnchor="middle" fill="#5a6b38" fontSize="7">
                250 غ · فاخر
              </text>
            </g>

            {/* Honey jar */}
            <g filter="url(#softShadow)" transform="translate(305, 268)">
              <ellipse cx="22" cy="52" rx="20" ry="5" fill="#000" opacity="0.3" />
              <path d="M8 18 L36 18 L34 48 Q22 54 10 48 Z" fill="url(#honey)" />
              <ellipse cx="22" cy="18" rx="16" ry="5" fill="url(#goldLid)" />
              <text x="22" y="38" textAnchor="middle" fill="#4a3010" fontSize="6" fontWeight="600">
                عسل
              </text>
            </g>

            {/* Scattered nuts & almonds */}
            <ellipse cx="95" cy="368" rx="8" ry="4" fill="#c49a5c" opacity="0.9" transform="rotate(-15 95 368)" />
            <ellipse cx="120" cy="375" rx="6" ry="3" fill="#8b7355" opacity="0.85" transform="rotate(20 120 375)" />
            <ellipse cx="280" cy="372" rx="7" ry="3.5" fill="#7a8f4e" opacity="0.9" transform="rotate(-8 280 372)" />
            <ellipse cx="310" cy="378" rx="5" ry="2.5" fill="#5a6b38" opacity="0.8" />
            <circle cx="165" cy="382" r="4" fill="#e8c96a" opacity="0.7" />
            <circle cx="235" cy="385" r="3.5" fill="#d4a030" opacity="0.65" />

            {/* Honey drip accent */}
            <path
              d="M318 255 Q322 275 318 290"
              stroke="#f0c040"
              strokeWidth="3"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />

            {/* Olive branch hint */}
            <path
              d="M25 200 Q40 180 55 195 Q45 210 30 205"
              stroke="#4a5c32"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
            <circle cx="38" cy="188" r="4" fill="#5a7038" opacity="0.35" />

            {/* Vignette */}
            <rect width="400" height="500" fill="url(#vignette)" />
          </svg>

          {/* Glass shine overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,transparent_50%,hsl(20_30%_8%/0.4)_100%)]"
          />
        </div>
      </div>

      {/* Ambient glow behind frame */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse,hsl(40_75%_50%/0.25)_0%,transparent_70%)] blur-2xl"
      />
    </motion.div>
  );
}
