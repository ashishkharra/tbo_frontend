// This is a stub for fetching wise options for a given dataId and type
// Replace with your real API logic



// Map wise type to backend field and label
const wiseTypeToField: Record<string, { field: string; label: string; isObjectArray?: boolean }> = {
  'Bhag': { field: 'bhags', label: 'भाज' },
  'Village': { field: 'grams', label: 'गांव' },
  'GP': { field: 'gps', label: 'ग्राम पंचायत' },
  'Block': { field: 'blocks', label: 'ब्लॉक' },
  'Party Kendra': { field: 'booths', label: 'पार्टी केंद्र', isObjectArray: true },
  'Section': { field: 'sections', label: 'सेक्शन' },
};

export async function fetchWiseOptions(dataId: string, type: string): Promise<{ id: string; name: string }[]> {
  if (!dataId || !type) return [];
  const config = wiseTypeToField[type];
  if (!config) return [];
  try {
    const res = await fetch(`/api/booth-mapping/hierarchy-options?dataId=${encodeURIComponent(dataId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (type === 'Bhag') {
      // Backend returns array of {id, name}
      const arr: { id: string; name: string }[] = data[config.field] || [];
      // Remove empty/null/undefined and deduplicate by id
      const unique = Array.from(new Map(arr.filter(v => v && v.id).map(v => [v.id, v])).values());
      return unique;
    } else if (config.isObjectArray) {
      const arr: { id: string; name: string }[] = data[config.field] || [];
      const unique = Array.from(new Map(arr.filter(v => v && v.id && v.name).map(v => [v.id, v])).values());
      return unique;
    } else {
      const values: string[] = data[config.field] || [];
      const unique = Array.from(new Set(values.filter(v => v && v.trim())));
      return unique.map((v) => ({ id: v, name: v }));
    }
  } catch (e) {
    return [];
  }
}
