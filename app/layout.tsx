import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../src/styles/global.css';

export const metadata: Metadata = {
  title: 'Recall.dev — Interview Preparation Workspace',
  description:
    'AI-powered study plans, spaced recall, and interview prep for software engineers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
