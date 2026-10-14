import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AssessmentListScreen from '../screens/AssessmentListScreen';
import AssessmentDetailScreen from '../screens/AssessmentDetailScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AssessmentList" component={AssessmentListScreen} />
        <Stack.Screen name="AssessmentDetail" component={AssessmentDetailScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
