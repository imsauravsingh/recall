const Badge = ({ label }: { label: string }) => (
  <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
    {label}
  </span>
);

export default Badge;
