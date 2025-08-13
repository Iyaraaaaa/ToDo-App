import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Camera, Save, ArrowLeft, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Profile } from '@/types/Task';
import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/constants/Styles';

interface ProfileFormProps {
  profile: Profile | null;
  onSave: (profile: Profile) => void;
  onCancel?: () => void;
}

export default function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setImageUrl(profile.imageUrl);
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', error);
    }
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter both first and last name');
      return;
    }

    const profileData: Profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      imageUrl: imageUrl.trim(),
    };

    onSave(profileData);
  };

  const defaultImageUrl = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {onCancel && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Profile Information</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
            <Image
              source={{ uri: imageUrl || defaultImageUrl }}
              style={styles.profileImage}
              defaultSource={{ uri: defaultImageUrl }}
            />
            <View style={styles.imageOverlay}>
              <Upload size={24} color={Colors.white} />
              <Text style={styles.uploadText}>Upload Photo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={GlobalStyles.label}>First Name *</Text>
          <TextInput
            style={[
              GlobalStyles.input,
              firstNameFocused && GlobalStyles.inputFocused,
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            onFocus={() => setFirstNameFocused(true)}
            onBlur={() => setFirstNameFocused(false)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={GlobalStyles.label}>Last Name *</Text>
          <TextInput
            style={[
              GlobalStyles.input,
              lastNameFocused && GlobalStyles.inputFocused,
            ]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            onFocus={() => setLastNameFocused(true)}
            onBlur={() => setLastNameFocused(false)}
          />
        </View>

        <TouchableOpacity style={GlobalStyles.button} onPress={handleSave}>
          <View style={styles.saveButtonContent}>
            <Save size={18} color={Colors.white} />
            <Text style={GlobalStyles.buttonText}>Save Profile</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    padding: 16,
    paddingBottom: 0,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
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

  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: Colors.gray100,
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadText: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  inputGroup: {
    marginBottom: 16,
  },

  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});