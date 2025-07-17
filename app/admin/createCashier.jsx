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
import { Ionicons } from "@expo/vector-icons";

const CreateCashier = ({ itsFromModal, customModal, setUserDataUpdated, userDataUpdated }) => {
  const { cashierId, isEdit } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && cashierId) {
      const fetchCashier = async () => {
        try {
          const cashierDoc = await firestore()
            .collection("users")
            .doc(cashierId)
            .get();
          const cashierData = cashierDoc.data();
          if (cashierData) {
            setName(cashierData.name || "");
            setPhoneNumber(cashierData.phoneNumber || "");
            setEmail(cashierData.email || "");
          }
        } catch (error) {
          console.error("Error fetching cashier data: ", error);
        }
      };

      fetchCashier();
    }
  }, [isEdit, cashierId]);

  const handleSave = async () => {
    let valid = true;
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
      valid = false;
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      valid = false;
    }
    const countryCodeRegex = /^\+/;
    if (!countryCodeRegex.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must include a country code.";
      valid = false;
    }
    const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format.";
      valid = false;
    }
    const localNumber = phoneNumber.replace(/^\+\d{1,2}/, "");
    if (localNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits long.";
      valid = false;
    }
    const usersRef = firestore().collection("users");
    const querySnapshot = await usersRef
      .where("phoneNumber", "==", phoneNumber)
      .get();
    if (querySnapshot.docs[0] && querySnapshot.docs[0]?.id != cashierId) {
      newErrors.phoneNumber = "Phone number is already used.";
      valid = false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required.";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      const cashierData = {
        name,
        phoneNumber,
        email,
        createdAt: new Date(),
        role: "cashier",
      };

      try {
        if (isEdit) {
          console.log("cashierId", cashierId);
          // Update existing cashier
          await firestore()
            .collection("users")
            .doc(cashierId)
            .update(cashierData);
          Alert.alert("Success", "Cashier details updated successfully!");
        } else {
          // Add new cashier
          await firestore().collection("users").add(cashierData);
          Alert.alert("Success", "Cashier details saved successfully!");
        }
        if(itsFromModal){
          setUserDataUpdated(!userDataUpdated)
          customModal();
        } else{
          router.replace("/admin/cashierDashboard");

        }
      } catch (error) {
        console.log("error", error);
        Alert.alert("Error", "Failed to save cashier");
      }
    }
  };

  return (
    <View style={itsFromModal ? styles.modalContainer : styles.container}>
      <View style={styles.header}>
        {itsFromModal ? (
          ""
        ) : (
          <TouchableOpacity
            onPress={() => router.replace(`/admin/cashierDashboard`)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Cashier" : "Create Cashier"}
        </Text>
        <Text></Text>
      </View>
      <ScrollView style={styles.form}>
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
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="Phone Number *"
            value={phoneNumber}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, phoneNumber: "" }));
              setPhoneNumber(value);
            }}
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
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
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEdit ? "UPDATE" : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>
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
  modalContainer: {
    padding: 20,
    backgroundColor: "#1C1C1E",
    paddingBottom: 70,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    marginVertical: 20,
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: "rgba(0, 128, 128, 0.8)",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: "rgba(0, 128, 128, 0.8)",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default CreateCashier;
