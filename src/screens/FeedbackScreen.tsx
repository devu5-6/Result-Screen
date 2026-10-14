import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackNavProp, FeedbackRouteProp } from '../navigation/types';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';
import { AssessmentResult } from '../types/assessment';
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  SCORE_GOOD_THRESHOLD,
} from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.48;

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bottom Sheet (Screen 4)
// ─────────────────────────────────────────────────────────────────────────────

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View style={sheetStyles.legendItem}>
    <View style={[sheetStyles.legendDot, { backgroundColor: color }]} />
    <Text style={sheetStyles.legendLabel}>{label}</Text>
  </View>
);

interface ProgressSheetProps {
  allAssessments: AssessmentResult[];
  completedAssessments: AssessmentResult[];
  currentId: string;
  slideAnim: Animated.Value;
  onClose: () => void;
  onSelectAssessment: (id: string) => void;
}

const ProgressSheet = ({
  allAssessments,
  completedAssessments,
  currentId,
  slideAnim,
  onClose,
  onSelectAssessment,
}: ProgressSheetProps) => {
  const insets = useSafeAreaInsets();
  const completedCount = completedAssessments.length;
  const pendingCount = allAssessments.length - completedCount;
  const completedPct = Math.round(
    (completedCount / allAssessments.length) * 100,
  );

  return (
    <>
      {/* Dimmed overlay */}
      <Animated.View
        style={[
          sheetStyles.overlay,
          {
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet panel */}
      <Animated.View
        style={[
          sheetStyles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, SPACING['3xl']),
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SHEET_HEIGHT + 50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={sheetStyles.handle} />

        <View style={sheetStyles.header}>
          <Text style={sheetStyles.title}>Overall Progress</Text>
          <TouchableOpacity onPress={onClose} style={sheetStyles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={sheetStyles.counterRow}>
          <View style={sheetStyles.counterLeft}>
            <Text style={sheetStyles.counterCurrent}>{completedCount}</Text>
            <Text style={sheetStyles.counterTotal}>
              {' '}/ {allAssessments.length}
            </Text>
          </View>
          <View style={sheetStyles.legendRow}>
            <LegendDot color={COLORS.circleCompleted} label="Done" />
            <LegendDot color={COLORS.circleActive} label="Active" />
            <LegendDot color={COLORS.circlePending} label="Pending" />
          </View>
        </View>

        {/* Numbered circles */}
        <View style={sheetStyles.circlesRow}>
          {allAssessments.map((a) => {
            const isActive = a.id === currentId;
            const isDone = a.status === 'Completed' && !isActive;
            const isPending = a.status === 'Pending';

            let bg = COLORS.circlePending;
            let textColor = COLORS.circlePendingText;
            if (isActive) {
              bg = COLORS.circleActive;
              textColor = '#fff';
            } else if (isDone) {
              bg = COLORS.circleCompleted;
              textColor = '#fff';
            }

            return (
              <TouchableOpacity
                key={a.id}
                style={[
                  sheetStyles.circle,
                  { backgroundColor: bg },
                  isActive && sheetStyles.circleActiveShadow,
                ]}
                onPress={() => !isPending && onSelectAssessment(a.id)}
                disabled={isPending}
                activeOpacity={0.7}
              >
                <Text style={[sheetStyles.circleText, { color: textColor }]}>
                  {a.questionNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats */}
        <View style={sheetStyles.statsRow}>
          <View style={sheetStyles.statBox}>
            <Text style={sheetStyles.statLabel}>COMPLETED</Text>
            <Text
              style={[
                sheetStyles.statValue,
                { color: COLORS.circleCompleted },
              ]}
            >
              {completedPct}%
            </Text>
          </View>
          <View style={sheetStyles.statDivider} />
          <View style={sheetStyles.statBox}>
            <Text style={sheetStyles.statLabel}>REMAINING</Text>
            <Text style={sheetStyles.statValue}>{pendingCount}</Text>
            <Text style={sheetStyles.statUnit}>
              Assessment{pendingCount !== 1 ? 's' : ''} Left
            </Text>
          </View>
        </View>

        {/* Gradient progress bar */}
        <View style={sheetStyles.progressBarBg}>
          <LinearGradient
            colors={[COLORS.circleCompleted, '#34D399']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              sheetStyles.progressBarFill,
              { width: `${completedPct}%` },
            ]}
          />
        </View>
      </Animated.View>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Feedback Screen (Screen 3)
// ─────────────────────────────────────────────────────────────────────────────

export default function FeedbackScreen() {
  const navigation = useNavigation<FeedbackNavProp>();
  const route = useRoute<FeedbackRouteProp>();
  const insets = useSafeAreaInsets();

  const completedAssessments = useMemo(
    () => MOCK_ASSESSMENTS.filter((a) => a.status === 'Completed'),
    [],
  );

  const [currentId, setCurrentId] = useState(route.params.assessmentId);
  const [showProgress, setShowProgress] = useState(false);
  const [slideAnim] = useState(() => new Animated.Value(0));

  const currentIndex = completedAssessments.findIndex(
    (a) => a.id === currentId,
  );
  const assessment = completedAssessments[currentIndex];
  const total = completedAssessments.length;

  const openProgress = useCallback(() => {
    setShowProgress(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const closeProgress = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowProgress(false));
  }, [slideAnim]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0)
      setCurrentId(completedAssessments[currentIndex - 1].id);
  }, [currentIndex, completedAssessments]);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1)
      setCurrentId(completedAssessments[currentIndex + 1].id);
  }, [currentIndex, total, completedAssessments]);

  const selectAssessment = useCallback(
    (id: string) => {
      setCurrentId(id);
      closeProgress();
    },
    [closeProgress],
  );

  if (!assessment) return null;

  const isGood =
    assessment.score !== undefined && assessment.score >= SCORE_GOOD_THRESHOLD;
  const tierColor = isGood ? COLORS.good : COLORS.warning;
  const tierBg = isGood ? COLORS.goodLight : COLORS.warningLight;

  const feedbackParagraphs = (assessment.feedback ?? '').split('\n').filter(Boolean);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.headerTitle}>AI Feedback</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeChip}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color={COLORS.danger} />
          <Text style={styles.closeChipText}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* Nav strip: "1 / 3" + score chip */}
      <View style={styles.navStrip}>
        <View style={styles.navStripLeft}>
          <Text style={styles.navCurrent}>{currentIndex + 1}</Text>
          <Text style={styles.navTotal}> / {total}</Text>
        </View>
        <View style={[styles.scoreChip, { backgroundColor: tierBg }]}>
          <View style={[styles.scoreChipDot, { backgroundColor: tierColor }]} />
          <Text style={[styles.scoreChipText, { color: tierColor }]}>
            {assessment.score ?? 0}%
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Content */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.qLabel}>QUESTION {currentIndex + 1}</Text>
        <Text style={styles.qText}>{assessment.question}</Text>

        {/* Response type chip */}
        <View
          style={[
            styles.typeChip,
            assessment.assessmentType === 'Recorded'
              ? { backgroundColor: COLORS.recordedSurface }
              : { backgroundColor: COLORS.textTypeSurface },
          ]}
        >
          <Ionicons
            name={assessment.assessmentType === 'Recorded' ? 'mic' : 'document-text'}
            size={14}
            color={
              assessment.assessmentType === 'Recorded'
                ? COLORS.recorded
                : COLORS.textType
            }
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.typeChipLabel,
              {
                color:
                  assessment.assessmentType === 'Recorded'
                    ? COLORS.recorded
                    : COLORS.textType,
              },
            ]}
          >
            {assessment.assessmentType} Response
          </Text>
        </View>

        {/* Feedback card with gradient */}
        <View style={styles.feedbackCard}>
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.feedbackCardInner}
          >
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackHeaderLeft}>
                <View style={styles.feedbackAvatarCircle}>
                  <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.feedbackAuthor}>AI Coach Feedback</Text>
                  <Text style={styles.feedbackMeta}>
                    Vani.Coach · Auto-generated
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.feedbackDivider} />
            {feedbackParagraphs.map((paragraph, idx) => (
              <Text key={idx} style={styles.feedbackParagraph}>
                {paragraph}
              </Text>
            ))}
          </LinearGradient>
        </View>

        {/* Score breakdown */}
        <View style={styles.scoreBreakdown}>
          <View style={styles.scoreBreakdownHeader}>
            <Text style={styles.scoreBreakdownLabel}>SCORE</Text>
            <Text style={[styles.scoreBreakdownValue, { color: tierColor }]}>
              {assessment.score ?? 0}%{' '}
              · {isGood ? 'Good' : 'Needs Improvement'}
            </Text>
          </View>
          <View style={styles.scoreBarBg}>
            <LinearGradient
              colors={
                isGood
                  ? [COLORS.good, '#34D399']
                  : [COLORS.warning, '#FBBF24']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.scoreBarFill,
                { width: `${assessment.score ?? 0}%` },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, SPACING.xl) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.navArrow,
            currentIndex === 0 && styles.navArrowDisabled,
          ]}
          onPress={goPrev}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentIndex === 0 ? COLORS.textTertiary : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navArrow,
            currentIndex === total - 1 && styles.navArrowDisabled,
          ]}
          onPress={goNext}
          disabled={currentIndex === total - 1}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentIndex === total - 1 ? COLORS.textTertiary : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openProgress}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressBtn}
          >
            <Ionicons
              name="layers-outline"
              size={16}
              color={COLORS.textWhite}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.progressBtnText}>View Progress</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Progress bottom sheet */}
      {showProgress && (
        <ProgressSheet
          allAssessments={MOCK_ASSESSMENTS}
          completedAssessments={completedAssessments}
          currentId={currentId}
          slideAnim={slideAnim}
          onClose={closeProgress}
          onSelectAssessment={selectAssessment}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback Screen Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  closeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dangerLight,
  },
  closeChipText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.danger,
  },

  navStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  navStripLeft: { flexDirection: 'row', alignItems: 'baseline' },
  navCurrent: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textPrimary,
  },
  navTotal: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.medium,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.md,
  },
  scoreChipDot: { width: 8, height: 8, borderRadius: 4 },
  scoreChipText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING['2xl'],
  },

  scrollArea: { flex: 1 },
  scrollContent: { padding: SPACING['2xl'], paddingBottom: SPACING['4xl'] },

  qLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.bold,
    letterSpacing: FONTS.letterSpacing.widest,
    marginBottom: SPACING.md,
  },
  qText: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 28,
    letterSpacing: FONTS.letterSpacing.tight,
    marginBottom: SPACING.xl,
  },

  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  typeChipIcon: { fontSize: 14 },
  typeChipLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semiBold },

  feedbackCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING['3xl'],
    ...SHADOWS.md,
  },
  feedbackCardInner: { padding: SPACING['2xl'] },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  feedbackHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  feedbackAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  feedbackAvatar: { fontSize: 20 },
  feedbackAuthor: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textPrimary,
  },
  feedbackMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: 1 },
  feedbackDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.xl },
  feedbackParagraph: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: SPACING.xl,
  },

  scoreBreakdown: { gap: SPACING.lg },
  scoreBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBreakdownLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.bold,
    letterSpacing: FONTS.letterSpacing.widest,
  },
  scoreBreakdownValue: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semiBold },
  scoreBarBg: {
    height: 10,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: RADIUS.full },

  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    gap: SPACING.lg,
  },
  navArrow: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  navArrowDisabled: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.divider,
  },
  navArrowText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.bold,
  },
  navArrowTextDisabled: { color: COLORS.textTertiary },
  progressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    ...SHADOWS.md,
  },
  progressBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    color: '#FFFFFF',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Sheet Styles
// ─────────────────────────────────────────────────────────────────────────────
const sheetStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    paddingHorizontal: SPACING['2xl'],
    ...SHADOWS.xl,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.bold,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  counterLeft: { flexDirection: 'row', alignItems: 'baseline' },
  counterCurrent: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textPrimary,
  },
  counterTotal: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.medium,
  },
  legendRow: { flexDirection: 'row', gap: SPACING.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.medium,
  },
  circlesRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING['3xl'],
    flexWrap: 'wrap',
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActiveShadow: {
    shadowColor: COLORS.circleActive,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  circleText: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING['2xl'],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING['2xs'],
  },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  statLabel: {
    fontSize: FONTS.sizes.xxs,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.bold,
    letterSpacing: FONTS.letterSpacing.widest,
  },
  statValue: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textPrimary,
  },
  statUnit: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, fontWeight: FONTS.weights.medium },
  progressBarBg: {
    height: 10,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: RADIUS.full },
});
