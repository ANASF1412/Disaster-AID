import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith("/auth/");
    // Only auto-logout on 401 for protected endpoints, never for login/register
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const centersAPI = {
  getAll: (params) => api.get("/centers", { params }),
  create: (data) => api.post("/centers", data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
};

export const inventoryAPI = {
  getByCenter: (centerId, params) => api.get(`/inventory/${centerId}`, { params }),
  create: (data) => api.post("/inventory", data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  bulkUpdate: (updates) => api.put("/inventory/bulk-update", { updates }),
};

export const volunteersAPI = {
  getAll: (params) => api.get("/volunteers", { params }),
  updateStatus: (data) => api.put("/volunteers/status", data),
  assign: (data) => api.post("/volunteers/assign", data),
};

export const dispatchAPI = {
  getAll: (params) => api.get("/dispatch", { params }),
  create: (data) => api.post("/dispatch", data),
  update: (id, data) => api.put(`/dispatch/${id}`, data),
};

export const analyticsAPI = {
  getCriticalZones: () => api.get("/analytics/critical-zones"),
  getHeatmap: () => api.get("/analytics/heatmap"),
};

export default api;
