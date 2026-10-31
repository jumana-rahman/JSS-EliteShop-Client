import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createSubcategory, updateSubcategory } from '../../services/categories';

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843]/50 bg-white';

export default function SubcategoryFormModal({ open, category, subcategory, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError('');
    setSaving(false);
    setName(subcategory?.name || '');
  }, [open, subcategory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Subcategory name must be at least 2 characters.');
      return;
    }

    setSaving(true);

    try {
      const payload = { name: name.trim() };
      const data = subcategory
        ? await updateSubcategory(category.id, subcategory.id, payload)
        : await createSubcategory(category.id, payload);

      onSaved(data.subcategory);
    } catch (err) {
      setError(err.message || 'Unable to save this subcategory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={subcategory ? 'Edit Subcategory' : 'Add Subcategory'}
      subtitle={category ? `Under ${category.name}` : undefined}
      onClose={saving ? () => {} : onClose}
      maxWidth="max-w-md"
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
            form="subcategory-form"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#831843] text-white text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : subcategory ? 'Save Changes' : 'Add Subcategory'}
          </button>
        </div>
      }
    >
      <form id="subcategory-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <label className="block">
          <span className="block text-sm font-medium text-[#17211D] mb-1.5">Name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Headphones"
            className={inputClass}
            autoFocus
          />
        </label>
      </form>
    </Modal>
  );
}
