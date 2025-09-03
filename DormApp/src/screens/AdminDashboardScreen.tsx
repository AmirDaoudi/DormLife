import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { RootState, AppDispatch } from '../store/store';
import { updateRequestStatus, Request } from '../store/requestsSlice';
import GeorgetownLogo from '../components/GeorgetownLogo';

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const { requests } = useSelector((state: RootState) => state.requests);
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentData } = useSelector((state: RootState) => state.temperature);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Advanced filtering with search
  const filteredRequests = requests
    .filter(request => request.status === activeTab)
    .filter(request => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.category.toLowerCase().includes(query) ||
        request.roomNumber.toString().toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by priority, then by timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  
  // Real-time statistics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const resolvedTodayCount = requests.filter(r => 
    r.status === 'resolved' && 
    new Date(r.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const urgentCount = requests.filter(r => r.priority === 'urgent' && r.status !== 'resolved').length;
  const averageResponseTime = "2.3h"; // Mock data
  const satisfactionRate = "94%"; // Mock data

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: Request['status'], customNote?: string) => {
    const statusMessages = {
      in_progress: 'Request assigned to maintenance team',
      resolved: customNote || 'Issue has been resolved successfully'
    };

    try {
      await dispatch(updateRequestStatus({ 
        requestId, 
        status: newStatus,
        adminNotes: statusMessages[newStatus] || 'Status updated by admin'
      }));
      
      Alert.alert(
        'Status Updated',
        `Request has been marked as ${newStatus.replace('_', ' ')}`
      );
      
      // Reset any selected request
      setSelectedRequest(null);
      setAdminNote('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleQuickResolve = (requestId: string) => {
    Alert.alert(
      'Resolve Request',
      'Add a resolution note for this request:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Resolved', 
          onPress: () => handleStatusUpdate(requestId, 'resolved', 'Request completed by admin')
        }
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <GeorgetownLogo size="small" variant="dark" showAppName={false} />
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileTab' as never)}
          >
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.textOnPrimary} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.adminName}>House Advisor Portal</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="people" size={16} color={Colors.textOnPrimary} />
            <Text style={styles.roleText}>Staff Access</Text>
          </View>
        </View>
      </View>

      <View style={styles.dashboardSection}>
        <Text style={styles.dashboardTitle}>Control Center</Text>
        <View style={styles.controlGrid}>
          <View style={styles.controlCard}>
            <Ionicons name="thermometer" size={24} color={Colors.error} />
            <Text style={styles.controlValue}>{currentData.current}°F</Text>
            <Text style={styles.controlLabel}>Current Temp</Text>
          </View>
          
          <View style={styles.controlCard}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.controlValue}>127</Text>
            <Text style={styles.controlLabel}>Active Students</Text>
          </View>
          
          <View style={styles.controlCard}>
            <Ionicons name="flash" size={24} color={Colors.warning} />
            <Text style={styles.controlValue}>{urgentCount}</Text>
            <Text style={styles.controlLabel}>Urgent Issues</Text>
          </View>
          
          <View style={styles.controlCard}>
            <Ionicons name="time" size={24} color={Colors.success} />
            <Text style={styles.controlValue}>{averageResponseTime}</Text>
            <Text style={styles.controlLabel}>Avg Response</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
          <View style={[styles.statIndicator, { backgroundColor: Colors.warning }]} />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
          <View style={[styles.statIndicator, { backgroundColor: Colors.primary }]} />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{resolvedTodayCount}</Text>
          <Text style={styles.statLabel}>Resolved Today</Text>
          <View style={[styles.statIndicator, { backgroundColor: Colors.success }]} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests, rooms, categories..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'in_progress' && styles.activeTab]}
          onPress={() => setActiveTab('in_progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in_progress' && styles.activeTabText]}>
            In Progress ({inProgressCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.requestsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <Text style={styles.resultsCount}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
        
        {filteredRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestMeta}>
                <Text style={styles.category}>{formatCategory(request.category)}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(request.priority) }]}>
                  <Text style={styles.priorityText}>{request.priority.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <Text style={styles.upvoteCount}>{request.upvotes.length} votes</Text>
              </View>
            </View>
            
            <Text style={styles.requestTitle}>{request.title}</Text>
            
            {request.description && (
              <Text style={styles.requestDescription}>
                {request.description}
              </Text>
            )}

            <View style={styles.requestDetails}>
              <Text style={styles.roomInfo}>
                {request.isAnonymous ? 'Anonymous Request' : `Room ${request.roomNumber}`}
              </Text>
              <Text style={styles.timestamp}>{request.timestamp}</Text>
            </View>

            {activeTab === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                  onPress={() => handleStatusUpdate(request.id, 'in_progress')}
                >
                  <Ionicons name="play" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.actionButtonText}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: Colors.success }]}
                  onPress={() => handleStatusUpdate(request.id, 'resolved', 'Resolved by admin')}
                >
                  <Ionicons name="checkmark" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.actionButtonText}>Resolve</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'in_progress' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: Colors.success }]}
                  onPress={() => handleStatusUpdate(request.id, 'resolved', 'Completed by maintenance team')}
                >
                  <Ionicons name="checkmark" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.actionButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
            )}

            {request.adminNotes && (
              <View style={styles.adminNotesContainer}>
                <Ionicons name="person-circle" size={16} color={Colors.primary} />
                <Text style={styles.adminNotes}>{request.adminNotes}</Text>
              </View>
            )}
          </View>
        ))}
        
        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateTitle}>
              No {activeTab.replace('_', ' ')} requests
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === 'pending' 
                ? 'All caught up! No pending requests to review.'
                : activeTab === 'in_progress'
                ? 'No requests currently being worked on.'
                : 'No resolved requests to show.'
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
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textLight,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  dashboardSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  controlCard: {
    width: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  controlValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  controlLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 25,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  statIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
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
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: Colors.backgroundSecondary,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
  requestActions: {
    alignItems: 'flex-end',
  },
  upvoteCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomInfo: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  adminNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  adminNotes: {
    flex: 1,
    fontSize: 13,
    color: Colors.textOnPrimary,
    lineHeight: 18,
    fontWeight: '500',
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
    fontWeight: '500',
  },
});