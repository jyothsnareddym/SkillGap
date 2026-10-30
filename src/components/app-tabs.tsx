
import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Analyze',
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
