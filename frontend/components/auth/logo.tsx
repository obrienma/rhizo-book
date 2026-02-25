const Logo = () => (
  <div className="flex items-center gap-2 justify-center">
    <div className="w-10 h-10 bg-[#164E63] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/10">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="3" fill="#2DD4BF" />
        <circle cx="10" cy="22" r="3" fill="#2DD4BF" />
        <circle cx="22" cy="22" r="3" fill="#2DD4BF" />
        <path d="M16 10L10 22M16 10L22 22M10 22L22 22" stroke="#2DD4BF" strokeWidth="2" />
      </svg>
    </div>
    <span className="text-2xl font-bold tracking-tight text-slate-800">
      Rhizo<span className="text-[#2DD4BF]">Book</span>
    </span>
  </div>
);

export default Logo;
