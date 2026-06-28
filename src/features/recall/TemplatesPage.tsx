'use client';

import Link from 'next/link';
import { templates } from './recallData';

function tagClass(tag: string) {
  if (tag === 'Hard') return 'bg-[#FCEBEB] text-[#A32D2D]';
  if (tag === 'Medium') return 'bg-[#FAEEDA] text-[#633806]';
  if (tag === 'Easy') return 'bg-[#EAF3DE] text-[#27500A]';
  if (tag === 'Backend') return 'bg-[#E1F5EE] text-[#085041]';
  if (tag === 'AI Round') return 'bg-[#EEEDFE] text-[#3C3489]';
  if (tag.includes('HR')) return 'bg-[#FBEAF0] text-[#72243E]';
  if (tag.includes('System')) return 'bg-[#FAEEDA] text-[#633806]';
  return 'bg-[#E6F1FB] text-[#0C447C]';
}

function TemplatesPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold">Quick recall templates</h1>
        <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Pick a template and create a structured recall workspace in one click.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.name} className="rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${template.accent}`}>{template.name[0]}</div>
            <h2 className="mt-3 text-sm font-semibold">{template.name}</h2>
            <p className="mt-1 min-h-10 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">{template.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagClass(tag)}`}>{tag}</span>
              ))}
            </div>
            <Link href="/recall" className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#534AB7] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3C3489]">
              Use template
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default TemplatesPage;
