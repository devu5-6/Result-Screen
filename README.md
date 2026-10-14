# Vani.Coach — Assessment Results Screen (React Native)

An AI-powered communication coaching platform frontend assessment implementation for **Vani.Coach**, built with React Native and Expo.

---

## 🎯 Example Scenario Data Compliance

The mock dataset in `src/data/mockAssessments.ts` matches the exact scenario specified in the assessment PDF:

1. **"Tell me about yourself"**
   - Type: `Recorded`
   - Score: `82`
   - Status: `Completed` $\rightarrow$ **Good** ($\ge 75$)
   - AI Feedback: Included (strengths, pacing, delivery)
2. **"Describe a challenging situation"**
   - Type: `Recorded`
   - Score: `65`
   - Status: `Completed` $\rightarrow$ **Needs Improvement** ($< 75$)
   - AI Feedback: Included (STAR method, quantifiable outcomes)
3. **"Write a professional email to your manager"**
   - Type: `Text`
   - Score: `78`
   - Status: `Completed` $\rightarrow$ **Good** ($\ge 75$)
   - AI Feedback: Included (conciseness, action items)
4. **"Explain your current project"**
   - Type: `Recorded`
   - Status: `Pending`
   - Score: `undefined` (correctly omitted)
   - Feedback: `undefined` (correctly omitted)

---

## 🚀 Key Architectural & Technical Decisions

### 1. Virtualization & Memory Efficiency for Large Datasets
- **`FlatList` over `ScrollView`**: Ensures only visible rows plus a small buffer window are mounted in memory.
- **`removeClippedSubviews={true}`**: Native views outside the viewport are detached from the hierarchy to conserve RAM on both Android and iOS.
- **Tuned Batch Rendering**:
  - `initialNumToRender={6}`: Quick first frame paint.
  - `maxToRenderPerBatch={8}`: Prevents UI thread starvation during fast flings.
  - `windowSize={10}`: Keeps active memory footprint bounded regardless of list size (e.g., 500+ items).
- **Component Memoization**:
  - `AssessmentCard` is wrapped in `React.memo` with a custom equality check `(prev, next) => prev.item === next.item`.
  - Callbacks (`renderItem`, `keyExtractor`) use `useCallback` to avoid breaking memoization.

### 2. Edge Case Handling
- **Pending Assessments**:
  - Pending items gracefully omit scores, feedback, and detail navigation buttons.
  - Status is displayed with a clean "Pending Review" pill and "Awaiting AI evaluation..." prompt.
- **Empty State**:
  - When no assessments exist in the active tab (or when toggling the Empty State Demo button), `EmptyList` displays an intuitive call-to-action without crashing or rendering empty cards.
- **Data Growth / Pagination Readiness**:
  - Structured domain model (`AssessmentResult`) supports cursor-based or offset pagination with zero changes to the presentation layer.

### 3. Custom Precision Radial Gauge Component (`BiomarkerGaugeCard`)
- Custom-engineered radial capsule-tick gauge inspired by modern health & coaching biomarker designs.
- Features smooth interpolation, dynamic tick coloring, dome ambient glow, and compact row layout fitting 3 key metrics side-by-side:
  - **Pending Queue**
  - **Average Score %**
  - **Completed Count**

---

## 📂 Project Structure

```
assessment-results/
├── src/
│   ├── components/
│   │   └── BiomarkerGaugeCard.tsx    # Radial capsule tick gauge component
│   ├── constants/
│   │   └── theme.ts                  # Design tokens, color palette, typography & thresholds
│   ├── data/
│   │   └── mockAssessments.ts        # Dataset matching PDF example scenario
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Stack navigation (List -> Detail -> Feedback)
│   │   └── types.ts                  # Type-safe navigation parameters
│   ├── screens/
│   │   ├── AssessmentListScreen.tsx  # Main results list with hero gauges & tabs
│   │   ├── AssessmentDetailScreen.tsx# Single assessment scorecard & breakdown
│   │   └── FeedbackScreen.tsx        # In-depth AI feedback viewer & progress sheet
│   └── types/
│       └── assessment.ts             # Domain interfaces (AssessmentResult, etc.)
├── App.tsx                           # Safe area root provider & navigation root
└── package.json
```

---

## 🛠️ Running the Application

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Start the Development Server
```bash
npm start
```

### 2. Run on Web
```bash
npm run web
```

### 3. Run on Mobile (iOS / Android)
- Scan the QR code using the **Expo Go** app on your physical device, or press `a` for Android Emulator / `i` for iOS Simulator.

### 4. Interactive Empty State Demo
- Tap the **top-right button** in the hero section on the main screen to toggle between **Normal Mode** and **Empty State Simulation**.

---

## ✅ Code Quality Verification
- **TypeScript**: `npx tsc --noEmit` $\rightarrow$ 0 errors
- **Linter**: `npm run lint` $\rightarrow$ 0 warnings / 0 errors
