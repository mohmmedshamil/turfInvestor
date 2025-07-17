import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import firestore from '@react-native-firebase/firestore';
import StatementPeriod from "./statementPeriod";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "../store/userContext";
import Ionicons from '@expo/vector-icons/Ionicons';

const ProjectStatement = () => {
  const [project, setProject] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const { projectId } = useLocalSearchParams();
  const { user, initializing } = useUser();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState(); // Default filter period
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (projectId) {
      const fetchProjectData = async () => {
        try {
          const projectSnapshot = await firestore().collection('projects').doc(projectId).get();
          if (projectSnapshot.exists) {
            const projectData = projectSnapshot.data();
            setProject(projectData);
          } else {
            console.log('No such project!');
          }
        } catch (error) {
          console.error("Error fetching project data: ", error);
        }
      };

      fetchProjectData();
    }
  }, [projectId]);

  useEffect(() => {
    if (project && project.partners) {
      let totalBalance = 0;
      const allTransactions = [];

      // Filter partners to get only the current user's details
      const currentUserPartner = project.partners.find(partner => partner.id === user?.id);

      if (currentUserPartner && currentUserPartner.profitShare) {
        currentUserPartner.profitShare.forEach((share) => {
          totalBalance += share.profitShare;
          allTransactions.push({
            date: new Date(share.date),
            amount: share.profitShare,
          });
        });
      }

      setCurrentBalance(totalBalance);
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    }
  }, [project, user]);

  const filterTransactions = () => {
    const now = new Date();
    let filtered = [];

    if (filterPeriod === 'custom') {
      if (startDate && endDate) {
        filtered = transactions.filter(transaction => transaction.date >= startDate && transaction.date <= endDate);
      }
    } else {
      switch (filterPeriod) {
        case 'lastMonth':
          const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
          filtered = transactions.filter(transaction => transaction.date >= lastMonth);
          break;
        case 'last3Months':
          const last3Months = new Date(now.setMonth(now.getMonth() - 3));
          filtered = transactions.filter(transaction => transaction.date >= last3Months);
          break;
        case 'last6Months':
          const last6Months = new Date(now.setMonth(now.getMonth() - 6));
          filtered = transactions.filter(transaction => transaction.date >= last6Months);
          break;
        case 'lastYear':
          const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
          filtered = transactions.filter(transaction => transaction.date >= lastYear);
          break;
        default:
          filtered = transactions;
          break;
      }
    }

    setFilteredTransactions(filtered);
  };

  const handleProceed = () => {
    filterTransactions();
  };

  const renderTransaction = (transaction, index) => (
    <View key={index} style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.date.toDateString()}</Text>
      </View>
      <Text style={styles.transactionAmount}>{transaction.amount.toFixed(2)}</Text>
    </View>
  );

  if (!project) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={()=> router.replace(`/partner/partnerDashboard`)}>
       <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Statement</Text>
        <Text style={styles.headerBalance}>Current Profit</Text>
        <Text style={styles.headerBalanceAmount}>{currentBalance.toFixed(2)}</Text>
      </View>
      <ScrollView>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <StatementPeriod
              filterPeriod={filterPeriod}
              setFilterPeriod={setFilterPeriod}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              onProceed={handleProceed}
            />
          </View>
        </View>

        <View style={styles.transactionList}>
          {filteredTransactions.map((transaction, index) => renderTransaction(transaction, index))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021526',
    padding: 20,
  },
  header: {
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 20,
  },
  headerBalance: {
    fontSize: 18,
    color: "white",
    marginHorizontal: 20,
  },
  headerBalanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: "#042240",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardItem: {
    alignItems: "center",
  },
  cardItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  creditCardBill: {
    backgroundColor: "#FF6B6B",
  },
  billingCycle: {
    backgroundColor: "#FFA726",
  },
  billPayment: {
    backgroundColor: "#4CAF50",
  },
  cardItemText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  cardItemAmount: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionList: {
    marginTop: 20,
  },
  date: {
    color: "#BBB",
    fontSize: 14,
    marginBottom: 10,
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
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: "white",
    fontSize: 16,
  },
  transactionSubtitle: {
    color: "#BBB",
    fontSize: 14,
  },
  transactionAmount: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProjectStatement;
