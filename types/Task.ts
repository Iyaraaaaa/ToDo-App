export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  imageUrl: string;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}