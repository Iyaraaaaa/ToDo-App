import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SquareCheck as CheckSquare, Clock, Users, TrendingUp } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProfileForm from '@/components/ProfileForm';
import { Profile, Task, TaskStatistics } from '@/types/Task';
import { StorageService } from '@/utils/storage';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [statistics, setStatistics] = useState<TaskStatistics>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  const loadData = async () => {
    try {
      const [userProfile, tasks] = await Promise.all([
        StorageService.getProfile(),
        StorageService.getTasks(),
      ]);

      setProfile(userProfile);
      
      const completedTasks = tasks.filter(task => task.completed).length;
      setStatistics({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks: tasks.length - completedTasks,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleSaveProfile = async (profileData: Profile) => {
    try {
      await StorageService.saveProfile(profileData);
      setProfile(profileData);
      setIsEditing(false);
      Alert.alert(
        'Success',
        'Profile saved successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const defaultImageUrl = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400';

  if (isEditing || !profile) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {profile ? 'Edit Profile' : 'Setup Profile'}
          </Text>
        </View>
        <ProfileForm 
          profile={profile} 
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      </SafeAreaView>
    );
  }

  const completionRate = statistics.totalTasks > 0 
    ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
    : 0;

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: profile.imageUrl || defaultImageUrl }}
            style={styles.profileImage}
            defaultSource={{ uri: defaultImageUrl }}
          />
          <Text style={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statisticsSection}>
        <Text style={styles.sectionTitle}>Task Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <CheckSquare size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>{statistics.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={Colors.success} />
            </View>
            <Text style={styles.statNumber}>{statistics.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statNumber}>{statistics.pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        
        <View style={styles.achievementCard}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>
              {statistics.completedTasks >= 10 ? '🏆 Task Master' : '🎯 Getting Started'}
            </Text>
            <Text style={styles.achievementDescription}>
              {statistics.completedTasks >= 10
                ? `Congratulations! You've completed ${statistics.completedTasks} tasks.`
                : `Complete ${10 - statistics.completedTasks} more tasks to earn the Task Master badge!`
              }
            </Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  header: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },

  profileSection: {
    padding: 16,
  },

  profileCard: {
    ...GlobalStyles.card,
    alignItems: 'center',
    paddingVertical: 24,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: Colors.gray200,
  },

  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  editButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  editButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  statisticsSection: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },

  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  achievementsSection: {
    padding: 16,
    paddingBottom: 32,
  },

  achievementCard: {
    ...GlobalStyles.card,
    backgroundColor: Colors.primary,
  },

  achievementContent: {
    alignItems: 'center',
  },

  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },

  achievementDescription: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
});