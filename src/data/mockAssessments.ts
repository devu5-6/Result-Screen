import { AssessmentResult } from '../types/assessment';

/**
 * Mock dataset that matches the PDF example scenario.
 * In production, fetched from the Vani.Coach API with pagination.
 */
export const MOCK_ASSESSMENTS: AssessmentResult[] = [
  {
    id: '1',
    questionNumber: 1,
    question: 'Tell me about yourself',
    assessmentType: 'Recorded',
    score: 82,
    status: 'Completed',
    completedAt: 'Dec 16, 2025 · 10:30 AM',
    feedback:
      'Great introduction! Your response was well-structured and confident. You highlighted your key strengths effectively and maintained excellent eye contact with the camera throughout.\n\nYour pacing was natural, and you demonstrated strong self-awareness when discussing your professional journey. Consider adding a brief mention of your long-term career aspirations to make your introduction even more compelling and forward-looking.\n\nStrengths: Confident delivery, clear structure, professional tone.\nAreas to improve: Add future goals, slightly reduce filler words.',
  },
  {
    id: '2',
    questionNumber: 2,
    question: 'Describe a challenging situation you faced at work',
    assessmentType: 'Recorded',
    score: 65,
    status: 'Completed',
    completedAt: 'Dec 17, 2025 · 02:15 PM',
    feedback:
      'You described the situation clearly, but the resolution could have been more detailed and impactful. The STAR method (Situation, Task, Action, Result) would help structure a stronger, more memorable answer.\n\nYour emotional intelligence came through when discussing team dynamics, which is a positive signal. However, quantifying the outcome — such as time saved, revenue impact, or team satisfaction improvement — would significantly strengthen your response.\n\nStrengths: Honest reflection, good emotional awareness.\nAreas to improve: Use STAR method, quantify results, be more specific about actions taken.',
  },
  {
    id: '3',
    questionNumber: 3,
    question: 'Write a professional email to your manager requesting a deadline extension',
    assessmentType: 'Text',
    score: 78,
    status: 'Completed',
    completedAt: 'Dec 18, 2025 · 11:00 AM',
    feedback:
      "Good email structure with a clear subject line and professional tone. The body was concise and action-oriented, demonstrating respect for your manager's time.\n\nYour reasoning for the extension was logical and well-presented. Minor improvements: include a specific proposed new deadline rather than leaving it open-ended, and add a brief note about what steps you've already taken to minimize the delay.\n\nStrengths: Professional tone, clear ask, good formatting.\nAreas to improve: Propose specific deadline, mention mitigation steps, add formal closing.",
  },
  {
    id: '4',
    questionNumber: 4,
    question: 'Explain your current project to a non-technical audience',
    assessmentType: 'Recorded',
    status: 'Pending',
  },
];
