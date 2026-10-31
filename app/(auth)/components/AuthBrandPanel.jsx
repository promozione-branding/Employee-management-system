
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

const awningColors = [
  "#F58D3F",
  "#FFF5EB",
  "#2B5086",
  "#FFF5EB",
];

const bars = [
  {
    label: "Inquiry",
    x: 0,
    y: 198,
    height: 90,
    color: "#F7A25C",
    dark: true,
  },
  {
    label: "Follow-up",
    x: 112,
    y: 164,
    height: 124,
    color: "#F58D3F",
    dark: true,
  },
  {
    label: "Quotation",
    x: 224,
    y: 128,
    height: 160,
    color: "#F27B1E",
    dark: true,
  },
  {
    label: "Deal",
    x: 336,
    y: 90,
    height: 198,
    color: "#2F5A97",
    dark: false,
  },
  {
    label: "Income",
    x: 448,
    y: 50,
    height: 238,
    color: "#3B69AD",
    dark: false,
  },
];

const points = [
  { x: 45, y: 178 },
  { x: 157, y: 144 },
  { x: 269, y: 108 },
  { x: 381, y: 70 },
  { x: 493, y: 30 },
];

export default function AuthBrandPanel() {
  const [logoError, setLogoError] = useState(false);

  const sectionRef = useRef(null);
  const awningRef = useRef(null);
  const logoRef = useRef(null);
  const headlineRef = useRef(null);
  const descriptionRef = useRef(null);

  const barsRef = useRef([]);
  const labelsRef = useRef([]);
  const lineRef = useRef(null);
  const markersRef = useRef([]);
  const arrowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ==================================
      // DESKTOP ANIMATION
      // ==================================

      mm.add("(min-width: 981px)", () => {
        const tl = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        // Initial states
        gsap.set(awningRef.current, {
          scaleY: 0,
          transformOrigin: "top center",
        });

        gsap.set(
          [
            logoRef.current,
            headlineRef.current,
            descriptionRef.current,
          ],
          {
            opacity: 0,
            y: 25,
          }
        );

        // Bars start at bottom baseline
        gsap.set(barsRef.current, {
          attr: {
            y: 288,
            height: 0,
          },
        });

        gsap.set(labelsRef.current, {
          opacity: 0,
          y: 10,
        });

        // Line initial state
        gsap.set(lineRef.current, {
          strokeDasharray: 1,
          strokeDashoffset: 1,
        });

        // Markers initial state
        gsap.set(markersRef.current, {
          opacity: 0,
          scale: 0,
          transformOrigin: "center center",
        });

        gsap.set(arrowRef.current, {
          opacity: 0,
          scale: 0.5,
          transformOrigin: "center center",
        });

        // 1. Awning unfolds
        tl.to(
          awningRef.current,
          {
            scaleY: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          0.1
        );

        // 2. Logo entrance
        tl.to(
          logoRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          0.35
        );

        // 3. Heading entrance
        tl.to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          0.65
        );

        // 4. Description entrance
        tl.to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          0.9
        );

        // ==================================
        // 5. BARS GROW FROM BOTTOM TO TOP
        // ==================================

        barsRef.current.forEach((bar, index) => {
          tl.to(
            bar,
            {
              attr: {
                y: bars[index].y,
                height: bars[index].height,
              },
              duration: 0.85,
              ease: "power3.out",
            },
            1.1 + index * 0.12
          );
        });

        // 6. Labels appear
        labelsRef.current.forEach((label, index) => {
          tl.to(
            label,
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
            },
            1.75 + index * 0.1
          );
        });

        // ==================================
        // 7. CONNECTING LINE DRAW ANIMATION
        // ==================================

        tl.to(
          lineRef.current,
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power1.inOut",
          },
          1.95
        );

        // ==================================
        // 8. POINTS APPEAR ALONG THE LINE
        // ==================================

        const markerTimes = [
          1.95,
          2.16,
          2.38,
          2.60,
          2.82,
        ];

        markersRef.current.forEach((marker, index) => {
          tl.to(
            marker,
            {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              ease: "back.out(2)",
            },
            markerTimes[index]
          );
        });

        // 9. Final arrow
        tl.to(
          arrowRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2)",
          },
          3.08
        );

        return () => {
          tl.kill();
        };
      });

      // ==================================
      // MOBILE ANIMATION
      // ==================================

      mm.add("(max-width: 980px)", () => {
        gsap.set(
          [
            awningRef.current,
            logoRef.current,
            headlineRef.current,
          ],
          {
            opacity: 0,
            y: 20,
          }
        );

        const mobileTl = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        mobileTl
          .to(awningRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
          })
          .to(
            logoRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
            },
            "-=0.3"
          )
          .to(
            headlineRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
            },
            "-=0.2"
          );

        return () => mobileTl.kill();
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative isolate flex h-full min-h-[150px]
        min-w-0 flex-col overflow-hidden
        bg-[#0A2E66] px-6 py-5 text-white
        sm:px-8
        lg:min-h-0 lg:px-12 lg:pt-[105px] lg:pb-0
      "
    >
      {/* ================================== */}
      {/* BACKGROUND PATTERN */}
      {/* ================================== */}

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="brand-floral-pattern"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              opacity=".065"
            >
              <path d="M50 22 C60 34 60 42 50 50 C40 42 40 34 50 22Z" />
              <path d="M50 78 C60 66 60 58 50 50 C40 58 40 66 50 78Z" />
              <path d="M22 50 C34 40 42 40 50 50 C42 60 34 60 22 50Z" />
              <path d="M78 50 C66 40 58 40 50 50 C58 60 66 60 78 50Z" />
            </g>

            <circle
              cx="50"
              cy="50"
              r="2.5"
              fill="#F27B1E"
              opacity=".45"
            />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#brand-floral-pattern)"
        />
      </svg>

      {/* ================================== */}
      {/* TOP AWNING */}
      {/* ================================== */}

      <div
        ref={awningRef}
        className="
          absolute inset-x-0 top-0 z-30
          h-[94px] origin-top overflow-hidden
          border-t-[4px] border-[#061D44]
          drop-shadow-[0_9px_12px_rgba(0,0,0,0.22)]
        "
      >
        <div className="flex h-full w-full overflow-hidden">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="h-[90px] w-11 shrink-0 rounded-b-[22px]"
              style={{
                backgroundColor:
                  awningColors[index % awningColors.length],
              }}
            />
          ))}
        </div>
      </div>

      {/* ================================== */}
      {/* MAIN CONTENT */}
      {/* ================================== */}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">

        {/* LOGO */}

        <div ref={logoRef}>
          {!logoError ? (
            <Image
              src="/iblogo.png"
              alt="Inquiry Bazaar"
              width={480}
              height={230}
              priority
              onError={() => setLogoError(true)}
              className="
                h-auto w-[160px] object-contain
                sm:w-[180px]
                lg:w-[220px]
              "
            />
          ) : (
            <div className="flex items-center gap-2 text-2xl font-black">
              <span className="text-3xl">
                I<span className="text-[#F27B1E]">B</span>
              </span>

              <span>
                Inquiry{" "}
                <span className="text-[#F27B1E]">Bazaar</span>
              </span>
            </div>
          )}
        </div>

        {/* HEADLINE */}

        <div className="my-auto max-w-[540px] py-8 lg:py-10">
          <div ref={headlineRef}>
            <h1
              className="
                mb-5 font-serif font-black tracking-tight
                text-[30px] leading-[1.12]
                sm:text-4xl
                lg:text-[clamp(42px,4.1vw,66px)]
                lg:leading-[1.12]
              "
            >
              <span className="block">
                Inquiry se
              </span>

              <span className="block text-[#F27B1E]">
                INCOME tak!
              </span>
            </h1>
          </div>

          <p
            ref={descriptionRef}
            className="
              max-w-[390px]
              text-sm leading-6
              text-[#FFF5EB]/90
              sm:text-base
              lg:text-[19px] lg:leading-8
            "
          >
            Your leads, follow-ups, quotations
            <br className="hidden lg:block" />
            and deals, all in one place.
          </p>
        </div>

        {/* ================================== */}
        {/* GROWTH CHART */}
        {/* ================================== */}

        <div className="mt-auto hidden w-full max-w-[540px] lg:block">
          <svg
            viewBox="0 0 540 290"
            className="block h-auto w-full overflow-visible"
            fill="none"
            role="img"
            aria-label="Business growth from inquiry to income"
          >

            {/* BARS - BOTTOM TO TOP */}

            {bars.map((bar, index) => (
              <g key={bar.label}>
                <rect
                  ref={(el) => {
                    barsRef.current[index] = el;
                  }}
                  x={bar.x}
                  y="288"
                  width="90"
                  height="0"
                  rx="10"
                  fill={bar.color}
                />

                {/* LABELS */}

                <text
                  ref={(el) => {
                    labelsRef.current[index] = el;
                  }}
                  x={bar.x + 45}
                  y={bar.y + 28}
                  textAnchor="middle"
                  fill={bar.dark ? "#0A2E66" : "#FFFFFF"}
                  fontSize="15"
                  fontWeight="900"
                  fontFamily="Arial, sans-serif"
                >
                  {bar.label}
                </text>
              </g>
            ))}

            {/* CONNECTING GROWTH LINE */}

            <path
              ref={lineRef}
              d="
                M45 178
                L157 144
                L269 108
                L381 70
                L493 30
                L510 23.9
              "
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
            />

            {/* CONNECTED POINTS */}

            {points.map((point, index) => (
              <circle
                key={index}
                ref={(el) => {
                  markersRef.current[index] = el;
                }}
                cx={point.x}
                cy={point.y}
                r={index === 4 ? 5.5 : 5}
                fill={index === 4 ? "#F27B1E" : "#0A2E66"}
                stroke="white"
                strokeWidth="2.5"
              />
            ))}

            {/* FINAL ARROW */}

            <path
              ref={arrowRef}
              d="M502.9 33.9 L511.8 23.3 L498.1 20.7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>
        </div>
      </div>
    </section>
  );
}
