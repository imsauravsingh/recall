import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Topic, TopicCategory } from '../../lib/types';

const categoryOptions: TopicCategory[] = ['Backend', 'System Design', 'Architecture', 'Interview', 'Career', 'Other'];

interface TopicFormValues {
  title: string;
  category: TopicCategory;
  subcategory: string;
  description: string;
  tags: string;
}

interface TopicFormProps {
  initialTopic?: Topic;
  onSubmit: (values: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'archived'> & { id?: string; archived?: boolean }) => void;
  onCancel: () => void;
}

function TopicForm({ initialTopic, onSubmit, onCancel }: TopicFormProps) {
  const { register, handleSubmit, reset } = useForm<TopicFormValues>({
    defaultValues: {
      title: initialTopic?.title ?? '',
      category: initialTopic?.category ?? 'Backend',
      subcategory: initialTopic?.subcategory ?? '',
      description: initialTopic?.description ?? '',
      tags: initialTopic?.tags.join(', ') ?? '',
    },
  });

  useEffect(() => {
    reset({
      title: initialTopic?.title ?? '',
      category: initialTopic?.category ?? 'Backend',
      subcategory: initialTopic?.subcategory ?? '',
      description: initialTopic?.description ?? '',
      tags: initialTopic?.tags.join(', ') ?? '',
    });
  }, [initialTopic, reset]);

  function handleFormSubmit(values: TopicFormValues) {
    onSubmit({
      id: initialTopic?.id,
      archived: initialTopic?.archived ?? false,
      title: values.title.trim(),
      category: values.category,
      subcategory: values.subcategory.trim(),
      description: values.description.trim(),
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Topic title</span>
          <input
            type="text"
            {...register('title', { required: true })}
            placeholder="Redis rate limiting"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Category</span>
          <select
            {...register('category')}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option} className="bg-slate-950 text-slate-100">
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Subcategory</span>
          <input
            type="text"
            {...register('subcategory')}
            placeholder="Caching / Rate limiting"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Tags</span>
          <input
            type="text"
            {...register('tags')}
            placeholder="redis, caching, performance"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Description</span>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Why this topic matters and what to practice."
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Save topic
        </button>
      </div>
    </form>
  );
}

export default TopicForm;
