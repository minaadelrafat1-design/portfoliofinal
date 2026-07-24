import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface StringListInputProps {
  values: string[];
  onChange: (v: string[]) => void;
  label: string;
  placeholder?: string;
}

export function StringListInput({ values, onChange, label, placeholder }: StringListInputProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        />
        <button type="button" onClick={add} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs text-primary">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
