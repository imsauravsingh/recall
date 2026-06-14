interface PlaceholderPageProps {
  title: string;
  description: string;
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Coming soon</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-100">{title}</h2>
      </div>
      <p className="max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

export default PlaceholderPage;
