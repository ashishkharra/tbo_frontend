import axios from "axios";

const BASE_URL = "http://192.168.29.176:3500/api";
// const BASE_URL = "http://localhost:3500/api";
// const BASE_URL = "http://192.168.1.9:3500/api";

export const IMAGE_URL = "http://localhost:3500";

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userinfo");
  localStorage.removeItem("authToken");
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("session_token");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("userinfo");
};

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    const authHeaders = getAuthHeaders();

    config.headers = {
      ...authHeaders,
      ...(config.headers || {}),
    };

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: any) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.message || "";
    const sessionExpired = data?.sessionExpired;

    const shouldLogout =
      status === 401 ||
      // status === 403 ||
      sessionExpired === true ||
      message === "Session expired or invalid" ||
      message === "Invalid authentication token" ||
      message === "Unauthorized access" ||
      message === "Authentication failed" ||
      // message === "Invalid access" ||
      message === "User account is inactive";

    if (shouldLogout) {
      clearAuthStorage();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

const getErrorResponse = (err: any, fallbackMessage = "Server error", fallbackData: any = []) => {
  return (
    err?.response?.data || {
      success: false,
      data: fallbackData,
      message: fallbackMessage,
    }
  );
};

export const CheckAccess = async (accessKey: string) => {
  try {
    const res = await axiosInstance.get(`/access-check/${accessKey}`);
    return res.data;
  } catch (err: any) {
    return (
      err?.response?.data || {
        success: false,
        allowed: false,
        message: "Server error",
      }
    );
  }
};

export const ImportDatasetCsv = async (formData: FormData) => {
  try {
    const res = await axiosInstance.post(`/dataset/import`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const PostTboUsers = async (data: any) => {
  try {
    const res = await axiosInstance.post(`/auth/users`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTboUserDetails = async (id: number | string) => {
  try {
    const res = await axiosInstance.get(`/auth/users/${id}/details`);
    return res.data;
  } catch (err: any) {
    return (
      err?.response?.data || {
        success: false,
        message: "Server error",
        data: {},
      }
    );
  }
};

export const DatasetImportHistory = async () => {
  try {
    const res = await axiosInstance.get(`/dataset/import-history`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const datasetAreaMapping = async (data: any) => {
  try {
    const res = await axiosInstance.post(`/dataset/area-mapping`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTboUsers = async (params: any = {}) => {
  try {
    const res = await axiosInstance.get(`/auth/users`, { params });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        itemsPerPage: 1000,
        totalItems: 0,
        totalPages: 0,
      },
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const BulkUpdateTboUsers = async (users: any[]) => {
  try {
    const res = await axiosInstance.patch(`/auth/users/bulk-update`, { users });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
      data: [],
    };
  }
};

export const getUserAssignmentsByToken = async (token: any) => {
  try {
    const res = await axiosInstance.get(
      `/user-assignments/${token}?_t=${Date.now()}`
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTboModules = async () => {
  try {
    const res = await axiosInstance.get(`/auth/modules-code`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const UpdateTboUsers = async (id: any, data: any) => {
  try {
    const res = await axiosInstance.put(`/auth/users/${id}`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const DeleteTboUsers = async (id: any) => {
  try {
    const res = await axiosInstance.delete(`/auth/users/${id}`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getProfile = async () => {
  try {
    const res = await axiosInstance.get(`/auth/profile`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const TboUsersChangePassword = async (id: any, data: any) => {
  try {
    const res = await axiosInstance.put(`/auth/users/${id}/password`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const ChangeOwnPassword = async (id: any, data: any) => {
  try {
    const res = await axiosInstance.put(`/auth/users/${id}/change-password`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getModules = async () => {
  try {
    const res = await axiosInstance.get(`/modules`);
    return res.data;
  } catch (err: any) {
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

    const res = await axiosInstance.get(`/user-assignment/${id}`);
    return res.data;
  } catch (err: any) {
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

    const res = await axiosInstance.get(`/team/users/${id}/members`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const PostTboTeamMembers = async (data: any) => {
  try {
    const res = await axiosInstance.post(`/team/users/parents`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const DeleteTboTeamMembers = async (id: any, parent_id: any) => {
  try {
    const res = await axiosInstance.delete(
      `/team/users/${id}/parents/${parent_id}`
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getMasterFilter = async () => {
  try {
    const res = await axiosInstance.get(`/dataset/master-filter`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const ApplyAccessCodesToUser = async (payload: any) => {
  try {
    const res = await axiosInstance.post(
      `/user-assignments/apply-access-codes`,
      payload
    );
    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const getSubFilter = async (filters: any) => {
  try {
    const res = await axiosInstance.get(`/dataset/sub-filter`, {
      params: filters,
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getTableDataByMasterFilter = async (queryString = "") => {
  try {
    const url = queryString ? `/dataset/voters?${queryString}` : `/dataset/voters`;
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (err: any) {
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

export const buildVoterQueryString = (filters: any, page: any, limit: any) => {
  const queryParams = new URLSearchParams();

  if (filters.block_city) queryParams.append("block_city", filters.block_city);
  if (filters.distt) queryParams.append("distt", filters.distt);
  if (filters.ac_no) queryParams.append("ac_no", filters.ac_no);
  if (filters.pc_no) queryParams.append("pc_no", filters.pc_no);

  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  return queryParams.toString();
};

export const updateDataset = async (data: any) => {
  try {
    const res = await axiosInstance.patch(`/dataset/update`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getDataIdRow = async (queryString = "") => {
  try {
    const url = queryString
      ? `/dataid/get-dataid-row?${queryString}`
      : `/dataid/get-dataid-row`;

    const res = await axiosInstance.get(url);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const updateDataIdRow = async (data: any) => {
  try {
    const res = await axiosInstance.patch(`/dataid/update-dataid-row`, data);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getDataIdAllRow = async () => {
  try {
    const res = await axiosInstance.get(`/dataid/get-dataid-all-rows`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const importEnRollData = async (
  formData: FormData,
  data_id: any,
  ac_no: any
) => {
  try {
    formData.append("data_id", String(data_id));
    formData.append("ac_no", String(ac_no));

    const res = await axiosInstance.post(`/dataid/import-eroll-data`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message:
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Server error",
    };
  }
};

export const volterListMasterFilter = async () => {
  try {
    const res = await axiosInstance.get(`/dataid/voter-list-master-filter`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const volterMasterFilterGo = async (params: any = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString
      ? `/dataid/master-filter?${queryString}`
      : `/dataid/master-filter`;

    const res = await axiosInstance.get(fullUrl);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getVoterListSubFilter = async (filters: any) => {
  try {
    const res = await axiosInstance.get(`/dataid/sub-filter`, {
      params: filters,
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const filterPrintRegister = async (params: any = {}) => {
  try {
    const res = await axiosInstance.get(`/dataid/get/wise/cast`, { params });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const downloadPrintRegister = async (data: any) => {
  try {
    const res = await axiosInstance.post(`/dataid/print/register`, data, {
      responseType: "blob",
    });

    return {
      success: true,
      data: res.data,
      contentType: res.headers["content-type"],
    };
  } catch (err: any) {
    if (err?.response?.data instanceof Blob) {
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
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const downloadBlankRegister = async () => {
  try {
    const res = await axiosInstance.get(`/dataid/download-blank-register`, {
      responseType: "blob",
    });

    return {
      success: true,
      data: res.data,
      contentType: res.headers["content-type"],
    };
  } catch (err: any) {
    if (err?.response?.data instanceof Blob) {
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
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const dataidImportMasterTable = async (filters: any = {}) => {
  try {
    const res = await axiosInstance.get(`/dataid/get/master/tables`, {
      params: { ...filters },
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: { result: [], filters: { status: [], data_id: [] } },
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const deleteMasterRowApi = async (payload: { table: string; id: number; data_id: number | string; }) => {
  try {
    const res = await axiosInstance.delete(`/dataid/delete/master/row`, {
      data: payload,
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
      error: err?.response?.data || null,
    };
  }
};

export const saveMasterPatchApi = async (payload: {
  table: string;
  id: number;
  data_id: number | string;
  updates: Record<string, any>;
}) => {
  try {
    const res = await axiosInstance.patch(`/dataid/save/master/patch`, payload);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
      error: err?.response?.data || null,
    };
  }
};

export const addRowInDataIdImportMaster = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/dataid/add-row`, payload);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const dataidMapingMaster = async (filters = {}) => {
  try {
    const res = await axiosInstance.get(`/dataid/get/mapping/tables`, {
      params: { ...filters },
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: { result: [], filters: { status: [], data_id: [] } },
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const generateSurnamesApi = async (dataIds: string[]) => {
  try {
    const res = await axiosInstance.post(`/dataid/generate/surnames`, {
      data_id: dataIds,
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Server error",
      data: null,
    };
  }
};

export const generateIdsApi = async (dataIds: string[]) => {
  try {
    const res = await axiosInstance.post(`/dataid/generate/ids`, {
      data_id: dataIds,
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Server error",
      data: null,
    };
  }
};

export const getYojnaListApi = async (dataId: string) => {
  try {
    const res = await axiosInstance.post(`/dataid/yojna/list`, {
      data_id: dataId,
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Server error",
      data: null,
    };
  }
};

export const updateMappingBatch = async (updates: any) => {
  try {
    const res = await axiosInstance.patch(`/dataid/mapping-to-db`, updates, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const DownloadBoothMaping = async (data_id: any) => {
  try {
    const res = await axiosInstance.get(`/dataid/download-mapping`, {
      params: { data_id },
      responseType: "blob",
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getPermissionModulesApi = async () => {
  try {
    const res = await axiosInstance.get(`/auth/get/permission/modules`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Server error",
      data: null,
    };
  }
};

export const getTableColumns = async (tableName: string) => {
  try {
    const res = await axiosInstance.get(
      `/auth/get/table/columns?table=${tableName}`
    );
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const getUserPermissions = async (userId: number) => {
  try {
    const res = await axiosInstance.get(`/auth/user-permissions/${userId}`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const UserPermissionsAssign = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/auth/users/assign-modules`, payload);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err?.response?.data?.message || "Server error",
    };
  }
};

export const GetDataAssignmentOptions = async (paramsObj: {
  table: string;
  wise_type: string;
  data_id?: string | number;
  block_id?: string | number;
  gp_ward_id?: string | number;
  ac_id?: string | number;
  bhag_no?: string | number;
  mandal_id?: string | number;
}) => {
  try {
    const res = await axiosInstance.get(`/user-assignments/options`, {
      params: paramsObj,
    });
    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const SaveUserAssignments = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/user-assignments/save`, payload);
    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const GetUserAssignments = async (
  userId: string | number,
  roleId?: string | number
) => {
  try {
    const res = await axiosInstance.get(`/user-assignments/details/${userId}`, {
      params: {
        role_id: roleId || undefined,
      },
    });

    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const ApplyModuleCodeToUser = async (payload: {
  user_id: string | number;
  modules_code: string;
}) => {
  try {
    const res = await axiosInstance.post(
      `/user-assignments/apply-module-code`,
      payload
    );

    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const ApplyPermissionCodeToUser = async (payload: {
  user_id: string | number;
  permission_code: string | number;
}) => {
  try {
    const res = await axiosInstance.post(
      `/user-assignments/apply-permission-code`,
      payload
    );

    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const downloadMasterExcelApi = async (filters: any = {}) => {
  try {
    const table = filters.table || "master";

    const res = await axiosInstance.get(`/dataid/download-master-excel`, {
      params: {
        ...filters,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${table}_${Date.now()}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Download failed",
    };
  }
};

export const downloadErollMappingExcel = async (filters: any = {}) => {
  try {
    const res = await axiosInstance.get(`/dataid/download-eroll-mapping-excel`, {
      params: {
        ...filters,
      },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `eroll_mapping_${Date.now()}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Download failed",
    };
  }
};

export const saveLiveVoterListApi = async (payload: any[]) => {
  try {
    const hasPhoto = payload.some((item) => item?.photo instanceof File);

    let body: any = payload;
    let headers: any = getAuthHeaders();

    if (hasPhoto) {
      const formData = new FormData();

      payload.forEach((item, index) => {
        Object.entries(item).forEach(([key, value]) => {
          if (key === "photo" && value instanceof File) {
            formData.append(`photo_${index}`, value);
          } else if (value !== undefined && value !== null) {
            formData.append(`${index}[${key}]`, String(value));
          }
        });
      });

      body = formData;
      delete headers["Content-Type"];
    }

    const res = await axiosInstance.patch(`/dataid/update`, body, {
      headers,
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Failed to save voter changes",
      data: {},
    };
  }
};

export const uploadMappingOverride = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post(`/dataid/upload-mapping`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "File upload failed",
      data: {},
    };
  }
};

export const addEmptyImportMasterRow = async () => {
  try {
    const res = await axiosInstance.post(`/dataid/add-empty-row`, {});
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Failed to create empty row",
      data: {},
    };
  }
};

export const syncSurnameApi = async (dataids: any = []) => {
  try {
    const res = await axiosInstance.post(`/dataid/sync/surname`, {
      data_id: dataids
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
      error: err?.response?.data || null,
    };
  }
};

export const addEmptyRowsApi = async (table: string, data_id: number, rowCount: number) => {
  try {
    const res = await axiosInstance.post(`/dataid/add-empty-rows`, {
      table,
      data_id,
      rowCount
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Server error",
      error: err?.response?.data || null,
    };
  }
};

export const importMasterCsvApi = async (payload: {
  table: string;
  file: File;
}) => {
  try {
    const formData = new FormData();
    formData.append("table", payload.table);
    formData.append("file", payload.file);

    const res = await axiosInstance.post(`/dataid/import-master-csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || "Import failed",
      error: err?.response?.data || null,
    };
  }
};

export const initiateLoginApi = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/auth/initiate-login`, payload);
    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const verifyDeviceOtpApi = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/auth/verify-device-otp`, payload);
    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const verifyUserOtpApi = async (payload: any) => {
  try {
    const res = await axiosInstance.post(`/auth/verify-user-otp`, payload);

    const token =
      res?.data?.data?.token ||
      res?.data?.token ||
      res?.headers?.["x-access-token"] ||
      null;

    const user = res?.data?.data?.user || res?.data?.user || null;

    if (typeof window !== "undefined" && token && typeof token === "string") {
      localStorage.setItem("token", token);
    }

    if (typeof window !== "undefined" && user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("userinfo", JSON.stringify(user));
    }

    return res.data;
  } catch (err: any) {
    return getErrorResponse(err, "Server error");
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.post(`/auth/logout`, {});
    clearAuthStorage();
    return res.data;
  } catch (err: any) {
    clearAuthStorage();
    return getErrorResponse(err, "Server error");
  }
};

export default axiosInstance;