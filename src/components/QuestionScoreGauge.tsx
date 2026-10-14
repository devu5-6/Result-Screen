import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to calculate SVG Arc coordinates (0° is 12 o'clock top)
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
};

export interface QuestionScoreGaugeProps {
  score?: number;
  maxScore?: number;
  label?: string;
  categoryLabel?: string;
  isPending?: boolean;
  size?: number;
  width?: number;
}

export const QuestionScoreGauge: React.FC<QuestionScoreGaugeProps> = ({
  score = 51,
  maxScore = 100,
  label,
  categoryLabel,
  isPending = false,
  size,
  width,
}) => {
  const displayLabel = label ?? categoryLabel ?? 'Question score';
  const SVG_SIZE = size ?? width ?? Math.min(SCREEN_WIDTH * 0.82, 310);
  const CENTER = SVG_SIZE / 2;
  const RADIUS = SVG_SIZE * 0.32;
  const STROKE_WIDTH = Math.max(16, SVG_SIZE * 0.075);

  const clampedScore = isPending ? 0 : Math.max(0, Math.min(maxScore, score));
  const pct = (clampedScore / maxScore) * 100;

  // Arc Ranges:
  // 1. Left Arc (LOW): -135° to -55° (span = 80°) -> score 0 to 33.3
  // 2. Top Arc (MEDIUM): -45° to +45° (span = 90°) -> score 33.3 to 66.6
  // 3. Right Arc (HIGH): +55° to +135° (span = 80°) -> score 66.6 to 100
  const { scoreAngle, inSegment } = useMemo(() => {
    if (isPending) return { scoreAngle: -135, inSegment: 0 };
    if (pct <= 33.33) {
      const t = pct / 33.33;
      return { scoreAngle: -135 + t * 80, inSegment: 1 };
    }
    if (pct <= 66.66) {
      const t = (pct - 33.33) / 33.33;
      return { scoreAngle: -45 + t * 90, inSegment: 2 };
    }
    const t = (pct - 66.66) / 33.34;
    return { scoreAngle: 55 + Math.min(1, t) * 80, inSegment: 3 };
  }, [pct, isPending]);

  const knobPosition = useMemo(
    () => polarToCartesian(CENTER, CENTER, RADIUS, scoreAngle),
    [CENTER, RADIUS, scoreAngle],
  );

  return (
    <View style={[styles.container, { width: SVG_SIZE, height: SVG_SIZE }]}>
      {/* Background Concentric Rings (faint white circles) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Circle cx="50%" cy="50%" r="46%" fill="rgba(255,255,255,0.06)" />
          <Circle cx="50%" cy="50%" r="33%" fill="rgba(255,255,255,0.06)" />
          <Circle cx="50%" cy="50%" r="20%" fill="rgba(255,255,255,0.08)" />
        </Svg>
      </View>

      <View style={[styles.gaugeContainer, { width: SVG_SIZE, height: SVG_SIZE }]}>
        {/* Main Gauge SVG */}
        <Svg width={SVG_SIZE} height={SVG_SIZE}>
          <G strokeLinecap="round">
            {/* 1. Left Arc (LOW) */}
            <Path
              d={describeArc(CENTER, CENTER, RADIUS, -135, -55)}
              fill="none"
              stroke="#FCE390"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Left Arc filled */}
            {!isPending && inSegment === 1 && scoreAngle > -135 && (
              <Path
                d={describeArc(CENTER, CENTER, RADIUS, -135, scoreAngle)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={STROKE_WIDTH}
              />
            )}
            {!isPending && inSegment > 1 && (
              <Path
                d={describeArc(CENTER, CENTER, RADIUS, -135, -55)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={STROKE_WIDTH}
              />
            )}

            {/* 2. Top Arc (MEDIUM) - Background Track */}
            <Path
              d={describeArc(CENTER, CENTER, RADIUS, -45, 45)}
              fill="none"
              stroke="#F6C543"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Top Arc - Filled Progress */}
            {!isPending && inSegment === 2 && scoreAngle > -45 && (
              <Path
                d={describeArc(CENTER, CENTER, RADIUS, -45, scoreAngle)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={STROKE_WIDTH}
              />
            )}
            {!isPending && inSegment > 2 && (
              <Path
                d={describeArc(CENTER, CENTER, RADIUS, -45, 45)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={STROKE_WIDTH}
              />
            )}

            {/* 3. Right Arc (HIGH) - Background Track */}
            <Path
              d={describeArc(CENTER, CENTER, RADIUS, 55, 135)}
              fill="none"
              stroke="#F6C543"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Right Arc - Dotted Pattern Overlay */}
            <Path
              d={describeArc(CENTER, CENTER, RADIUS, 55, 135)}
              fill="none"
              stroke="#DF9E18"
              strokeWidth={Math.max(3.5, SVG_SIZE * 0.013)}
              strokeDasharray="4, 16"
              strokeLinecap="round"
            />

            {/* Right Arc - Filled Progress */}
            {!isPending && inSegment === 3 && scoreAngle > 55 && (
              <Path
                d={describeArc(CENTER, CENTER, RADIUS, 55, scoreAngle)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={STROKE_WIDTH}
              />
            )}
          </G>

          {/* White active indicator knob at the end of the score progress */}
          {!isPending && (
            <Circle
              cx={knobPosition.x}
              cy={knobPosition.y}
              r={Math.max(7, SVG_SIZE * 0.026)}
              fill="#FFFFFF"
              stroke="#FDBB2D"
              strokeWidth={Math.max(3.5, SVG_SIZE * 0.013)}
            />
          )}
        </Svg>

        {/* Floating Labels */}
        <Text style={[styles.label, styles.labelLow]}>LOW</Text>
        <Text style={[styles.label, styles.labelMedium]}>MEDIUM</Text>
        <Text style={[styles.label, styles.labelHigh]}>HIGH</Text>

        {/* Center White Card */}
        <View
          style={[
            styles.centerCircle,
            {
              width: SVG_SIZE * 0.52,
              height: SVG_SIZE * 0.52,
              borderRadius: (SVG_SIZE * 0.52) / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.scoreNumber,
              { fontSize: Math.max(36, SVG_SIZE * 0.165), lineHeight: Math.max(42, SVG_SIZE * 0.19) },
            ]}
          >
            {isPending ? '—' : clampedScore}
          </Text>
          <Text style={styles.outOfText}>
            {isPending ? 'Pending' : `Out of ${maxScore}`}
          </Text>

          <View style={styles.freudRow}>
            <Text style={styles.freudText}>{displayLabel}</Text>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
          </View>

          {/* Bottom Badge Icon (4 dots) */}
          <View style={styles.bottomBadge}>
            <View style={styles.dotRow}>
              <View style={styles.smallDot} />
            </View>
            <View style={styles.dotRowCenter}>
              <View style={styles.smallDot} />
              <View style={[styles.smallDot, { marginHorizontal: 3 }]} />
            </View>
            <View style={styles.dotRow}>
              <View style={styles.smallDot} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default QuestionScoreGauge;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDBB2D', // Main warm yellow/orange background
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scoreNumber: {
    fontWeight: '800',
    color: '#F4A526', // Orange score text
  },
  outOfText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  freudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  freudText: {
    fontSize: 11,
    color: '#7A7A7A',
    marginRight: 4,
  },
  infoIcon: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: '#A0A0A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#A0A0A0',
    fontStyle: 'italic',
    lineHeight: 11,
  },
  bottomBadge: {
    position: 'absolute',
    bottom: -18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4A526',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dotRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 1.5,
  },
  smallDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  label: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  labelLow: {
    left: '8%',
    top: '60%',
    transform: [{ rotate: '-90deg' }],
  },
  labelMedium: {
    top: '11%',
  },
  labelHigh: {
    right: '6%',
    top: '60%',
    transform: [{ rotate: '90deg' }],
  },
});
