import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFriends } from '@store/useFriends';
import { FriendCard } from '@components/FriendCard';
import type { Pet } from '@types/db';

export default function SocialScreen() {
  const { friends, requests, activities, fetchFriends, sendRequest, respondRequest } = useFriends();
  const [username, setUsername] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [fetchFriends])
  );

  const handleAdd = async () => {
    if (!username) return;
    await sendRequest(username);
    setUsername('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Add a friend</Text>
          <TextInput
            placeholder="Friend username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <Button title="Send Request" onPress={handleAdd} />
        </View>

        {requests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>Friend Requests</Text>
            {requests.map((request) => (
              <View key={request.id} style={styles.requestRow}>
                <Text style={styles.requestText}>Request from {request.requester_id}</Text>
                <View style={styles.requestActions}>
                  <Button title="Accept" onPress={() => respondRequest(request.id, 'ACCEPTED')} />
                  <Button title="Decline" onPress={() => respondRequest(request.id, 'BLOCKED')} />
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionHeading}>Friends</Text>
        <View style={styles.friendGrid}>
          {friends.length === 0 && <Text style={styles.empty}>No friends yet.</Text>}
          {friends.map((friend) => {
            const fallbackPet: Pet = {
              id: `virtual-${friend.profile.id}`,
              user_id: friend.profile.id,
              xp: friend.pet?.xp ?? 0,
              level: friend.pet?.level ?? 1,
              streak_days: friend.pet?.streak_days ?? 0,
              last_claim: friend.pet?.last_claim ?? null,
              created_at: friend.pet?.created_at ?? new Date().toISOString()
            };
            return (
              <FriendCard
                key={friend.friendship.id}
                profile={friend.profile}
                pet={friend.pet ?? fallbackPet}
                badges={friend.badges}
              />
            );
          })}
        </View>

        <Text style={styles.sectionHeading}>Activity</Text>
        <View style={styles.card}>
          {activities.length === 0 && <Text style={styles.empty}>No activity yet.</Text>}
          {activities.map((activity) => (
            <Text key={activity.id} style={styles.activityRow}>
              {activity.type} • {activity.created_at}
            </Text>
          ))}
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
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  requestRow: {
    marginBottom: 12
  },
  requestText: {
    marginBottom: 8
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16
  },
  friendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  empty: {
    color: '#999'
  },
  activityRow: {
    marginBottom: 8
  }
});
