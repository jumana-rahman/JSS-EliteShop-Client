import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createCategory, updateCategory } from '../../services/categories';

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843]/50 bg-white';

function emptyForm() {
  return { name: '', color: '#831843', description: '' };
}

export default function CategoryFormModal({ open, category, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError('');
    setSaving(false);
    setForm(
      category
        ? {
            name: category.name || '',
            color: category.color || '#831843',
            description: category.description || '',
          }
        : emptyForm()
    );
  }, [open, category]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Category name must be at least 2 characters.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        color: form.color || '#831843',
        description: form.description.trim(),
      };

      const data = category
        ? await updateCategory(category.id, payload)
        : await createCategory(payload);

      onSaved(data.category);
    } catch (err) {
      setError(err.message || 'Unable to save this category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={category ? 'Edit Category' : 'Add Category'}
      subtitle={category ? 'Update how this category appears in the store.' : 'Categories group your products in the storefront.'}
      onClose={saving ? () => {} : onClose}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#831843] text-white text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <label className="block">
          <span className="block text-sm font-medium text-[#17211D] mb-1.5">Name</span>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Electronics"
            className={inputClass}
            autoFocus
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-[#17211D] mb-1.5">Accent Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={e => update('color', e.target.value.toUpperCase())}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer bg-white"
            />
            <input
              value={form.color}
              onChange={e => update('color', e.target.value)}
              className={inputClass}
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-[#17211D] mb-1.5">Description</span>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Optional short description for this category."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </label>
      </form>
    </Modal>
  );
}
