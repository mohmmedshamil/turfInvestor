import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { useUser } from "../store/userContext";
import { router } from "expo-router";
import Footer from "./footer";
// import registerNNPushToken from 'native-notify';

const PartnerDashboard = () => {
  const landingPage = require("../../assets/images/landingPage.jpg");
  const [projects, setProjects] = useState([]);
  const { user, initializing } = useUser();
  const [loading, setLoading] = useState(true);
  // let token = registerNNPushToken(23118, 'pjBZ9MxRPC33VwBGOTqi1Z');
  // console.log("registerNNPushToken", token);
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true); // Start loader
      try {
        const projectsSnapshot = await firestore().collection("projects").get();
        const projectList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let filterProject = projectList.filter(
          (obj) =>
            obj.isDeleted !== true &&
            obj.partners?.some((partner) => partner?.id === user?.id)
        );
        console.log("filterProject", filterProject);
        setProjects(filterProject);
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setLoading(false); // Stop loader
      }
    };
    fetchProjects();
  }, [user]);
  const showStatement = (id) => {
    const params = { projectId: id };
    const queryString = new URLSearchParams(params).toString();
    router.replace(`/partner/projectStatement?${queryString}`);
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFB72B" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Existing UI code */}
          {/* Header */}
          <View style={styles.header}>
            <Image
              style={styles.avatar}
              source={{ uri: "https://via.placeholder.com/150" }} // Replace with the actual avatar URL
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>hello, {user?.name}</Text>
              <Text style={styles.welcome}>Welcome back</Text>
            </View>
          </View>

          {/* Explore Opportunities */}
          <Text style={styles.sectionTitle}>your projects</Text>

          {projects?.length ? (
            projects.map((obj) => {
              const partner = obj.partners.find((p) => p.id === user.id);
              const investment = partner ? partner.investmentAmount : "N/A";
              const profit = partner ? partner?.profit : "N/A";
              const profitShare = partner
                ? partner?.profitShare?.reduce((accumulator, currentValue) => {
                    return accumulator + Math.floor(currentValue.profitShare);
                  }, 0)
                : "N/A";
              const latestProfit = partner
                ? partner?.profitShare?.[0]?.profitShare
                : "N/A";
              return (
                <TouchableOpacity
                  onPress={() => showStatement(obj.id)}
                  key={obj.id}
                >
                  <View style={[styles.card]}>
                    <ImageBackground
                      source={
                        obj?.projectPhoto
                          ? { uri: obj.projectPhoto }
                          : landingPage
                      }
                      style={styles.image}
                    >
                      <Text style={styles.infoImage}>
                        <AntDesign
                          name="enviroment"
                          size={18}
                          color="#FFB72B"
                        />
                        {obj.location}
                      </Text>
                    </ImageBackground>
                    <View style={styles.content}>
                      <View style={styles.header}>
                        <Text style={styles.title}>{obj.projectName}</Text>
                        <Text style={styles.projectType}>
                          {obj.closingType}
                        </Text>
                      </View>
                      <View style={styles.details}>
                        <Text style={styles.description}>
                          {obj.projectDescription}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Investment:</Text>{" "}
                          {investment}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Profit share:</Text>{" "}
                          {profit} %
                        </Text>
                      </View>
                      <View style={styles.investment}>
                        <Text style={styles.maximumInvestment}>
                          Total Profit: ₹{profitShare}
                        </Text>
                        <Text style={styles.minimumInvestment}>
                          Latest Profit: ₹{latestProfit}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity style={styles.contactAdminButton}>
              <Text style={styles.contactAdminText}>Contact Admin</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Footer Menu */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#021526",
    paddingTop: 30,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  welcome: {
    fontSize: 14,
    color: "gray",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 16,
    color: "#E2DFD0",
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
    marginBottom: 15,
  },
  contactAdminButton: {
    backgroundColor: "#FFB72B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  contactAdminText: {
    fontSize: 16,
    color: "#0d0d19",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#121113",
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    margin: 10,
    width: 300,
    padding: 5,
    backgroundColor: "#d6a231",
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
    color: "#101000",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: "#344C64",
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
  label: {
    fontWeight: "bold",
    color: "#344C64",
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
    color: "#1A3636",
  },
  minimumInvestment: {
    fontSize: 14,
    color: "#677D6A",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#ddd",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 50, height: 50 },
    shadowOpacity: 1,
    shadowRadius: 4,
    backgroundColor: "#d6a231",
    elevation: 5, // Android
  },
  footerButton: {
    alignItems: "center",
    paddingVertical: 2,
  },
  footerText: {
    fontSize: 12,
    color: "#0d0d19",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PartnerDashboard;
