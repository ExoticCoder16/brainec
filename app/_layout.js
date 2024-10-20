// app/_layout.tsx
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false, // Hide the header for the index screen
        }} 
      />
      <Stack.Screen 
        name="details" 
        options={{
          title: 'AI Result',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
