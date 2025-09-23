
import Negotiation from '../models/negotiation.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import EnhancedUser from '../models/enhancedUser.js';
import socketService from '../services/socketService.js';

// Create a new negotiation
export const createNegotiation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { amount, currency = 'USD', topic, message, eventId } = req.body;
    const currentUserId = req.user._id;
    const currentUserRole = req.user.role;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    const existingNegotiation = await Negotiation.findByConversation(conversationId);
    if (existingNegotiation && existingNegotiation.status === 'active') {
      return res.status(400).json({ success: false, message: 'An active negotiation already exists for this conversation' });
    }

    // Determine organizer and speaker
    const participants = conversation.participants;
    let organizer, speaker;
    for (const participant of participants) {
      if (participant.user.toString() === currentUserId) {
        if (currentUserRole === 'organizer') organizer = currentUserId;
        else speaker = currentUserId;
      } else {
        const otherUser = await EnhancedUser.findById(participant.user);
        if (otherUser.role === 'organizer') organizer = participant.user;
        else speaker = participant.user;
      }
    }

    if (!organizer || !speaker) {
      return res.status(400).json({ success: false, message: 'Both organizer and speaker must be present in the conversation' });
    }

    const negotiation = new Negotiation({
      conversation: conversationId,
      organizer,
      speaker,
      event: eventId || null,
      topic: topic || 'Speaking Engagement',
      currentProposal: {
        amount,
        currency,
        proposedBy: currentUserId,
        proposedAt: new Date(),
        message
      },
      proposals: [{
        amount,
        currency,
        proposedBy: currentUserId,
        proposedAt: new Date(),
        message,
        status: 'pending'
      }],
      status: 'active'
    });

    await negotiation.save();

    const negotiationMessage = new Message({
      content: `💰 New proposal: ${currency} ${amount} - ${message || 'No additional message'}`,
      messageType: 'negotiation_proposal',
      sender: currentUserId,
      conversation: conversationId,
      metadata: { negotiationId: negotiation._id, amount, currency, proposalType: 'initial' }
    });

    await negotiationMessage.save();

    conversation.lastMessage = {
      content: `💰 New proposal: ${currency} ${amount}`,
      sender: currentUserId,
      timestamp: negotiationMessage.createdAt,
      messageType: 'negotiation_proposal'
    };
    await conversation.save();

    await negotiation.populate([
      { path: 'organizer', select: 'firstName lastName email role' },
      { path: 'speaker', select: 'firstName lastName email role' },
      { path: 'event', select: 'title date' }
    ]);

    socketService.io.to(conversationId).emit('negotiation_created', { negotiation, message: negotiationMessage });

    res.status(201).json({ success: true, message: 'Negotiation created successfully', negotiation, message: negotiationMessage });

  } catch (error) {
    console.error('Error creating negotiation:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get negotiation by conversation
export const getNegotiation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    const negotiation = await Negotiation.findByConversation(conversationId);
    if (!negotiation) return res.status(404).json({ success: false, message: 'No negotiation found for this conversation' });

    res.status(200).json({ success: true, message: 'Negotiation retrieved successfully', negotiation });

  } catch (error) {
    console.error('Error getting negotiation:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Propose a new amount (counter-proposal)
export const proposeAmount = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { amount, currency = 'USD', message } = req.body;
    const currentUserId = req.user._id;

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return res.status(404).json({ success: false, message: 'Negotiation not found' });

    const currentUserIdStr = currentUserId.toString();
    const organizerIdStr = negotiation.organizer.toString();
    const speakerIdStr = negotiation.speaker.toString();
    if (organizerIdStr !== currentUserIdStr && speakerIdStr !== currentUserIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied to this negotiation' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Negotiation is no longer active' });
    }

    const lastPendingProposal = negotiation.proposals.slice().reverse().find(p => p.status === 'pending');
    if (lastPendingProposal && lastPendingProposal.proposedBy.toString() === currentUserIdStr) {
      return res.status(400).json({ success: false, message: 'You cannot make consecutive proposals. Wait for the other party to respond.' });
    }

    if (negotiation.proposals.length >= negotiation.settings.maxProposals) {
      return res.status(400).json({ success: false, message: 'Maximum number of proposals reached' });
    }

    await negotiation.addProposal(amount, currency, currentUserId, message);

    const negotiationMessage = new Message({
      content: `💰 Counter-proposal: ${currency} ${amount} - ${message || 'No additional message'}`,
      messageType: 'negotiation_proposal',
      sender: currentUserId,
      conversation: negotiation.conversation,
      metadata: { negotiationId: negotiation._id, amount, currency, proposalType: 'counter' }
    });

    await negotiationMessage.save();

    const conversation = await Conversation.findById(negotiation.conversation);
    conversation.lastMessage = { content: `💰 Counter-proposal: ${currency} ${amount}`, sender: currentUserId, timestamp: negotiationMessage.createdAt, messageType: 'negotiation_proposal' };
    await conversation.save();

    await negotiation.populate([
      { path: 'organizer', select: 'firstName lastName email role' },
      { path: 'speaker', select: 'firstName lastName email role' },
      { path: 'event', select: 'title date' }
    ]);

    socketService.io.to(negotiation.conversation.toString()).emit('negotiation_proposal', { negotiation, message: negotiationMessage });

    res.status(200).json({ success: true, message: 'Proposal sent successfully', negotiation, message: negotiationMessage });

  } catch (error) {
    console.error('Error proposing amount:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Accept a proposal
export const acceptProposal = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { message } = req.body;
    const currentUserId = req.user._id;

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return res.status(404).json({ success: false, message: 'Negotiation not found' });

    const currentUserIdStr = currentUserId.toString();
    const organizerIdStr = negotiation.organizer.toString();
    const speakerIdStr = negotiation.speaker.toString();
    if (organizerIdStr !== currentUserIdStr && speakerIdStr !== currentUserIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied to this negotiation' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Negotiation is no longer active' });
    }

    const lastProposal = negotiation.proposals[negotiation.proposals.length - 1];
    if (!lastProposal || lastProposal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending proposal to accept' });
    }

    if (lastProposal.proposedBy.toString() === currentUserIdStr) {
      return res.status(400).json({ success: false, message: 'You cannot accept your own proposal' });
    }

    // Accept proposal using respondToProposal (no manual update)
    await negotiation.respondToProposal(negotiation.proposals.length - 1, 'accepted', message);

    negotiation.currentProposal = { ...lastProposal, status: 'accepted', respondedAt: new Date(), responseMessage: message || 'I accept this proposal' };
    negotiation.finalAgreement = { amount: lastProposal.amount, currency: lastProposal.currency, acceptedBy: currentUserId, acceptedAt: new Date() };
    negotiation.status = 'accepted';

    await negotiation.save();

    const acceptanceMessage = new Message({
      content: `✅ Proposal accepted: ${negotiation.currentProposal.currency} ${negotiation.currentProposal.amount} - ${message || 'Deal confirmed!'}`,
      messageType: 'negotiation_accepted',
      sender: currentUserId,
      conversation: negotiation.conversation,
      metadata: { negotiationId: negotiation._id, amount: negotiation.currentProposal.amount, currency: negotiation.currentProposal.currency, finalAgreement: negotiation.finalAgreement }
    });

    await acceptanceMessage.save();

    const conversation = await Conversation.findById(negotiation.conversation);
    conversation.lastMessage = { content: `✅ Proposal accepted: ${negotiation.currentProposal.currency} ${negotiation.currentProposal.amount}`, sender: currentUserId, timestamp: acceptanceMessage.createdAt, messageType: 'negotiation_accepted' };
    await conversation.save();

    await negotiation.populate([
      { path: 'organizer', select: 'firstName lastName email role' },
      { path: 'speaker', select: 'firstName lastName email role' },
      { path: 'event', select: 'title date' }
    ]);

    socketService.io.to(negotiation.conversation.toString()).emit('negotiation_accepted', { negotiation, message: acceptanceMessage });

    res.status(200).json({ success: true, message: 'Proposal accepted successfully', negotiation, message: acceptanceMessage });

  } catch (error) {
    console.error('Error accepting proposal:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Decline a proposal
export const declineProposal = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { message } = req.body;
    const currentUserId = req.user._id;

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return res.status(404).json({ success: false, message: 'Negotiation not found' });

    const currentUserIdStr = currentUserId.toString();
    const organizerIdStr = negotiation.organizer.toString();
    const speakerIdStr = negotiation.speaker.toString();
    if (organizerIdStr !== currentUserIdStr && speakerIdStr !== currentUserIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied to this negotiation' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Negotiation is no longer active' });
    }

    const lastProposal = negotiation.proposals[negotiation.proposals.length - 1];
    if (!lastProposal || lastProposal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending proposal to decline' });
    }

    if (lastProposal.proposedBy.toString() === currentUserIdStr) {
      return res.status(400).json({ success: false, message: 'You cannot decline your own proposal' });
    }

    await negotiation.respondToProposal(negotiation.proposals.length - 1, 'declined', message);

    negotiation.currentProposal = { ...lastProposal, status: 'declined', respondedAt: new Date(), responseMessage: message || 'Proposal declined' };
    negotiation.status = 'declined';
    await negotiation.save();

    const declineMessage = new Message({
      content: `❌ Proposal declined: ${negotiation.currentProposal.currency} ${negotiation.currentProposal.amount} - ${message || 'Proposal not accepted'}`,
      messageType: 'negotiation_declined',
      sender: currentUserId,
      conversation: negotiation.conversation,
      metadata: { negotiationId: negotiation._id, amount: negotiation.currentProposal.amount, currency: negotiation.currentProposal.currency }
    });

    await declineMessage.save();

    const conversation = await Conversation.findById(negotiation.conversation);
    conversation.lastMessage = { content: `❌ Proposal declined: ${negotiation.currentProposal.currency} ${negotiation.currentProposal.amount}`, sender: currentUserId, timestamp: declineMessage.createdAt, messageType: 'negotiation_declined' };
    await conversation.save();

    await negotiation.populate([
      { path: 'organizer', select: 'firstName lastName email role' },
      { path: 'speaker', select: 'firstName lastName email role' },
      { path: 'event', select: 'title date' }
    ]);

    socketService.io.to(negotiation.conversation.toString()).emit('negotiation_declined', { negotiation, message: declineMessage });

    res.status(200).json({ success: true, message: 'Proposal declined successfully', negotiation, message: declineMessage });

  } catch (error) {
    console.error('Error declining proposal:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Other methods (cancelNegotiation, getUserNegotiations, getNegotiationStats, etc.) remain the same
// Cancel negotiation
export const cancelNegotiation = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { reason } = req.body;
    const currentUserId = req.user._id;

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }

    // Check if user is participant
    const currentUserIdStr = currentUserId.toString();
    const organizerIdStr = negotiation.organizer.toString();
    const speakerIdStr = negotiation.speaker.toString();
    
    if (organizerIdStr !== currentUserIdStr && 
        speakerIdStr !== currentUserIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this negotiation'
      });
    }

    // Check if negotiation is still active
    if (negotiation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Negotiation is no longer active'
      });
    }

    // Cancel the negotiation
    await negotiation.cancelNegotiation(currentUserId, reason);

    // Create cancellation message
    const cancelMessage = new Message({
      content: `🚫 Negotiation cancelled - ${reason || 'No reason provided'}`,
      messageType: 'negotiation_cancelled',
      sender: currentUserId,
      conversation: negotiation.conversation,
      metadata: {
        negotiationId: negotiation._id,
        cancelledBy: currentUserId,
        reason
      }
    });

    await cancelMessage.save();

    // Update conversation's last message
    const conversation = await Conversation.findById(negotiation.conversation);
    conversation.lastMessage = {
      content: `🚫 Negotiation cancelled`,
      sender: currentUserId,
      timestamp: cancelMessage.createdAt,
      messageType: 'negotiation_cancelled'
    };
    await conversation.save();

    // Populate negotiation data
    await negotiation.populate([
      { path: 'organizer', select: 'firstName lastName email role' },
      { path: 'speaker', select: 'firstName lastName email role' },
      { path: 'event', select: 'title date' }
    ]);

    // Emit real-time event
    socketService.io.to(negotiation.conversation.toString()).emit('negotiation_cancelled', {
      negotiation: negotiation,
      message: cancelMessage
    });

    res.status(200).json({
      success: true,
      message: 'Negotiation cancelled successfully',
      negotiation: negotiation,
      message: cancelMessage
    });

  } catch (error) {
    console.error('Error cancelling negotiation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's negotiations
export const getUserNegotiations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { status, limit = 20, skip = 0 } = req.query;

    let filter = {
      $or: [
        { organizer: currentUserId },
        { speaker: currentUserId }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const negotiations = await Negotiation.find(filter)
      .populate('organizer speaker event', 'firstName lastName email role title date')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      message: 'Negotiations retrieved successfully',
      negotiations: negotiations,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: negotiations.length
      }
    });

  } catch (error) {
    console.error('Error getting user negotiations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get negotiation statistics
export const getNegotiationStats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const stats = await Negotiation.getNegotiationStats(currentUserId);

    res.status(200).json({
      success: true,
      message: 'Negotiation statistics retrieved successfully',
      stats: stats
    });

  } catch (error) {
    console.error('Error getting negotiation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get all negotiations
export const getAllNegotiationsAdmin = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    let filter = {};
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const negotiations = await Negotiation.find(filter)
      .populate('organizer speaker event', 'firstName lastName email role title date')
      .populate('conversation', 'participants type status')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Negotiation.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'All negotiations retrieved successfully',
      negotiations: negotiations,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting all negotiations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get negotiation details
export const getNegotiationAdmin = async (req, res) => {
  try {
    const { negotiationId } = req.params;

    const negotiation = await Negotiation.findById(negotiationId)
      .populate('organizer speaker event', 'firstName lastName email role title date')
      .populate('conversation', 'participants type status lastMessage')
      .populate('proposals.proposedBy', 'firstName lastName email role');

    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Negotiation details retrieved successfully',
      negotiation: negotiation
    });

  } catch (error) {
    console.error('Error getting negotiation details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get negotiation statistics
export const getNegotiationStatsAdmin = async (req, res) => {
  try {
    const stats = await Negotiation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$currentProposal.amount' },
          avgAmount: { $avg: '$currentProposal.amount' }
        }
      }
    ]);

    const totalNegotiations = await Negotiation.countDocuments();
    const activeNegotiations = await Negotiation.countDocuments({ status: 'active' });
    const completedNegotiations = await Negotiation.countDocuments({ status: 'accepted' });

    res.status(200).json({
      success: true,
      message: 'Admin negotiation statistics retrieved successfully',
      stats: {
        totalNegotiations,
        activeNegotiations,
        completedNegotiations,
        statusBreakdown: stats,
        completionRate: totalNegotiations > 0 ? (completedNegotiations / totalNegotiations * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Error getting admin negotiation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

