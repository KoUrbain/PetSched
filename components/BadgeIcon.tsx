import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Badge } from '@types/db';

interface BadgeIconProps {
  badge: Badge;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{badge.icon}</Text>
      <Text style={styles.name}>{badge.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    margin: 4,
    width: 80
  },
  icon: {
    fontSize: 24
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  }
});
