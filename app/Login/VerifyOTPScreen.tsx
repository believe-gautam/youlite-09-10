import { loginCustomerByEmail } from "@/lib/services/authService";
import Colors from "@/utils/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const VerifyOTPScreen = () => {
  const params = useLocalSearchParams();
  const mobile = params.mobile as string;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // FIX: Use the correct type for the environment or let TypeScript infer it.
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all digits are filled
    const completeOtp = newOtp.join("");
    if (completeOtp.length === 6) {
      handleVerifyOTP(completeOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    if (isVerified || isLoading) return;

    const otpCode = code || otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://youlitestore.in/app-api/verify_otp.php?otp=${otpCode}&mobile=${mobile}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile,
          otp: otpCode,
        }),
      });

      const data = await response.json();
      const email = data?.user_data?.user_email || null;

      if (data.success && email) {
        setIsVerified(true);
        await loginCustomerByEmail(email);
        Alert.alert("Success", "Mobile number verified successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          data.message || "Invalid OTP. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isVerified || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://youlitestore.in/app-api/send_otp.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "OTP resent successfully");
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        setIsVerified(false);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const canSubmit = otp.every((digit) => digit !== "") && !isVerified;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {isVerified ? (
              <Ionicons name="checkmark-circle" size={60} color={Colors.PRIMARY} />
            ) : (
              <Ionicons name="lock-closed" size={60} color={Colors.PRIMARY} />
            )}
          </View>
          <Text style={styles.title}>
            {isVerified ? "Verified!" : "Verify OTP"}
          </Text>
          <Text style={styles.subtitle}>
            {isVerified ? (
              "Your mobile number has been successfully verified!"
            ) : (
              <>
                Enter the 6-digit code sent to{"\n"}
                <Text style={styles.mobile}>+91 {mobile}</Text>
              </>
            )}
          </Text>
        </View>

        {!isVerified ? (
          <View style={styles.formContainer}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                  editable={!isLoading && !isVerified}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!canSubmit || isLoading) && styles.buttonDisabled,
              ]}
              onPress={() => handleVerifyOTP()}
              disabled={!canSubmit || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend OTP in {formatTime(timer)}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.resendText,
                    isLoading && styles.resendTextDisabled
                  ]}>
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.infoText}>
                Didn't receive the code? Check your message inbox
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.continueButtonText}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 30,
    zIndex: 10,
    padding: 10,
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
    lineHeight: 24,
  },
  mobile: {
    fontWeight: "bold",
    color: Colors.BLACK,
  },
  formContainer: {
    width: "100%",
  },
  successContainer: {
    width: "100%",
    alignItems: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.BLACK,
    backgroundColor: Colors.WHITE,
  },
  otpInputFilled: {
    borderColor: Colors.PRIMARY,
    backgroundColor: `${Colors.PRIMARY}05`,
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
  continueButton: {
    backgroundColor: Colors.PRIMARY || "#4CAF50",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  continueButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  resendText: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  resendTextDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    flex: 1,
  },
});

export default VerifyOTPScreen;