import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CreditCard as Edit, Trash2, Check, Clock } from 'lucide-react-native';
import { Task } from '@/types/Task';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { DateUtils } from '@/utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => onDelete(task.id)
        },
      ]
    );
  };

  const isOverdue = !task.completed && DateUtils.isTaskDue(task);
  const isToday = DateUtils.isTaskToday(task.date);

  return (
    <View style={[styles.card, task.completed && styles.completedCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          <View style={styles.statusContainer}>
            {isOverdue && (
              <View style={styles.overdueTag}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
            {isToday && !isOverdue && (
              <View style={styles.todayTag}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, task.completed ? styles.undoButton : styles.completeButton]}
            onPress={() => onToggleComplete(task.id)}
          >
            <Check size={18} color={task.completed ? Colors.warning : Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(task)}>
            <Edit size={18} color={Colors.gray600} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {task.description && (
        <Text style={[styles.description, task.completed && styles.completedText]}>
          {task.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.dateTimeContainer}>
          <Clock size={16} color={Colors.gray500} />
          <Text style={styles.dateTime}>
            {DateUtils.formatDisplayDate(task.date)} at {DateUtils.formatDisplayTime(task.time)}
          </Text>
        </View>
        
        {task.completed && (
          <View style={styles.completedBadge}>
            <Check size={14} color={Colors.success} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...GlobalStyles.card,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  completedCard: {
    backgroundColor: Colors.gray50,
    borderLeftColor: Colors.success,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  completedText: {
    color: Colors.gray500,
    textDecorationLine: 'line-through',
  },

  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  overdueTag: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  overdueText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  todayTag: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  todayText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
  },

  completeButton: {
    backgroundColor: Colors.success,
  },

  undoButton: {
    backgroundColor: Colors.warning,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dateTime: {
    fontSize: 14,
    color: Colors.gray500,
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  completedBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});