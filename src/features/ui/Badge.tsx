const Badge = ({ label }: { label: string }) => (
  <span className="inline-flex rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] font-semibold text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]">
    {label}
  </span>
);

export default Badge;
