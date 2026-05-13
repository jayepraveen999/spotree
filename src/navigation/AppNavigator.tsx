import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MapScreen from '../screens/MapScreen';
import CaptureScreen from '../screens/CaptureScreen';
import ExploreScreen from '../screens/ExploreScreen';
import TreeGuideScreen from '../screens/TreeGuideScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Map: { focused: 'map', unfocused: 'map-outline' },
  Capture: { focused: 'camera', unfocused: 'camera-outline' },
  Explore: { focused: 'compass', unfocused: 'compass-outline' },
  Guide: { focused: 'book', unfocused: 'book-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2d6a4f',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            height: 88,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Capture" component={CaptureScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Guide" component={TreeGuideScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
