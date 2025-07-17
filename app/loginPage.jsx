import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";

const landingPage = require("../assets/images/landingPage.jpg");
const backgroundImage = require("../assets/images/background.png");

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState("login"); // "login" or "otp"
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (number) => {
    const countryCodeRegex = /^\+/;
    if (!countryCodeRegex.test(number)) {
      setErrorMessage("Phone number must include a country code.");
      return false;
    }
    const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumberRegex.test(number)) {
      setErrorMessage("Invalid phone number format.");
      return false;
    }
    const localNumber = number.replace(/^\+\d{1,2}/, "");
    if (localNumber.length !== 10) {
      setErrorMessage("Phone number must be exactly 10 digits long.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const sendOtp = async () => {
    setLoading(true);
    if (!validatePhoneNumber(phoneNumber)) {
      setLoading(false);
      return;
    }

    try {
      const userExists = await checkUserExists(phoneNumber);
      console.log("userExists", userExists);
      if (userExists?.isUserExists) {
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        setConfirmation(confirmation);
        setStep("otp");
      } else {
        setErrorMessage(`User not found. Please contact admin.`);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (phoneNumber) => {
    try {
      const usersRef = firestore().collection("users");
      const querySnapshot = await usersRef
        .where("phoneNumber", "==", phoneNumber)
        .get();
      return {
        isUserExists: !querySnapshot.empty,
        data: querySnapshot.docs[0]?.data(),
      };
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) {
      setErrorMessage("No confirmation object available");
      return;
    }

    try {
      const credential = await confirmation.confirm(otp);
      const userData = await fetchUserData(credential.user.phoneNumber);
      // setUser(userData); // Set user data in context or state as needed
      if (userData?.role === "Admin") {
        router.replace(`/admin/adminDashboard`);
      } else if (userData?.role === "cashier") {
        router.replace(`/cashier/projectList`);
      } else if (userData?.role === "partner") {
        router.replace(`/partner/partnerDashboard`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Error verifying OTP. Please try again.");
    }
  };

  const fetchUserData = async (phoneNumber) => {
    try {
      const usersRef = firestore().collection("users");
      const querySnapshot = await usersRef
        .where("phoneNumber", "==", phoneNumber)
        .get();
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 1)" />
      {step === "login" ? (
        <ImageBackground source={landingPage} style={styles.backgroundImage}>
          <View style={styles.overlay} />
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: "https://path-to-your-profile-image1.jpg" }}
                style={styles.profileImage}
              />
              <Image
                source={{ uri: "https://path-to-your-profile-image2.jpg" }}
                style={styles.profileImage}
              />
            </View>
          </View>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FFB72B" />
            </View>
          ) : (
            <>
              <View style={styles.textContainer}>
                <Text style={styles.title}>For the busy ones,</Text>
                <Text style={styles.subtitle}>
                  workout from anywhere, anytime.
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="+91 Enter your mobile number"
                  keyboardType="phone-pad"
                  onChangeText={setPhoneNumber}
                  value={phoneNumber}
                />
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
                <TouchableOpacity style={styles.button} onPress={sendOtp}>
                  <Text style={styles.buttonText}>CONTINUE</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ImageBackground>
      ) : (
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.otpContainer}>
            <Text style={styles.title}>Verify OTP</Text>
            <TextInput
              style={[styles.input, { marginTop: 15 }]}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              onChangeText={setOtp}
              value={otp}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <Text
              style={[
                styles.title,
                {
                  fontSize: 12,
                  fontWeight: 400,
                  color: "silver",
                  marginVertical: 5,
                },
              ]}
            >
              otp is shared to {phoneNumber}.{" "}
            </Text>

            <TouchableOpacity style={styles.button} onPress={verifyOtp}>
              <Text style={styles.buttonText}>VERIFY</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  otpContainer: {
    flex: 1,
    marginTop: 60,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, .7)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  profileContainer: {
    flexDirection: "row",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginPage;
