'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { apiClient } from '@/utils/apiUrl';

type ColumnPermission = {
  columnName: string;
  can_view: boolean;
  can_edit: boolean;
  can_mask: boolean;
  isJsonField?: boolean;
  category?: 'regular' | 'mapping' | 'other';
};

interface ColumnPermissionsManagerProps {
  tableName: 'live_voter_list' | 'live_booth_mapping';
  userId: number;
  userLabel?: string;
  onSave?: () => void;
}

export const ColumnPermissionsManager = forwardRef<{ save: () => Promise<void> }, ColumnPermissionsManagerProps>(
  ({ tableName, userId, userLabel, onSave }, ref) => {
    const [columns, setColumns] = useState<ColumnPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      const load = async () => {
        if (!userId) {
          setColumns([]);
          return;
        }
        try {
          setLoading(true);
          let importType: 'voter_list' | 'adv_voter_list' | 'booth_mapping' | null = null;
          if (tableName === 'live_voter_list') importType = 'voter_list';
          else if (tableName === 'live_booth_mapping') importType = 'booth_mapping';

          let columnNames: string[] = [];
          if (importType) {
            const data = await apiClient.request(`/table-columns/${importType}`, 'GET', undefined, true);
            if (data && data.success && Array.isArray(data.columns)) {
              columnNames = data.columns.map((c: any) => c.columnName);
            }
          }

          // Add mapping JSON fields for live_voter_list
          const mappingFields = tableName === 'live_voter_list' ? [
            'mapping.village_id',
            'mapping.gp_id',
            'mapping.block_id',
            'mapping.pin_code_id',
            'mapping.post_office_id',
            'mapping.police_station_id',
            'mapping.party_kendra_id',
            'mapping.mandal_id',
            'mapping.psb_id',
            'mapping.coordinate_id'
          ] : [];

          // Define which columns are "other details"
          const otherDetailsFields = tableName === 'live_voter_list' ? [
            'proffcity', 'castName', 'castNew', 'newcastId', 
            'cast_category', 'castCategory', 'sub_cast', 'subCast',
            'acNo', 'family_id', 'data_id', 
            'profession_id', 'profession_name', 'profession_city',
            'education_id', 'education_name',
            'bank_account_name', 'account_no', 'bank_ifsc', 'upi_id', 'aadhar_no',
            'created_at', 'updated_at'
          ] : tableName === 'live_booth_mapping' ? [
            'ru', 'pin_code', 'pin_code_id', 'post_office', 'post_office_id',
            'police_station', 'police_station_id', 'party_kendra', 'party_kendra_id',
            'mandal', 'mandal_id', 'psb_en', 'psb_hi', 'psb_id',
            'cordinate', 'coordinate_id', 'created_at', 'updated_at'
          ] : [];

          const mappingFieldsSet = new Set(mappingFields);
          const otherDetailsSet = new Set(otherDetailsFields);

          const permsData = await apiClient.request(
            `/table-permissions?table=${encodeURIComponent(tableName)}&userId=${encodeURIComponent(
              String(userId)
            )}`,
            'GET',
            undefined,
            true
          );
          const permsMap = new Map<string, ColumnPermission>();
          if (permsData && permsData.success && Array.isArray(permsData.permissions)) {
            permsData.permissions.forEach((p: any) => {
              const isMapping = p.column_name?.startsWith('mapping.');
              const isOther = otherDetailsSet.has(p.column_name);
              permsMap.set(p.column_name, {
                columnName: p.column_name,
                can_view: !!p.can_view,
                can_edit: !!p.can_edit,
                can_mask: !!p.can_mask,
                isJsonField: isMapping,
                category: isMapping ? 'mapping' : isOther ? 'other' : 'regular'
              });
            });
          }

          // Categorize regular columns
          const regularColumns: ColumnPermission[] = columnNames
            .filter(name => !mappingFieldsSet.has(name) && !otherDetailsSet.has(name))
            .map((name) => {
              const existing = permsMap.get(name);
              if (existing) return existing;
              return { columnName: name, can_view: true, can_edit: true, can_mask: false, isJsonField: false, category: 'regular' };
            });

          // Merge mapping fields
          const jsonColumns: ColumnPermission[] = mappingFields.map((name) => {
            const existing = permsMap.get(name);
            if (existing) return existing;
            return { columnName: name, can_view: true, can_edit: true, can_mask: false, isJsonField: true, category: 'mapping' };
          });

          // Merge other details fields
          const otherColumns: ColumnPermission[] = columnNames
            .filter(name => otherDetailsSet.has(name))
            .map((name) => {
              const existing = permsMap.get(name);
              if (existing) return existing;
              return { columnName: name, can_view: true, can_edit: true, can_mask: false, isJsonField: false, category: 'other' };
            });

          setColumns([...regularColumns, ...jsonColumns, ...otherColumns]);
        } catch (err) {
          console.error('Error loading permissions for table', tableName, err);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [tableName, userId]);

    const toggle = (columnName: string, field: keyof ColumnPermission) => {
      setColumns(prev =>
        prev.map(c => {
          if (c.columnName !== columnName) return c;
          const next = { ...c };

          if (field === 'can_view') {
            next.can_view = !next.can_view;
            if (!next.can_view) {
              next.can_edit = false;
              next.can_mask = false;
            }
          } else if (field === 'can_edit') {
            const newEdit = !next.can_edit;
            next.can_edit = newEdit;
            if (newEdit) {
              next.can_view = true;
              next.can_mask = false;
            }
          } else if (field === 'can_mask') {
            const newMask = !next.can_mask;
            next.can_mask = newMask;
            if (newMask) {
              next.can_view = true;
              next.can_edit = false;
            }
          }

          return next;
        })
      );
    };

    const handleSave = async () => {
      try {
        setSaving(true);
        await apiClient.request(
          '/table-permissions/bulk',
          'PUT',
          {
            tableName,
            userId,
            permissions: columns.map((c) => ({
              columnName: c.columnName,
              can_view: c.can_view,
              can_edit: c.can_edit,
              can_mask: c.can_mask,
            })),
          } as any,
          true
        );
        if (onSave) onSave();
      } catch (err) {
        console.error('Error saving table permissions:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: handleSave
    }), [columns, tableName, userId]);

    // Separate columns by category
    const regularColumns = columns.filter(c => c.category === 'regular' || (!c.category && !c.isJsonField));
    const mappingColumns = columns.filter(c => c.category === 'mapping' || c.isJsonField);
    const otherColumns = columns.filter(c => c.category === 'other');

    const renderColumnSection = (cols: ColumnPermission[], sectionTitle?: string) => (
      <div className="mb-6">
        {sectionTitle && (
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">{sectionTitle}</h3>
        )}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                    Column
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    View
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    Edit
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    Mask
                  </th>
                </tr>
              </thead>
              <tbody>
                {cols.slice(0, Math.ceil(cols.length / 2)).map((col) => (
                  <tr key={col.columnName} className="hover:bg-gray-50/80">
                    <td className="border border-gray-200 px-2 py-1.5 text-[10px] font-mono">{col.columnName}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_view}
                        onChange={() => toggle(col.columnName, 'can_view')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_edit}
                        onChange={() => toggle(col.columnName, 'can_edit')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_mask}
                        onChange={() => toggle(col.columnName, 'can_mask')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide">
                    Column
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    View
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    Edit
                  </th>
                  <th className="border border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide">
                    Mask
                  </th>
                </tr>
              </thead>
              <tbody>
                {cols.slice(Math.ceil(cols.length / 2)).map((col) => (
                  <tr key={col.columnName} className="hover:bg-gray-50/80">
                    <td className="border border-gray-200 px-2 py-1.5 text-[10px] font-mono">{col.columnName}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_view}
                        onChange={() => toggle(col.columnName, 'can_view')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_edit}
                        onChange={() => toggle(col.columnName, 'can_edit')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={col.can_mask}
                        onChange={() => toggle(col.columnName, 'can_mask')}
                        className="w-3.5 h-3.5 text-gray-600 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    if (loading) {
      return (
        <div className="py-6 text-center text-sm text-gray-500">Loading columns...</div>
      );
    }

    if (columns.length === 0) {
      return (
        <div className="py-6 text-center text-sm text-gray-500">No columns found for this table.</div>
      );
    }

    return (
      <div className="space-y-4">
        {userLabel && (
          <div className="text-sm text-gray-600 mb-4">
            Managing permissions for: <span className="font-semibold">{userLabel}</span>
          </div>
        )}
        {regularColumns.length > 0 && renderColumnSection(regularColumns, 'Regular Columns')}
        {mappingColumns.length > 0 && renderColumnSection(mappingColumns, 'Mapping Fields (JSON)')}
        {otherColumns.length > 0 && renderColumnSection(otherColumns, 'Other Details')}
      </div>
    );
  }
);

ColumnPermissionsManager.displayName = 'ColumnPermissionsManager';
