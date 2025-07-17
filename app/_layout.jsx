import { Stack } from "expo-router";
import { UserProvider } from "./store/userContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "orange",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="otpVerificationPage"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/adminDashboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/projectDashboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/createProject"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/cashierDashboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/createCashier"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/partnerDashboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="admin/createPartner"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="cashier/projectList"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="cashier/editProfitClose"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="partner/partnerDashboard"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="partner/projectStatement"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="partner/withdrawPage"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="admin/withdrawHistory"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="partner/settings"
          options={{
            headerShown: false,
          }}
        />
                <Stack.Screen
          name="admin/adminProjectStatement"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="partner/personalInfo"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="partner/contactAdmin"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerBackTitleVisible: false,
          }}
        />
      </Stack>
    </UserProvider>
  );
}
