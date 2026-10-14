import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '../constants/theme';

export interface BiomarkerGaugeCardProps {
  /** Title shown on top-left (e.g. "Avg Score", "Completed", "Pending") */
  title?: string;
  /** Main score / value displayed in the center of the arc */
  value?: string | number;
  /** Unit or subtitle below the center number (e.g. "Score", "Done", "Queue") */
  unit?: string;
  /** Left reference limit (e.g. "< 60", "0", "< 0.15") */
  lowLabel?: string;
  /** Right reference limit (e.g. "≥ 75", "4", "> 0.45") */
  highLabel?: string;
  /** Fill percentage (0 to 100) that fills the gauge arc and inside dome */
  fillPercentage?: number;
  /** Primary accent color for highlighted ticks & inner glow */
  activeColor?: string;
  /** Badge text in top-right (only in non-compact mode) */
  badgeText?: string;
  /** Which ticks to highlight: 'progress' (default) or 'high' */
  highlightMode?: 'progress' | 'high';
  /** Allow interactive toggle between live data and screenshot replica */
  allowToggleMode?: boolean;
  /** Optional custom card width */
  cardWidth?: number;
  /** Compact mode to fit all 3 cards in a single row without carousel */
  compact?: boolean;
  /** Scale factor to increase or decrease the gauge arc & ticks size */
  gaugeScale?: number;
  /** Optional container style override */
  style?: StyleProp<ViewStyle>;
}

export const BiomarkerGaugeCard: React.FC<BiomarkerGaugeCardProps> = ({
  title: propTitle = 'Avg Score',
  value: propValue = '75%',
  unit: propUnit = 'Score',
  lowLabel: propLowLabel = '< 60',
  highLabel: propHighLabel = '≥ 75',
  fillPercentage = 75,
  activeColor = '#4F46E5',
  badgeText,
  highlightMode = 'progress',
  allowToggleMode = false,
  cardWidth,
  compact = false,
  gaugeScale = 1,
  style,
}) => {
  // Mode toggle: allows toggling between Assessment Live Data and Screenshot Replica
  const [isScreenshotExact, setIsScreenshotExact] = useState(false);

  // Active values depending on mode
  const title = isScreenshotExact ? 'Testosterone' : propTitle;
  const unit = isScreenshotExact ? 'ng/mL' : propUnit;
  const lowLabel = isScreenshotExact ? '< 0.15' : propLowLabel;
  const highLabel = isScreenshotExact ? '> 0.45' : propHighLabel;

  // Geometry based on compact mode and gaugeScale
  const scale = gaugeScale;
  const TOTAL_TICKS = compact ? 17 : 21;
  const GAUGE_WIDTH = Math.round((compact ? 88 : 250) * scale);
  const GAUGE_HEIGHT = Math.round((compact ? 52 : 125) * scale);
  const RADIUS_ARC = Math.round((compact ? 29 : 76) * scale);
  const TICK_WIDTH = compact ? +(3.2 * Math.min(scale, 1.25)).toFixed(1) : 5.5;
  const TICK_HEIGHT = compact ? +(8.5 * scale).toFixed(1) : 16;
  const TICK_BORDER_RADIUS = TICK_WIDTH / 2;
  const CX = GAUGE_WIDTH / 2;
  const CY = Math.round((compact ? 45 : 112) * scale);
  const DOME_RADIUS = Math.round((compact ? 21 : 58) * scale);

  // Parse numeric target from propValue for smooth counting animation
  const { targetNum, suffix, isFloat } = useMemo(() => {
    if (typeof propValue === 'number') {
      return { targetNum: propValue, suffix: '', isFloat: false };
    }
    const str = String(propValue);
    const hasPercent = str.includes('%');
    const cleaned = str.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned) || 0;
    const isFloatVal = cleaned.includes('.');
    return {
      targetNum: num,
      suffix: hasPercent ? '%' : '',
      isFloat: isFloatVal,
    };
  }, [propValue]);

  // Transition state: smooth animated progress from 0 to 1
  const [currentProgress, setCurrentProgress] = useState(0);
  const [animValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    animValue.setValue(0);
    const listenerId = animValue.addListener(({ value: p }) => {
      setCurrentProgress(p);
    });

    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animValue.removeListener(listenerId);
    };
  }, [animValue, fillPercentage, targetNum, isScreenshotExact]);

  // Animated display number
  const { displayNumber, displaySuffix } = useMemo(() => {
    if (isScreenshotExact) {
      return {
        displayNumber: (currentProgress * 0.56).toFixed(2),
        displaySuffix: '',
      };
    }
    if (isFloat) {
      return {
        displayNumber: (currentProgress * targetNum).toFixed(1),
        displaySuffix: suffix,
      };
    }
    return {
      displayNumber: `${Math.round(currentProgress * targetNum)}`,
      displaySuffix: suffix,
    };
  }, [currentProgress, isScreenshotExact, isFloat, targetNum, suffix]);

  // Number of ticks to fill based on animated progress
  const targetFilledTicks = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, fillPercentage));
    return Math.round((clamped / 100) * TOTAL_TICKS);
  }, [fillPercentage, TOTAL_TICKS]);

  const filledCount = useMemo(() => {
    if (isScreenshotExact || highlightMode === 'high') {
      return 0;
    }
    return Math.round(targetFilledTicks * currentProgress);
  }, [isScreenshotExact, highlightMode, targetFilledTicks, currentProgress]);

  // Set of active tick indices
  const activeTicks = useMemo(() => {
    const active = new Set<number>();
    if (isScreenshotExact || highlightMode === 'high') {
      const activeCount = Math.round(currentProgress * 3);
      for (let i = 0; i < activeCount; i++) {
        active.add(TOTAL_TICKS - 1 - i);
      }
    } else {
      for (let i = 0; i < filledCount; i++) {
        active.add(i);
      }
    }
    return active;
  }, [isScreenshotExact, highlightMode, currentProgress, filledCount, TOTAL_TICKS]);

  const effectiveColor = isScreenshotExact ? '#FA5274' : activeColor;

  // Pre-calculate tick geometry and dynamic colors
  const ticks = useMemo(() => {
    return Array.from({ length: TOTAL_TICKS }, (_, i) => {
      const t = i / (TOTAL_TICKS - 1);
      const angleDeg = 180 - t * 180;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = CX + RADIUS_ARC * Math.cos(angleRad);
      const y = CY - RADIUS_ARC * Math.sin(angleRad);
      const rot = 90 - angleDeg;
      const isActive = activeTicks.has(i);

      let tickColor = '#E3E6EB';
      let opacity = 1;

      if (isActive) {
        if (isScreenshotExact || highlightMode === 'high') {
          if (i === TOTAL_TICKS - 3) {
            tickColor = '#FDA4AF';
            opacity = 0.9;
          } else if (i === TOTAL_TICKS - 2) {
            tickColor = '#FB7185';
            opacity = 0.95;
          } else {
            tickColor = '#FA5274';
            opacity = 1;
          }
        } else {
          tickColor = effectiveColor;
          const progressFactor = filledCount > 1 ? i / (filledCount - 1) : 1;
          opacity = 0.78 + 0.22 * progressFactor;
        }
      }

      return {
        id: i,
        x,
        y,
        rot,
        isActive,
        color: tickColor,
        opacity,
      };
    });
  }, [
    activeTicks,
    effectiveColor,
    isScreenshotExact,
    highlightMode,
    filledCount,
    TOTAL_TICKS,
    CX,
    CY,
    RADIUS_ARC,
  ]);

  // Smoothly animated dome opacity
  const domeOpacity = useMemo(() => {
    const base = isScreenshotExact ? 0.05 : 0.08 + (fillPercentage / 100) * 0.06;
    return base * currentProgress;
  }, [isScreenshotExact, fillPercentage, currentProgress]);

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        cardWidth !== undefined && { width: cardWidth },
        style,
      ]}
    >
      {/* Top Header Row */}
      <View style={[styles.headerRow, compact && styles.headerRowCompact]}>
        <View style={styles.titleWrap}>
          {compact && (
            <View
              style={[
                styles.compactStatusDot,
                { backgroundColor: effectiveColor },
                scale > 1 && { width: 6, height: 6, borderRadius: 3 },
              ]}
            />
          )}
          <Text
            style={[
              styles.title,
              compact && styles.titleCompact,
              compact && scale > 1 && { fontSize: 12, fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {allowToggleMode && (
            <TouchableOpacity
              onPress={() => setIsScreenshotExact((prev) => !prev)}
              style={[styles.toggleBtn, compact && styles.toggleBtnCompact]}
              activeOpacity={0.6}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name="swap-horizontal"
                size={compact ? 9 : 11}
                color="#64748B"
                style={{ marginRight: 2 }}
              />
              <Text
                style={[styles.toggleBtnText, compact && styles.toggleBtnTextCompact]}
              >
                {isScreenshotExact ? 'Live' : 'Exact'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status badge (in normal mode) */}
        {!compact && badgeText && !isScreenshotExact && (
          <View
            style={[
              styles.badgeWrap,
              {
                backgroundColor: `${effectiveColor}14`,
                borderColor: `${effectiveColor}30`,
              },
            ]}
          >
            <Ionicons name="sparkles" size={11} color={effectiveColor} />
            <Text style={[styles.badgeText, { color: effectiveColor }]}>
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      {/* Radial Gauge Visual */}
      <View
        style={[
          styles.gaugeContainer,
          compact && {
            width: GAUGE_WIDTH,
            height: GAUGE_HEIGHT + Math.round(10 * scale),
            marginTop: Math.round(4 * scale),
          },
        ]}
      >
        {/* Soft inner dome fill inside the arch cavity */}
        <View
          style={[
            styles.innerDome,
            {
              left: CX - DOME_RADIUS,
              top: CY - DOME_RADIUS,
              width: DOME_RADIUS * 2,
              height: DOME_RADIUS,
              borderTopLeftRadius: DOME_RADIUS,
              borderTopRightRadius: DOME_RADIUS,
              backgroundColor: effectiveColor,
              opacity: domeOpacity,
            },
          ]}
        />

        {/* Inner track border accent */}
        <View
          style={[
            styles.innerTrackBorder,
            {
              left: CX - (DOME_RADIUS + (compact ? 2 : 4)),
              top: CY - (DOME_RADIUS + (compact ? 2 : 4)),
              width: (DOME_RADIUS + (compact ? 2 : 4)) * 2,
              height: DOME_RADIUS + (compact ? 2 : 4),
              borderTopLeftRadius: DOME_RADIUS + (compact ? 2 : 4),
              borderTopRightRadius: DOME_RADIUS + (compact ? 2 : 4),
              borderColor: `${effectiveColor}22`,
            },
          ]}
        />

        {/* Render radial capsule ticks */}
        {ticks.map((tick) => (
          <View
            key={tick.id}
            style={[
              styles.tick,
              {
                left: tick.x - TICK_WIDTH / 2,
                top: tick.y - TICK_HEIGHT / 2,
                width: TICK_WIDTH,
                height: TICK_HEIGHT,
                borderRadius: TICK_BORDER_RADIUS,
                backgroundColor: tick.color,
                opacity: tick.opacity,
                transform: [{ rotate: `${tick.rot}deg` }],
              },
            ]}
          />
        ))}

        {/* Center score readout */}
        <View
          style={[
            styles.centerReadout,
            compact
              ? { bottom: scale > 1 ? 20 : 18 }
              : { bottom: 26 },
          ]}
        >
          <Text
            style={[
              styles.valueText,
              compact && styles.valueTextCompact,
              compact && scale > 1 && styles.valueTextHeroCompact,
            ]}
            numberOfLines={1}
          >
            {displayNumber}
            {displaySuffix ? (
              <Text
                style={[
                  styles.suffixText,
                  compact && styles.suffixTextCompact,
                  compact && scale > 1 && styles.suffixTextHeroCompact,
                ]}
              >
                {displaySuffix}
              </Text>
            ) : null}
          </Text>
        </View>

        {/* Bottom scale labels: Left limit, Unit center, Right limit */}
        <View
          style={[
            styles.bottomScaleRow,
            compact && styles.bottomScaleRowCompact,
          ]}
        >
          <Text
            style={[
              styles.scaleTextLeft,
              compact && styles.scaleTextCompact,
              compact && scale > 1 && { fontSize: 9.5, minWidth: 24 },
            ]}
            numberOfLines={1}
          >
            {lowLabel}
          </Text>
          <Text
            style={[
              styles.scaleTextCenter,
              compact && styles.scaleTextCompact,
              compact && scale > 1 && { fontSize: 9.5 },
            ]}
            numberOfLines={1}
          >
            {unit}
          </Text>
          <Text
            style={[
              styles.scaleTextRight,
              compact && styles.scaleTextCompact,
              compact && scale > 1 && { fontSize: 9.5, minWidth: 24 },
            ]}
            numberOfLines={1}
          >
            {highLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EBF0F5',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
    }),
  },
  cardCompact: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 6,
    borderRadius: 18,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  headerRowCompact: {
    justifyContent: 'center',
    marginBottom: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  compactStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  toggleBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  toggleBtnCompact: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextCompact: {
    fontSize: 8.5,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderWidth: 1,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Gauge area
  gaugeContainer: {
    width: 250,
    height: 125 + 14,
    alignSelf: 'center',
    position: 'relative',
    marginTop: 2,
  },
  innerDome: {
    position: 'absolute',
  },
  innerTrackBorder: {
    position: 'absolute',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  tick: {
    position: 'absolute',
  },
  centerReadout: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.6,
  },
  valueTextCompact: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  valueTextHeroCompact: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  suffixText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
  },
  suffixTextCompact: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
  },
  suffixTextHeroCompact: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  bottomScaleRow: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomScaleRowCompact: {
    bottom: 0,
    left: 2,
    right: 2,
  },
  scaleTextLeft: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    minWidth: 45,
    textAlign: 'left',
  },
  scaleTextCenter: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  scaleTextRight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    minWidth: 45,
    textAlign: 'right',
  },
  scaleTextCompact: {
    fontSize: 8.5,
    fontWeight: '500',
    minWidth: 20,
  },
});
