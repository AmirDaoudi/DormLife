import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RootState, AppDispatch } from '../store/store';
import { submitTemperatureVote, fetchTemperatureData } from '../store/temperatureSlice';

export default function TemperatureScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentData, stats, hasVotedToday, loading } = useSelector(
    (state: RootState) => state.temperature
  );
  
  const [selectedTemp, setSelectedTemp] = useState(72);

  useEffect(() => {
    // Fetch initial temperature data
    dispatch(fetchTemperatureData());
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchTemperatureData());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Initialize selected temp with user's last vote or average
    if (stats.userLastVote) {
      setSelectedTemp(stats.userLastVote);
    } else if (stats.averagePreference) {
      setSelectedTemp(stats.averagePreference);
    }
  }, [stats]);

  const getTrendIcon = () => {
    switch (currentData.trend) {
      case 'rising':
        return 'trending-up';
      case 'falling':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (currentData.trend) {
      case 'rising':
        return Colors.error;
      case 'falling':
        return Colors.primary;
      default:
        return Colors.textLight;
    }
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const lastUpdated = new Date(currentData.lastUpdated);
    const diffInMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  const calculateTimeUntilNextVote = () => {
    if (!stats.nextVoteAvailable) return null;
    
    const nextVote = new Date(stats.nextVoteAvailable);
    const now = new Date();
    const diffInMs = nextVote.getTime() - now.getTime();
    
    if (diffInMs <= 0) return null;
    
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleVote = async () => {
    if (hasVotedToday) {
      const timeLeft = calculateTimeUntilNextVote();
      Alert.alert(
        'Already Voted Today', 
        timeLeft 
          ? `You can vote again in ${timeLeft}` 
          : 'You can vote again soon!'
      );
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to vote.');
      return;
    }
    
    try {
      await dispatch(submitTemperatureVote({
        temperature: selectedTemp,
        userId: user.id,
      })).unwrap();
      
      Alert.alert(
        'Vote Submitted',
        `Your vote for ${selectedTemp}°F has been recorded successfully. Thank you for helping us maintain a comfortable environment in ${currentData.zone}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit your vote. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.currentTempContainer}>
          <View style={styles.tempHeader}>
            <Text style={styles.currentTempLabel}>Current Temperature</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => dispatch(fetchTemperatureData())}
            >
              <Ionicons name="refresh" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tempDisplayContainer}>
            <Text style={styles.currentTemp}>{currentData.current}°F</Text>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon() as keyof typeof Ionicons.glyphMap} 
                size={20} 
                color={getTrendColor()} 
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {currentData.trend}
              </Text>
            </View>
          </View>
          
          <View style={styles.zoneInfo}>
            <Text style={styles.currentTempSubtitle}>{currentData.zone}</Text>
            <Text style={styles.lastUpdated}>Updated {formatLastUpdated()}</Text>
          </View>
          
          <View style={styles.targetTempContainer}>
            <Text style={styles.targetLabel}>Target: {currentData.target}°F</Text>
            <View style={styles.tempDiffContainer}>
              {currentData.current !== currentData.target && (
                <Text style={[
                  styles.tempDiff,
                  { color: currentData.current > currentData.target ? Colors.error : Colors.primary }
                ]}>
                  {currentData.current > currentData.target ? '+' : ''}
                  {(currentData.current - currentData.target).toFixed(1)}°
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.votingContainer}>
          <Text style={styles.votingTitle}>Vote for Your Preferred Temperature</Text>
          
          <View style={styles.temperatureSelector}>
            <Text style={styles.selectedTemp}>{selectedTemp}°F</Text>
            <Slider
              style={styles.slider}
              minimumValue={65}
              maximumValue={80}
              value={selectedTemp}
              onValueChange={setSelectedTemp}
              step={1}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>65°F</Text>
              <Text style={styles.sliderLabel}>80°F</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.voteButton, 
              (hasVotedToday || loading) && styles.voteButtonDisabled
            ]}
            onPress={handleVote}
            disabled={hasVotedToday || loading}
          >
            <Text style={styles.voteButtonText}>
              {loading 
                ? 'Submitting Vote...' 
                : hasVotedToday 
                ? 'Already Voted Today' 
                : 'Submit Vote'
              }
            </Text>
          </TouchableOpacity>

          {hasVotedToday && (
            <Text style={styles.nextVoteText}>
              {calculateTimeUntilNextVote() 
                ? `Next vote available in ${calculateTimeUntilNextVote()}`
                : 'You can vote again soon!'
              }
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Voting Stats</Text>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Votes</Text>
            <Text style={styles.statValue}>{stats.totalVotes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Preference</Text>
            <Text style={styles.statValue}>{stats.averagePreference}°F</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Your Last Vote</Text>
            <Text style={styles.statValue}>
              {stats.userLastVote ? `${stats.userLastVote}°F` : 'Not voted'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  currentTempContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
  },
  tempHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  tempDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  zoneInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  targetTempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  tempDiffContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  tempDiff: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentTempLabel: {
    fontSize: 17,
    color: Colors.textLight,
    marginBottom: 8,
  },
  currentTemp: {
    fontSize: 64,
    fontWeight: '300',
    color: Colors.text,
    marginBottom: 8,
  },
  currentTempSubtitle: {
    fontSize: 15,
    color: Colors.textLight,
  },
  votingContainer: {
    marginBottom: 30,
  },
  votingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  temperatureSelector: {
    alignItems: 'center',
    marginBottom: 30,
  },
  selectedTemp: {
    fontSize: 48,
    fontWeight: '300',
    color: Colors.primary,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  sliderThumb: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  voteButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  voteButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  voteButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  nextVoteText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});