import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronRight, ChevronLeft, Check, Bell, BellOff, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { interestOptions } from '@/mocks/interests';
import { OnboardingData } from '@/types';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const animateProgress = useCallback((toStep: number) => {
    Animated.spring(progressAnim, {
      toValue: toStep / TOTAL_STEPS,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [progressAnim]);

  const goNext = useCallback(() => {
    if (step === 1) {
      if (!name.trim() || !username.trim()) {
        Alert.alert('Required Fields', 'Please fill in your name and username.');
        return;
      }
    }
    if (step === 2 && selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest.');
      return;
    }
    if (step < TOTAL_STEPS) {
      const next = step + 1;
      setStep(next);
      animateProgress(next);
    } else {
      const data: OnboardingData = {
        name: name.trim(),
        username: username.trim(),
        dateOfBirth,
        phone,
        gender,
        interests: selectedInterests,
        avatar,
        notificationsEnabled,
      };
      completeOnboarding(data);
      router.replace('/(tabs)/(home)');
    }
  }, [step, name, username, dateOfBirth, phone, gender, selectedInterests, avatar, notificationsEnabled, completeOnboarding, router, animateProgress]);

  const goBack = useCallback(() => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      animateProgress(prev);
    }
  }, [step, animateProgress]);

  const toggleInterest = useCallback((id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>We will use this to personalize your experience</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          testID="onboarding-name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          placeholder="Choose a username"
          placeholderTextColor={Colors.textLight}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          testID="onboarding-username"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={Colors.textLight}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          testID="onboarding-dob"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Your phone number"
          placeholderTextColor={Colors.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          testID="onboarding-phone"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderChip, gender === g && styles.genderChipActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What are you into?</Text>
      <Text style={styles.stepSubtitle}>Select your travel interests to find better matches</Text>

      <View style={styles.interestsGrid}>
        {interestOptions.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <TouchableOpacity
              key={interest.id}
              style={[styles.interestItem, isSelected && styles.interestItemActive]}
              onPress={() => toggleInterest(interest.id)}
              testID={`interest-${interest.id}`}
            >
              <Text style={styles.interestEmoji}>{interest.emoji}</Text>
              <Text style={[styles.interestLabel, isSelected && styles.interestLabelActive]}>
                {interest.label}
              </Text>
              {isSelected && (
                <View style={styles.interestCheck}>
                  <Check size={12} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add a profile photo</Text>
      <Text style={styles.stepSubtitle}>Help other travelers recognize you</Text>

      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage} testID="avatar-picker">
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={Colors.textLight} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Camera size={18} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to upload a photo</Text>
        {!avatar && (
          <TouchableOpacity style={styles.skipPhotoButton} onPress={goNext}>
            <Text style={styles.skipPhotoText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Stay in the loop</Text>
      <Text style={styles.stepSubtitle}>Get notified about matches, messages, and trip updates</Text>

      <View style={styles.notificationOptions}>
        <TouchableOpacity
          style={[styles.notifCard, notificationsEnabled && styles.notifCardActive]}
          onPress={() => setNotificationsEnabled(true)}
          testID="notif-enable"
        >
          <View style={[styles.notifIcon, notificationsEnabled && styles.notifIconActive]}>
            <Bell size={28} color={notificationsEnabled ? Colors.white : Colors.textSecondary} />
          </View>
          <Text style={[styles.notifTitle, notificationsEnabled && styles.notifTitleActive]}>Enable Notifications</Text>
          <Text style={styles.notifDesc}>Get real-time updates about your trips and matches</Text>
          {notificationsEnabled && (
            <View style={styles.selectedBadge}>
              <Check size={16} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.notifCard, !notificationsEnabled && styles.notifCardActive]}
          onPress={() => setNotificationsEnabled(false)}
          testID="notif-disable"
        >
          <View style={[styles.notifIcon, !notificationsEnabled && styles.notifIconActive]}>
            <BellOff size={28} color={!notificationsEnabled ? Colors.white : Colors.textSecondary} />
          </View>
          <Text style={[styles.notifTitle, !notificationsEnabled && styles.notifTitleActive]}>Maybe Later</Text>
          <Text style={styles.notifDesc}>You can always enable this in settings</Text>
          {!notificationsEnabled && (
            <View style={styles.selectedBadge}>
              <Check size={16} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.topArea, { paddingTop: insets.top + 12 }]}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.stepIndicator}>Step {step} of {TOTAL_STEPS}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <ChevronLeft size={20} color={Colors.text} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          <TouchableOpacity style={styles.nextButton} onPress={goNext} testID="onboarding-next">
            <Text style={styles.nextText}>
              {step === TOTAL_STEPS ? 'Get Started' : 'Continue'}
            </Text>
            {step < TOTAL_STEPS && <ChevronRight size={18} color={Colors.white} />}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topArea: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepIndicator: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingTop: 16,
    gap: 16,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: -8,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  genderChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  genderChipTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    position: 'relative',
  },
  interestItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  interestEmoji: {
    fontSize: 18,
  },
  interestLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  interestLabelActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  interestCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 30,
    gap: 16,
  },
  avatarPicker: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'relative',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarHint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  skipPhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipPhotoText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  notificationOptions: {
    gap: 14,
    paddingTop: 10,
  },
  notifCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  notifCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  notifIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconActive: {
    backgroundColor: Colors.primary,
  },
  notifTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  notifTitleActive: {
    color: Colors.primary,
  },
  notifDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
