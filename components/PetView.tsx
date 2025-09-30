import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { petMood, PetMood } from '@lib/gamification';

const levelAnimations: { max: number; file: any }[] = [
  { max: 4, file: require('../assets/pet/level1.json') },
  { max: 9, file: require('../assets/pet/level5.json') },
  { max: Infinity, file: require('../assets/pet/level10.json') }
];

interface PetViewProps {
  level: number;
  xp: number;
  lastDone: string | null;
}

export const PetView: React.FC<PetViewProps> = ({ level, xp, lastDone }) => {
  const animation = levelAnimations.find((entry) => level <= entry.max) ?? levelAnimations[0];
  const mood: PetMood = petMood(lastDone);

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop
        source={animation.file}
        style={styles.lottie}
      />
      <Text style={styles.caption}>Your pet is {mood === 'happy' ? 'happy' : 'feeling down'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  lottie: {
    width: 220,
    height: 220
  },
  caption: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  }
});
