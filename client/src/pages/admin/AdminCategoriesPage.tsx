import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { FolderTree, Plus, Layers, Check } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Field Modal
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [selectedCatForField, setSelectedCatForField] = useState<any>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForField) return;
    setIsSaving(true);
    const token = localStorage.getItem('dd_token');

    let optionsParsed: string[] | null = null;
    if (fieldType === 'dropdown' && fieldOptions) {
      optionsParsed = fieldOptions.split(',').map((s) => s.trim());
    }

    try {
      const res = await fetch('/api/admin/category-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: selectedCatForField.id,
          fieldName,
          label: fieldLabel,
          fieldType,
          options: optionsParsed,
          isRequired,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`New dynamic field "${fieldLabel}" added to ${selectedCatForField.name}!`);
        setFieldModalOpen(false);
        fetchCategories();
      } else {
        alert(data.message || 'Failed to add field.');
      }
    } catch (err) {
      alert('Error creating category field.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          CATEGORY & DYNAMIC FORM BUILDER
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Add or edit categories and requirement specification form fields without code changes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-6 bg-white border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="orange">{cat.slug}</Badge>
                <span className="text-xs font-mono text-neutral-400">
                  {cat.commissionPct}% Commission
                </span>
              </div>

              <h3 className="font-dot text-lg font-bold text-neutral-900 mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                {cat.description}
              </p>

              {/* Dynamic fields count & preview */}
              <div className="border-t border-dashed border-neutral-200 pt-3 mb-4">
                <span className="font-mono text-[11px] uppercase text-neutral-400 font-bold block mb-1">
                  Dynamic Fields ({cat.fields?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.fields?.map((f: any) => (
                    <span key={f.id} className="text-[10px] font-mono bg-white text-neutral-700 px-2 py-0.5 rounded border border-[#D9D9D9] shadow-2xs">
                      {f.label} ({f.fieldType})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCatForField(cat);
                setFieldLabel('');
                setFieldName('');
                setFieldType('text');
                setFieldOptions('');
                setFieldModalOpen(true);
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="w-full justify-center"
            >
              Add Dynamic Field
            </Button>
          </Card>
        ))}
      </div>

      {/* ADD FIELD MODAL */}
      <Modal
        isOpen={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        title="ADD DYNAMIC FORM FIELD"
        subtitle={`Appending parameter to ${selectedCatForField?.name}`}
      >
        <form onSubmit={handleAddFieldSubmit} className="space-y-4">
          <Input
            label="Field Label (shown to customer)"
            value={fieldLabel}
            onChange={(e) => {
              setFieldLabel(e.target.value);
              setFieldName(e.target.value.toLowerCase().replace(/\s+/g, ''));
            }}
            placeholder="e.g. Thickness Specification"
            required
          />

          <Input
            label="JSON Field Identifier"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g. thicknessSpec"
            required
          />

          <Select
            label="Input Field Type"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            options={[
              { value: 'text', label: 'Single-line Text' },
              { value: 'number', label: 'Numeric Value' },
              { value: 'dropdown', label: 'Select Dropdown' },
              { value: 'toggle', label: 'Boolean Toggle (Yes/No)' },
            ]}
          />

          {fieldType === 'dropdown' && (
            <Input
              label="Dropdown Options (comma-separated)"
              value={fieldOptions}
              onChange={(e) => setFieldOptions(e.target.value)}
              placeholder="e.g. 12mm, 16mm, 19mm, 25mm"
              required
            />
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is-req"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <label htmlFor="is-req" className="text-xs font-mono text-neutral-700 cursor-pointer">
              Mark as required field
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button variant="secondary" type="button" onClick={() => setFieldModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit" isLoading={isSaving}>
              Save Field to Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
