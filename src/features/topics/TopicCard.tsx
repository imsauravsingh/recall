import Badge from '../ui/Badge';
import { Topic } from '../../lib/types';

interface TopicCardProps {
  topic: Topic;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
}

const TopicCard = ({ topic, onEdit, onDelete, onArchive }: TopicCardProps) => {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge label={topic.category} />
            {topic.archived && <Badge label="Archived" />}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-100">{topic.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{topic.description || 'No description added yet.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onArchive(topic.id, !topic.archived)}
            className="rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
          >
            {topic.archived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(topic)}
            className="rounded-2xl border border-cyan-500 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(topic.id)}
            className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{topic.subcategory || 'General'}</span>
        <span>{new Date(topic.updatedAt).toLocaleDateString()}</span>
        <span>{topic.tags.length ? topic.tags.join(', ') : 'No tags'}</span>
      </div>
    </article>
  );
};

export default TopicCard;
