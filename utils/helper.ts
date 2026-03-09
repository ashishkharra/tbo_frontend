function validateEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
 
function validatePhone(phone: string) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

const mapOptionsWithId = (
  items: any[],
  idKey: string,
  nameKey: string
) => {
  const options = new Set<string>();

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item && item[idKey] && item[nameKey]) {
        options.add(`${item[idKey]} - ${item[nameKey]}`);
      }
    });
  }

  return options;
};

// Helper function to map frontend filter names to backend expected names
const mapFiltersToBackend = (filters: any) => {
  return {
    // Keep as is
    data_id: filters.data_id,
    ac_no: filters.ac_no,
    pc_no: filters.pc_no,
    district_id: filters.district_id,
    
    // Map sub filter fields
    lbt: filters.lbt,
    gram: filters.gram, // This should already be village_id
    gp: filters.gp, // This should already be gp_ward_id
    bhag_no: filters.bhagNo, // Map to backend field name if different
    section_no: filters.sectionNo, // Map to backend field name if different
    mobile: filters.mobile,
    cast_id: filters.castId, // Map to backend field name if different
    name: filters.name,
    surname: filters.surname,
    gender: filters.gender,
    
    // More filters
    block_id: filters.block, // Map to backend field name if different
    mandal_id: filters.mandal, // Map to backend field name if different
    kendra_id: filters.kendra, // Map to backend field name if different
    hno: filters.hno,
    age_from: filters.ageFrom, // Map to backend field name if different
    age_to: filters.ageTo, // Map to backend field name if different
    dob: filters.dob,
    profession: filters.profession_name, // Map to backend field name if different
    
    // Level 2 filters
    aadhar: filters.aadhar,
    post_office: filters.postOffice, // Map to backend field name if different
    pin_code: filters.pinCode, // Map to backend field name if different
    police_station: filters.policeStation, // Map to backend field name if different
    education: filters.edu, // Map to backend field name if different
    mukhiya: filters.mukhiya,
    
    page: filters.page,
    limit: filters.limit
  };
};

const getOriginalKey = (backendKey: string): string => {
  const mapping: Record<string, string> = {
    'village_id': 'gram',
    'gp_ward_id': 'gp',
    'bhag_no': 'bhagNo',
    'sec_no': 'sectionNo',
    'phone1': 'mobile',
    'castid': 'castId',
    'vname': 'name',
    'surname': 'surname',
    'sex': 'gender',
    'block_id': 'block',
    'mandal_id': 'mandal',
    'kendra_id': 'kendra',
    'proff_id': 'profession_name',
    'post_office': 'postOffice',
    'pin_code': 'pinCode',
    'police_station': 'policeStation',
    'edu_id': 'edu'
  };
  return mapping[backendKey] || backendKey;
};

export { validateEmail, validatePhone, mapOptionsWithId, mapFiltersToBackend, getOriginalKey};