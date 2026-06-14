const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/75 p-6 shadow-soft">
    {children}
  </div>
);

export default Panel;
