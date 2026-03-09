
import React, { useEffect, useState } from 'react';
import { fetchWiseOptions } from './apiWiseOptions';

interface MultiSelectCheckboxProps {
  rowId: number;
  type: string;
  dataId: string;
  selected: string[];
  onChange: (vals: string[]) => void;
  closeOnSelect?: boolean;
}

const MultiSelectCheckbox: React.FC<MultiSelectCheckboxProps> = ({ rowId, type, dataId, selected, onChange, closeOnSelect }) => {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type && dataId) {
      setLoading(true);
      fetchWiseOptions(dataId, type).then(opts => {
        setOptions(opts);
        setLoading(false);
      });
    } else {
      setOptions([]);
    }
  }, [type, dataId]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleCheck = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(val => val !== id));
    } else {
      onChange([...selected, id]);
      if (closeOnSelect) setOpen(false);
    }
  };

  if (!type || !dataId) return null;

  return (
    <div ref={containerRef} style={{ minWidth: 200, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 50 }}>
      <div
        style={{ minWidth: 180, border: '1px solid #eee', borderRadius: 4, padding: 8, background: '#fafbfc', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        {selected.length === 0 ? <span style={{ color: '#888', fontSize: 13 }}>Select...</span> : selected.map(id => {
          const opt = options.find(o => o.id === id);
          return opt ? (
            <span key={id} style={{ marginRight: 6 }}>{opt.id}{opt.name && opt.name.trim() && ` (${opt.name})`}</span>
          ) : null;
        })}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, maxHeight: 180, minWidth: 180, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 8, background: '#fafbfc', marginTop: 2 }}>
          {loading ? (
            <div>Loading...</div>
          ) : options.length === 0 ? (
            <span style={{ color: '#888', fontSize: 13 }}>No options</span>
          ) : (
            <>
              <label key="select-all" style={{ display: 'block', marginBottom: 6, fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected.length === options.length && options.length > 0}
                  ref={el => {
                    if (el) {
                      el.indeterminate = selected.length > 0 && selected.length < options.length;
                    }
                  }}
                  onChange={() => {
                    if (selected.length === options.length) {
                      onChange([]);
                    } else {
                      onChange(options.map(opt => opt.id));
                    }
                  }}
                />{' '}
                Select All
              </label>
              {options.map(opt => (
                <label key={opt.id} style={{ display: 'block', marginBottom: 4, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.id)}
                    onChange={() => handleCheck(opt.id)}
                  />{' '}
                  {opt.id}{opt.name && opt.name.trim() && ` (${opt.name})`}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectCheckbox;
