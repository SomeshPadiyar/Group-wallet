// api.js
const API_BASE_URL = 'http://10.145.2.60:3000/api';

export const api = {
  // Get user's groups
  getUserGroups: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/users/${phone}/groups`);
    return await response.json();
  },

  // Create group
  createGroup: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });
    return await response.json();
  },

  // Join group
  joinGroup: async (code, user) => {
    const response = await fetch(`${API_BASE_URL}/groups/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, user }),
    });
    return await response.json();
  },

  // Get group by ID
  getGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`);
    return await response.json();
  },

  // Update group
  updateGroup: async (groupId, updates) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return await response.json();
  },

  // Delete group
  deleteGroup: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
    });
    return await response.json();
  },

  // NEW: Approve transaction
  approveTransaction: async (groupId, transactionId, userId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions/${transactionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  },

  // In api.js - Add this method to the api object

// NEW: Update approval threshold (admin only)
updateApprovalThreshold: async (groupId, newThreshold, adminUserId) => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/threshold`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newThreshold, adminUserId }),
  });
  return await response.json();
},

  // NEW: Reject transaction
  rejectTransaction: async (groupId, transactionId, userId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions/${transactionId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  },
};