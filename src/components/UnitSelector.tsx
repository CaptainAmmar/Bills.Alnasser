import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface UnitSelectorProps {
  name: string;
  defaultValue?: string;
  label?: string;
}

const DEFAULT_UNITS = ['لفة', 'قطعة', 'طرد', 'راس', 'ربطة'];

export default function UnitSelector({ name, defaultValue = '', label = 'الوحدة' }: UnitSelectorProps) {
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [selectedUnit, setSelectedUnit] = useState(defaultValue);
  const [isAdding, setIsAdding] = useState(false);
  const [newUnit, setNewUnit] = useState('');

  useEffect(() => {
    if (defaultValue && !DEFAULT_UNITS.includes(defaultValue)) {
      setUnits(prev => Array.from(new Set([...prev, defaultValue])));
    }
    setSelectedUnit(defaultValue);
  }, [defaultValue]);

  const handleAddUnit = () => {
    if (newUnit && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setSelectedUnit(newUnit);
      setNewUnit('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold">{label}</label>
      {isAdding ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="وحدة جديدة..."
            className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-primary"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddUnit}
            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="flex-1 p-2 border rounded-lg text-sm bg-white"
          >
            <option value="">اختر الوحدة...</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
            title="إضافة وحدة جديدة"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
      <input type="hidden" name={name} value={selectedUnit} />
    </div>
  );
}
