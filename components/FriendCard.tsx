import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Profile, Pet, Badge } from '@types/db';

interface FriendCardProps {
  profile: Profile;
  pet: Pet;
  badges: Badge[];
}

export const FriendCard: React.FC<FriendCardProps> = ({ profile, pet, badges }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile.username.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={styles.username}>{profile.username}</Text>
      <Text style={styles.meta}>Lvl {pet.level} • 🔥 {pet.streak_days}</Text>
      <View style={styles.badges}>
        {badges.slice(0, 3).map((badge) => (
          <Text key={badge.id} style={styles.badge}>
            {badge.icon}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700'
  },
  username: {
    fontWeight: '600',
    marginBottom: 4
  },
  meta: {
    color: '#666'
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4
  },
  badge: {
    fontSize: 18
  }
});
