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

const CreatePartner = ({
  itsFromModal,
  customModal,
  setUserDataUpdated,
  userDataUpdated,
}) => {
  const { partnerId, isEdit } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [googlePay, setGooglePay] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && partnerId) {
      const fetchPartner = async () => {
        try {
          const partnerDoc = await firestore()
            .collection("users")
            .doc(partnerId)
            .get();
          const partnerData = partnerDoc.data();
          if (partnerData) {
            setName(partnerData.name || "");
            setPhoneNumber(partnerData.phoneNumber || "");
            setEmail(partnerData.email || "");
            setAddress(partnerData.address || "");
            setAadhaar(partnerData.aadhaar || "");
            setPan(partnerData.pan || "");
            setAccountNumber(partnerData.accountNumber || "");
            setIfsc(partnerData.ifsc || "");
            setGooglePay(partnerData.googlePay || "");
          }
        } catch (error) {
          console.error("Error fetching partner data: ", error);
        }
      };

      fetchPartner();
    }
  }, [isEdit, partnerId]);

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

    // Check if phone number already exists
    const usersRef = firestore().collection("users");
    const querySnapshot = await usersRef
      .where("phoneNumber", "==", phoneNumber)
      .get();
    if (!isEdit || (isEdit && querySnapshot.docs[0]?.id !== partnerId)) {
      if (!querySnapshot.empty) {
        newErrors.phoneNumber = "Phone number is already used.";
        valid = false;
      }
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required.";
      valid = false;
    }
    if (!address.trim()) {
      newErrors.address = "Address is required.";
      valid = false;
    }
    if (!aadhaar.trim() || aadhaar.length !== 12) {
      newErrors.aadhaar = "Aadhaar number must be 12 digits.";
      valid = false;
    }
    if (!pan.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      newErrors.pan = "Invalid PAN number.";
      valid = false;
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required.";
      valid = false;
    }
    if (!ifsc.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      newErrors.ifsc = "Invalid IFSC code.";
      valid = false;
    }
    if (!googlePay.trim()) {
      newErrors.googlePay = "Google Pay number is required.";
      valid = false;
    } else {
      const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneNumberRegex.test(googlePay)) {
        newErrors.googlePay = "Invalid googlePay number format.";
        valid = false;
      }
    }

    setErrors(newErrors);

    if (valid) {
      const partnerData = {
        name,
        phoneNumber,
        email,
        address,
        aadhaar,
        pan,
        accountNumber,
        ifsc,
        googlePay,
        createdAt: new Date(),
        role: "partner",
      };

      try {
        if (isEdit) {
          // Update existing partner
          await firestore()
            .collection("users")
            .doc(partnerId)
            .update(partnerData);
          Alert.alert("Success", "Partner details updated successfully!");
        } else {
          // Add new partner
          await firestore().collection("users").add(partnerData);
          Alert.alert("Success", "Partner details saved successfully!");
        }
        if (itsFromModal) {
          setUserDataUpdated(!userDataUpdated);
          customModal();
        } else {
          router.replace("/admin/partnerDashboard");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to save partner");
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
            onPress={() => router.replace(`/admin/partnerDashboard`)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Partner" : "Create Partner"}
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
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Address *"
            value={address}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, address: "" }));
              setAddress(value);
            }}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.aadhaar && styles.inputError]}
            placeholder="Aadhaar Number *"
            value={aadhaar}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, aadhaar: "" }));
              setAadhaar(value);
            }}
            keyboardType="number-pad"
          />
          {errors.aadhaar && (
            <Text style={styles.errorText}>{errors.aadhaar}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.pan && styles.inputError]}
            placeholder="PAN Number *"
            value={pan}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, pan: "" }));
              setPan(value);
            }}
          />
          {errors.pan && <Text style={styles.errorText}>{errors.pan}</Text>}
        </View>
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
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.googlePay && styles.inputError]}
            placeholder="Google Pay Number *"
            value={googlePay}
            onChangeText={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, googlePay: "" }));
              setGooglePay(value);
            }}
            keyboardType="phone-pad"
          />
          {errors.googlePay && (
            <Text style={styles.errorText}>{errors.googlePay}</Text>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEdit ? "Update Partner" : "Save Partner"}
        </Text>
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

export default CreatePartner;
