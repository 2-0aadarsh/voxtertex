import mongoose from 'mongoose';
import Dispute from '../models/dispute.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const createDispute = async (req, res) => {
    const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // remove "Bearer "
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });


    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log('Decoded token:', decoded);
    try {
         const user = req.user; 
        console.log('--- Create Dispute Called ---');
        const { title, description, category, priority, respondentId } = req.body;

        if (!title || !description || !category || !respondentId) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, category, and respondent'
            });
        }

        const complainantId = mongoose.Types.ObjectId(req.user._id);
        const respondentIdObj = mongoose.Types.ObjectId(respondentId);

        console.log('Complainant ID:', complainantId.toString());
        console.log('Respondent ID:', respondentIdObj.toString());

        const respondent = await User.findById(respondentIdObj);
        if (!respondent) {
            console.log('Respondent not found');
            return res.status(404).json({
                success: false,
                message: 'Respondent not found'
            });
        }

        // Create dispute object
        const dispute = new Dispute({
            title,
            description,
            category,
            priority: priority || 'medium',
            complainant: complainantId,
            respondent: respondentIdObj,
            peerToPeerData: {
                startedAt: new Date(),
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        console.log('Dispute object created (before timeline & messages):', dispute);

        // Add timeline entry
        dispute.timeline.push({
            action: 'Dispute created',
            performedBy: complainantId,
            details: 'Initial creation',
            stage: dispute.currentStage,
            timestamp: new Date()
        });

        // Add initial message
        dispute.messages.push({
            sender: complainantId,
            content: 'Dispute created successfully',
            messageType: 'message',
            timestamp: new Date()
        });

        console.log('Timeline and message added to dispute:', dispute.timeline, dispute.messages);

        // Save dispute to DB
        const savedDispute = await dispute.save();
        console.log('✅ Dispute saved successfully:', savedDispute._id);

        return res.status(201).json({
            success: true,
            message: 'Dispute created successfully',
            dispute: savedDispute
        });

    } catch (error) {
        console.error('❌ Create dispute error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// Get all disputes for the current user
export const getUserDisputes = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, stage, page = 1, limit = 10 } = req.query;

        const query = {
            $or: [
                { complainant: userId },
                { respondent: userId }
            ]
        };

        // Add filters
        if (status) query.status = status;
        if (stage) query.currentStage = stage;

        const skip = (page - 1) * limit;

        const disputes = await Dispute.find(query)
            .populate('complainant', 'firstName lastName email')
            .populate('respondent', 'firstName lastName email')
            .populate('mediationData.mediator', 'firstName lastName email')
            .sort({ lastActivityAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Dispute.countDocuments(query);

        res.json({
            success: true,
            disputes,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get user disputes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a specific dispute by ID
export const getDisputeById = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const userId = req.user._id;

        const dispute = await Dispute.findById(disputeId)
            .populate('complainant', 'firstName lastName email')
            .populate('respondent', 'firstName lastName email')
            .populate('mediationData.mediator', 'firstName lastName email')
            .populate('legalData.legalRepresentative', 'firstName lastName email')
            .populate('messages.sender', 'firstName lastName email')
            .populate('evidence.submittedBy', 'firstName lastName email')
            .populate('timeline.performedBy', 'firstName lastName email');

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check if user is authorized to view this dispute
        const isAuthorized = 
            dispute.complainant._id.equals(userId) ||
            dispute.respondent._id.equals(userId) ||
            (dispute.mediationData?.mediator && dispute.mediationData.mediator._id.equals(userId));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this dispute'
            });
        }

        res.json({
            success: true,
            dispute
        });

    } catch (error) {
        console.error('Get dispute by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add a message to a dispute
export const addMessage = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { content, messageType = 'message', attachments = [] } = req.body;
        const userId = req.user._id;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check authorization
        const isAuthorized = 
            dispute.complainant.equals(userId) ||
            dispute.respondent.equals(userId) ||
            (dispute.mediationData?.mediator && dispute.mediationData.mediator.equals(userId));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add messages to this dispute'
            });
        }

        // Add the message
        await dispute.addMessage(userId, content, messageType, attachments);

        // Add timeline entry
        await dispute.addTimelineEntry(
            `Message added`,
            userId,
            `${messageType === 'message' ? 'Message' : messageType} added to dispute`
        );

        // Populate and return updated dispute
        await dispute.populate([
            { path: 'complainant', select: 'firstName lastName email' },
            { path: 'respondent', select: 'firstName lastName email' },
            { path: 'messages.sender', select: 'firstName lastName email' }
        ]);

        res.json({
            success: true,
            message: 'Message added successfully',
            dispute
        });

    } catch (error) {
        console.error('Add message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Escalate a dispute to the next stage
export const escalateDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check authorization (only parties can escalate)
        const isAuthorized = 
            dispute.complainant.equals(userId) ||
            dispute.respondent.equals(userId);

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Only dispute parties can escalate a dispute'
            });
        }

        // Check if escalation is possible
        if (dispute.currentStage === 'legal') {
            return res.status(400).json({
                success: false,
                message: 'Dispute is already at the highest stage (legal)'
            });
        }

        // Perform escalation
        const escalated = dispute.escalate(reason, userId);
        if (!escalated) {
            return res.status(400).json({
                success: false,
                message: 'Unable to escalate dispute'
            });
        }

        await dispute.save();

        // Populate and return updated dispute
        await dispute.populate([
            { path: 'complainant', select: 'firstName lastName email' },
            { path: 'respondent', select: 'firstName lastName email' }
        ]);

        res.json({
            success: true,
            message: `Dispute escalated to ${dispute.currentStage} stage`,
            dispute
        });

    } catch (error) {
        console.error('Escalate dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Assign mediator to a dispute
export const assignMediator = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { mediatorId } = req.body;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check if dispute is in mediation stage
        if (dispute.currentStage !== 'mediation') {
            return res.status(400).json({
                success: false,
                message: 'Dispute must be in mediation stage to assign a mediator'
            });
        }

        // Check if mediator exists
        const mediator = await User.findById(mediatorId);
        if (!mediator) {
            return res.status(404).json({
                success: false,
                message: 'Mediator not found'
            });
        }

        // Assign mediator
        dispute.mediationData.mediator = mediatorId;
        await dispute.save();

        // Add timeline entry
        await dispute.addTimelineEntry(
            'Mediator assigned',
            req.user._id,
            `${mediator.firstName} ${mediator.lastName} assigned as mediator`
        );

        // Populate and return updated dispute
        await dispute.populate([
            { path: 'complainant', select: 'firstName lastName email' },
            { path: 'respondent', select: 'firstName lastName email' },
            { path: 'mediationData.mediator', select: 'firstName lastName email' }
        ]);

        res.json({
            success: true,
            message: 'Mediator assigned successfully',
            dispute
        });

    } catch (error) {
        console.error('Assign mediator error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Resolve a dispute
export const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { 
            resolutionType, 
            description, 
            terms, 
            compensationAmount, 
            compensationCurrency = 'INR' 
        } = req.body;
        const userId = req.user._id;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check authorization
        const isAuthorized = 
            dispute.complainant.equals(userId) ||
            dispute.respondent.equals(userId) ||
            (dispute.mediationData?.mediator && dispute.mediationData.mediator.equals(userId));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to resolve this dispute'
            });
        }

        // Update dispute resolution
        dispute.resolution = {
            type: resolutionType,
            description,
            terms,
            resolvedAt: new Date(),
            resolvedBy: userId
        };

        if (compensationAmount) {
            dispute.resolution.compensation = {
                amount: compensationAmount,
                currency: compensationCurrency
            };
        }

        dispute.status = 'resolved';

        // Update stage-specific resolution data
        switch (dispute.currentStage) {
            case 'peer-to-peer':
                dispute.peerToPeerData.isResolved = true;
                dispute.peerToPeerData.resolution = description;
                dispute.peerToPeerData.agreedTerms = terms;
                break;
            case 'mediation':
                dispute.mediationData.isResolved = true;
                dispute.mediationData.resolution = description;
                dispute.mediationData.agreement = terms;
                break;
            case 'legal':
                dispute.legalData.isResolved = true;
                dispute.legalData.verdict = description;
                break;
        }

        await dispute.save();

        // Add timeline entry
        await dispute.addTimelineEntry(
            'Dispute resolved',
            userId,
            `Dispute resolved via ${resolutionType} resolution`
        );

        // Populate and return updated dispute
        await dispute.populate([
            { path: 'complainant', select: 'firstName lastName email' },
            { path: 'respondent', select: 'firstName lastName email' },
            { path: 'resolution.resolvedBy', select: 'firstName lastName email' }
        ]);

        res.json({
            success: true,
            message: 'Dispute resolved successfully',
            dispute
        });

    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get dispute statistics
export const getDisputeStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's disputes
        const userDisputes = await Dispute.find({
            $or: [
                { complainant: userId },
                { respondent: userId }
            ]
        });

        const stats = {
            total: userDisputes.length,
            byStatus: {
                active: 0,
                resolved: 0,
                escalated: 0,
                closed: 0
            },
            byStage: {
                'peer-to-peer': 0,
                'mediation': 0,
                'legal': 0
            },
            asComplainant: userDisputes.filter(d => d.complainant.equals(userId)).length,
            asRespondent: userDisputes.filter(d => d.respondent.equals(userId)).length,
            averageResolutionTime: 0
        };

        // Calculate statistics
        let totalResolutionTime = 0;
        let resolvedCount = 0;

        userDisputes.forEach(dispute => {
            stats.byStatus[dispute.status]++;
            stats.byStage[dispute.currentStage]++;

            if (dispute.status === 'resolved' && dispute.resolution?.resolvedAt) {
                resolvedCount++;
                const resolutionTime = dispute.resolution.resolvedAt - dispute.createdAt;
                totalResolutionTime += resolutionTime;
            }
        });

        if (resolvedCount > 0) {
            stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60 * 24)); // in days
        }

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get dispute stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Submit evidence for a dispute
export const submitEvidence = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { title, description, files = [] } = req.body;
        const userId = req.user._id;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found'
            });
        }

        // Check authorization
        const isAuthorized = 
            dispute.complainant.equals(userId) ||
            dispute.respondent.equals(userId);

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit evidence for this dispute'
            });
        }

        // Add evidence
        dispute.evidence.push({
            submittedBy: userId,
            title,
            description,
            files,
            submittedAt: new Date()
        });

        await dispute.save();

        // Add timeline entry
        await dispute.addTimelineEntry(
            'Evidence submitted',
            userId,
            `Evidence "${title}" submitted`
        );

        res.json({
            success: true,
            message: 'Evidence submitted successfully',
            evidence: dispute.evidence[dispute.evidence.length - 1]
        });

    } catch (error) {
        console.error('Submit evidence error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
