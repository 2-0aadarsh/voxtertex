export interface EventFormData {
  // Core Details
  eventName: string
  startDate: string
  endDate: string
  eventMode: 'offline' | 'online' | 'hybrid'
  location: string
  
  // Branding & Content
  description: string
  image: File | null
  tags: string[]
  
  // Ticketing
  ticketTypes: Array<{
    name: string
    price: string
    quantity: string
  }>
  
  // Speakers
  speakers: Array<{
    name: string
    title: string
    bio: string
  }>
  
  // Add-ons
  addons: {
    featureOnHome: boolean
    includeInNewsletter: boolean
    socialMediaPromotion: boolean
  }
}

export interface Speaker {
  name: string
  title: string
  bio: string
  image?: string
}

export interface TicketType {
  name: string
  price: string
  quantity: string
}