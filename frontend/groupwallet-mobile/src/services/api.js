// api.js
const API_BASE_URL = 'https://group-wallet-backend.onrender.com/api';
// const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get current user
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

  // Approve transaction
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

  // Reject transaction
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

  // Complete payment for deposit
  completePayment: async (groupId, transactionId, paymentData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions/${transactionId}/complete-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    return await response.json();
  },

  // Complete withdrawal with UPI
  completeWithdrawal: async (groupId, transactionId, withdrawalData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions/${transactionId}/complete-withdrawal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withdrawalData),
    });
    return await response.json();
  },

  // Get payment details
  getPaymentDetails: async (groupId, transactionId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transactions/${transactionId}/payment-details`);
    return await response.json();
  },

  // Get pending payments for user
  getPendingPayments: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/users/${phone}/pending-payments`);
    return await response.json();
  },

  // Update user profile
  updateUser: async (phone, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${phone}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  // Update approval threshold (admin only)
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
};