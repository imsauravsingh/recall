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

  const inputClass =
    'w-full rounded-lg border border-[#dddbe7] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#AFA9EC] focus:ring-2 focus:ring-[#EEEDFE] dark:border-[#292735] dark:bg-[#20202a] dark:focus:ring-[#26215C]';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 rounded-lg border border-[#dddbe7] bg-white p-4 dark:border-[#292735] dark:bg-[#1a1a23]">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Topic title</span>
          <input
            type="text"
            {...register('title', { required: true })}
            placeholder="Redis rate limiting"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Category</span>
          <select
            {...register('category')}
            className={inputClass}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Subcategory</span>
          <input
            type="text"
            {...register('subcategory')}
            placeholder="Caching / Rate limiting"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Tags</span>
          <input
            type="text"
            {...register('tags')}
            placeholder="redis, caching, performance"
            className={inputClass}
          />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span>Description</span>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Why this topic matters and what to practice."
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#dddbe7] px-4 py-2.5 text-sm text-[#625f6c] transition hover:bg-[#f1f0f5] dark:border-[#292735] dark:text-[#b6b2c5] dark:hover:bg-[#20202a]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-[#534AB7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3C3489]"
        >
          Save topic
        </button>
      </div>
    </form>
  );
}

export default TopicForm;
