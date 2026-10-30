import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { registerUser, clearError } from '../store/authSlice';
import { Colors } from '../constants/Colors';
import GeorgetownLogo from '../components/GeorgetownLogo';

interface School {
  id: string;
  name: string;
  address: string;
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    roomNumber: '',
    graduationYear: '',
    schoolId: '',
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  React.useEffect(() => {
    // Use the real Georgetown Prep UUID from database
    const georgetownPrepId = '39221cb8-b063-49e7-b5bf-912001551f2a';
    setSchools([{
      id: georgetownPrepId,
      name: 'Georgetown Preparatory School',
      address: '10900 Rockville Pike, North Bethesda, MD 20852'
    }]);
    setFormData({ ...formData, schoolId: georgetownPrepId });
    setLoadingSchools(false);
    
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const { email, password, confirmPassword, fullName, roomNumber, graduationYear, schoolId } = formData;

    if (!email || !password || !confirmPassword || !fullName || !roomNumber || !graduationYear || !schoolId) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Validate room number (should be a number between 200-599)
    const roomNum = parseInt(roomNumber);
    if (isNaN(roomNum) || roomNum < 200 || roomNum > 599) {
      Alert.alert('Error', 'Room number must be between 200-599');
      return false;
    }

    // Validate graduation year (2026=Senior, 2027=Junior, 2028=Sophomore, 2029=Freshman)
    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(graduationYear);
    if (isNaN(gradYear) || gradYear < currentYear || gradYear > currentYear + 4) {
      Alert.alert('Error', `Graduation year must be between ${currentYear} and ${currentYear + 4}`);
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const { email, password, fullName, roomNumber, graduationYear, schoolId } = formData;
    
    try {
      await dispatch(registerUser({ 
        email, 
        password, 
        fullName, 
        roomNumber,
        graduationYear: parseInt(graduationYear),
        schoolId 
      })).unwrap();
      Alert.alert(
        'Registration Successful',
        'Account created! You can now sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error) {
      // Error is handled by the error state
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <GeorgetownLogo size="large" variant="dark" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Georgetown Prep community</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Room Number</Text>
              <TextInput
                style={styles.input}
                value={formData.roomNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, roomNumber: text })
                }
                placeholder="Room number (200-599)"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Graduation Year</Text>
              <TextInput
                style={styles.input}
                value={formData.graduationYear}
                onChangeText={(text) =>
                  setFormData({ ...formData, graduationYear: text })
                }
                placeholder="Graduation year (2026=Senior, 2027=Junior, etc.)"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>School</Text>
              <View style={styles.schoolContainer}>
                <Text style={styles.schoolText}>Georgetown Preparatory School</Text>
                <Text style={styles.schoolSubtext}>10900 Rockville Pike, North Bethesda, MD</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="your.name@georgetownprep.org"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Create a password"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm your password"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading || loadingSchools}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 17,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  schoolContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  schoolText: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  schoolSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  registerButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
    marginTop: 20,
    gap: 5,
  },
  footerText: {
    fontSize: 17,
    color: Colors.textLight,
  },
  signInText: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: '500',
  },
});