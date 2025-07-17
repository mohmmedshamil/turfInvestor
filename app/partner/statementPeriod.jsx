import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomRadioButton = ({ label, value, checked, onPress }) => {
  return (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onPress(value)}>
      <View style={styles.radioButton}>
        {checked === value && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const StatementPeriod = ({ filterPeriod, setFilterPeriod, startDate, setStartDate, endDate, setEndDate, onProceed }) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  const handleCustomDateRange = () => {
    setFilterPeriod('custom');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>For which period do you need a statement?</Text>
      <View style={styles.radioContainer}>
        <CustomRadioButton label="Last Month" value="lastMonth" checked={filterPeriod} onPress={setFilterPeriod} />
        <CustomRadioButton label="Last 3 Months" value="last3Months" checked={filterPeriod} onPress={setFilterPeriod} />
        <CustomRadioButton label="Last 6 Months" value="last6Months" checked={filterPeriod} onPress={setFilterPeriod} />
        <CustomRadioButton label="Last Year" value="lastYear" checked={filterPeriod} onPress={setFilterPeriod} />
      </View>
      <Text style={styles.customDateText}>Or select a custom date of your choice</Text>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={() => { handleCustomDateRange(); setShowStartDatePicker(true); }} style={styles.datePicker}>
          <Text style={styles.datePickerText}>{startDate ? startDate.toDateString() : "Start Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { handleCustomDateRange(); setShowEndDatePicker(true); }} style={styles.datePicker}>
          <Text style={styles.datePickerText}>{endDate ? endDate.toDateString() : "End Date"}</Text>
        </TouchableOpacity>
      </View>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeStartDate}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeEndDate}
        />
      )}
      <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#fff"
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#005EB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#005EB8',
  },
  radioButtonLabel: {
    fontSize: 14,
    color: "#fff"
  },
  customDateText: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    color: "#fff"
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  datePickerText: {
    color: 'grey',
  },
  proceedButton: {
    backgroundColor: '#005EB8',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "500"
  },
  advancedSearchText: {
    color: '#005EB8',
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default StatementPeriod;
