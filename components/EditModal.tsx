
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EventItem } from '../types';
import { Button } from './Button';
import { Input, TextArea } from './Input';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventItem) => void;
  event: EventItem | null; // null means creating new
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState<EventItem>({
    id: '',
    startTime: '',
    duration: '',
    title: '',
    description: '',
    teamLead: '',
    teamMembers: '',
    logistics: '',
    notes: '',
    script: '',
    category: 'general'
  });

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData(event);
      } else {
        // Reset for new entry
        setFormData({
            id: Date.now().toString(),
            startTime: '09:00',
            duration: '10 mns',
            title: '',
            description: '',
            teamLead: '',
            teamMembers: '',
            logistics: '',
            notes: '',
            script: '',
            category: 'general'
        });
      }
    }
  }, [isOpen, event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  // Logic to show script field
  const showScriptField = 
    formData.category === 'stage' || 
    formData.title.toLowerCase().includes('anchor') ||
    formData.teamLead.toLowerCase().includes('anchor');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-floating w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-brand-dark">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Input 
                label="Time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange} 
                placeholder="09:00"
            />
            <Input 
                label="Duration" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                placeholder="30 mins"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Category</label>
            <div className="relative">
                <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent bg-white shadow-sm"
                >
                    <option value="general">General</option>
                    <option value="stage">Stage / Program</option>
                    <option value="food">Food / Break</option>
                    <option value="registration">Registration</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>

          <Input 
            label="Event Title" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Main Keynote"
            autoFocus
          />

          <TextArea 
            label="Description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Detailed description of the event..."
          />
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Responsibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Team Lead (In Charge)" 
                    name="teamLead" 
                    value={formData.teamLead} 
                    onChange={handleChange} 
                    placeholder="Primary Leader"
                />
                <Input 
                    label="Team Members / Delegates" 
                    name="teamMembers" 
                    value={formData.teamMembers} 
                    onChange={handleChange} 
                    placeholder="Member 1, Member 2..."
                />
            </div>
          </div>

          <Input 
             label="Logistics / Props" 
             name="logistics" 
             value={formData.logistics} 
             onChange={handleChange} 
             placeholder="Mics, Gifts, Chairs..."
          />
          
          {showScriptField && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <TextArea 
                    label="Anchor Script" 
                    name="script" 
                    value={formData.script || ''} 
                    onChange={handleChange} 
                    placeholder="Enter the speech script for the anchor..."
                    className="font-serif text-lg bg-indigo-50/50 border-indigo-100 focus:ring-indigo-200"
                    rows={4}
                />
            </div>
          )}

           <TextArea 
            label="Internal Notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            placeholder="Hidden notes for staff..."
            rows={2}
          />
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit} className="px-8">
                Save
            </Button>
          </div>
      </div>
    </div>
  );
};
