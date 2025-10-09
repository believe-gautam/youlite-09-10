import Colors from "@/utils/Colors";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Use the updated authService without JWT
import {
  loginCustomerByEmail,
  registerCustomer,
} from "@/lib/services/authService";

const LoginRegisterPage = () => {
  // UI state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password modal state
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [step, setStep] = useState(1);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const formPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;

  // Toggle between login and register
  const toggleForm = () => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formPosition, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLogin((prev) => !prev);
      formPosition.setValue(50);
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(formPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // ✅ Handle Login (by email only)
  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setIsLoading(true);
    try {
      await loginCustomerByEmail(email);
      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage = error?.message || "Login failed.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Register
  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    setIsLoading(true);
    try {
      await registerCustomer({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: email,
      });
      Alert.alert("Success", "Account created successfully!");
      router.replace("/(tabs)");
      setFirstName("");
      setLastName("");
      setConfirmPassword("");
    } catch (error: any) {
      let errorMessage = error?.message || "Registration failed.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Decide whether to call login or register
  const handleSubmit = () => {
    if (isLogin) handleLogin();
    else handleRegister();
  };

  // Forgot password mock flow
  const handleForgotPassword = () => {
    setForgotPasswordModal(true);
    setStep(1);
    setResetEmail(email);
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const sendResetCode = () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStep(2);
      Alert.alert("Success", "Reset code sent to your email");
      setIsLoading(false);
    }, 700);
  };

  const verifyResetCode = () => {
    if (!resetCode) {
      Alert.alert("Error", "Please enter the reset code");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
    }, 700);
  };

  const resetPassword = () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please enter and confirm your new password");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      Alert.alert("Success", "Password reset successfully");
      setForgotPasswordModal(false);
      setStep(1);
      setNewPassword("");
      setConfirmNewPassword("");
      setIsLoading(false);
    }, 700);
  };

  // Forgot password modal
  const renderForgotPasswordModal = () => (
    <Modal
      visible={forgotPasswordModal}
      animationType="slide"
      transparent
      onRequestClose={() => setForgotPasswordModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setForgotPasswordModal(false)}
          >
            <Ionicons name="close" size={24} color={Colors.BLACK} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Reset Password</Text>
          {step === 1 && (
            <>
              <Text style={styles.modalSubtitle}>
                Enter your email address to receive a reset code
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={sendResetCode}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>Send Reset Code</Text>
              </TouchableOpacity>
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.modalSubtitle}>
                Enter the 6-digit code sent to your email
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reset Code"
                  value={resetCode}
                  onChangeText={setResetCode}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={verifyResetCode}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>Verify Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resendCode}
                onPress={sendResetCode}
                disabled={isLoading}
              >
                <Text style={styles.resendCodeText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}
          {step === 3 && (
            <>
              <Text style={styles.modalSubtitle}>Enter your new password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowNewPassword((v) => !v)}
                >
                  <Feather
                    name={showNewPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmNewPassword}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowConfirmNewPassword((v) => !v)}
                >
                  <Feather
                    name={showConfirmNewPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={resetPassword}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonText}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const canSubmit = isLogin
    ? !!email
    : !!email && !!password && !!firstName && !!lastName && !!confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back!" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Sign in to continue" : "Join us to get started"}
          </Text>
        </View>
        <Animated.View
          style={[
            styles.formContainer,
            { opacity: formOpacity, transform: [{ translateY: formPosition }] },
          ]}
        >
          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.PRIMARY}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            </>
          )}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={Colors.PRIMARY}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={Colors.PRIMARY}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.PRIMARY}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setShowConfirmPassword((v) => !v)}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          )}
          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, (!canSubmit || isLoading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity style={styles.socialButton}>
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={toggleForm}>
            <Text style={styles.footerLink}>
              {isLogin ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sign In With Mobile
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/Login/MobileRegistrationScreen", })}>
            <Text>Click Here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      {renderForgotPasswordModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  skipButton: {
    position: "absolute",
    top: 80,
    right: 30,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: { color: Colors.PRIMARY, fontSize: 16, fontWeight: "600" },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: "#666" },
  formContainer: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", color: Colors.BLACK },
  visibilityToggle: { padding: 5 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  forgotPasswordText: { color: Colors.PRIMARY, fontSize: 14 },
  button: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#ddd" },
  dividerText: { marginHorizontal: 10, color: "#666" },


  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 50,
    marginBottom: 30,
    gap: 10,
  },
  socialButtonText: { color: Colors.BLACK, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  footerLink: { color: Colors.PRIMARY, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: Colors.WHITE, borderRadius: 15, padding: 25, alignItems: 'center' },
  closeButton: { alignSelf: 'flex-end', padding: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.PRIMARY, marginBottom: 10, alignSelf: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  modalButtonText: { color: Colors.WHITE, fontSize: 16, fontWeight: 'bold' },
  resendCode: { marginTop: 15 },
  resendCodeText: { color: Colors.PRIMARY, fontSize: 14 },
});

export default LoginRegisterPage;
