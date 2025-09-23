// controllers/speakerManagementController.js
import Negotiation from '../models/negotiation.js';

const formatSpeakerData = (n) => {
  const lastAccepted = n.finalAgreement?.acceptedAt
    ? n.finalAgreement.acceptedAt
    : null;

  const lastDeclined = n.proposals.filter(p => p.status === 'declined').pop();
  const lastCountered = n.proposals.filter(p => p.status === 'countered').pop();

  return {
    negotiationId: n._id,
    conversationId: n.conversation,
    topic: n.topic,

    speakerId: n.speaker?._id,
    speakerName: n.speaker
      ? `${n.speaker.firstName} ${n.speaker.lastName}`
      : "Unknown",
    speakerEmail: n.speaker?.email,
    profileImage: n.speaker?.profileImage || {},

    event: n.event
      ? {
          id: n.event._id,
          name: n.event.name,
          date: n.event.date,
          location: n.event.location,
          isPast: n.event.date ? new Date(n.event.date) < new Date() : false,
          isFuture: n.event.date ? new Date(n.event.date) > new Date() : false,
          status: n.event.date
            ? new Date(n.event.date) > new Date()
              ? "future"
              : "past"
            : "unknown",
        }
      : null,

    currentAmount: n.currentProposal?.amount || null,
    currentCurrency: n.currentProposal?.currency || null,
    currentStatus: n.status,
    currentProposedAt: n.currentProposal?.proposedAt || null,

    lastAccepted,
    lastDeclined: lastDeclined
      ? { amount: lastDeclined.amount, time: lastDeclined.respondedAt }
      : null,
    lastCountered: lastCountered
      ? { amount: lastCountered.amount, time: lastCountered.respondedAt }
      : null,
  };
};

export const getSpeakersGrouped = async (req, res) => {
  try {
    // Fetch ALL negotiations, regardless of organizer or speaker
    const negotiations = await Negotiation.find({})
      .populate("speaker", "firstName lastName email profileImage")
      .populate("event");

    const confirmed = [];
    const declined = [];
    const inprogress = [];

    negotiations.forEach(negotiation => {
      const lastProposal = negotiation.proposals[negotiation.proposals.length - 1];

      const baseData = {
        negotiationId: negotiation._id,
        conversationId: negotiation.conversation,
        topic: negotiation.topic,
        speakerId: negotiation.speaker?._id,
        speakerName: negotiation.speaker
          ? `${negotiation.speaker.firstName} ${negotiation.speaker.lastName}`
          : "Unknown Speaker",
        speakerEmail: negotiation.speaker?.email || "N/A",
        profileImage: negotiation.speaker?.profileImage || {},
        event: negotiation.event
          ? {
              id: negotiation.event._id,
              isPast: false, // you can compute based on event date if available
              isFuture: false,
              status: negotiation.event.status || "unknown"
            }
          : null,
        currentAmount: negotiation.currentProposal?.amount || null,
        currentCurrency: negotiation.currentProposal?.currency || null,
        currentStatus: negotiation.currentProposal?.status || null,
        currentProposedAt: negotiation.currentProposal?.proposedAt || null,
        lastAccepted: lastProposal?.status === "accepted" ? lastProposal.respondedAt : null,
        lastDeclined: lastProposal?.status === "declined" ? lastProposal.respondedAt : null,
        lastCountered: lastProposal?.status === "countered" ? lastProposal.respondedAt : null
      };

      if (negotiation.finalAgreement?.amount && lastProposal?.status === "accepted") {
        confirmed.push(baseData);
      } else if (lastProposal?.status === "declined") {
        declined.push(baseData);
      } else {
        inprogress.push(baseData);
      }
    });

    return res.status(200).json({ confirmed, declined, inprogress });
  } catch (error) {
    console.error("Error fetching speaker management data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch speaker management data"
    });
  }
};

export const getSpeakersByStatus = async (req, res) => {
  try {
    // Example: filter speakers by status (confirmed/declined/inprogress)
    const { status } = req.query; // e.g., ?status=confirmed

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const result = await Negotiation.find({ "currentProposal.status": status })
      .populate("speaker", "firstName lastName email")
      .populate("event");

    return res.status(200).json({
      success: true,
      status,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error("Error fetching speakers by status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speakers by status"
    });
  }
};
