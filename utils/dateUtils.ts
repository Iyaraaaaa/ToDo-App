export const DateUtils = {
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  },

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDisplayTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  isTaskDue(task: { date: string; time: string }): boolean {
    const now = new Date();
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    return taskDateTime <= now;
  },

  isTaskToday(dateString: string): boolean {
    const today = new Date();
    const taskDate = new Date(dateString);
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    );
  }
};