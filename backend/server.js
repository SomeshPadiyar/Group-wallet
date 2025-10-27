// server.js - Add these new routes and enhance existing ones
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let groups = [];
let users = [];

// Add to server.js - NEW transaction approval endpoints

// Approve transaction
// Approve transaction
app.post('/api/groups/:groupId/transactions/:transactionId/approve', (req, res) => {
  const { groupId, transactionId } = req.params;
  const { userId } = req.body;
  
  console.log(`Approval request: Group ${groupId}, Transaction ${transactionId}, User ${userId}`);
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const transaction = group.transactions.find(t => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({ error: `Transaction is already ${transaction.status}` });
  }

  // Initialize arrays if they don't exist
  if (!transaction.approvals) transaction.approvals = [];
  if (!transaction.rejections) transaction.rejections = [];

  // Remove user from rejections if they previously rejected
  transaction.rejections = transaction.rejections.filter(id => id !== userId);
  
  // Add user to approvals if not already there
  if (!transaction.approvals.includes(userId)) {
    transaction.approvals.push(userId);
  }

  const approvalCount = transaction.approvals.length;
  const rejectionCount = transaction.rejections.length;
  const totalMembers = group.members.length;
  const requiredApprovals = group.approvalThreshold;

  console.log(`Voting: ${approvalCount} approve, ${rejectionCount} reject, ${totalMembers} total members, need ${requiredApprovals} approvals`);

  // Check if approved
  if (approvalCount >= requiredApprovals) {
    transaction.status = 'approved';
    transaction.approvedAt = new Date().toISOString();
    console.log(`Transaction ${transactionId} APPROVED!`);
  }
  // Check if rejected (all members voted but not enough approvals)
  else if ((approvalCount + rejectionCount) >= totalMembers) {
    transaction.status = 'rejected';
    transaction.rejectedAt = new Date().toISOString();
    console.log(`Transaction ${transactionId} REJECTED - all members voted but not enough approvals`);
  }

  res.json({
    transaction,
    votingStatus: {
      approvals: approvalCount,
      rejections: rejectionCount,
      totalMembers: totalMembers,
      requiredApprovals: requiredApprovals,
      isApproved: transaction.status === 'approved',
      isRejected: transaction.status === 'rejected'
    }
  });
});

// Reject transaction
app.post('/api/groups/:groupId/transactions/:transactionId/reject', (req, res) => {
  const { groupId, transactionId } = req.params;
  const { userId } = req.body;
  
  console.log(`Rejection request: Group ${groupId}, Transaction ${transactionId}, User ${userId}`);
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const transaction = group.transactions.find(t => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({ error: `Transaction is already ${transaction.status}` });
  }

  // Initialize arrays if they don't exist
  if (!transaction.approvals) transaction.approvals = [];
  if (!transaction.rejections) transaction.rejections = [];

  // Remove user from approvals if they previously approved
  transaction.approvals = transaction.approvals.filter(id => id !== userId);
  
  // Add user to rejections if not already there
  if (!transaction.rejections.includes(userId)) {
    transaction.rejections.push(userId);
  }

  const approvalCount = transaction.approvals.length;
  const rejectionCount = transaction.rejections.length;
  const totalMembers = group.members.length;
  const requiredApprovals = group.approvalThreshold;

  console.log(`Voting: ${approvalCount} approve, ${rejectionCount} reject, ${totalMembers} total members, need ${requiredApprovals} approvals`);

  // Check if approved
  if (approvalCount >= requiredApprovals) {
    transaction.status = 'approved';
    transaction.approvedAt = new Date().toISOString();
    console.log(`Transaction ${transactionId} APPROVED!`);
  }
  // Check if rejected (all members voted but not enough approvals)
  else if ((approvalCount + rejectionCount) >= totalMembers) {
    transaction.status = 'rejected';
    transaction.rejectedAt = new Date().toISOString();
    console.log(`Transaction ${transactionId} REJECTED - all members voted but not enough approvals`);
  }

  res.json({
    transaction,
    votingStatus: {
      approvals: approvalCount,
      rejections: rejectionCount,
      totalMembers: totalMembers,
      requiredApprovals: requiredApprovals,
      isApproved: transaction.status === 'approved',
      isRejected: transaction.status === 'rejected'
    }
  });
});

// Create transaction endpoint (if not already there)
app.post('/api/groups/:groupId/transactions', (req, res) => {
  const { groupId } = req.params;
  const { type, amount, description, createdBy } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Validate transaction data
  if (!['deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const newTransaction = {
    id: uuidv4(),
    type,
    amount: parseFloat(amount),
    description: description || '',
    status: 'pending',
    createdBy,
    createdAt: new Date().toISOString(),
    approvals: [],
    rejectedBy: null,
  };

  if (!group.transactions) {
    group.transactions = [];
  }
  
  group.transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Enhanced transaction creation in group creation/update
app.post('/api/groups', (req, res) => {
  const { name, code, approvalThreshold, members, createdBy } = req.body;
  
  // Check if code already exists
  if (groups.some(group => group.code === code)) {
    return res.status(400).json({ error: 'Group code already exists' });
  }

  const newGroup = {
    id: uuidv4(),
    name,
    code,
    approvalThreshold: parseInt(approvalThreshold) || 2,
    members: members || [],
    transactions: [],
    createdAt: new Date().toISOString(),
    createdBy,
  };

  groups.push(newGroup);
  res.status(201).json(newGroup);
});

// Enhanced join group - ensure proper member structure
app.post('/api/groups/join', (req, res) => {
  const { code, user } = req.body;
  
  const group = groups.find(g => g.code === code);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Check if user already a member
  if (group.members.some(member => member.phone === user.phone)) {
    return res.status(400).json({ error: 'Already a member of this group' });
  }

  // Add user to group with proper structure
  group.members.push({
    id: user.id || uuidv4(),
    name: user.name,
    phone: user.phone,
    isAdmin: false
  });
  
  res.json(group);
});

// NEW: Create transaction endpoint
app.post('/api/groups/:groupId/transactions', (req, res) => {
  const { groupId } = req.params;
  const { type, amount, description, createdBy } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Validate transaction data
  if (!['deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const newTransaction = {
    id: uuidv4(),
    type,
    amount: parseFloat(amount),
    description: description || '',
    status: 'pending',
    createdBy,
    createdAt: new Date().toISOString(),
    approvals: [], // Array of user IDs who approved
    rejectedBy: null, // User ID who rejected (if any)
  };

  group.transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// NEW: Approve transaction with counting logic
app.post('/api/groups/:groupId/transactions/:transactionId/approve', (req, res) => {
  const { groupId, transactionId } = req.params;
  const { userId } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const transaction = group.transactions.find(t => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Check if transaction is already finalized
  if (transaction.status !== 'pending') {
    return res.status(400).json({ error: `Transaction is already ${transaction.status}` });
  }

  // Initialize approvals array if it doesn't exist
  if (!transaction.approvals) {
    transaction.approvals = [];
  }

  // Check if user already approved
  if (transaction.approvals.includes(userId)) {
    return res.status(400).json({ error: 'You have already approved this transaction' });
  }

  // Add user approval
  transaction.approvals.push(userId);

  // Check if we reached the approval threshold
  const approvalCount = transaction.approvals.length;
  const requiredApprovals = group.approvalThreshold;

  console.log(`Approval progress: ${approvalCount}/${requiredApprovals}`);

  if (approvalCount >= requiredApprovals) {
    transaction.status = 'approved';
    transaction.approvedAt = new Date().toISOString();
    console.log(`Transaction ${transactionId} automatically approved!`);
  }

  res.json({
    transaction,
    approvalProgress: {
      current: approvalCount,
      required: requiredApprovals,
      isApproved: transaction.status === 'approved'
    }
  });
});

// NEW: Reject transaction
app.post('/api/groups/:groupId/transactions/:transactionId/reject', (req, res) => {
  const { groupId, transactionId } = req.params;
  const { userId } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const transaction = group.transactions.find(t => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({ error: `Cannot reject - transaction is already ${transaction.status}` });
  }

  // Reject the transaction (single rejection is enough)
  transaction.status = 'rejected';
  transaction.rejectedBy = userId;
  transaction.rejectedAt = new Date().toISOString();

  res.json(transaction);
});

// NEW: Get transaction approval status
app.get('/api/groups/:groupId/transactions/:transactionId/approval-status', (req, res) => {
  const { groupId, transactionId } = req.params;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const transaction = group.transactions.find(t => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const approvalProgress = {
    current: transaction.approvals ? transaction.approvals.length : 0,
    required: group.approvalThreshold,
    isApproved: transaction.status === 'approved',
    isRejected: transaction.status === 'rejected',
    approvals: transaction.approvals || []
  };

  res.json(approvalProgress);
});

// Keep your existing routes but enhance the update group to handle transactions properly
app.put('/api/groups/:id', (req, res) => {
  const groupIndex = groups.findIndex(g => g.id === req.params.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Preserve critical fields that shouldn't be overwritten
  const updatedGroup = {
    ...groups[groupIndex],
    ...req.body,
    // Don't allow these to be changed via update
    id: groups[groupIndex].id,
    createdAt: groups[groupIndex].createdAt,
    createdBy: groups[groupIndex].createdBy,
  };

  groups[groupIndex] = updatedGroup;
  res.json(updatedGroup);
});

// Enhanced get group by ID
app.get('/api/groups/:id', (req, res) => {
  const group = groups.find(g => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  res.json(group);
});

// Get all groups for a user
app.get('/api/users/:phone/groups', (req, res) => {
  const userPhone = req.params.phone;
  const userGroups = groups.filter(group => 
    group.members.some(member => member.phone === userPhone)
  );
  res.json(userGroups);
});

// Delete group
app.delete('/api/groups/:id', (req, res) => {
  const groupIndex = groups.findIndex(g => g.id === req.params.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }

  groups.splice(groupIndex, 1);
  res.json({ message: 'Group deleted successfully' });
});

// Admin update approval threshold
app.put('/api/groups/:groupId/threshold', (req, res) => {
  const { groupId } = req.params;
  const { newThreshold, adminUserId } = req.body;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  // Check if user is admin (creator)
  if (group.createdBy !== adminUserId) {
    return res.status(403).json({ error: 'Only admin can change approval threshold' });
  }

  if (newThreshold < 1 || newThreshold > group.members.length) {
    return res.status(400).json({ error: `Threshold must be between 1 and ${group.members.length}` });
  }

  group.approvalThreshold = newThreshold;
  
  res.json({
    message: `Approval threshold updated to ${newThreshold}`,
    group: group
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Current groups in memory: ${groups.length}`);
});