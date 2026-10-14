import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AssessmentListNavProp } from '../navigation/types';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';
import { AssessmentResult } from '../types/assessment';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, SCORE_GOOD_THRESHOLD } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BiomarkerGaugeCard } from '../components/BiomarkerGaugeCard';

// ─────────────────────────────────────────────────────────────────────────────
// Assessment Card
// ─────────────────────────────────────────────────────────────────────────────
const AssessmentCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: AssessmentResult;
    onPress: () => void;
  }) => {
    const isPending = item.status === 'Pending';
    const isGood =
      item.score !== undefined && item.score >= SCORE_GOOD_THRESHOLD;

    return (
      <TouchableOpacity
        style={[styles.card, isPending && styles.cardPending]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isPending}
      >
        {/* Left gradient accent */}
        <LinearGradient
          colors={
            isPending
              ? ['#94A3B8', '#64748B']
              : ['#4338CA', '#6366F1']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardAccent}
        >
          {isPending ? (
            <Ionicons name="time-outline" size={24} color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.accentScore}>{item.score}</Text>
              <View style={styles.accentDivider} />
              <Text style={styles.accentUnit}>
                {item.assessmentType === 'Recorded' ? 'REC' : 'TXT'}
              </Text>
            </>
          )}
        </LinearGradient>

        {/* Card body */}
        <View style={styles.cardBody}>
          {/* Top row: type badge + question number */}
          <View style={styles.cardTop}>
            <View
              style={[
                styles.typeBadge,
                item.assessmentType === 'Recorded'
                  ? styles.typeBadgeRecorded
                  : styles.typeBadgeText,
              ]}
            >
              <Ionicons
                name={item.assessmentType === 'Recorded' ? 'mic' : 'document-text'}
                size={12}
                color={
                  item.assessmentType === 'Recorded'
                    ? COLORS.recorded
                    : COLORS.textType
                }
              />
              <Text
                style={[
                  styles.typeBadgeLabel,
                  item.assessmentType === 'Recorded'
                    ? { color: COLORS.recorded }
                    : { color: COLORS.textType },
                ]}
              >
                {item.assessmentType}
              </Text>
            </View>
            <Text style={styles.questionNumber}>Q{item.questionNumber}</Text>
          </View>

          {/* Question */}
          <Text
            style={[styles.cardQuestion, isPending && styles.mutedText]}
            numberOfLines={2}
          >
            {item.question}
          </Text>

          {/* Subtitle */}
          <Text style={styles.cardSubtitle}>
            {isPending ? 'Awaiting AI evaluation...' : item.completedAt ?? 'Vani.Coach'}
          </Text>

          {/* AI Feedback Preview */}
          {!isPending && item.feedback ? (
            <View style={styles.cardFeedback}>
              <View style={styles.cardFeedbackHeader}>
                <Ionicons name="sparkles" size={11} color={COLORS.primary} />
                <Text style={styles.cardFeedbackLabel}>AI Feedback</Text>
              </View>
              <Text style={styles.cardFeedbackText} numberOfLines={2}>
                {item.feedback}
              </Text>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.cardFooter}>
            {isPending ? (
              <View style={styles.pendingChip}>
                <Ionicons name="time" size={13} color={COLORS.pendingText} />
                <Text style={styles.pendingLabel}>Pending Review</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.tierChip,
                  {
                    backgroundColor: isGood ? COLORS.goodLight : COLORS.warningLight,
                    borderColor: isGood ? COLORS.goodBorder : COLORS.warningBorder,
                  },
                ]}
              >
                <Ionicons
                  name={isGood ? 'checkmark-circle' : 'alert-circle'}
                  size={13}
                  color={isGood ? COLORS.good : COLORS.warning}
                />
                <Text
                  style={[
                    styles.tierLabel,
                    { color: isGood ? COLORS.good : COLORS.warning },
                  ]}
                >
                  {isGood ? 'Good' : 'Needs Improvement'}
                </Text>
              </View>
            )}

            {!isPending && (
              <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
                <Text style={styles.detailBtnText}>View</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.item === next.item,
);
AssessmentCard.displayName = 'AssessmentCard';

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Tab Bar
// ─────────────────────────────────────────────────────────────────────────────
type TabItem = {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
};

const TAB_ITEMS: TabItem[] = [
  { icon: 'home-outline', activeIcon: 'home', label: 'Home' },
  { icon: 'book-outline', activeIcon: 'book', label: 'Courses' },
  { icon: 'bar-chart-outline', activeIcon: 'bar-chart', label: 'Results', active: true },
  { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
];

const BottomTabBar = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_ITEMS.map((tab) => (
        <TouchableOpacity key={tab.label} style={styles.bottomTab} activeOpacity={0.7}>
          <View
            style={[
              styles.bottomTabIconContainer,
              tab.active && styles.bottomTabIconContainerActive,
            ]}
          >
            <Ionicons
              name={tab.active ? tab.activeIcon : tab.icon}
              size={20}
              color={tab.active ? COLORS.tabActive : COLORS.tabInactive}
            />
          </View>
          <Text
            style={[
              styles.bottomTabLabel,
              {
                color: tab.active ? COLORS.tabActive : COLORS.tabInactive,
                fontWeight: tab.active
                  ? FONTS.weights.semiBold
                  : FONTS.weights.medium,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
type Tab = 'completed' | 'pending';

export default function AssessmentListScreen() {
  const navigation = useNavigation<AssessmentListNavProp>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('completed');
  const [isDemoEmpty, setIsDemoEmpty] = useState(false);

  const completedAssessments = useMemo(
    () => (isDemoEmpty ? [] : MOCK_ASSESSMENTS.filter((a) => a.status === 'Completed')),
    [isDemoEmpty],
  );
  const pendingAssessments = useMemo(
    () => (isDemoEmpty ? [] : MOCK_ASSESSMENTS.filter((a) => a.status === 'Pending')),
    [isDemoEmpty],
  );
  const avgScore = useMemo(() => {
    const scores = completedAssessments
      .map((a) => a.score)
      .filter((s): s is number => s !== undefined);
    return scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }, [completedAssessments]);

  const totalAssessments = completedAssessments.length + pendingAssessments.length;
  const completedPercent =
    totalAssessments > 0
      ? Math.round((completedAssessments.length / totalAssessments) * 100)
      : 0;
  const pendingPercent =
    totalAssessments > 0
      ? Math.round((pendingAssessments.length / totalAssessments) * 100)
      : 0;

  // The 3 compact Gauge cards fitting side-by-side
  const gaugeItems = useMemo(
    () => [
      {
        id: 'pending',
        title: 'Pending',
        value: pendingAssessments.length,
        unit: `of ${totalAssessments}`,
        lowLabel: '0',
        highLabel: `${totalAssessments}`,
        fillPercentage: pendingPercent,
        activeColor: '#F59E0B',
        allowToggleMode: false,
      },
      {
        id: 'avgScore',
        title: 'Avg Score',
        value: `${avgScore}%`,
        unit: 'Score',
        lowLabel: '< 60',
        highLabel: '≥ 75',
        fillPercentage: avgScore,
        activeColor: '#6366F1',
        allowToggleMode: false,
      },
      {
        id: 'completed',
        title: 'Completed',
        value: completedAssessments.length,
        unit: `of ${totalAssessments}`,
        lowLabel: '0',
        highLabel: `${totalAssessments}`,
        fillPercentage: completedPercent,
        activeColor: '#10B981',
        allowToggleMode: false,
      },
    ],
    [
      avgScore,
      completedAssessments.length,
      pendingAssessments.length,
      totalAssessments,
      completedPercent,
      pendingPercent,
    ],
  );

  const listData =
    activeTab === 'completed' ? completedAssessments : pendingAssessments;

  const keyExtractor = useCallback((item: AssessmentResult) => item.id, []);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AssessmentResult>) => (
      <AssessmentCard
        item={item}
        onPress={() =>
          navigation.navigate('AssessmentDetail', { assessmentId: item.id })
        }
      />
    ),
    [navigation],
  );

  // List header — rendered inside FlatList so it scrolls with content
  const ListHeader = (
    <View>
      {/* Gradient hero */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + SPACING.xl }]}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroGreeting}>Your Performance</Text>
            <Text style={styles.heroTitle}>Assessment Results</Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, isDemoEmpty && styles.settingsBtnActive]}
            onPress={() => setIsDemoEmpty((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Empty State Demo"
          >
            <Ionicons
              name={isDemoEmpty ? 'refresh' : 'eye-off-outline'}
              size={18}
              color={COLORS.textWhite}
            />
          </TouchableOpacity>
        </View>

        {isDemoEmpty && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={15} color="#FFFFFF" />
            <Text style={styles.demoBannerText}>
              Empty State Simulation · Tap top-right button to restore data
            </Text>
          </View>
        )}

        {/* 3 Compact Gauge Cards side-by-side fitting together on the screen */}
        <View style={styles.gaugesRow}>
          {gaugeItems.map((item) => {
            const isAvgScore = item.id === 'avgScore';
            return (
              <BiomarkerGaugeCard
                key={item.id}
                compact
                title={item.title}
                value={item.value}
                unit={item.unit}
                lowLabel={item.lowLabel}
                highLabel={item.highLabel}
                fillPercentage={item.fillPercentage}
                activeColor={item.activeColor}
                allowToggleMode={item.allowToggleMode}
                gaugeScale={isAvgScore ? 1.22 : 1}
                style={
                  isAvgScore
                    ? styles.heroGaugeCard
                    : styles.secondaryGaugeCard
                }
              />
            );
          })}
        </View>
      </LinearGradient>

      {/* Tab switcher — floats over gradient bottom */}
      <View style={styles.tabOuter}>
        <View style={styles.tabContainer}>
          {(['completed', 'pending'] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === 'completed'
                ? completedAssessments.length
                : pendingAssessments.length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab === 'completed' ? 'Completed' : 'Pending'}
                </Text>
                {isActive && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section label */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>
          {activeTab === 'completed'
            ? `${completedAssessments.length} assessment${completedAssessments.length !== 1 ? 's' : ''} reviewed`
            : `${pendingAssessments.length} assessment${pendingAssessments.length !== 1 ? 's' : ''} in queue`}
        </Text>
      </View>
    </View>
  );

  const EmptyList = (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons
          name={
            activeTab === 'completed'
              ? 'clipboard-outline'
              : 'checkmark-done-circle-outline'
          }
          size={38}
          color={activeTab === 'completed' ? COLORS.primary : COLORS.good}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'completed' ? 'No Results Yet' : 'All Caught Up!'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'completed'
          ? 'Complete an assessment to receive your personalised AI feedback and score.'
          : 'You have no pending assessments right now.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
      
      <BottomTabBar />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING['3xl'],
    flexGrow: 1,
  },

  // ── Hero ──
  hero: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['5xl'],
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING['3xl'],
  },
  heroGreeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textWhiteMuted,
    fontWeight: FONTS.weights.medium,
    letterSpacing: FONTS.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textWhite,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#FBBF24',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  demoBannerText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: '#FFFFFF',
    fontWeight: FONTS.weights.medium,
  },
  settingsIcon: {
    fontSize: 18,
    color: COLORS.textWhite,
  },
  gaugesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.sm,
  },
  heroGaugeCard: {
    flex: 1.18,
    paddingHorizontal: 4,
  },
  secondaryGaugeCard: {
    flex: 0.91,
    paddingHorizontal: 4,
  },

  // ── Tabs ──
  tabOuter: {
    marginTop: -SPACING['3xl'],
    paddingHorizontal: SPACING['2xl'],
    marginBottom: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xs,
    ...SHADOWS.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textTertiary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semiBold,
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },

  // Section label
  sectionLabel: {
    paddingHorizontal: SPACING['2xl'],
    marginBottom: SPACING.lg,
  },
  sectionLabelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },

  // ── Card ──
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING['2xl'],
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardPending: {
    opacity: 0.78,
  },
  cardAccent: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
    gap: SPACING.xs,
  },
  accentScore: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textWhite,
  },
  accentDivider: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: SPACING['2xs'],
  },
  accentUnit: {
    fontSize: FONTS.sizes.xxs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textWhiteMuted,
    letterSpacing: FONTS.letterSpacing.widest,
    textTransform: 'uppercase',
  },
  cardBody: {
    flex: 1,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  typeBadgeRecorded: {
    backgroundColor: COLORS.recordedSurface,
  },
  typeBadgeText: {
    backgroundColor: COLORS.textTypeSurface,
  },
  typeBadgeLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
  },
  questionNumber: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textTertiary,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  cardQuestion: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 22,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  mutedText: {
    color: COLORS.textTertiary,
  },
  cardSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
  },
  cardFeedback: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    gap: SPACING['2xs'],
  },
  cardFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardFeedbackLabel: {
    fontSize: FONTS.sizes.xxs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },
  cardFeedbackText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  tierLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
  },
  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.pendingBg,
  },
  pendingDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.pendingText,
  },
  pendingLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.pendingText,
    fontWeight: FONTS.weights.medium,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
  },
  detailBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },
  detailBtnArrow: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING['6xl'],
    paddingHorizontal: SPACING['4xl'],
    gap: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bottomTabIconContainer: {
    width: 36,
    height: 28,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabIconContainerActive: {
    backgroundColor: COLORS.primaryLight,
  },
  bottomTabIcon: {
    fontSize: 18,
  },
  bottomTabLabel: {
    fontSize: FONTS.sizes.xxs,
  },
});
