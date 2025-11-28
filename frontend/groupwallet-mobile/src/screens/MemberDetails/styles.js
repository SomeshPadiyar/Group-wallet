import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const memberStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { fontSize: 16, color: '#666' },
  
  header: {
    backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#e9ecef', alignItems: 'center',
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  memberName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  memberPhone: { fontSize: 16, color: '#666', marginBottom: 8 },
  adminBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#FFEAA7' },
  adminBadgeText: { color: '#856404', fontSize: 14, fontWeight: '600' },

  statsContainer: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: 'white', width: (width - 60) / 2, padding: 20, borderRadius: 16, marginBottom: 16,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#f1f3f4',
  },
  statIcon: { fontSize: 32, marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 4 },
  statSubtext: { fontSize: 12, color: '#999', textAlign: 'center' },

  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  transactionItem: {
    backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e9ecef',
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionIcon: { fontSize: 24, marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionType: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  transactionDescription: { fontSize: 14, color: '#666', marginBottom: 2 },
  transactionTime: { fontSize: 12, color: '#999' },
  transactionRight: { alignItems: 'flex-end' },
  transactionStatus: {
    fontSize: 12, fontWeight: '600', backgroundColor: '#f8f9fa',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  // ORIGINAL: Compact filter container (much better!)
  filterContainer: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e9ecef' 
  },
  filterButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8 
  },
  filterButtonActive: { 
    backgroundColor: '#007AFF' 
  },
  filterButtonInactive: { 
    backgroundColor: '#f8f9fa' 
  },
  filterButtonText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  filterButtonTextActive: { 
    color: 'white' 
  },
  filterButtonTextInactive: { 
    color: '#666' 
  },
  swipeHint: {
  color: '#666',
  fontSize: 12,
  marginTop: 8,
  fontStyle: 'italic',
  textAlign: 'center',
},
});