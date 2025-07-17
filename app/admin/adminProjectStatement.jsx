import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import StatementPeriod from "../partner/statementPeriod";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";

const AdminProjectStatement = () => {
  const [project, setProject] = useState(null);
  const [dateWiseTransactions, setDateWiseTransactions] = useState({});
  const [filteredTransactions, setFilteredTransactions] = useState({});
  const [filterPeriod, setFilterPeriod] = useState("lastMonth");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { projectId } = useLocalSearchParams();

  useEffect(() => {
    if (projectId) {
      const fetchProjectData = async () => {
        try {
          const projectSnapshot = await firestore()
            .collection("projects")
            .doc(projectId)
            .get();
          if (projectSnapshot.exists) {
            const projectData = projectSnapshot.data();
            setProject(projectData);
            groupTransactionsByDate(projectData.partners || [], projectData.profits);
          } else {
            console.log("No such project!");
          }
        } catch (error) {
          console.error("Error fetching project data: ", error);
        }
      };

      fetchProjectData();
    }
  }, [projectId]);

  useEffect(() => {
    console.log("dateWiseTransactions", dateWiseTransactions);
    if (Object.keys(dateWiseTransactions).length > 0) {
      filterTransactions();
    }
  }, [dateWiseTransactions, filterPeriod]);

  const groupTransactionsByDate = (partners, profits) => {
    const transactionsByDate = {};

    partners.forEach((partner) => {
      partner?.profitShare?.forEach((share) => {
        const date = new Date(share.date).toDateString();
        if (!transactionsByDate[date]) {
          transactionsByDate[date] = {};
        }
        if (!transactionsByDate[date]?.transactionArray) {
            transactionsByDate[date].transactionArray = [];
          }
        console.log("transactionsByDate", transactionsByDate);
        let profit = profits.find((obj)=> obj.date == share.date);
        if(profit){
            transactionsByDate[date].income = profit.income;
            transactionsByDate[date].expense =  profit.expense;
        }
        transactionsByDate[date]?.transactionArray.push({
          partnerName: partner.name,
          amount: share.profitShare,
          date: new Date(share.date),
        });
      });
    });
    console.log("transactionsByDate", transactionsByDate);
    setDateWiseTransactions(transactionsByDate);
  };

  const filterTransactions = () => {
    let filtered = {};

    const periodMapping = {
      lastMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      last3Months: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      last6Months: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      lastYear: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    };

    const start =
      filterPeriod === "custom" ? startDate : periodMapping[filterPeriod];
    const end = filterPeriod === "custom" ? endDate : new Date();

    Object.keys(dateWiseTransactions).forEach((date) => {
      const filteredByDate = dateWiseTransactions[date].transactionArray.filter(
        (transaction) => transaction.date >= start && transaction.date <= end
      );

      if (filteredByDate.length > 0) {
        filtered[date] = filteredByDate;
      }
    });

    setFilteredTransactions(filtered);
  };

  const renderDateWiseTransactions = () => {
    if (Object.keys(filteredTransactions).length === 0) {
      return (
        <View style={styles.noTransactions}>
          <Text style={styles.noTransactionsText}>
            No transactions available for the selected period.
          </Text>
        </View>
      );
    }
  
    return Object.keys(filteredTransactions).map((date, index) => (
      <View key={index} style={styles.dateSection}>
        <Text style={styles.dateTitle}>{date}</Text>
        <Text style={styles.incomeExpenseText}>
          Income: {dateWiseTransactions[date]?.income || 0}, Expense: {dateWiseTransactions[date]?.expense || 0}
        </Text>
        {filteredTransactions[date]?.map((transaction, idx) => (
          <View key={idx} style={styles.transactionItem}>
            <Text style={styles.partnerName}>{transaction.partnerName}</Text>
            <Text style={styles.transactionAmount}>
              {transaction.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    ));
  };

  const generateExcel = async () => {
    if (!project || Object.keys(filteredTransactions).length === 0) {
      return;
    }

    const wsData = [];

    // Add Project Name
    wsData.push([
      {
        v: `Project: ${project.projectName}`,
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "008080" } },
        },
      },
    ]);
    wsData.push([]);

    // Add Headers
    const headers = [
      "Date",
      ...project.partners.map((partner) => partner.name),
      "Total",
    ];
    wsData.push(
      headers.map((header) => ({
        v: header,
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "008080" } },
        },
      }))
    );

    // Add Data Rows
    Object.keys(filteredTransactions).forEach((date) => {
      const row = [{ v: date, s: { fill: { fgColor: { rgb: "E0FFFF" } } } }];
      let totalProfit = 0;

      project.partners.forEach((partner) => {
        const partnerTransactions = filteredTransactions[date].filter(
          (transaction) => transaction.partnerName === partner.name
        );
        const profit = partnerTransactions.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
        totalProfit += profit;

        row.push({
          v: profit.toFixed(2),
          s: { fill: { fgColor: { rgb: "FFE4B5" } } },
        });
      });

      row.push({
        v: totalProfit.toFixed(2),
        s: { font: { bold: true }, fill: { fgColor: { rgb: "F0E68C" } } },
      });
      wsData.push(row);
    });

    // Add Total Profit
    wsData.push([]);
    const totalRow = [
      {
        v: "Total Profit",
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "008080" } },
        },
      },
    ];
    const totalProfits = project.partners.map((partner) => {
      let total = 0;
      Object.keys(filteredTransactions).forEach((date) => {
        const partnerTransactions = filteredTransactions[date].filter(
          (transaction) => transaction.partnerName === partner.name
        );
        total += partnerTransactions.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
      });
      return {
        v: total.toFixed(2),
        s: { font: { bold: true }, fill: { fgColor: { rgb: "FFA500" } } },
      };
    });
    totalRow.push(...totalProfits);
    totalRow.push({
      v: totalProfits
        .reduce((acc, curr) => acc + parseFloat(curr.v), 0)
        .toFixed(2),
      s: { font: { bold: true }, fill: { fgColor: { rgb: "FFA500" } } },
    });
    wsData.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const uri =
      FileSystem.cacheDirectory + `project_statement_${projectId}.xlsx`;

    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(uri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Project Statement",
      UTI: "com.microsoft.excel.xlsx",
    });
  };

  if (!project) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace(`/admin/projectDashboard`)}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{project.projectName}</Text>
      </View>
      <ScrollView>
        <View
          style={{
            backgroundColor: "#344C64",
            marginBottom: 10,
            borderRadius: 10,
          }}
        >
          <StatementPeriod
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onProceed={filterTransactions}
          />
        </View>
        {filteredTransactions ? renderDateWiseTransactions() : ""}
        {Object.keys(filteredTransactions).length === 0 ? (
          ""
        ) : (
          <TouchableOpacity style={styles.exportButton} onPress={generateExcel}>
            <Text style={styles.exportButtonText}>Export to Excel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#021526",
    padding: 20,
  },
  header: {
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: "#042240",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  projectTitle: {
    fontSize: 20,
    color: "white",
  },
  dateSection: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F97300",
    marginBottom: 5,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#50727B",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  partnerName: {
    color: "white",
    fontSize: 16,
  },
  transactionAmount: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  exportButton: {
    backgroundColor: "#F97300",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  exportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noTransactionsText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  incomeExpenseText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  }
});

export default AdminProjectStatement;
