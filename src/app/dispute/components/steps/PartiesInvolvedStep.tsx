'use client'

import { useState, useEffect } from 'react';
import { DisputeFormData, PartyInvolved } from '../../types/disputeTypes';
import { Check } from 'lucide-react';

interface PartiesInvolvedStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

interface SelectableParty extends PartyInvolved {
  selected?: boolean;
}

export default function PartiesInvolvedStep({ formData, onFormDataUpdate }: PartiesInvolvedStepProps) {
  const [activeTab, setActiveTab] = useState<'Speakers' | 'Participants'>('Participants');
  const [speakers, setSpeakers] = useState<SelectableParty[]>([]);
  const [participants, setParticipants] = useState<SelectableParty[]>([
    { name: 'John Smith', role: 'Marketing Manager', email: 'john@example.com', selected: false },
    { name: 'Sarah Johnson', role: 'Event Coordinator', email: 'sarah@example.com', selected: false },
    { name: 'Mike Chen', role: 'IT Department Head', email: 'mike@example.com', selected: false },
    { name: 'Lisa Wong', role: 'Finance Manager', email: 'lisa@example.com', selected: false },
  ]);

  // Helper: restore selections from formData
  const restoreSelections = (list: SelectableParty[]) => {
    return list.map(p => ({
      ...p,
      selected: formData.partiesInvolved?.some(f => f.email === p.email) || false,
    }));
  };

  // Fetch speakers for the selected event and restore selection
  useEffect(() => {
    if (!formData.eventId) return;

    const fetchSpeakers = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/events`);
        const data = await res.json();
        const selectedEvent =
          data.data.upcoming.find((e: any) => e._id === formData.eventId) ||
          data.data.past.find((e: any) => e._id === formData.eventId);

        if (selectedEvent) {
          const formattedSpeakers: SelectableParty[] = selectedEvent.speakers.map((s: any) => ({
            name: s.name || 'Unknown',
            role: 'Speaker',
            email: s.email || 'no-email@example.com',
            selected: false,
          }));

          setSpeakers(restoreSelections(formattedSpeakers));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSpeakers();
  }, [formData.eventId, formData.partiesInvolved]);

  // Restore participant selections when formData changes
  useEffect(() => {
    setParticipants(prev => restoreSelections(prev));
  }, [formData.partiesInvolved]);

  // Toggle selection for any party (speaker or participant)
  const toggleSelection = (party: SelectableParty, type: 'speakers' | 'participants') => {
    const list = type === 'speakers' ? speakers : participants;
    const updatedList = list.map(p => (p.email === party.email ? { ...p, selected: !p.selected } : p));

    type === 'speakers' ? setSpeakers(updatedList) : setParticipants(updatedList);

    // Update formData with all selected parties
    const combinedSelected = [...updatedList, ...(type === 'speakers' ? participants : speakers)]
      .filter(p => p.selected)
      .map(p => ({ name: p.name, role: p.role, email: p.email }));

    onFormDataUpdate({ partiesInvolved: combinedSelected });
  };

  const renderPartyList = () => {
    const list = activeTab === 'Speakers' ? speakers : participants;
    const type = activeTab === 'Speakers' ? 'speakers' : 'participants';

    return list.map(party => (
      <div
        key={party.email}
        onClick={() => toggleSelection(party, type)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          party.selected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{party.name}</h4>
            <p className="text-xs text-gray-500">{party.email}</p>
            <p className="text-xs text-gray-400">{party.role}</p>
          </div>
          <div
            className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors ${
              party.selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
            }`}
          >
            {party.selected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-orange-500 mb-2">Identify Parties Involved</h3>
        <p className="text-gray-600 mb-1">Select all Parties involved in this dispute</p>
        <p className="text-sm text-gray-500">Select individuals or entities that are part of this dispute</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-0 bg-gray-100 p-1 rounded-full">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'Speakers' ? 'text-white bg-orange-500' : 'text-gray-500 bg-transparent'
          }`}
          onClick={() => setActiveTab('Speakers')}
        >
          Speakers
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'Participants' ? 'text-white bg-orange-500' : 'text-gray-500 bg-transparent'
          }`}
          onClick={() => setActiveTab('Participants')}
        >
          Participants
        </button>
      </div>

      {/* Party List */}
      <div className="space-y-3">{renderPartyList()}</div>
    </div>
  );
}
