import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { AppDispatch } from '../store/store';
import { createRequest, Request } from '../store/requestsSlice';

interface RequestCategory {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const categories: RequestCategory[] = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    icon: 'construct',
    description: 'Room repairs, plumbing, electrical issues',
  },
  {
    id: 'noise',
    title: 'Noise Complaint',
    icon: 'volume-high',
    description: 'Excessive noise, disturbances',
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    icon: 'shield-checkmark',
    description: 'Safety concerns, security issues',
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    icon: 'sparkles',
    description: 'Housekeeping, sanitation requests',
  },
  {
    id: 'suggestion',
    title: 'Suggestion',
    icon: 'bulb',
    description: 'Ideas for improvement, feedback',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'ellipsis-horizontal',
    description: 'General requests and inquiries',
  },
];

const priorities = [
  { id: 'low', title: 'Low', color: Colors.textLight },
  { id: 'medium', title: 'Medium', color: Colors.primary },
  { id: 'high', title: 'High', color: Colors.warning },
  { id: 'urgent', title: 'Urgent', color: Colors.error },
];

export default function CreateRequestScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (title.trim().length < 5) {
      Alert.alert('Title Too Short', 'Please enter at least 5 characters for the title.');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Description Too Short', 'Please enter at least 10 characters for the description.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(createRequest({
        category: selectedCategory as Request['category'],
        priority: selectedPriority as Request['priority'],
        title: title.trim(),
        description: description.trim(),
        isAnonymous,
      })).unwrap();
      
      Alert.alert(
        'Request Submitted',
        'Your request has been submitted successfully. You will receive updates on its status.',
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit your request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Request</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={
                  selectedCategory === category.id
                    ? Colors.primary
                    : Colors.textLight
                }
              />
              <Text
                style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && styles.categoryTitleSelected,
                ]}
              >
                {category.title}
              </Text>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.id}
              style={[
                styles.priorityButton,
                selectedPriority === priority.id && styles.priorityButtonSelected,
              ]}
              onPress={() => setSelectedPriority(priority.id)}
            >
              <Text
                style={[
                  styles.priorityText,
                  selectedPriority === priority.id && styles.priorityTextSelected,
                ]}
              >
                {priority.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Title *</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Brief description of your request"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Provide detailed information about your request..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <TouchableOpacity
          style={styles.anonymousToggle}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <View style={styles.anonymousToggleLeft}>
            <Ionicons
              name={isAnonymous ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.primary}
            />
            <View style={styles.anonymousToggleText}>
              <Text style={styles.anonymousToggleTitle}>Submit Anonymously</Text>
              <Text style={styles.anonymousToggleSubtitle}>
                Your identity will be hidden from other residents
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleSwitch,
              isAnonymous && styles.toggleSwitchActive,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                isAnonymous && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryTitleSelected: {
    color: Colors.primary,
  },
  categoryDescription: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: Colors.primary,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  priorityTextSelected: {
    color: Colors.textOnPrimary,
  },
  titleInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  descriptionInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  anonymousToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  anonymousToggleText: {
    marginLeft: 12,
    flex: 1,
  },
  anonymousToggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  anonymousToggleSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
});