'use client';
import { useEffect, useState } from 'react';
import { DisputeFormData } from '../../types/disputeTypes';

interface EventSelectionStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

export default function EventSelectionStep({ formData, onFormDataUpdate }: EventSelectionStepProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/events');
        const data = await res.json();
        const allEvents = [...(data.data.upcoming || []), ...(data.data.past || [])];
        setEvents(allEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = (event: any) => {
    onFormDataUpdate({ eventName: event.topic, eventId: event._id, eventDate: event.eventDate, });
  };

  if (loading) return <p>Loading events...</p>;
  if (events.length === 0) return <p>No events available.</p>;

  return (
    <div className="space-y-6">
      {events.map(event => (
        <div key={event._id} onClick={() => handleSelectEvent(event)} className={`p-4 border rounded-lg cursor-pointer ${formData.eventId === event._id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
          <h4 className="font-medium text-gray-900">{event.topic}</h4>
          <p className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
