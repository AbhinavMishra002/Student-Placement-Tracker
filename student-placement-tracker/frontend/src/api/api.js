import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Generic REST helpers reused by every entity page
export const api = {
  get: (url, params) => client.get(url, { params }).then((r) => r.data),
  post: (url, body) => client.post(url, body).then((r) => r.data),
  put: (url, body) => client.put(url, body).then((r) => r.data),
  del: (url) => client.delete(url).then((r) => r.data),
};

export const StudentsAPI = {
  list: (params) => api.get("/students", params),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.del(`/students/${id}`),
};

export const CompaniesAPI = {
  list: (params) => api.get("/companies", params),
  get: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post("/companies", data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  remove: (id) => api.del(`/companies/${id}`),
};

export const ApplicationsAPI = {
  list: (params) => api.get("/applications", params),
  get: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post("/applications", data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  remove: (id) => api.del(`/applications/${id}`),
};

export const InterviewsAPI = {
  list: (params) => api.get("/interviews", params),
  create: (data) => api.post("/interviews", data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  remove: (id) => api.del(`/interviews/${id}`),
};

export const PlacementsAPI = {
  list: (params) => api.get("/placements", params),
  create: (data) => api.post("/placements", data),
  update: (id, data) => api.put(`/placements/${id}`, data),
  remove: (id) => api.del(`/placements/${id}`),
};

export const DashboardAPI = {
  stats: () => api.get("/dashboard/stats"),
};
