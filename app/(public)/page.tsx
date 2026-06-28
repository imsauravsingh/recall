'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

const features = [
  {
    icon: '📚',
    title: 'Smart Study Plans',
    desc: 'AI-generated weekly roadmaps tailored to your role, experience, and timeline.',
  },
  {
    icon: '🔁',
    title: 'Spaced Recall',
    desc: 'Active recall sessions with confidence scoring and automatic rescheduling.',
  },
  {
    icon: '🎯',
    title: 'Learning Domains',
    desc: 'Organize everything across DSA, System Design, Backend, Behavioural, and more.',
  },
  {
    icon: '🤖',
    title: 'AI-Assisted Practice',
    desc: 'Bring your own API key. Works with Claude, GPT-4, Gemini, DeepSeek, and Ollama.',
  },
  {
    icon: '📄',
    title: 'Resume Integration',
    desc: 'Upload your resume and generate personalized interview questions instantly.',
  },
  {
    icon: '📊',
    title: 'Progress Insights',
    desc: 'Track weak topics, recall scores, and domain readiness over time.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Complete onboarding',
    desc: 'Tell us your current role, tech stack, target company, and prep timeline.',
  },
  {
    step: '02',
    title: 'Get your study plan',
    desc: 'We recommend Learning Domains and generate a tailored multi-week study plan.',
  },
  {
    step: '03',
    title: 'Study and recall',
    desc: 'Add topics, take notes, and run recall sessions to lock in what you learn.',
  },
  {
    step: '04',
    title: 'Ship the interview',
    desc: 'Track confidence, fix weak spots, and walk into interviews prepared.',
  },
];

const domains = [
  { label: 'Backend Engineering', color: 'bg-[#E1F5EE] text-[#085041]' },
  { label: 'DSA', color: 'bg-[#EEEDFE] text-[#3C3489]' },
  { label: 'System Design', color: 'bg-[#FAEEDA] text-[#633806]' },
  { label: 'AI System Design', color: 'bg-[#F3E8FF] text-[#6B21A8]' },
  { label: 'Resume Preparation', color: 'bg-[#FBEAF0] text-[#72243E]' },
  { label: 'Behavioural HR', color: 'bg-[#E6F1FB] text-[#0C447C]' },
  { label: 'Cloud', color: 'bg-[#EAF3DE] text-[#27500A]' },
  { label: 'Database', color: 'bg-[#FDE8D8] text-[#7C3D12]' },
  { label: 'Custom', color: 'bg-[#F1F0F5] text-[#625f6c]' },
];

const providers = [
  { name: 'Claude', sub: 'Anthropic' },
  { name: 'GPT-4', sub: 'OpenAI' },
  { name: 'Gemini', sub: 'Google' },
  { name: 'DeepSeek', sub: 'DeepSeek AI' },
  { name: 'Ollama', sub: 'Local / Offline' },
  { name: 'OpenRouter', sub: 'Multi-provider' },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white text-[#24232b] dark:bg-[#0e0e14] dark:text-[#f4f3f8]">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#eceaf2] bg-white/90 backdrop-blur dark:border-[#292735] dark:bg-[#0e0e14]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEEDFE] text-sm font-semibold text-[#534AB7]">R</div>
            <span className="text-sm font-semibold">Recall.dev</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[#625f6c] sm:flex dark:text-[#b6b2c5]">
            <a href="#features" className="hover:text-[#534AB7] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#534AB7] transition">How it works</a>
            <a href="#domains" className="hover:text-[#534AB7] transition">Domains</a>
          </nav>
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#534AB7] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#3C3489] transition"
              >
                Go to workspace
              </Link>
            ) : (
              <>
                <SignInButton mode="redirect">
                  <button className="rounded-lg px-3 py-1.5 text-sm text-[#625f6c] hover:text-[#24232b] transition dark:text-[#b6b2c5]">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="rounded-lg bg-[#534AB7] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#3C3489] transition">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center lg:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e0dff6] bg-[#EEEDFE] px-3 py-1 text-xs font-medium text-[#534AB7] dark:border-[#2e2a5e] dark:bg-[#1a1848] dark:text-[#CECBF6]">
          Local-first · AI-assisted · Built for engineers
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[#1a1928] dark:text-white lg:text-5xl">
          Land your next engineering role with structured preparation
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#625f6c] dark:text-[#b6b2c5]">
          Recall.dev gives you a personalised study plan, spaced recall sessions, and AI-powered interview practice — all in one focused workspace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#534AB7] px-7 py-3 text-sm font-semibold text-white hover:bg-[#3C3489] transition"
            >
              Open workspace
            </Link>
          ) : (
            <>
              <SignUpButton mode="redirect">
                <button className="w-full rounded-xl bg-[#534AB7] px-7 py-3 text-sm font-semibold text-white hover:bg-[#3C3489] transition sm:w-auto">
                  Start for free
                </button>
              </SignUpButton>
              <SignInButton mode="redirect">
                <button className="w-full rounded-xl border border-[#dddbe7] px-7 py-3 text-sm font-medium text-[#24232b] hover:bg-[#f6f6f8] transition dark:border-[#292735] dark:text-white dark:hover:bg-[#1a1a23] sm:w-auto">
                  Sign in
                </button>
              </SignInButton>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-[#888391]">No credit card required · Works offline · BYOK AI</p>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[#eceaf2] bg-[#faf9fc] py-16 dark:border-[#292735] dark:bg-[#111119]">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888391]">Features</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#1a1928] dark:text-white lg:text-3xl">
            Everything you need to prepare, nothing you don&apos;t
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#17171f]">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888391]">How it works</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#1a1928] dark:text-white lg:text-3xl">
            From signup to interview-ready in four steps
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#17171f]">
                <span className="text-3xl font-bold text-[#EEEDFE] dark:text-[#1e1c3e]">{s.step}</span>
                <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Domains */}
      <section id="domains" className="border-t border-[#eceaf2] bg-[#faf9fc] py-16 dark:border-[#292735] dark:bg-[#111119]">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888391]">Learning Domains</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#1a1928] dark:text-white lg:text-3xl">
            Covers every dimension of the modern engineering interview
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[#625f6c] dark:text-[#b6b2c5]">
            All topics, templates, recall sessions, and study plan tasks belong to a Learning Domain. We recommend domains automatically from your profile.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {domains.map((d) => (
              <span key={d.label} className={`rounded-full px-4 py-2 text-sm font-medium ${d.color}`}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Provider Support */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888391]">AI Provider Support</p>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#1a1928] dark:text-white lg:text-3xl">
            Bring your own API key
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[#625f6c] dark:text-[#b6b2c5]">
            Connect any AI provider. Your keys are stored encrypted and never leave your account.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {providers.map((p) => (
              <div key={p.name} className="flex flex-col items-center rounded-2xl border border-[#eceaf2] bg-white py-5 px-3 text-center dark:border-[#292735] dark:bg-[#17171f]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEEDFE] text-sm font-bold text-[#534AB7] dark:bg-[#26215C] dark:text-[#CECBF6]">
                  {p.name[0]}
                </div>
                <p className="mt-2 text-xs font-semibold">{p.name}</p>
                <p className="mt-0.5 text-[10px] text-[#888391]">{p.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#eceaf2] bg-[#534AB7] py-16 dark:border-[#292735]">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">
            Start your interview prep today
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c5c2f0]">
            Free to use. No credit card. Works offline. Add AI when you&apos;re ready.
          </p>
          <div className="mt-7">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#534AB7] hover:bg-[#f0effc] transition"
              >
                Open your workspace
              </Link>
            ) : (
              <SignUpButton mode="redirect">
                <button className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[#534AB7] hover:bg-[#f0effc] transition">
                  Create your free workspace
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eceaf2] py-8 dark:border-[#292735]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EEEDFE] text-xs font-semibold text-[#534AB7]">R</div>
            <span className="text-sm font-semibold">Recall.dev</span>
          </div>
          <p className="text-xs text-[#888391]">
            Built for engineers preparing for their next role.
          </p>
          <div className="flex gap-4 text-xs text-[#888391]">
            <a href="#features" className="hover:text-[#534AB7]">Features</a>
            <a href="#how-it-works" className="hover:text-[#534AB7]">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
