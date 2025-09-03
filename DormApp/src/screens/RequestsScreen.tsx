import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RootState, AppDispatch } from '../store/store';
import { toggleUpvote, Request } from '../store/requestsSlice';

export default function RequestsScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests } = useSelector((state: RootState) => state.requests);
  
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  
  const displayedRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(request => request.userId === user?.id);

  const handleUpvote = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      await dispatch(toggleUpvote({ 
        requestId, 
        userId: user.id 
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update vote. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'in_progress': return Colors.primary;
      case 'resolved': return Colors.success;
      default: return Colors.textLight;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.primary;
      case 'low': return Colors.textLight;
      default: return Colors.textLight;
    }
  };

  const handleNewRequest = () => {
    navigation.navigate('CreateRequest' as never);
  };

  const formatCategory = (category: string): string => {
    switch (category) {
      case 'maintenance': return 'Maintenance';
      case 'noise': return 'Noise Complaint';
      case 'safety': return 'Safety & Security';
      case 'cleaning': return 'Cleaning';
      case 'suggestion': return 'Suggestion';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const getUserHasUpvoted = (request: Request): boolean => {
    return user?.id && Array.isArray(request.upvotes) ? request.upvotes.includes(user.id) : false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <TouchableOpacity style={styles.newRequestButton} onPress={handleNewRequest}>
          <Text style={styles.newRequestButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {displayedRequests.map((request) => (
          <TouchableOpacity key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestMeta}>
                <Text style={styles.category}>{formatCategory(request.category)}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(request.priority) }]}>
                  <Text style={styles.priorityText}>{request.priority.toUpperCase()}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                <Text style={styles.statusText}>{request.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.requestTitle}>{request.title}</Text>
            
            {request.description && (
              <Text style={styles.requestDescription} numberOfLines={2}>
                {request.description}
              </Text>
            )}

            <View style={styles.requestMeta}>
              <Text style={styles.roomNumber}>
                {request.isAnonymous ? 'Anonymous' : `Room ${request.roomNumber}`}
              </Text>
            </View>
            
            <View style={styles.requestFooter}>
              <Text style={styles.timestamp}>{request.timestamp}</Text>
              <TouchableOpacity 
                style={[
                  styles.upvoteContainer,
                  getUserHasUpvoted(request) && styles.upvoteContainerActive
                ]}
                onPress={() => handleUpvote(request.id)}
              >
                <Ionicons 
                  name={getUserHasUpvoted(request) ? "thumbs-up" : "thumbs-up-outline"} 
                  size={16} 
                  color={getUserHasUpvoted(request) ? Colors.background : Colors.primary} 
                />
                <Text style={[
                  styles.upvoteText,
                  getUserHasUpvoted(request) && styles.upvoteTextActive
                ]}>
                  {Array.isArray(request.upvotes) ? request.upvotes.length : 0}
                </Text>
              </TouchableOpacity>
            </View>

            {request.status === 'resolved' && request.adminNotes && (
              <View style={styles.adminNotesContainer}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.adminNotes}>{request.adminNotes}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        {displayedRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'all' ? 'No requests yet' : 'No requests from you'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === 'all' 
                ? 'Be the first to submit a request or suggestion!'
                : 'Tap the + button to create your first request'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
  },
  newRequestButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  newRequestButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.backgroundSecondary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text,
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
    color: Colors.textLight,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  upvoteContainerActive: {
    backgroundColor: Colors.primary,
  },
  upvoteText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  upvoteTextActive: {
    color: Colors.background,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  roomNumber: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  adminNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  adminNotes: {
    flex: 1,
    fontSize: 13,
    color: Colors.background,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});