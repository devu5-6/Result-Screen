import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  AssessmentList: undefined;
  AssessmentDetail: { assessmentId: string };
  Feedback: { assessmentId: string };
};

export type AssessmentListNavProp = NativeStackNavigationProp<RootStackParamList, 'AssessmentList'>;
export type AssessmentDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'AssessmentDetail'>;
export type AssessmentDetailRouteProp = RouteProp<RootStackParamList, 'AssessmentDetail'>;
export type FeedbackNavProp = NativeStackNavigationProp<RootStackParamList, 'Feedback'>;
export type FeedbackRouteProp = RouteProp<RootStackParamList, 'Feedback'>;
