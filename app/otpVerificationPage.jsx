import { PhoneAuthProvider } from "@react-native-firebase/auth";
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useUser } from './store/userContext'; // Adjust the path accordingly
import { ConfirmationContext } from './store/confirmationContext'; // Adjust the path accordingly

const backgroundImage = require("../assets/images/background.png");

const OtpVerificationPage = () => {
  const [otp, setOtp] = useState("");
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  let {confirmation} = useContext(ConfirmationContext);
  const verifyOtp = async () => {
    try {
      const credential = await confirmation.confirm(otp);
      const userData = await fetchUserData(credential.user.phoneNumber);
      const queryString = new URLSearchParams({ phone }).toString();
      if (userData?.role === "admin") {
        router.replace(`/admin/adminDashboard?${queryString}`);
      } else if (userData?.role === "cashier") {
        router.replace(`/cashier/projectList?${queryString}`);
      }  else if (userData?.role === "partner") {
        router.replace(`/partner/partnerDashboard`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const fetchUserData = async (phoneNumber) => {
    try {
      const usersRef = firestore().collection('users');
      const querySnapshot = await usersRef.where('phoneNumber', '==', phoneNumber).get();
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
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          onChangeText={setOtp}
          value={otp}
        />
        <TouchableOpacity style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>VERIFY</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    marginTop: 50,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default OtpVerificationPage;
