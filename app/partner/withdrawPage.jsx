import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUser } from "../store/userContext";
import Footer from "./footer";

const WithdrawPage = () => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const { user, initializing } = useUser();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchUserProjects = async () => {
        try {
          const projectsSnapshot = await firestore()
            .collection("projects")
            .get();

          let totalBalance = 0;
          projectsSnapshot.docs.forEach((doc) => {
            const projectData = doc.data();
            const currentUserPartner = projectData?.partners?.find(
              (partner) => partner?.id === user?.id
            );

            if (currentUserPartner && currentUserPartner.profitShare) {
              currentUserPartner.profitShare.forEach((share) => {
                totalBalance += Math.floor(share.profitShare);
              });
            }
          });

          const withdrawRequestsSnapshot = await firestore()
            .collection("withdrawRequests")
            .where("userId", "==", user.id)
            .get();

          const totalWithdrawn = withdrawRequestsSnapshot.docs.reduce(
            (sum, doc) => sum + doc.data().amount,
            0
          );

          const available = totalBalance - totalWithdrawn;
          setAvailableBalance(available);

          const userTransactions = withdrawRequestsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setTransactions(userTransactions);
        } catch (error) {
          console.error("Error fetching user projects: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProjects();
    }
  }, [user]);

  // const sendEmail = (user, amount) => {
  //   const templateParams = {
  //     apikey: '7E129BC24C1DF9DA85CC3677A3E1C3B6F3A7AD773304D98BDD701523DC6878EEC72128A93743B3434F6B07979FE66616',
  //     subject: 'Withdrawal Request Notification',
  //     from: 'turfinvestor006@gmail.com',
  //     to: 'turfinvestor006@gmail.com',
  //     bodyText: `
  //       A withdrawal request has been made by ${user.name}:
  //       - Phone: ${user.phoneNumber}
  //       - Amount: ₹${amount.toFixed(2)}
  //       - Account Number: ${user.accountNumber || '-'}
  //       - IFSC: ${user.ifsc || '-'}
  //       - Google Pay: ${user.googlePay || '-'}
  //     `,
  //     isTransactional: false, // Set to true if the email is transactional
  //   };

  //   fetch('https://api.elasticemail.com/v2/email/send', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: new URLSearchParams(templateParams).toString(),
  //   })
  //     .then(response => response.json())
  //     .then(result => {
  //       if (result.success) {
  //         console.log('Email sent successfully:', result);
  //       } else {
  //         console.error('Error sending email:', result.error);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error sending email:', error);
  //     });
  // };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount to withdraw.");
      return;
    }

    if (amount > availableBalance) {
      Alert.alert(
        "Insufficient balance",
        "You do not have enough balance to withdraw this amount."
      );
      return;
    }

    setLoading(true);

    try {
      const newWithdrawal = {
        amount,
        status: "pending",
        timestamp: new Date().getTime(),
        userId: user.id,
        user: user,
      };

      const docRef = await firestore()
        .collection("withdrawRequests")
        .add(newWithdrawal);
      const withdrawalId = docRef.id;

      await firestore()
        .collection("users")
        .doc(user.id)
        .update({
          withdrawals: firestore.FieldValue.arrayUnion(withdrawalId),
        });

      setAvailableBalance((prevBalance) => prevBalance - amount);
      setTransactions((prevTransactions) => [
        { id: withdrawalId, ...newWithdrawal },
        ...prevTransactions,
      ]);

      Alert.alert(
        "Withdrawal Successful",
        "Your withdrawal request has been submitted."
      );
      // sendNotificationToAdmin(user, amount);
      // sendEmail(user, amount);
    } catch (error) {
      console.error("Error processing withdrawal: ", error);
      Alert.alert(
        "Error",
        "There was an error processing your withdrawal. Please try again later."
      );
    } finally {
      setLoading(false);
      setWithdrawAmount("");
    }
  };

  if (initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFBF00";
      case "success":
        return "#00FF00";
      case "failed":
        return "#FF0000";
      default:
        return "#FFFFFF";
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFB72B" />
        </View>
      ) : (
        <>
          <ScrollView style={styles.content}>
            <Text style={styles.balanceText}>Your available balance</Text>
            <Text style={styles.balanceAmount}>
              ₹ {availableBalance.toFixed(2)}
            </Text>
            <View style={styles.balanceContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter amount to withdraw"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.transactionText}>
              The below list summarizes the transaction history of your account
            </Text>

            {transactions.length > 0 ? (
              Object.keys(groupedTransactions).map((date) => (
                <View key={date}>
                  <Text style={styles.transactionDate}>{date}</Text>
                  {groupedTransactions[date].map((transaction, index) => (
                    <View key={index} style={styles.transactionItem}>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionTitle}>
                          ₹ {transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionStatus,
                          { color: getStatusColor(transaction.status) },
                        ]}
                      >
                        {transaction.status === "success"
                          ? "credited"
                          : transaction.status}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.noTransactionsText}>
                No transactions found!
              </Text>
            )}
          </ScrollView>
          <Footer />
        </>
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
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
    color: "#000",
    marginRight: 8,
    fontSize: 16,
  },
  withdrawButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  withdrawButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  transactionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 16,
  },
  transactionDate: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#535C91",
    marginTop: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  noTransactionsText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WithdrawPage;
