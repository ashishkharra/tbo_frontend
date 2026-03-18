import axios from 'axios';
//const BASE_URL = 'http://localhost:3500/api';
//const BASE_URL = 'http://localhost:3500/api'
const BASE_URL = 'http://192.168.1.9:3500/api';
export const IMAGE_URL = 'http://192.168.29.176:3500';
//const BASE_URL = 'http://192.168.1.9:3500/api';
const getAuthHeaders = async () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export const loginApi = async (data: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    return err.response?.data || { success: false, message: "Server error" };
  }
};

export const ImportDatasetCsv = async (formData: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/dataset/import`,
      formData,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    return (
      err.response?.data || {
        success: false,
        message: "Server error",
      }
    );
  }
};

export const PostTboUsers = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/auth/users`,
      data,
      { headers }
    );

    console.log("API Response:", res.data);

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const DatasetImportHistory = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/dataset/import-history`
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const datasetAreaMapping = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/dataset/area-mapping`,
      data,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const getTboUsers = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/auth/users`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const getUserAssignmentsByToken = async (token: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/user-assignments/${token}?_t=${Date.now()}`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
}

export const getTboModules = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/auth/modules-code`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const UpdateTboUsers = async (id: any, data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.put(
      `${BASE_URL}/auth/users/${id}`,
      data,
      { headers }
    );

    console.log("UpdateTboUsers API Response:", res.data);

    return res.data;
  } catch (err: any) {
    console.error("UpdateTboUsers error:", err?.response?.data || err.message);

    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const DeleteTboUsers = async (id: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.delete(
      `${BASE_URL}/auth/users/${id}`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "DeleteTboUsers error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getProfile = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/auth/profile`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const TboUsersChangePassword = async (id: any, data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.put(
      `${BASE_URL}/auth/users/${id}/password`,
      data,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "TboUsersChangePassword error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const ChangeOwnPassword = async (id: any, data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.put(
      `${BASE_URL}/auth/users/${id}/change-password`,
      data,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "ChangeOwnPassword error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getModules = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/modules`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "getModules error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getDataAssignment = async (id: any) => {
  try {
    if (!id) {
      return {
        success: false,
        data: [],
        message: "Invalid id",
      };
    }

    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/user-assignment/${id}`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "getDataAssignment error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTboTeams = async (id: any) => {
  try {
    if (!id) {
      return {
        success: false,
        data: [],
        message: "Invalid id",
      };
    }

    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/team/users/${id}/members`,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "getDataAssignment error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const PostTboTeamMembers = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/team/users/parents`,
      data,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};

export const DeleteTboTeamMembers = async (id: any, parent_id: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.delete(
      `${BASE_URL}/team/users/${id}/parents/${parent_id}`,
      { headers }
    );

    console.log("API Response:", res.data);
    return res.data;

  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const getMasterFilter = async () => {
  try {

    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataset/master-filter`,
      { headers }
    );
    console.log("dfdfs", res)
    return res.data;
  } catch (err: any) {
    console.error(
      "getDataAssignment error:",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};


export const getSubFilter = async (filters: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataset/sub-filter`,
      {
        headers,
        params: filters
      }
    );
    console.log("getSubFilter API Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("getSubFilter Error:", err);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTableDataByMasterFilter = async (queryString = "") => {
  try {
    const headers = await getAuthHeaders();

    const url = queryString
      ? `${BASE_URL}/dataset/voters?${queryString}`
      : `${BASE_URL}/dataset/voters`;

    const res = await axios.get(url, { headers });

    return res.data;
  } catch (err: any) {
    console.error("getTableDataByMasterFilter error:", err?.response?.data || err.message);

    return {
      success: false,
      data: [],
      total: 0,
      totalPages: 0,
      page: 1,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

// Add this function to build query string with pagination
export const buildVoterQueryString = (filters: any, page: any, limit: any) => {
  const queryParams = new URLSearchParams();

  // Add filters
  if (filters.block_city) queryParams.append("block_city", filters.block_city);
  if (filters.distt) queryParams.append("distt", filters.distt);
  if (filters.ac_no) queryParams.append("ac_no", filters.ac_no);
  if (filters.pc_no) queryParams.append("pc_no", filters.pc_no);

  // Add pagination
  queryParams.append("page", page);
  queryParams.append("limit", limit);

  return queryParams.toString();
};

export const updateDataset = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.patch(
      `${BASE_URL}/dataset/update`,
      data,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
          "Accept": "application/json",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("Update error:", err.response?.data || err.message);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};


// export const deletedataset = async (data) => {
//   try {
//     const headers = await getAuthHeaders();

//     const res = await axios.delete(
//       `${BASE_URL}/dataset/delete`,
//       data,
//       { headers }
//     );
//     return res.data;
//   } catch (err: any) {
//     console.error("Update error:", err.response?.data || err.message);
//     return {
//       success: false,
//       data: [],
//       message: err.response?.data?.message || "Server error",
//     };
//   }
// };

export const getDataIdRow = async (queryString = "") => {
  try {
    const headers = await getAuthHeaders();
    const url = queryString
      ? `${BASE_URL}/dataid/get-dataid-row?${queryString}`
      : `${BASE_URL}/dataid/get-dataid-row`;

    const res = await axios.get(url, { headers });
    console.log("getDataIdRow API Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "/dataid/get-dataid-row",
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};


export const updateDataIdRow = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.patch(
      `${BASE_URL}/dataid/update-dataid-row`,
      data,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    console.error("Update error:", err.response?.data || err.message);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const getDataIdAllRow = async () => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BASE_URL}/dataid/get-dataid-all-rows`;

    const res = await axios.get(url, { headers });
    return res.data;
  } catch (err: any) {
    console.error(
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};


export const importEnRollData = async (formData: any, data_id: any, ac_no: any) => {
  try {
    const headers = await getAuthHeaders();
    headers['Content-Type'] = 'multipart/form-data';

    formData.append('data_id', data_id.toString());
    formData.append('ac_no', ac_no.toString());

    const url = `${BASE_URL}/dataid/import-eroll-data`;

    const res = await axios.post(url, formData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return res.data;
  } catch (err: any) {
    console.error('Import eroll data error:', err?.response?.data || err.message);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.error || err?.response?.data?.message || "Server error",
    };
  }
};


export const volterListMasterFilter = async () => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BASE_URL}/dataid/voter-list-master-filter`;

    const res = await axios.get(url, { headers });

    console.log('res data ->>> ', res.data)
    return res.data;
  } catch (err: any) {
    console.error(
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};


export const volterMasterFilterGo = async (params: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BASE_URL}/dataid/master-filter`;

    const queryString: string = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    const res = await axios.get(fullUrl, { headers });

    console.log(res.data)
    return res.data;
  } catch (err: any) {
    console.error(err?.response?.data || err.message);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};


export const getVoterListSubFilter = async (filters: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataid/sub-filter`,
      {
        headers,
        params: filters
      }
    );
    // console.log("getSubFilter API Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("getSubFilter Error:", err);

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const filterPrintRegister = async (params: any = {}) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${BASE_URL}/dataid/get/wise/cast`;

    const res = await axios.get(url, {
      headers,
      params
    });
    console.log("filterPrintRegister API Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      err?.response?.data || err.message
    );

    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const downloadPrintRegister = async (data: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/dataid/print/register`,
      data,
      {
        headers,
        responseType: 'blob'
      }
    );

    return {
      success: true,
      data: res.data,
      contentType: res.headers['content-type']
    };
  } catch (err: any) {
    console.error("Download error:", err.response?.data || err.message);

    if (err.response?.data instanceof Blob) {
      const errorText = await err.response.data.text();
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          message: errorJson.message || "Server error",
        };
      } catch {
        return {
          success: false,
          message: "Server error",
        };
      }
    }

    return {
      success: false,
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const downloadBlankRegister = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataid/download-blank-register`,
      {
        headers,
        responseType: 'blob'
      }
    );

    return {
      success: true,
      data: res.data,
      contentType: res.headers['content-type']
    };
  } catch (err: any) {
    console.error("Download error:", err.response?.data || err.message);

    if (err.response?.data instanceof Blob) {
      const errorText = await err.response.data.text();
      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          message: errorJson.message || "Server error",
        };
      } catch {
        return {
          success: false,
          message: "Server error",
        };
      }
    }

    return {
      success: false,
      message: err.response?.data?.message || "Server error",
    };
  }
};



export const dataidImportMasterTable = async (filters: any = {}) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataid/get/master/tables`,
      {
        headers,
        params: {
          ...filters
        }
      }
    );

    return res.data;
  } catch (err: any) {
    console.error("Error in dataidImportMasterTable:", err);

    return {
      success: false,
      data: { result: [], filters: { status: [], data_id: [] } },
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const addRowInDataIdImportMaster = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/dataid/add-row`,
      payload,
      { headers }
    );

    return res.data;
  } catch (err: any) {
    console.error("Error in addRowInDataIdImportMaster:", err);

    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const dataidMapingMaster = async (filters = {}) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataid/get/mapping/tables`,
      {
        headers,
        params: {
          ...filters
        }
      }
    );
    console.log("dataidMapingMaster API Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error in dataidImportMasterTable:", err);

    return {
      success: false,
      data: { result: [], filters: { status: [], data_id: [] } },
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const generateSurnamesApi = async (dataIds: string[]) => {
  try {
    const headers = await getAuthHeaders();

    // console.log('dat a>>>>>>> ', dataIds)

    const res = await axios.post(
      `${BASE_URL}/dataid/generate/surnames`,
      { data_id: dataIds },
      { headers }
    );

    // console.log("generateSurnamesApi Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error in generateSurnamesApi:", err);

    return {
      success: false,
      message: err?.response?.data?.message || err.message || "Server error",
      data: null,
    };
  }
};

export const generateIdsApi = async (dataIds: string[]) => {
  try {
    const headers = await getAuthHeaders();
    // console.log('dat a>>>>>>> ', dataIds)
    const res = await axios.post(
      `${BASE_URL}/dataid/generate/ids`,
      { data_id: dataIds },
      { headers }
    );

    // console.log("generateSurnamesApi Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error in generateIdsApi:", err);

    return {
      success: false,
      message: err?.response?.data?.message || err.message || "Server error",
      data: null,
    };
  }
}

export const getYojnaListApi = async (dataId: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/dataid/yojna/list`,
      { data_id: dataId },
      { headers }
    );

    return res.data;

  } catch (err: any) {
    console.error("Error in getYojnaListApi:", err);

    return {
      success: false,
      message: err?.response?.data?.message || err.message || "Server error",
      data: null,
    };
  }
};

export const updateMappingBatch = async (updates: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.patch(
      `${BASE_URL}/dataid/mapping-to-db`,
      updates,
      {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("Update error:", err.response?.data || err.message);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const DownloadBoothMaping = async (data_id: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/dataid/download-mapping`,
      {
        params: { data_id },
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        responseType: 'blob',
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("Download error:", err.response?.data || err.message);
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const getPermissionModulesApi = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(`
      ${BASE_URL}/auth/get/permission/modules`,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    console.error("Error in getPermissionModulesApi:", err);

    return {
      success: false,
      message: err?.response?.data?.message || err.message || "Server error",
      data: null,
    };
  }
};


export const getTableColumns = async (tableName: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/auth/get/table/columns?table=${tableName}`,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: "Server error",
    };
  }
};
export const getUserPermissions = async (userId: number) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.get(
      `${BASE_URL}/auth/user-permissions/${userId}`,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};

export const UserPermissionsAssign = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await axios.post(
      `${BASE_URL}/auth/users/assign-modules`,
      payload,
      { headers }
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err.response?.data?.message || "Server error",
    };
  }
};
