import React from "react";

const stars = [
  { x: "8%", y: "22%", size: 16, delay: "0s", duration: "5.5s", color: "#fff3a3" },
  { x: "20%", y: "8%", size: 11, delay: "0.6s", duration: "4.8s", color: "#ffd6ff" },
  { x: "35%", y: "3%", size: 14, delay: "1.1s", duration: "6s", color: "#bde0fe" },
  { x: "60%", y: "5%", size: 12, delay: "0.2s", duration: "5.2s", color: "#ffffff" },
  { x: "78%", y: "14%", size: 17, delay: "1.5s", duration: "5.8s", color: "#ffcf70" },
  { x: "90%", y: "32%", size: 10, delay: "0.9s", duration: "4.6s", color: "#cdb4db" },
  { x: "82%", y: "60%", size: 13, delay: "1.8s", duration: "5.7s", color: "#ffffff" },
  { x: "12%", y: "58%", size: 12, delay: "1.3s", duration: "5s", color: "#a7f3d0" },
  { x: "5%", y: "44%", size: 9, delay: "0.4s", duration: "4.4s", color: "#fde68a" },
  { x: "68%", y: "72%", size: 10, delay: "2s", duration: "6.2s", color: "#fbcfe8" },
  { x: "30%", y: "70%", size: 8, delay: "1.7s", duration: "4.9s", color: "#bfdbfe" },
  { x: "50%", y: "0%", size: 9, delay: "2.4s", duration: "5.4s", color: "#fff7ed" },
];

function StarShape({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="magical-star-svg"
    >
      <path
        d="M12 1.8L14.6 8.7L21.8 12L14.6 15.3L12 22.2L9.4 15.3L2.2 12L9.4 8.7L12 1.8Z"
        fill={color}
        stroke="var(--star-outline)"
        strokeWidth="1.2"
      />
      <path
        d="M12 5.3L13.5 9.7L18 12L13.5 14.3L12 18.7L10.5 14.3L6 12L10.5 9.7L12 5.3Z"
        fill="white"
        opacity="0.55"
      />
    </svg>
  );
}

export default function MagicalStars3D() {
  return (
    <div className="magical-stars-3d" aria-hidden="true">
      <div className="magic-orbit orbit-one">
        <span className="orbit-dot dot-a" />
        <span className="orbit-dot dot-b" />
        <span className="orbit-dot dot-c" />
      </div>

      <div className="magic-orbit orbit-two">
        <span className="orbit-dot dot-d" />
        <span className="orbit-dot dot-e" />
      </div>

      {stars.map((star, index) => (
        <span
          key={index}
          className="magic-star"
          style={{
            left: star.x,
            top: star.y,
            "--star-delay": star.delay,
            "--star-duration": star.duration,
            "--star-glow": star.color,
          }}
        >
          <StarShape size={star.size} color={star.color} />
        </span>
      ))}

      <style>{`
        .magical-stars-3d {
          --star-shadow-strong: rgba(120, 53, 15, 0.45);
          --star-light-glow: rgba(245, 158, 11, 0.85);
          --star-outline: rgba(88, 28, 135, 0.55);
          
          position: absolute;
          inset: -18%;
          z-index: 6;
          pointer-events: none;
          perspective: 700px;
          transform-style: preserve-3d;
          overflow: visible;
        }

        :global(.dark) .magical-stars-3d,
        .dark .magical-stars-3d {
          --star-shadow-strong: rgba(255, 255, 255, 0.45);
          --star-light-glow: rgba(255, 243, 163, 0.9);
          --star-outline: rgba(255, 255, 255, 0.35);
        }

        .magic-star {
          position: absolute;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(0 0 2px var(--star-outline))
            drop-shadow(0 0 8px var(--star-glow))
            drop-shadow(0 0 18px var(--star-light-glow));
          animation:
            starFloat3D var(--star-duration) ease-in-out infinite,
            starTwinkle 1.8s ease-in-out infinite;
          animation-delay: var(--star-delay);
          transform-style: preserve-3d;
        }

        .magical-star-svg {
          transform-origin: center;
          animation: starSpin 4.5s linear infinite;
        }

        .magic-orbit {
          position: absolute;
          left: 50%;
          top: 46%;
          border-radius: 999px;
          transform-style: preserve-3d;
          pointer-events: none;
        }

        .orbit-one {
          width: 86%;
          height: 58%;
          transform: translate(-50%, -50%) rotateX(64deg);
          animation: orbitRotateOne 9s linear infinite;
        }

        .orbit-two {
          width: 68%;
          height: 42%;
          transform: translate(-50%, -50%) rotateX(66deg) rotateZ(18deg);
          animation: orbitRotateTwo 7.5s linear infinite reverse;
        }

        .orbit-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: white;
          box-shadow:
            0 0 8px #ffffff,
            0 0 16px var(--star-light-glow),
            0 0 24px var(--star-glow);
          animation: dotPulse 1.7s ease-in-out infinite;
        }

        .dot-a {
          left: 0%;
          top: 50%;
        }

        .dot-b {
          right: 8%;
          top: 18%;
          background: #bfdbfe;
        }

        .dot-c {
          right: 22%;
          bottom: 5%;
          background: #fde68a;
        }

        .dot-d {
          left: 12%;
          top: 22%;
          background: #fbcfe8;
        }

        .dot-e {
          right: 6%;
          bottom: 28%;
          background: #ffffff;
        }

        @keyframes starFloat3D {
          0% {
            opacity: 0;
            transform: translate3d(0, 10px, -30px) scale(0.65) rotateY(0deg);
          }
          20% {
            opacity: 1;
          }
          50% {
            opacity: 1;
            transform: translate3d(6px, -12px, 40px) scale(1.05) rotateY(180deg);
          }
          80% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate3d(-4px, -28px, -20px) scale(0.75) rotateY(360deg);
          }
        }

        @keyframes starTwinkle {
          0%, 100% {
            filter:
              drop-shadow(0 0 2px var(--star-outline))
              drop-shadow(0 0 5px var(--star-glow))
              drop-shadow(0 0 12px var(--star-light-glow));
          }
          50% {
            filter:
              drop-shadow(0 0 3px var(--star-outline))
              drop-shadow(0 0 12px var(--star-glow))
              drop-shadow(0 0 24px var(--star-light-glow));
          }
        }

        @keyframes starSpin {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes orbitRotateOne {
          from {
            transform: translate(-50%, -50%) rotateX(64deg) rotateZ(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotateX(64deg) rotateZ(360deg);
          }
        }

        @keyframes orbitRotateTwo {
          from {
            transform: translate(-50%, -50%) rotateX(66deg) rotateZ(18deg);
          }
          to {
            transform: translate(-50%, -50%) rotateX(66deg) rotateZ(378deg);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }

        @media (max-width: 640px) {
          .magical-stars-3d {
            inset: -12%;
          }

          .orbit-one {
            width: 78%;
            height: 50%;
          }

          .orbit-two {
            width: 60%;
            height: 36%;
          }
        }
      `}</style>
    </div>
  );
}
