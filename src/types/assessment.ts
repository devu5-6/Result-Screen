/**
 * Core domain types for the Assessment Results feature.
 */

export type AssessmentType = 'Recorded' | 'Text';
export type AssessmentStatus = 'Completed' | 'Pending';
export type PerformanceTier = 'Good' | 'Needs Improvement';

export interface AssessmentResult {
  id: string;
  questionNumber: number;
  question: string;
  assessmentType: AssessmentType;
  score?: number;         // undefined when status is Pending
  status: AssessmentStatus;
  feedback?: string;      // undefined when status is Pending
  completedAt?: string;
}
