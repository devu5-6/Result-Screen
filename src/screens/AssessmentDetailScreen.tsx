import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  AssessmentDetailNavProp,
  AssessmentDetailRouteProp,
} from '../navigation/types';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  SCORE_GOOD_THRESHOLD,
} from '../constants/theme';
import { BiomarkerGaugeCard } from '../components/BiomarkerGaugeCard';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const StatColumn = ({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: string;
}) => (
  <View style={styles.statCol}>
    <Text style={[styles.statValue, accent ? { color: accent } : {}]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {!isLast && <View style={styles.infoDivider} />}
  </>
);

const HighlightItem = ({
  icon,
  text,
  iconColor = COLORS.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  iconColor?: string;
}) => (
  <View style={styles.highlightItem}>
    <View style={styles.highlightIconBox}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={styles.highlightText}>{text}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function AssessmentDetailScreen() {
  const navigation = useNavigation<AssessmentDetailNavProp>();
  const route = useRoute<AssessmentDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { assessmentId } = route.params;

  const assessment = MOCK_ASSESSMENTS.find((a) => a.id === assessmentId);
  if (!assessment) return null;

  const isGood =
    assessment.score !== undefined && assessment.score >= SCORE_GOOD_THRESHOLD;
  const tierLabel = isGood ? 'Good' : 'Needs Improvement';
  const tierColor = isGood ? COLORS.good : COLORS.warning;
  const tierBg = isGood ? COLORS.goodLight : COLORS.warningLight;
  const tierBorder = isGood ? COLORS.goodBorder : COLORS.warningBorder;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ── Gradient Hero ── */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + SPACING.xl }]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textWhite} />
          </TouchableOpacity>

          <Text style={styles.heroQuestion}>{assessment.question}</Text>
          <Text style={styles.heroSubtitle}>
            Vani.Coach · AI Communication Coach
          </Text>

          {/* Gauge card matching main screen */}
          <View style={{ marginTop: SPACING.lg }}>
            <BiomarkerGaugeCard
              title="Question Score"
              value={assessment.score !== undefined ? `${assessment.score}%` : '—'}
              unit={assessment.status === 'Pending' ? 'Pending' : 'Score'}
              lowLabel="< 60"
              highLabel="≥ 75"
              fillPercentage={assessment.score ?? 0}
              activeColor={isGood ? '#10B981' : '#F59E0B'}
              badgeText={isGood ? 'Good' : 'Needs Improvement'}
            />
          </View>
        </LinearGradient>

        {/* ── Main content ── */}
        <View style={styles.contentContainer}>
          {/* Stats bar */}
          <View style={styles.statsBar}>
            <StatColumn
              value={assessment.assessmentType}
              label="TYPE"
              accent={
                assessment.assessmentType === 'Recorded'
                  ? COLORS.recorded
                  : COLORS.textType
              }
            />
            <View style={styles.statsBarDivider} />
            <StatColumn value="1" label="ATTEMPT" />
            <View style={styles.statsBarDivider} />
            <StatColumn
              value={isGood ? 'Good' : 'Needs Impr.'}
              label="PERFORMANCE"
              accent={tierColor}
            />
          </View>

          {/* Performance banner */}
          <View
            style={[
              styles.performanceBanner,
              { backgroundColor: tierBg, borderColor: tierBorder },
            ]}
          >
            <Ionicons
              name={isGood ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={tierColor}
            />
            <Text style={[styles.performanceText, { color: tierColor }]}>
              {tierLabel} — Your score is{' '}
              {isGood ? 'above' : 'below'} the 75% benchmark
            </Text>
          </View>

          {/* Assessment Details */}
          <Text style={styles.sectionTitle}>Assessment Details</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Completed" value={assessment.completedAt ?? '—'} />
            <InfoRow label="Response Type" value={assessment.assessmentType} />
            <InfoRow
              label="Question"
              value={`#${assessment.questionNumber} of ${MOCK_ASSESSMENTS.length}`}
              isLast
            />
          </View>

          {/* Feedback Highlights */}
          <Text style={styles.sectionTitle}>Feedback Highlights</Text>
          <View style={styles.highlightsCard}>
            <HighlightItem
              icon="analytics-outline"
              iconColor="#4F46E5"
              text="Detailed performance analysis based on your response"
            />
            <HighlightItem
              icon="bulb-outline"
              iconColor="#D97706"
              text="Actionable improvement suggestions to raise your score"
            />
            <HighlightItem
              icon="trophy-outline"
              iconColor="#059669"
              text="Key strengths identified with areas to develop"
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('Feedback', { assessmentId: assessment.id })
            }
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={COLORS.textWhite}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaText}>View Full AI Feedback</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={COLORS.textWhite}
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: SPACING['5xl'],
  },

  // Hero
  hero: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['6xl'] + 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textWhite,
    fontWeight: FONTS.weights.semiBold,
  },
  heroQuestion: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.textWhite,
    lineHeight: 32,
    letterSpacing: FONTS.letterSpacing.tight,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textWhiteMuted,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING['3xl'],
  },


  // Content
  contentContainer: {
    marginTop: -SPACING['4xl'],
    paddingHorizontal: SPACING['2xl'],
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statsBarDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xxs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.widest,
  },

  // Performance banner
  performanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING['3xl'],
    gap: SPACING.lg,
  },
  performanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  performanceText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    lineHeight: 20,
  },

  // Section title
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    letterSpacing: FONTS.letterSpacing.tight,
  },

  // Info card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING['3xl'],
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  infoLabel: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.semiBold,
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Highlights card
  highlightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING['3xl'],
    gap: SPACING.xl,
    ...SHADOWS.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  highlightIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightEmoji: {
    fontSize: 18,
  },
  highlightText: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl + 2,
    gap: SPACING.lg,
    ...SHADOWS.md,
  },
  ctaIcon: {
    fontSize: 18,
  },
  ctaText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    color: '#FFFFFF',
  },
  ctaArrow: {
    fontSize: FONTS.sizes.lg,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FONTS.weights.bold,
  },
});
