import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createProduct, updateProduct, uploadImage } from '../../services/products';

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843]/50 bg-white';
const emptySpec = { key: '', value: '' };

function emptyForm() {
  return {
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    subcategoryId: '',
    price: '',
    originalPrice: '',
    stock: '',
    images: [],
    specs: [{ ...emptySpec }],
    tags: '',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

export default function ProductFormModal({ open, product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError('');
    setSaving(false);
    setUploading(false);
    setImageUrl('');

    if (product) {
      const images = (product.images || []).filter(url => url && !url.includes('placehold.co'));
      const specs = Object.entries(product.specs || {}).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      setForm({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        price: product.price ?? '',
        originalPrice: product.originalPrice ?? '',
        stock: product.stockCount ?? '',
        images,
        specs: specs.length ? specs : [{ ...emptySpec }],
        tags: (product.tags || []).join(', '),
        isFeatured: Boolean(product.isFeatured),
        isTrending: Boolean(product.isTrending),
        isNew: Boolean(product.isNew),
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, product]);

  const selectedCategory = categories.find(category => category.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const changeCategory = (categoryId) => {
    const nextCategory = categories.find(category => category.id === categoryId);
    const validSubcategory = nextCategory?.subcategories?.some(
      subcategory => subcategory.id === form.subcategoryId
    );

    setForm(prev => ({
      ...prev,
      categoryId,
      subcategoryId: validSubcategory ? prev.subcategoryId : '',
    }));
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;

    if (form.images.length >= 8) {
      setError('You can add up to 8 images.');
      return;
    }

    if (!form.images.includes(url)) {
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    }

    setImageUrl('');
    setError('');
  };

  const removeImage = (url) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(image => image !== url) }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    if (form.images.length >= 8) {
      setError('You can add up to 8 images.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const data = await uploadImage(dataUrl);
      setForm(prev => ({ ...prev, images: [...prev.images, data.url].slice(0, 8) }));
    } catch (err) {
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateSpec = (index, key, value) => {
    setForm(prev => ({
      ...prev,
      specs: prev.specs.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [key]: value } : spec
      ),
    }));
  };

  const addSpec = () => {
    setForm(prev => ({ ...prev, specs: [...prev.specs, { ...emptySpec }] }));
  };

  const removeSpec = (index) => {
    setForm(prev => ({
      ...prev,
      specs: prev.specs.length > 1 ? prev.specs.filter((_, specIndex) => specIndex !== index) : prev.specs,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Product name must be at least 2 characters.');
      return;
    }

    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    if (!form.categoryId) {
      setError('Choose a category for this product.');
      return;
    }

    const price = Number(form.price);
    const originalPrice = form.originalPrice === '' ? price : Number(form.originalPrice);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price.');
      return;
    }

    if (!Number.isFinite(originalPrice) || originalPrice < 0) {
      setError('Enter a valid original price.');
      return;
    }

    if (originalPrice < price) {
      setError('Original price cannot be lower than the selling price.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of 0 or more.');
      return;
    }

    const specs = Object.fromEntries(
      form.specs
        .map(spec => [spec.key.trim(), spec.value.trim()])
        .filter(([key]) => key)
    );

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      brand: form.brand.trim(),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      price,
      originalPrice,
      stock,
      images: form.images,
      specs,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isNew: form.isNew,
    };

    setSaving(true);

    try {
      const data = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      onSaved(data.product);
    } catch (err) {
      setError(err.message || 'Unable to save this product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={product ? 'Edit Product' : 'Add Product'}
      subtitle={product ? 'Update the product details shown in your store.' : 'Add a new item to your catalog.'}
      onClose={saving ? () => {} : onClose}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-end gap-3">
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
            form="product-form"
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-xl bg-[#831843] text-white text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Product Name</span>
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              className={inputClass}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Brand</span>
            <input
              value={form.brand}
              onChange={e => update('brand', e.target.value)}
              placeholder="e.g. Sony"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Category</span>
            <select
              value={form.categoryId}
              onChange={e => changeCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Subcategory</span>
            <select
              value={form.subcategoryId}
              onChange={e => update('subcategoryId', e.target.value)}
              disabled={!form.categoryId || subcategories.length === 0}
              className={`${inputClass} disabled:bg-gray-50 disabled:text-[#6B756F]`}
            >
              <option value="">No subcategory</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
              ))}
            </select>
            {form.categoryId && subcategories.length === 0 && (
              <span className="block text-xs text-[#6B756F] mt-1">
                Add subcategories from the Categories section if you want to group this product further.
              </span>
            )}
          </label>
        </div>

        <div>
          <h3 className="font-display font-bold text-sm text-[#17211D] mb-3">Pricing & Stock</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-[#17211D] mb-1.5">Selling Price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => update('price', e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[#17211D] mb-1.5">Original Price ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={e => update('originalPrice', e.target.value)}
                placeholder="Leave blank for none"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[#17211D] mb-1.5">Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={e => update('stock', e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-sm text-[#17211D] mb-3">Images</h3>
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Paste an image URL"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="px-4 py-2.5 rounded-xl bg-[#831843]/8 text-[#831843] text-sm font-semibold hover:bg-[#831843]/15 transition-colors shrink-0"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#17211D] hover:bg-gray-50 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
            <span className="text-xs text-[#6B756F]">Up to 8 images. PNG, JPG or WebP under 5MB.</span>
          </div>

          {form.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {form.images.map(url => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6B756F] mt-3">No images added. A placeholder will be shown in the store.</p>
          )}
        </div>

        <div>
          <h3 className="font-display font-bold text-sm text-[#17211D] mb-3">Details</h3>
          <label className="block mb-4">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Description</span>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Describe the product, its features and what makes it special."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </label>

          <label className="block mb-4">
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Tags</span>
            <input
              value={form.tags}
              onChange={e => update('tags', e.target.value)}
              placeholder="headphones, audio, wireless"
              className={inputClass}
            />
            <span className="block text-xs text-[#6B756F] mt-1">Separate tags with commas.</span>
          </label>

          <div>
            <span className="block text-sm font-medium text-[#17211D] mb-1.5">Specifications</span>
            <div className="space-y-2">
              {form.specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={spec.key}
                    onChange={e => updateSpec(index, 'key', e.target.value)}
                    placeholder="e.g. Battery Life"
                    className={inputClass}
                  />
                  <input
                    value={spec.value}
                    onChange={e => updateSpec(index, 'value', e.target.value)}
                    placeholder="e.g. 30 hours"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="px-3 rounded-xl border border-gray-200 text-[#6B756F] hover:bg-gray-50 transition-colors shrink-0"
                    aria-label="Remove specification"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSpec}
              className="mt-2 text-sm font-semibold text-[#831843] hover:underline"
            >
              + Add specification
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-sm text-[#17211D] mb-3">Visibility</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { key: 'isFeatured', label: 'Featured', description: 'Show in the featured section' },
              { key: 'isTrending', label: 'Trending', description: 'Show in trending now' },
              { key: 'isNew', label: 'New Arrival', description: 'Add a new badge' },
            ].map(item => (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form[item.key] ? 'border-[#831843]/30 bg-[#831843]/5' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={e => update(item.key, e.target.checked)}
                  className="mt-0.5 accent-[#831843]"
                />
                <span>
                  <span className="block text-sm font-medium text-[#17211D]">{item.label}</span>
                  <span className="block text-xs text-[#6B756F]">{item.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
