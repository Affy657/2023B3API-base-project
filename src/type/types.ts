export type Role = 'Employee' | 'Admin' | 'ProjectManager';
export type referringEmployee = {
  id: string;
  username: string;
  email: string;
  role: string;
};
export type ProjectType = {
  id: string;
  name: string;
  referringEmployeeId: string;
};
