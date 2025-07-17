import React, { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useUser } from "../store/userContext";


const PersonalInfo = () => {
  const { partnerId } = useLocalSearchParams();
  const { user, initializing, setUpdateUser, updateUser } = useUser();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const fetchPartner = async () => {
        try {
          const partnerDoc = await firestore()
            .collection("users")
            .doc(user.id)
            .get();
          const partnerData = partnerDoc.data();
          if (partnerData) {
            setName(partnerData.name || "");
            setPhoneNumber(partnerData.phoneNumber || "");
            setEmail(partnerData.email || "");
            setAddress(partnerData.address || "");
            setAccountNumber(partnerData.accountNumber || "");
            setIfsc(partnerData.ifsc || "");
          }
        } catch (error) {
          console.error("Error fetching partner data: ", error);
        }
      };

      fetchPartner();
    }
  }, [user?.id]);

  const handleSave = async () => {
    let valid = true;
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
      valid = false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required.";
      valid = false;
    }
    // if (!accountNumber.trim()) {
    //   newErrors.accountNumber = "Account number is required.";
    //   valid = false;
    // }
    // if (!ifsc.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    //   newErrors.ifsc = "Invalid IFSC code.";
    //   valid = false;
    // }

    setErrors(newErrors);

    if (valid) {
      const partnerData = {
        name,
        email,
        address: address || "",
      };

      try {
        await firestore()
          .collection("users")
          .doc(user.id)
          .update(partnerData);
        Alert.alert("Success", "Partner details updated successfully!");
        setUpdateUser(!updateUser)
        router.replace("/partner/partnerDashboard")
      } catch (error) {
        Alert.alert("Error", "Failed to save partner details");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal Info</Text>
      </View>
      <ScrollView style={styles.form}>
        {/* Personal Info Section */}
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Name *"
            value={name}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
              setName(value);
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Phone Number"
            value={phoneNumber}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email *"
            value={email}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
              setEmail(value);
            }}
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Address"
            value={address}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, address: "" }));
              setAddress(value);
            }}
          />
        </View>

        {/* Bank Account Details Section */}
        {/* <Text style={styles.sectionTitle}>Bank Account Details</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.accountNumber && styles.inputError]}
            placeholder="Account Number *"
            value={accountNumber}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({
                ...prevErrors,
                accountNumber: "",
              }));
              setAccountNumber(value);
            }}
            keyboardType="number-pad"
          />
          {errors.accountNumber && (
            <Text style={styles.errorText}>{errors.accountNumber}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.ifsc && styles.inputError]}
            placeholder="IFSC Code *"
            value={ifsc}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, ifsc: "" }));
              setIfsc(value);
            }}
          />
          {errors.ifsc && <Text style={styles.errorText}>{errors.ifsc}</Text>}
        </View> */}
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Update Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1C1C1E",
    paddingBottom: 70,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: "rgba(46, 46, 46, 0.8)",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  disabledInput: {
    backgroundColor: "rgba(46, 46, 46, 0.5)",
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default PersonalInfo;
