import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getScores } from '../../lib/supabase';

const Leaderboard = () => {
  const [scores, setScores] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchScores() {
      const fetchedScores = await getScores();
      console.log('fetchedScores: ', fetchedScores);
      
      setScores(fetchedScores);
    }

    fetchScores();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text variant="titleLarge" style={styles.leaderboardTitle}>Leaderboard</Text>
          {scores && scores.length > 0 ? (
            scores.map((score, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text>{score.users.email}</Text>
                <Text>{score.score}</Text>
              </View>
            ))
          ) : (
            <Text>Loading leaderboard...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  leaderboardContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  leaderboardTitle: {
    marginBottom: 10,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Leaderboard;
