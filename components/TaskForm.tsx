import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, Save } from 'lucide-react-native';
import { Task } from '@/types/Task';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';
import { DateUtils } from '@/utils/dateUtils';

interface TaskFormProps {
  task?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDate(new Date(task.date));
      
      const [hours, minutes] = task.time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      setTime(timeDate);
    } else {
      // Set default time to current time + 1 hour
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0);
      setTime(defaultTime);
    }
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date: DateUtils.formatDate(date),
      time: DateUtils.formatTime(time),
      completed: task?.completed || false,
    };

    onSave(taskData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>

        <View style={styles.inputGroup}>
          <Text style={GlobalStyles.label}>Task Title *</Text>
          <TextInput
            style={[
              GlobalStyles.input,
              titleFocused && GlobalStyles.inputFocused,
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={GlobalStyles.label}>Description</Text>
          <TextInput
            style={[
              GlobalStyles.input,
              styles.textArea,
              descriptionFocused && GlobalStyles.inputFocused,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            multiline
            numberOfLines={3}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
          />
        </View>

        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeGroup}>
            <Text style={GlobalStyles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.dateTimeText}>
                {DateUtils.formatDisplayDate(DateUtils.formatDate(date))}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeGroup}>
            <Text style={GlobalStyles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.dateTimeText}>
                {DateUtils.formatDisplayTime(DateUtils.formatTime(time))}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={GlobalStyles.secondaryButton} onPress={onCancel}>
            <Text style={GlobalStyles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={GlobalStyles.button} onPress={handleSave}>
            <View style={styles.saveButtonContent}>
              <Save size={18} color={Colors.white} />
              <Text style={GlobalStyles.buttonText}>
                {task ? 'Update Task' : 'Save Task'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  form: {
    padding: 16,
  },

  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },

  inputGroup: {
    marginBottom: 16,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  dateTimeGroup: {
    flex: 1,
  },

  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },

  dateTimeText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});