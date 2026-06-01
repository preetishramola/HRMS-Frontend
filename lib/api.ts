import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
};

// Employees
export const employeeApi = {
  getAll: (page = 0, size = 10) =>
    api.get(`/api/employees?page=${page}&size=${size}`),
  getById: (id: number) => api.get(`/api/employees/${id}`),
  create: (data: any) => api.post("/api/employees", data),
  update: (id: number, data: any) => api.put(`/api/employees/${id}`, data),
  deactivate: (id: number) => api.patch(`/api/employees/${id}/deactivate`),
  getDashboardStats: () => api.get("/api/employees/dashboard/stats"),
  getMyTeam: () => api.get("/api/employees/my-team"),
};

// Departments
export const departmentApi = {
  getAll: () => api.get("/api/departments"),
  create: (data: any) => api.post("/api/departments", data),
};

// Attendance
export const attendanceApi = {
  checkIn: (id: number) => api.post(`/api/employees/${id}/attendance/checkin`),
  checkOut: (id: number) => api.patch(`/api/employees/${id}/attendance/checkout`),
  getMonthly: (id: number, month: number, year: number) =>
    api.get(`/api/employees/${id}/attendance?month=${month}&year=${year}`),
  getTeam: (deptId: number) => api.get(`/api/attendance/team?deptId=${deptId}`),
  getSummary: (id: number, month: number, year: number) =>
    api.get(`/api/employees/${id}/attendance/summary?month=${month}&year=${year}`),
};

// Leave
export const leaveApi = {
  apply: (id: number, data: any) => api.post(`/api/employees/${id}/leaves`, data),
  getByEmployee: (id: number) => api.get(`/api/employees/${id}/leaves`),
  getBalance: (id: number) => api.get(`/api/employees/${id}/leaves/balance`),
  getPending: () => api.get("/api/leaves/pending"),
  approve: (leaveId: number) => api.patch(`/api/leaves/${leaveId}/approve`),
  reject: (leaveId: number, reason?: string) =>
    api.patch(`/api/leaves/${leaveId}/reject${reason ? `?reason=${reason}` : ""}`),
};

// Payroll
export const payrollApi = {
  getByEmployee: (id: number) => api.get(`/api/employees/${id}/payroll`),
  getPayslip: (id: number, month: number, year: number) =>
    api.get(`/api/employees/${id}/payroll/${month}/${year}`),
  generate: (month: number, year: number) =>
    api.post(`/api/payroll/generate?month=${month}&year=${year}`),
};

// Performance
export const performanceApi = {
  getByEmployee: (id: number) => api.get(`/api/employees/${id}/performance`),
  getTeam: () => api.get("/api/performance/team"),
  create: (id: number, data: any) => api.post(`/api/employees/${id}/performance`, data),
  submit: (reviewId: number) => api.patch(`/api/performance/${reviewId}/submit`),
  createReview: (employeeId: number, data: any) => api.post(`/api/employees/${employeeId}/performance`, data),
};

// Public careers (no auth)
const publicApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080" });

export const careersApi = {
  getJobs: () => publicApi.get("/api/public/jobs"),
  getJob: (jobId: number) => publicApi.get(`/api/public/jobs/${jobId}`),
  apply: (jobId: number, formData: FormData) =>
    publicApi.post(`/api/public/jobs/${jobId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Recruitment
export const recruitmentApi = {
  getJobs: () => api.get("/api/jobs"),
  createJob: (data: any) => api.post("/api/jobs", data),
  getCandidates: (jobId: number) => api.get(`/api/jobs/${jobId}/candidates`),
  addCandidate: (jobId: number, formData: FormData) =>
    api.post(`/api/jobs/${jobId}/candidates`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  screenResume: (candidateId: number) =>
    api.post(`/api/interview/screen/${candidateId}`),
  updateStage: (candidateId: number, stage: string) =>
    api.patch(`/api/candidates/${candidateId}/stage?stage=${stage}`),
  scheduleInterview: (candidateId: number, scheduledAt: string, meetingLink?: string) =>
    api.patch(`/api/candidates/${candidateId}/schedule-interview`, { scheduledAt, meetingLink }),
  hireCandidate: (candidateId: number, deptId?: number, managerId?: number) =>
    api.post(`/api/candidates/${candidateId}/hire${deptId ? `?departmentId=${deptId}` : ""}`),
  sendOffer: (candidateId: number) =>
    api.post(`/api/candidates/${candidateId}/offer`),
};

// Public offer response (no auth — candidate clicks from email)
export const offerApi = {
  getDetails: (token: string) => publicApi.get(`/api/public/offer?token=${token}`),
  respond: (token: string, accepted: boolean) =>
    publicApi.post(`/api/public/offer/respond?token=${token}&accepted=${accepted}`),
};

// AI Interview
export const interviewApi = {
  start: (candidateId: number) =>
    api.post(`/api/interview/start/${candidateId}`),
  respond: (sessionId: string, answer: string) =>
    api.post(`/api/interview/${sessionId}/respond?answer=${encodeURIComponent(answer)}`),
  end: (sessionId: string) => api.post(`/api/interview/${sessionId}/end`),
};

// Feedback (peer-to-peer, visible only to recipient)
export const feedbackApi = {
  give: (data: { toEmployeeId: number; category: string; content: string }) =>
    api.post("/api/feedback", data),
  getReceived: () => api.get("/api/feedback/received"),
  getGiven: () => api.get("/api/feedback/given"),
  // Lightweight employee list for the recipient dropdown — available to all roles
  getDirectory: () => api.get("/api/employees/all/directory"),
};

// Anonymous Complaints
export const complaintApi = {
  submit: (data: { category: string; description: string }) =>
    api.post("/api/complaints", data),
  // HR only
  getAll: (status?: string) =>
    api.get(`/api/complaints${status ? `?status=${status}` : ""}`),
  getSummary: () => api.get("/api/complaints/summary"),
  updateStatus: (id: number, data: { status: string; hrNotes?: string }) =>
    api.patch(`/api/complaints/${id}/status`, data),
};

// Chatbot
export const chatbotApi = {
  ask: (question: string, sessionId?: string) => {
    const params = new URLSearchParams({ question });
    if (sessionId) params.set("sessionId", sessionId);
    return api.post(`/api/chatbot/ask?${params.toString()}`);
  },
};
