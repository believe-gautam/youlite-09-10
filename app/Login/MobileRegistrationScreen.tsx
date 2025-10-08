import Colors from "@/utils/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MobileRegistrationScreen = () => {
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const handleSendOTP = async () => {
    // Validate mobile number
    if (!mobile) {
      Alert.alert("Error", "Please enter your mobile number");
      return;
    }

    // Clean mobile number (remove spaces, +, -, etc.)
    const cleanMobile = mobile.replace(/[^0-9]/g, "");

    // Validate mobile number format (10 digits for India)
    if (cleanMobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending OTP to:", cleanMobile);

      // Call your send OTP API
      const response = await fetch("http://youlitestore.in/app-api/send_otp.php?mobile="+cleanMobile, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          mobile: cleanMobile,
        }),
      });

      console.log("Response status:", response.status);

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      // Check if response is JSON
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.log("Response text:", text);
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        Alert.alert("Success", "OTP sent to your mobile number");
        // Navigate to OTP verification screen
        router.push({
          pathname: "/Login/VerifyOTPScreen",
          params: { mobile: cleanMobile },
        });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Error details:", error);
      
      let errorMessage = "Something went wrong";
      
      if (error.message.includes("Network request failed")) {
        errorMessage = "Network error. Please check your internet connection";
      } else if (error.message.includes("405")) {
        console.log({error})
        errorMessage = "Server configuration error. Please contact support";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMobileNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, "");
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setMobile(limited);
  };

  const canSubmit = mobile.length === 10;

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
          <View style={styles.iconContainer}>
            <Ionicons name="phone-portrait-outline" size={80} color={Colors.PRIMARY} />
          </View>
          <Text style={styles.title}>Mobile Verification</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to receive OTP
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <Ionicons
              name="call-outline"
              size={20}
              color={Colors.PRIMARY}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobile}
              onChangeText={formatMobileNumber}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          <Text style={styles.helperText}>
            We'll send you a 6-digit OTP to verify your number
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              (!canSubmit || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={!canSubmit || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Sending..." : "Send OTP"}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.PRIMARY} />
            <Text style={styles.infoText}>
              Your information is safe and secure
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/Login/LoginRegisterPage")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  skipButton: {
    position: "absolute",
    top: 80,
    right: 30,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.PRIMARY}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  countryCode: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: "600",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: Colors.BLACK,
    fontSize: 16,
  },
  helperText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#666",
  },
  footerLink: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
  },
});

export default MobileRegistrationScreen;