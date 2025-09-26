// disputeType.ts

// ---- Enums for fixed values ----
export enum DisputeStage {
  PeerToPeer = 'Peer to peer',
  Mediation = 'Mediation',
  Legal = 'Legal',
  Resolved = 'Resolved',
}

export enum DisputeStatus {
  Active = 'Active',
  Resolved = 'Resolved',
  Escalated = 'Escalated',
}

export enum UrgencyLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// ---- Reusable Interfaces ----
export interface PartyInvolved {
  name: string
  role: string
  email?: string
  phone?: string;
  userId?: string | null 
}

export interface FileAttachment {
  file: File
  description?: string
}

// ---- Main Form Data ----
export interface DisputeFormData {
  // Core Details
  eventName: string
  eventId?: string
   eventDate?: string;
  disputeReason: string
  disputeTitle?: string 
  amount: number 
  category?: string
  description: string

  // Branding & Content
  evidence: FileAttachment | null
  attachments: FileAttachment[]

  // Parties Involved
  partiesInvolved: PartyInvolved[]

  // Additional Details
  preferredResolution?: string
  urgencyLevel: UrgencyLevel

  // Add-ons
  addons: {
    requestMediation: boolean
    escalateToLegal: boolean
    notifyAllParties: boolean
  }

  // --- New fields for Description & Evidence step ---
  detailedDescription?: string
  requestedResolution?: string
  supportingDocument?: File | null
  preferredContact?: 'Email Only' | 'Phone Only' | 'Both email and phone'
}
 
// ---- Dispute Record ----
export interface Dispute {
  id: string
  eventName: string
  disputeReason: string
  partiesInvolved: string      
  currentStage: DisputeStage
  status: DisputeStatus
  amount: number
  dateFiled: Date
  managedBy?: string
}

// ---- Evidence Detail ----
export interface Evidence {
  type: string
  file: File
  description: string
}
