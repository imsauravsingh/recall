'use client';

import { useState } from 'react';

export default function ResumePage() {
  const [hasResume] = useState(false);

  if (!hasResume) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Resume</h1>
          <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
            Upload your resume to generate personalised interview questions and AI-assisted answers.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dddbe7] bg-white py-16 px-6 text-center dark:border-[#292735] dark:bg-[#1a1a23]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEEDFE] text-2xl dark:bg-[#26215C]">
            📄
          </div>
          <h2 className="mt-4 text-base font-semibold">Upload your resume</h2>
          <p className="mt-2 max-w-sm text-sm text-[#625f6c] dark:text-[#b6b2c5]">
            Upload your resume to generate personalized interview questions and AI-assisted answer drafts.
          </p>
          <p className="mt-1 text-xs text-[#888391]">Resume upload is optional. Supports PDF and DOCX.</p>
          <button className="mt-6 rounded-xl bg-[#534AB7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3C3489] transition">
            Upload resume
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: '❓', title: 'Resume-based questions', desc: 'Get interview questions generated directly from your experience and projects.' },
            { icon: '✍️', title: 'AI answer drafts', desc: 'Let AI draft answers tailored to your background. Configure an AI provider first.' },
            { icon: '📂', title: 'Version history', desc: 'Upload new versions as your resume evolves. Track changes over time.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[#eceaf2] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
              <div className="text-xl">{item.icon}</div>
              <p className="mt-2 text-xs font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Resume</h1>
          <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Manage your resume and generated interview questions.</p>
        </div>
        <button className="rounded-xl bg-[#534AB7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3C3489] transition">
          Upload new version
        </button>
      </div>
    </div>
  );
}
