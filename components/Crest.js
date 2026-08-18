export default function Crest({ size = 34, tone = "#b8842b" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M24 3 43 10.2v14.3C43 34.6 34.9 41.6 24 45 13.1 41.6 5 34.6 5 24.5V10.2L24 3Z"
        fill="none"
        stroke={tone}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 28c3-2.6 6.1-2.6 9.1 0s6.1 2.6 9.1 0 6.1-2.6 8.8 0"
        stroke={tone}
        strokeWidth="1.9"
        strokeLinecap="round"
        opacity="0.65"
      />
      <text
        x="24"
        y="23"
        textAnchor="middle"
        fontFamily="Spectral, Georgia, serif"
        fontSize="15.5"
        fontWeight="600"
        fill={tone}
        letterSpacing="0.5"
      >
        AC
      </text>
    </svg>
  );
}
