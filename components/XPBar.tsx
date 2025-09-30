import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface XPBarProps {
  xp: number;
  level: number;
}

export const XPBar: React.FC<XPBarProps> = ({ xp, level }) => {
  const progress = Math.min((xp % 100) / 100, 1);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.level}>Lvl {level}</Text>
        <Text style={styles.xp}>{xp % 100}/100 XP</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  level: {
    fontWeight: '600'
  },
  xp: {
    fontVariant: ['tabular-nums'],
    color: '#666'
  },
  bar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden'
  },
  fill: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ff6f00'
  }
});
