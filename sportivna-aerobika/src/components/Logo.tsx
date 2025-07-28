export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Фігура спортсмена (синя) з нового логотипу */}
      <g fill="#1e3a8a" transform="translate(10, 10)">
        {/* Голова */}
        <path d="M65 15c-6 0-11 5-11 11s5 11 11 11 11-5 11-11-5-11-11-11z"/>

        {/* Тіло з динамічними лініями */}
        <path d="M45 35c-15 0-25 8-30 20l-10 25c-2 5 0 10 5 12 4 2 9 0 11-4l8-20c2-4 6-7 11-7h20c8 0 15 7 15 15v25c0 6 5 11 11 11s11-5 11-11V55c0-11-9-20-20-20H65"/>

        {/* Права рука (піднята) */}
        <path d="M75 40l25-15c4-2 9-1 12 2 3 3 4 8 2 12l-15 25c-1 2-3 3-5 3l-20-5c-3-1-5-4-4-7l5-15z"/>

        {/* Ліва рука */}
        <path d="M55 45l-20 10c-4 2-6 7-4 11l8 15c2 3 6 4 9 2l15-8c3-2 4-6 2-9l-10-21z"/>

        {/* Праве стегно */}
        <path d="M70 70l5 35c1 5 5 9 10 9s9-4 10-9l5-35c1-3-2-6-5-6h-20c-3 0-6 3-5 6z"/>

        {/* Ліве стегно */}
        <path d="M50 75l-5 30c-1 5-5 9-10 9s-9-4-10-9l-3-30c0-3 3-6 6-6h16c3 0 6 3 6 6z"/>

        {/* Динамічні лінії руху */}
        <path d="M90 25l15-5c2-1 4 1 3 3l-5 15c-1 2-4 2-5 0l-8-13z" opacity="0.7"/>
        <path d="M85 35l20-3c2 0 3 2 2 4l-8 12c-1 1-3 1-4-1l-10-12z" opacity="0.5"/>
        <path d="M80 45l18 0c2 0 3 3 1 4l-12 8c-1 1-3 0-3-2l-4-10z" opacity="0.3"/>
      </g>

      {/* Текст ФУСАФ (малиновий, шрифт IMPACT) */}
      <g fill="#be185d">
        <text x="120" y="45" fontSize="36" fontWeight="900" fontFamily="Impact, 'Arial Black', sans-serif" letterSpacing="1">ФУСАФ</text>
      </g>

      {/* Текст УКРАЇНА (чорний, шрифт IMPACT) */}
      <g fill="#000000">
        <text x="135" y="70" fontSize="12" fontWeight="700" fontFamily="Impact, 'Arial Black', sans-serif" letterSpacing="3">У К Р А Ї Н А</text>
      </g>
    </svg>
  );
}
