import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import BackgroundImage from "../backgroundImage";
import ProjectItems from "./projectItems";
import auth from '@react-native-firebase/auth';
import { useUser } from "../store/userContext";

// import auth from "@react-native-firebase/auth"; // Assuming you are using Firebase Auth

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateList, setUpdateList] = useState(false);
  const { user, initializing } = useUser();

  const colors = [
    "rgba(186, 171, 218, .3)",
    "rgba(121, 180, 183, .3)",
    "rgba(83, 92, 145, .3)",
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // const user = auth().currentUser; // Get the current logged-in user
        // if (!user) {
        //   console.error("No user is logged in");
        //   return;
        // }

        // const cashierUserId = user.uid; // Assuming you use the UID of the authenticated user as the cashier's user ID

        const projectsSnapshot = await firestore()
          .collection("projects")
          .where("assignedCashier", "==", "sN0o4iaWKsime99UMm3Z") // Filter projects by cashier user ID
          .get();
        const projectList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let filterProject = projectList.filter((obj) => obj.isDeleted != true);
        setProjects(filterProject);
      } catch (error) {
        console.error("Error fetching projects: ", error);
      }
    };

    fetchProjects();
  }, [updateList]);

  const filteredProjects = projects
    .filter((project) =>
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            auth()
              .signOut()
              .then(() => {
                console.log("User signed out!");
                router.replace("/"); // Replace with your login route
              })
              .catch((error) => {
                console.error("Error signing out: ", error);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <BackgroundImage>
      <SafeAreaView style={{ flex: 1, paddingTop: 50 }}>
        <View style={styles.logoutContainer}>
          <AntDesign
            name="logout"
            size={15}
            color="white"
            style={styles.logoutIcon}
            onPress={handleLogout}
          />
        </View>
        <View style={styles.header}>
          <View style={styles.search}>
            <FontAwesome
              name="search"
              size={13}
              color="#758694"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Search..."
              underlineColorAndroid="transparent"
              placeholderTextColor="#758694"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ alignItems: "center" }}>
          {!filteredProjects.length && (
            <Text style={styles.noProjectsText}>
              There are no projects, please create one
            </Text>
          )}
          {filteredProjects.map((project, index) => (
            <ProjectItems
              key={project.id}
              id={project.id}
              name={project.projectName}
              location={project.projectLocation}
              description={project.projectDescription}
              closingType={project.closingType}
              landlordType={project.landlordType}
              projectType={project.projectType}
              projectPhoto={project.projectPhoto}
              setUpdateList={setUpdateList}
              updateList={updateList}
              color={colors[index % colors.length]} // Assign color based on index
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 20,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(31, 31, 31, 0.7)",
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
    gap: 5,
  },
  icon: {
    marginLeft: 10,
    marginTop: 13,
  },
  input: {
    flex: 1,
    fontSize: 13,
    width: 300,
    color: "#758694",
  },
  noProjectsText: {
    color: "white",
    margin: 15,
    fontWeight: "bold",
    padding: 5,
    borderRadius: 10,
    opacity: 0.8,
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',

  },
  logoutIcon: {
    backgroundColor: "#1f2435",
    padding: 10,
    marginLeft: 10,
    borderRadius: 15,
    borderColor: "#1f2400",
    borderWidth: 2
  }
});

export default ProjectList;
