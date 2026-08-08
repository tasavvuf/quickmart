export function SeamlessPillBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg className="w-full h-full opacity-15 dark:opacity-10">
        <defs>
          <pattern
            id="seamless-pills"
            width="280"
            height="180"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-35)"
          >
            {/* Horizontal rows that tile continuously across tile boundaries */}
            <rect x="-40" y="10" width="200" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />
            <rect x="180" y="10" width="120" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />

            <rect x="10" y="55" width="110" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />
            <rect x="140" y="55" width="180" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />

            <rect x="-20" y="100" width="220" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />
            <rect x="220" y="100" width="90" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />

            <rect x="30" y="145" width="130" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />
            <rect x="180" y="145" width="160" height="22" rx="11" className="fill-[#275CCC] dark:fill-[#F5E4CF]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#seamless-pills)" />
      </svg>
    </div>
  );
}

export default SeamlessPillBackground;
