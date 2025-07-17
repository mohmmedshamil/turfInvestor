import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";

const ProjectCardItems = ({
  id,
  name,
  location,
  description,
  closingType,
  expectedReturn,
  landlordType,
  maximumInvestment,
  minimumInvestment,
  projectType,
  projectPhoto,
  setUpdateList,
  updateList,
  color,
}) => {
  const landingPage = require("../../assets/images/landingPage.jpg");

  const confirmDelete = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: handleDelete,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async () => {
    try {
      await firestore().collection("projects").doc(id).update({
        isDeleted: true,
      });
      setUpdateList(!updateList);
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to mark project as deleted");
    }
  };

  const editProject = () => {
    const params = { projectId: id, isEdit: true };
    const queryString = new URLSearchParams(params).toString();
    router.replace(`/admin/createProject?${queryString}`);
  };

  const reportProject = () => {
    const params = { projectId: id, isEdit: true };
    const queryString = new URLSearchParams(params).toString();
    router.replace(`/admin/adminProjectStatement?${queryString}`);
  };

  return (
    <TouchableOpacity onPress={editProject}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <ImageBackground
          source={projectPhoto ? { uri: projectPhoto } : landingPage}
          style={styles.image}
        >
          <Text style={styles.infoImage}>
            <AntDesign name="enviroment" size={18} color="#FFB72B" />
            {location}
          </Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <MaterialIcons name="delete-outline" size={24} color="red" />
          </TouchableOpacity>
        </ImageBackground>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.projectType}>{projectType}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.info}>
              <Text style={styles.label}>Closing Type:</Text> {closingType}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>Expected Return:</Text> ₹
              {expectedReturn}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>Landlord Type:</Text> {landlordType}
            </Text>
          </View>
          <View style={styles.investment}>
            <Text style={styles.maximumInvestment}>
              Maximum Investment: ₹{maximumInvestment}
            </Text>
            <Text style={styles.minimumInvestment}>
              Minimum Investment: ₹{minimumInvestment}
            </Text>
          </View>
          {/* Add Report Button */}
          <TouchableOpacity style={styles.reportBtn} onPress={reportProject}>
            <Text style={styles.reportBtnText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: "hidden",
    margin: 10,
    width: 300,
    padding: 5,
  },
  imageContainer: {
    borderBottomWidth: 4,
    borderBottomColor: "#fff",
  },
  image: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E2DFD0",
  },
  projectType: {
    fontSize: 14,
    color: "#FFFFFF",
    backgroundColor: "#79B4B7",
    padding: 5,
    borderRadius: 10,
  },
  details: {
    marginBottom: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
  },
  description: {
    fontSize: 14,
    color: "#BED1CF",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: "#BDC3C7",
  },
  infoImage: {
    fontSize: 14,
    marginBottom: 5,
    color: "#BDC3C7",
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: 10,
    backgroundColor: "rgba(151, 196, 184, .5)",
    borderRadius: 10,
    margin: 10,
  },
  deleteBtn: {
    position: "absolute",
    top: 0,
    right: 10,
    padding: 5,
    backgroundColor: "rgba(140, 190, 180, .5)",
    borderRadius: 50,
  },
  label: {
    fontWeight: "bold",
    color: "#ECF0F1",
  },
  investment: {
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7",
    paddingTop: 5,
  },
  maximumInvestment: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1C40F",
  },
  minimumInvestment: {
    fontSize: 14,
    color: "#BDC3C7",
  },
  reportBtn: {
    backgroundColor: "teal",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  reportBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProjectCardItems;
