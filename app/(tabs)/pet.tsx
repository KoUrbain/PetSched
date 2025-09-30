import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePet } from '@store/usePet';
import { PetView } from '@components/PetView';
import { XPBar } from '@components/XPBar';
import { BadgeIcon } from '@components/BadgeIcon';

export default function PetScreen() {
  const { pet, badges, fetchPet } = usePet();

  useFocusEffect(
    useCallback(() => {
      fetchPet();
    }, [fetchPet])
  );

  if (!pet) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>No pet yet. Complete a task to hatch one!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <PetView level={pet.level} xp={pet.xp} lastDone={pet.last_claim} />
        <View style={styles.section}>
          <XPBar level={pet.level} xp={pet.xp} />
          <Text style={styles.meta}>🔥 Streak: {pet.streak_days} days</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badges}>
            {badges.length === 0 && <Text style={styles.empty}>No badges yet. Keep playing!</Text>}
            {badges.map((badge) => (
              <BadgeIcon key={badge.id} badge={badge} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16
  },
  section: {
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  meta: {
    marginTop: 8,
    color: '#666'
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  empty: {
    textAlign: 'center',
    color: '#999'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  }
});
