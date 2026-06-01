export interface AuthUser {
  token: string;
  role: string;
  userId: number;
  employeeId: number;
  name: string;
  email: string;
}

export const saveUser = (user: AuthUser) => {
  localStorage.setItem("hrms_token", user.token);
  localStorage.setItem("hrms_user", JSON.stringify(user));
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hrms_user");
  return raw ? JSON.parse(raw) : null;
};

export const logout = () => {
  localStorage.removeItem("hrms_token");
  localStorage.removeItem("hrms_user");
  window.location.href = "/login";
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case "ROLE_ADMIN": return "#f97316";
    case "ROLE_MANAGER": return "#8b5cf6";
    case "ROLE_HR": return "#06b6d4";
    case "ROLE_EMPLOYEE": return "#22c55e";
    default: return "#64748b";
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case "ROLE_ADMIN": return "Admin";
    case "ROLE_MANAGER": return "Manager";
    case "ROLE_HR": return "HR";
    case "ROLE_EMPLOYEE": return "Employee";
    default: return role;
  }
};

export const getDashboardPath = (role: string) => {
  switch (role) {
    case "ROLE_ADMIN": return "/dashboard/admin";
    case "ROLE_MANAGER": return "/dashboard/manager";
    case "ROLE_HR": return "/dashboard/hr";
    case "ROLE_EMPLOYEE": return "/dashboard/employee";
    default: return "/login";
  }
};
