const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-[#dddbe7] bg-white p-4 shadow-soft dark:border-[#292735] dark:bg-[#1a1a23]">
    {children}
  </div>
);

export default Panel;
