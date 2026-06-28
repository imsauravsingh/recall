'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { providerCatalog } from '@/lib/ai/providerCatalog';
import type {
  AIProviderConfigInput,
  AIProviderKey,
  AIProviderPublicConfig,
} from '@/lib/ai/types';
import {
  deleteAIProvider,
  fetchAIProviders,
  saveAIProvider,
  testAIProvider,
  updateAIProvider,
} from './aiProviderClient';

const sections = ['Profile', 'Preparation', 'AI Providers', 'Appearance', 'Data'];

const emptyProviderForm: AIProviderConfigInput = {
  provider: 'openai',
  label: 'OpenAI',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  enabled: true,
  priority: 1,
  costMode: 'cheap',
};

function getStatusClass(status: AIProviderPublicConfig['status']) {
  if (status === 'connected') return 'bg-[#E7F7EF] text-[#0F6E56] dark:bg-[#12382B] dark:text-[#9CE2C4]';
  if (status === 'error') return 'bg-[#FDE8E8] text-[#A32D2D] dark:bg-[#3A1717] dark:text-[#F4A3A3]';
  return 'bg-[#f1f0f5] text-[#888391] dark:bg-[#20202a]';
}

export default function SettingsPage() {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('Profile');
  const [aiProviders, setAiProviders] = useState<AIProviderPublicConfig[]>([]);
  const [providerForm, setProviderForm] = useState<AIProviderConfigInput>(emptyProviderForm);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [loadingProviders, setLoadingProviders] = useState(false);

  const selectedCatalogProvider = useMemo(
    () => providerCatalog.find((item) => item.provider === providerForm.provider),
    [providerForm.provider],
  );

  async function loadAIProviders() {
    setLoadingProviders(true);
    try {
      setAiProviders(await fetchAIProviders());
    } catch (error) {
      setAiMessage((error as Error).message);
    } finally {
      setLoadingProviders(false);
    }
  }

  useEffect(() => {
    if (activeSection === 'AI Providers') {
      void loadAIProviders();
    }
  }, [activeSection]);

  function startConnect(provider: AIProviderKey) {
    const catalogItem = providerCatalog.find((item) => item.provider === provider);
    setEditingProviderId(null);
    setProviderForm({
      provider,
      label: catalogItem?.label ?? 'Custom Provider',
      apiKey: '',
      baseUrl: catalogItem?.defaultBaseUrl ?? '',
      model: catalogItem?.defaultModel ?? '',
      enabled: true,
      priority: aiProviders.length + 1,
      costMode: 'cheap',
    });
    setShowProviderForm(true);
    setAiMessage('');
  }

  function startEdit(provider: AIProviderPublicConfig) {
    setEditingProviderId(provider.id);
    setProviderForm({
      id: provider.id,
      provider: provider.provider,
      label: provider.label,
      apiKey: '',
      baseUrl: provider.baseUrl,
      model: provider.model,
      enabled: provider.enabled,
      priority: provider.priority,
      costMode: provider.costMode,
    });
    setShowProviderForm(true);
    setAiMessage('');
  }

  async function handleSaveProvider(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAiMessage('Saving provider...');
    try {
      const payload = {
        ...providerForm,
        apiKey: providerForm.apiKey || undefined,
      };
      const saved = editingProviderId
        ? await updateAIProvider(editingProviderId, payload)
        : await saveAIProvider(payload);
      setAiProviders((current) => {
        const withoutSaved = current.filter((item) => item.id !== saved.id);
        return [...withoutSaved, saved].sort((a, b) => a.priority - b.priority);
      });
      setEditingProviderId(saved.id);
      setProviderForm((current) => ({ ...current, id: saved.id, apiKey: '' }));
      setAiMessage('Provider saved. Test the connection to enable AI generation.');
    } catch (error) {
      setAiMessage((error as Error).message);
    }
  }

  async function handleTestProvider(id: string) {
    setAiMessage('Testing provider...');
    try {
      const tested = await testAIProvider(id);
      setAiProviders((current) =>
        current.map((item) => (item.id === tested.id ? tested : item)),
      );
      setAiMessage('Connection successful.');
    } catch (error) {
      setAiMessage((error as Error).message);
      await loadAIProviders();
    }
  }

  async function handleDeleteProvider(id: string) {
    setAiMessage('Disconnecting provider...');
    try {
      await deleteAIProvider(id);
      setAiProviders((current) => current.filter((item) => item.id !== id));
      if (editingProviderId === id) {
        setShowProviderForm(false);
        setEditingProviderId(null);
      }
      setAiMessage('Provider disconnected.');
    } catch (error) {
      setAiMessage((error as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Manage your profile, AI providers, and preferences.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[#eceaf2] bg-white p-1 dark:border-[#292735] dark:bg-[#1a1a23]">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeSection === s
                ? 'bg-[#24232b] text-white dark:bg-[#f4f3f8] dark:text-[#171720]'
                : 'text-[#625f6c] hover:bg-[#f1f0f5] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {activeSection === 'Profile' && (
        <div className="rounded-lg border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
          <h2 className="text-sm font-semibold">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">First name</span>
              <input defaultValue={user?.firstName ?? ''} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none focus:border-[#534AB7] dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
            </label>
            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Last name</span>
              <input defaultValue={user?.lastName ?? ''} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none focus:border-[#534AB7] dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
            </label>
            <label className="space-y-1.5 text-xs sm:col-span-2">
              <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Email</span>
              <input defaultValue={user?.emailAddresses[0]?.emailAddress ?? ''} disabled className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm text-[#888391] outline-none dark:border-[#2f2d3c] dark:bg-[#121218]" />
            </label>
          </div>
          <button className="mt-5 rounded-md bg-[#24232b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3a3845] dark:bg-[#f4f3f8] dark:text-[#171720]">
            Save changes
          </button>
        </div>
      )}

      {activeSection === 'Preparation' && (
        <div className="rounded-lg border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
          <h2 className="text-sm font-semibold">Preparation Profile</h2>
          <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
            Updating your profile will offer to regenerate domain recommendations without deleting your progress.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {['Current role', 'Years of experience', 'Technology stack', 'Target role', 'Daily study hours', 'Preparation timeline'].map((label) => (
              <label key={label} className="space-y-1.5 text-xs">
                <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">{label}</span>
                <input className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none focus:border-[#534AB7] dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
              </label>
            ))}
          </div>
          <button className="mt-5 rounded-md bg-[#24232b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3a3845] dark:bg-[#f4f3f8] dark:text-[#171720]">
            Save and regenerate recommendations
          </button>
        </div>
      )}

      {activeSection === 'AI Providers' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-3">
            <div className="rounded-lg border border-[#eceaf2] bg-[#faf9fc] p-4 dark:border-[#292735] dark:bg-[#14131b]">
              <p className="text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">
                Connect one or more providers using your own key. Keys are encrypted server-side and only masked metadata is shown here.
              </p>
            </div>

            {providerCatalog.map((p) => {
              const connected = aiProviders.find((item) => item.provider === p.provider);
              return (
                <div key={p.provider} className="flex flex-col gap-3 rounded-lg border border-[#eceaf2] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="mt-1 text-xs text-[#888391]">{p.vendor} · default {p.defaultModel}</p>
                    {connected ? (
                      <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">
                        {connected.model} {connected.maskedKey ? `· ${connected.maskedKey}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${getStatusClass(connected?.status ?? 'untested')}`}>
                      {connected?.status ?? 'not connected'}
                    </span>
                    {connected ? (
                      <>
                        <button onClick={() => startEdit(connected)} className="rounded-md border border-[#dddbe7] px-3 py-1.5 text-xs font-medium hover:bg-[#f6f6f8] dark:border-[#292735] dark:hover:bg-[#20202a]">
                          Edit
                        </button>
                        <button onClick={() => handleTestProvider(connected.id)} className="rounded-md border border-[#24232b] px-3 py-1.5 text-xs font-medium text-[#24232b] hover:bg-[#f6f6f8] dark:border-[#f4f3f8] dark:text-[#f4f3f8] dark:hover:bg-[#20202a]">
                          Test
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startConnect(p.provider)} className="rounded-md border border-[#24232b] px-3 py-1.5 text-xs font-medium text-[#24232b] hover:bg-[#f6f6f8] dark:border-[#f4f3f8] dark:text-[#f4f3f8] dark:hover:bg-[#20202a]">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loadingProviders ? <p className="text-xs text-[#888391]">Loading providers...</p> : null}
            {aiMessage ? <p className="text-xs text-[#625f6c] dark:text-[#b6b2c5]">{aiMessage}</p> : null}
          </div>

          <div className="rounded-lg border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
            {showProviderForm ? (
              <form onSubmit={handleSaveProvider} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{editingProviderId ? 'Edit provider' : 'Connect provider'}</h2>
                    <p className="mt-1 text-xs text-[#888391]">{selectedCatalogProvider?.vendor}</p>
                  </div>
                  <button type="button" onClick={() => setShowProviderForm(false)} className="rounded-md border border-[#dddbe7] px-2 py-1 text-xs dark:border-[#292735]">
                    Close
                  </button>
                </div>

                <label className="space-y-1.5 text-xs">
                  <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Provider</span>
                  <select value={providerForm.provider} onChange={(event) => startConnect(event.target.value as AIProviderKey)} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white">
                    {providerCatalog.map((provider) => (
                      <option key={provider.provider} value={provider.provider}>{provider.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 text-xs">
                  <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Label</span>
                  <input value={providerForm.label} onChange={(event) => setProviderForm((current) => ({ ...current, label: event.target.value }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
                </label>

                <label className="space-y-1.5 text-xs">
                  <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">API key</span>
                  <input type="password" value={providerForm.apiKey ?? ''} placeholder={editingProviderId ? 'Leave blank to keep existing key' : selectedCatalogProvider?.needsApiKey ? 'Required' : 'Optional'} onChange={(event) => setProviderForm((current) => ({ ...current, apiKey: event.target.value }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
                </label>

                <label className="space-y-1.5 text-xs">
                  <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Base URL</span>
                  <input value={providerForm.baseUrl ?? ''} onChange={(event) => setProviderForm((current) => ({ ...current, baseUrl: event.target.value }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs">
                    <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Model</span>
                    <input value={providerForm.model} onChange={(event) => setProviderForm((current) => ({ ...current, model: event.target.value }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
                  </label>
                  <label className="space-y-1.5 text-xs">
                    <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Priority</span>
                    <input type="number" min={1} value={providerForm.priority} onChange={(event) => setProviderForm((current) => ({ ...current, priority: Number(event.target.value) }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white" />
                  </label>
                </div>

                <label className="space-y-1.5 text-xs">
                  <span className="font-medium text-[#625f6c] dark:text-[#b6b2c5]">Cost mode</span>
                  <select value={providerForm.costMode} onChange={(event) => setProviderForm((current) => ({ ...current, costMode: event.target.value as AIProviderConfigInput['costMode'] }))} className="w-full rounded-md border border-[#d9d9e1] bg-[#f6f6f8] px-3 py-2 text-sm outline-none dark:border-[#2f2d3c] dark:bg-[#121218] dark:text-white">
                    <option value="cheap">Cheap first</option>
                    <option value="balanced">Balanced</option>
                    <option value="quality">Quality first</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={providerForm.enabled} onChange={(event) => setProviderForm((current) => ({ ...current, enabled: event.target.checked }))} />
                  <span>Enabled for AI generation</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="rounded-md bg-[#24232b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3a3845] dark:bg-[#f4f3f8] dark:text-[#171720]">
                    Save provider
                  </button>
                  {editingProviderId ? (
                    <>
                      <button type="button" onClick={() => handleTestProvider(editingProviderId)} className="rounded-md border border-[#24232b] px-4 py-2 text-xs font-semibold dark:border-[#f4f3f8]">
                        Test connection
                      </button>
                      <button type="button" onClick={() => handleDeleteProvider(editingProviderId)} className="rounded-md border border-[#E24B4A] px-4 py-2 text-xs font-semibold text-[#E24B4A]">
                        Disconnect
                      </button>
                    </>
                  ) : null}
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-sm font-semibold">Provider setup</h2>
                <p className="mt-2 text-xs leading-5 text-[#625f6c] dark:text-[#b6b2c5]">
                  Select a provider on the left. For OpenRouter, OpenAI, DeepSeek, Claude, and Gemini, paste the API key from that provider. For Ollama, keep the local base URL and model name, then test the connection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'Appearance' && (
        <div className="rounded-lg border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <p className="mt-3 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Theme and display preferences coming soon.</p>
        </div>
      )}

      {activeSection === 'Data' && (
        <div className="rounded-lg border border-[#eceaf2] bg-white p-5 dark:border-[#292735] dark:bg-[#1a1a23]">
          <h2 className="text-sm font-semibold">Data Management</h2>
          <p className="mt-1 text-xs text-[#625f6c] dark:text-[#b6b2c5]">Export, import, or clear your local data.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md border border-[#dddbe7] px-4 py-2 text-xs font-medium text-[#24232b] transition hover:bg-[#f6f6f8] dark:border-[#292735] dark:text-white dark:hover:bg-[#20202a]">
              Export all data
            </button>
            <button className="rounded-md border border-[#E24B4A] px-4 py-2 text-xs font-medium text-[#E24B4A] transition hover:bg-[#FDE8E8]">
              Clear local data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
