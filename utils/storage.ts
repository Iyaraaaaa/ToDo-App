import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Profile } from '@/types/Task';

const TASKS_KEY = '@tasks';
const PROFILE_KEY = '@profile';

export const StorageService = {
  // Task operations
  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedTasks = [...tasks, newTask];
      await this.saveTasks(updatedTasks);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );
      await this.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Profile operations
  async getProfile(): Promise<Profile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async saveProfile(profile: Profile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  // Clear all data (for testing purposes)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TASKS_KEY, PROFILE_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};