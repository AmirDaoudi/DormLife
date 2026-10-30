import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import GeorgetownLogo from '../components/GeorgetownLogo';

export default function AdminLoginScreen() {
  const navigation = useNavigation();
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Secure admin password - should be environment variable in production
  const ADMIN_PASSWORD = 'GPrep2024Admin!';

  const handleAdminLogin = async () => {
    if (!adminCode.trim()) {
      Alert.alert('Error', 'Please enter admin code');
      return;
    }

    setLoading(true);

    // Simple but secure check
    if (adminCode === ADMIN_PASSWORD) {
      setLoading(false);
      navigation.navigate('AdminDashboard' as never);
    } else {
      setLoading(false);
      Alert.alert('Access Denied', 'Invalid admin code');
      setAdminCode(''); // Clear the input
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <GeorgetownLogo size="medium" variant="dark" />
          <Text style={styles.title}>Admin Access</Text>
          <Text style={styles.subtitle}>Enter admin code to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Admin Code</Text>
            <TextInput
              style={styles.input}
              value={adminCode}
              onChangeText={setAdminCode}
              placeholder="Enter admin code"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ This area is restricted to authorized staff only
          </Text>
        </View>
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
  backButton: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
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
    marginBottom: 40,
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
  loginButton: {
    backgroundColor: Colors.error, // Red for admin access
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  loginButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  warning: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});