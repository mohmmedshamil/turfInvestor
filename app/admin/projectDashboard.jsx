import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator for the loader
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import BackgroundImage from "../backgroundImage";
import ProjectCardItems from "./projectCardItems";

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateList, setUpdateList] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const colors = [
    "rgba(186, 171, 218, .3)",
    "rgba(121, 180, 183, .3)",
    "rgba(83, 92, 145, .3)",
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true); // Start loading
        const projectsSnapshot = await firestore().collection("projects").get();
        const projectList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let filterProject = projectList.filter((obj) => obj.isDeleted != true);
        setProjects(filterProject);
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProjects();
  }, [updateList]);

  const filteredProjects = projects
    .filter((project) =>
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <BackgroundImage>
      <SafeAreaView style={{ flex: 1, paddingTop: 50 }}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.replace(`/admin/adminDashboard`)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.createProject}
                onPress={() => router.replace("/admin/createProject")}
              >
                <Text style={{ color: "#DC5F00", fontWeight: "500" }}>
                  Create Project
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: "center" }}>
              {!filteredProjects?.length && (
                <Text
                  style={{
                    color: "white",
                    margin: 15,
                    fontWeight: "bold",
                    padding: 5,
                    borderRadius: 10,
                    opacity: 0.8,
                  }}
                >
                  There is no partners, please create it
                </Text>
              )}
              {filteredProjects.map((project, index) => (
                <ProjectCardItems
                  key={project.id}
                  id={project.id}
                  name={project.projectName}
                  location={project.projectLocation}
                  description={project.projectDescription}
                  closingType={project.closingType}
                  expectedReturn={project.expectedReturn}
                  landlordType={project.landlordType}
                  maximumInvestment={project.maximumInvestment}
                  minimumInvestment={project.minimumInvestment}
                  projectType={project.projectType}
                  projectPhoto={project.projectPhoto}
                  setUpdateList={setUpdateList}
                  updateList={updateList}
                  color={colors[index % colors.length]} // Assign color based on index
                />
              ))}
            </ScrollView>
          </>
        )}
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
  createProject: {
    backgroundColor: "rgba(238, 230, 238, 1)",
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProjectDashboard;
