import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const WithdrawHistory = () => {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state
  const [selectedUser, setSelectedUser] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const fetchWithdrawRequests = async () => {
      try {
        const snapshot = await firestore().collection("withdrawRequests").get();
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWithdrawRequests(requests);
      } catch (error) {
        console.error("Error fetching withdrawal requests: ", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchWithdrawRequests();
  }, []);

  const groupByDate = (requests) => {
    return requests.reduce((acc, request) => {
      const date = new Date(request.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(request);
      return acc;
    }, {});
  };

  const groupedRequests = groupByDate(withdrawRequests);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFBF00"; // yellow
      case "success":
        return "#00FF00"; // green
      case "failed":
        return "#FF0000"; // red
      default:
        return "#FFFFFF"; // default white
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setTooltipVisible(true);
  };

  const updateStatus = async (requestId, newStatus) => {
    try {
      await firestore().collection("withdrawRequests").doc(requestId).update({
        status: newStatus,
      });
      setWithdrawRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
    } finally {
      setTooltipVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Loading withdrawal requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace(`/admin/adminDashboard`)} style={{paddingHorizontal: 15, padding: 5}}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Withdraw Requests</Text>
        {Object.keys(groupedRequests).length > 0 ? (
          Object.keys(groupedRequests).map((date) => (
            <View key={date}>
              <Text style={styles.transactionDate}>{date}</Text>
              {groupedRequests[date].map((request) => (
                <TouchableOpacity
                  key={request.id}
                  onPress={() => handleUserClick(request)}
                >
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>
                        {request.user?.name}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>
                        ₹ {request.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionSubtitle}>
                        {
                          new Date(request.timestamp)
                            .toLocaleString()
                            ?.split(",")?.[1]
                        }
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionStatus,
                        { color: getStatusColor(request.status) },
                      ]}
                    >
                      {request.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noTransactionsText}>
            No withdrawal requests found!
          </Text>
        )}
      </ScrollView>

      {selectedUser && (
        <Modal
          transparent={true}
          visible={tooltipVisible}
          onRequestClose={() => setTooltipVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>User Details</Text>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  Name: {selectedUser.user.name}
                </Text>
                <Text style={styles.modalText}>
                  Email: {selectedUser.user.email}
                </Text>
                <Text style={styles.modalText}>
                  Phone Number: {selectedUser.user.phoneNumber}
                </Text>
                <Text style={styles.modalText}>
                  Account Number: {selectedUser.user.accountNumber}
                </Text>
                <Text style={styles.modalText}>
                  Google Pay Number: {selectedUser.user.googlePay}
                </Text>
                <Text style={styles.modalText}>
                  PAN: {selectedUser.user.pan}
                </Text>
                <Text style={styles.modalText}>
                  Aadhaar: {selectedUser.user.aadhaar}
                </Text>
                <Text style={styles.modalText}>
                  IFSC: {selectedUser.user.ifsc}
                </Text>
                <Text style={styles.modalText}>
                  Current Status: {selectedUser.status}
                </Text>
              </View>

              {
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => updateStatus(selectedUser.id, "failed")}
                    style={[styles.actionButton, styles.failedButton]}
                  >
                    <Text style={styles.actionButtonText}>Failed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateStatus(selectedUser.id, "approved")}
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateStatus(selectedUser.id, "success")}
                    style={[styles.actionButton, styles.successButton]}
                  >
                    <Text style={styles.actionButtonText}>Success</Text>
                  </TouchableOpacity>
                </View>
              }

              <TouchableOpacity
                onPress={() => setTooltipVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F58CD",
    marginBottom: 20,
  },
  transactionDate: {
    fontSize: 16,
    color: "#787A91",
    fontWeight: "bold",
    marginVertical: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#344C64",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  transactionStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1, // Ensures that text does not overflow
  },
  transactionSubtitle: {
    color: "#BBB",
    fontSize: 12,
  },
  noTransactionsText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: "#021526",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor: "#fff",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#d6a231",
  },
  modalContent: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#d6a231",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  failedButton: {
    backgroundColor: "#FF0000",
  },
  successButton: {
    backgroundColor: "#03C988",
  },
  approveButton: {
    backgroundColor: "#FB773C",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021526",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: "#fff",
  },
});

export default WithdrawHistory;
