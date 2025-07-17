import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import CustomSelectPicker from "../customSelect";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import CreateCashier from "./createCashier";
import CreatePartner from "./createPartner";

const CreateProject = () => {
  const { projectId, isEdit } = useLocalSearchParams();
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [maximumInvestment, setMaximumInvestment] = useState("");
  const [minimumInvestment, setMinimumInvestment] = useState("");
  const [projectPhoto, setProjectPhoto] = useState(null);
  const [projectPhotoBase64, setProjectPhotoBase64] = useState("");
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerProfit, setPartnerProfit] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [userDataUpdated, setUserDataUpdated] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection("users").get();
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        usersList.forEach((obj) => {
          obj.label = obj?.name;
          obj.value = obj?.id;
        });
        console.log("usersList", usersList);
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, [userDataUpdated]);

  useEffect(() => {
    if (isEdit && projectId) {
      const fetchProject = async () => {
        try {
          const projectDoc = await firestore()
            .collection("projects")
            .doc(projectId)
            .get();
          const projectData = projectDoc.data();
          if (projectData) {
            setProjectName(projectData.projectName);
            setProjectLocation(projectData.projectLocation);
            setProjectDescription(projectData.projectDescription);
            setExpectedReturn(projectData.expectedReturn);
            setMaximumInvestment(projectData.maximumInvestment);
            setMinimumInvestment(projectData.minimumInvestment);
            setProjectPhotoBase64(projectData.projectPhoto);
            setSelectedProjectType(projectData.projectType);
            setSelectedLandlordType(projectData.landlordType);
            setSelectedClosingType(projectData.closingType);
            setSelectedCashier(projectData.assignedCashier);
            setPartners(projectData.partners || []);
          }
        } catch (error) {
          console.error("Error fetching project data: ", error);
        }
      };

      fetchProject();
    }
  }, [isEdit, projectId]);

  const projectTypes = [
    { value: "own", label: "Own project" },
    { value: "outside", label: "Outside project" },
  ];
  const landlordTypes = [
    { value: "ownership", label: "Ownership project" },
    { value: "rental", label: "Rental project" },
  ];
  const closingTypes = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  const [selectedProjectType, setSelectedProjectType] = useState("own");
  const [selectedLandlordType, setSelectedLandlordType] = useState("ownership");
  const [selectedClosingType, setSelectedClosingType] = useState("day");
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    let valid = true;
    let newErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required.";
      valid = false;
    }
    if (!projectLocation.trim()) {
      newErrors.projectLocation = "Project location is required.";
      valid = false;
    }
    if (!projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required.";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      const projectData = {
        projectName: projectName || "",
        projectLocation: projectLocation || "",
        projectDescription: projectDescription || "",
        projectType: selectedProjectType || "",
        landlordType: selectedLandlordType || "",
        closingType: selectedClosingType || "",
        expectedReturn: expectedReturn || "",
        maximumInvestment: maximumInvestment || "",
        minimumInvestment: minimumInvestment || "",
        projectPhoto: projectPhotoBase64 || "",
        assignedCashier: selectedCashier || "",
        partners: partners,
        createdAt: new Date(),
      };
      console.log("projectData", projectData);
      setLoading(true);
      try {
        if (isEdit && projectId) {
          await firestore()
            .collection("projects")
            .doc(projectId)
            .update(projectData);
          Alert.alert("Success", "Project updated successfully");
        } else {
          await firestore().collection("projects").add(projectData);
          Alert.alert("Success", "Project saved successfully");
        }
        router.replace("/admin/projectDashboard");
      } catch (error) {
        console.log("error", error);
        Alert.alert("Error", `Failed to ${isEdit ? "update" : "save"} project`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (name, value) => {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    switch (name) {
      case "projectName":
        setProjectName(value);
        break;
      case "projectLocation":
        setProjectLocation(value);
        break;
      case "projectDescription":
        setProjectDescription(value);
        break;
      case "expectedReturn":
        setExpectedReturn(value);
        break;
      case "maximumInvestment":
        setMaximumInvestment(value);
        break;
      case "minimumInvestment":
        setMinimumInvestment(value);
        break;
      case "partnerProfit":
        setPartnerProfit(value);
        break;
      case "investmentAmount":
        setInvestmentAmount(value);
        break;
      default:
        break;
    }
  };

  const handleValueChange = (pickerName, value) => {
    switch (pickerName) {
      case "projectType":
        setSelectedProjectType(value);
        break;
      case "landlordType":
        setSelectedLandlordType(value);
        break;
      case "closingType":
        setSelectedClosingType(value);
        break;
      case "cashier":
        setSelectedCashier(value);
        break;
      case "partner":
        setSelectedPartner(value);
        break;
      default:
        break;
    }
  };

  const handleAddPartner = () => {
    if (selectedPartner && partnerProfit && investmentAmount) {
      if (!partners.includes(selectedPartner)) {
        let selectedPartnerDetails = users.find(
          (obj) => obj.id == selectedPartner
        );
        setPartners([
          ...partners,
          {
            id: selectedPartner,
            profit: partnerProfit,
            investmentAmount,
            name: selectedPartnerDetails?.name,
          },
        ]);
        setSelectedPartner(null);
        setPartnerProfit("");
        setInvestmentAmount("");
      }
    } else {
      Alert.alert(
        "Error",
        "Please select a partner and enter a profit share percentage."
      );
    }
  };

  const deletePartner = (partnerId) => {
    setPartners((prevPartners) =>
      prevPartners.filter((partner) => partner.id !== partnerId)
    );
  };

  const selectProjectPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      let file = result?.assets?.[0]?.uri;
      setProjectPhoto(file);
      const base64 = await convertImageToBase64(file);
      setProjectPhotoBase64(base64);
    }
  };

  const convertImageToBase64 = async (uri) => {
    try {
      if (!uri) {
        throw new Error("Invalid URI");
      }
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.deleteAsync(uri); // Delete the local file
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.replace(`/admin/projectDashboard`)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEdit ? "Edit Project" : "Create Project"}
            </Text>
            <Text></Text>
          </View>
          <ScrollView style={styles.form}>
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={selectProjectPhoto}
                style={styles.uploadButton}
              >
                <Text style={styles.uploadButtonText}>
                  Upload Project Photo
                </Text>
              </TouchableOpacity>
              {projectPhoto || projectPhotoBase64 ? (
                <Image
                  source={{ uri: projectPhoto || projectPhotoBase64 }}
                  style={styles.projectPhoto}
                />
              ) : null}
            </View>
            <Text style={styles.labelName}>Project name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.projectName && styles.inputError]}
                placeholder="Project name *"
                value={projectName}
                onChangeText={(value) => handleChange("projectName", value)}
              />
              {errors.projectName && (
                <Text style={styles.errorText}>{errors.projectName}</Text>
              )}
            </View>
            <Text style={styles.labelName}>Project location</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.projectLocation && styles.inputError,
                ]}
                placeholder="Project location *"
                value={projectLocation}
                onChangeText={(value) => handleChange("projectLocation", value)}
              />
              {errors.projectLocation && (
                <Text style={styles.errorText}>{errors.projectLocation}</Text>
              )}
            </View>
            <Text style={styles.labelName}>Project description</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.projectDescription && styles.inputError,
                ]}
                placeholder="Project description *"
                value={projectDescription}
                onChangeText={(value) =>
                  handleChange("projectDescription", value)
                }
              />
              {errors.projectDescription && (
                <Text style={styles.errorText}>
                  {errors.projectDescription}
                </Text>
              )}
            </View>
            <Text style={styles.labelName}>Expected Return</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Expected Return"
                value={expectedReturn}
                onChangeText={(value) => handleChange("expectedReturn", value)}
              />
            </View>
            <Text style={styles.labelName}>Maximum Investment</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Maximum Investment"
                value={maximumInvestment}
                onChangeText={(value) =>
                  handleChange("maximumInvestment", value)
                }
              />
            </View>
            <Text style={styles.labelName}>Minimum Investment</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Minimum Investment"
                value={minimumInvestment}
                onChangeText={(value) =>
                  handleChange("minimumInvestment", value)
                }
              />
            </View>
            <Text style={styles.labelName}>Project type</Text>
            <View style={styles.inputContainer}>
              <CustomSelectPicker
                data={projectTypes}
                selectedValue={selectedProjectType}
                onValueChange={(value) =>
                  handleValueChange("projectType", value)
                }
                placeholder="Select Project Type"
              />
            </View>
            <Text style={styles.labelName}>Landlord type</Text>
            <View style={styles.inputContainer}>
              <CustomSelectPicker
                data={landlordTypes}
                selectedValue={selectedLandlordType}
                onValueChange={(value) =>
                  handleValueChange("landlordType", value)
                }
                placeholder="Select Landlord Type"
              />
            </View>
            <Text style={styles.labelName}>Closing type</Text>
            <View style={styles.inputContainer}>
              <CustomSelectPicker
                data={closingTypes}
                selectedValue={selectedClosingType}
                onValueChange={(value) =>
                  handleValueChange("closingType", value)
                }
                placeholder="Select Closing Type"
              />
            </View>
            <Text style={styles.labelName}>Cashier</Text>
            <View style={styles.inputContainer}>
              <CustomSelectPicker
                data={users.filter((user) => user.role === "cashier")}
                selectedValue={selectedCashier}
                onValueChange={(value) => handleValueChange("cashier", value)}
                placeholder="Select Cashier"
                customButton="Create New Cashier"
                customModal={() => setModalVisible(true)} // Ensure it's a function
              />
            </View>
            <View style={styles.partnerSection}>
              <Text style={styles.addPartnerHeading}>Partners section</Text>
              <CustomSelectPicker
                data={users?.filter((user) => user.role === "partner")}
                selectedValue={selectedPartner}
                onValueChange={(value) => handleValueChange("partner", value)}
                placeholder="Select Partner"
                customButton="Create New Partner"
                customModal={() => setPartnerModalVisible(true)}
              />
              <TextInput
                style={styles.profitInput}
                placeholder="Investment amount"
                keyboardType="numeric"
                value={investmentAmount}
                onChangeText={(value) =>
                  handleChange("investmentAmount", value)
                }
              />
              <TextInput
                style={styles.profitInput}
                placeholder="Profit share percentage"
                keyboardType="numeric"
                value={partnerProfit}
                onChangeText={(value) => handleChange("partnerProfit", value)}
              />
              <TouchableOpacity
                style={styles.addPartner}
                onPress={handleAddPartner}
              >
                <Text style={styles.addPartnerText}>Add</Text>
              </TouchableOpacity>

              {partners.map((partner) => (
                <View key={partner.id} style={styles.partnerContainer}>
                  <Text style={{ width: "30%" }}>{partner.name}</Text>
                  <Text style={{ width: "30%", color: "teal" }}>
                    {partner.investmentAmount}₹
                  </Text>
                  <Text style={{ width: "20%", color: "teal" }}>
                    {partner.profit}%
                  </Text>
                  <TouchableOpacity
                    style={styles.deletePartner}
                    onPress={() => deletePartner(partner.id)}
                  >
                    <Feather name="delete" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <CreateCashier
                  itsFromModal={true}
                  customModal={() => setModalVisible(false)} // Ensure it's a function
                  setUserDataUpdated={setUserDataUpdated}
                  userDataUpdated={userDataUpdated}
                />
              </View>
            </View>
          </Modal>
          <Modal
            visible={partnerModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPartnerModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <CreatePartner
                  itsFromModal={true}
                  customModal={() => setPartnerModalVisible(false)} // Ensure it's a function
                  setUserDataUpdated={setUserDataUpdated}
                  userDataUpdated={userDataUpdated}
                />
              </View>
            </View>
          </Modal>
        </>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelName: {
    color: "#7077A1",
    marginTop: 10,
    paddingHorizontal: 5
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
    marginVertical: 5,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "rgba(46, 46, 46, 0.8)",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  profitInput: {
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
  uploadButton: {
    backgroundColor: "#1679AB",
    borderRadius: 500,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    width: 200,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  projectPhoto: {
    width: "100%",
    height: 200,
    marginTop: 20,
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
  partnerSection: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    minHeight: 100,
    marginBottom: 20,
  },
  partnerList: {
    marginTop: 10,
  },
  partnerItem: {
    fontSize: 16,
    color: "#333",
  },
  addPartner: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addPartnerText: {
    color: "#fff",
    fontSize: 16,
  },
  addPartnerHeading: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  partnerContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 0,
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1, // Ensure it takes full space
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center", // Center the modalContainer
    maxHeight: 350,
  },
  modalContainer: {
    width: "90%", // Adjust as needed or use a fixed width
    maxWidth: 400, // Optional: Set a maximum width if desired
    borderRadius: 5,
    padding: 5,
    marginTop: 80,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreateProject;
