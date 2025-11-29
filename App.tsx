
import React, { useState } from 'react';
import { Plus, Download, RotateCcw, Search, Calendar, Database } from 'lucide-react';
import { EventItem } from './types';
import { EventCard } from './components/EventCard';
import { EditModal } from './components/EditModal';
import { Button } from './components/Button';
import { useEvents } from './hooks/useEvents';
import { INITIAL_EVENTS } from './constants';

const App: React.FC = () => {
  const { events, loading, error, saveEvents } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null) return;

    const newEvents = [...events];
    const [movedItem] = newEvents.splice(draggingIndex, 1);
    newEvents.splice(dropIndex, 0, movedItem);
    
    saveEvents(newEvents);
    setDraggingIndex(null);
  };

  // Basic CRUD
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newEvents = [...events];
    [newEvents[index - 1], newEvents[index]] = [newEvents[index], newEvents[index - 1]];
    saveEvents(newEvents);
  };

  const handleMoveDown = (index: number) => {
    if (index === events.length - 1) return;
    const newEvents = [...events];
    [newEvents[index + 1], newEvents[index]] = [newEvents[index], newEvents[index + 1]];
    saveEvents(newEvents);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const newEvents = events.filter(e => e.id !== id);
      saveEvents(newEvents);
    }
  };

  const handleEdit = (event: EventItem) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleSave = (savedEvent: EventItem) => {
    let newEvents;
    if (editingEvent) {
      // Update existing
      newEvents = events.map(e => e.id === savedEvent.id ? savedEvent : e);
    } else {
      // Add new
      newEvents = [...events, savedEvent];
    }
    saveEvents(newEvents);
    setIsModalOpen(false);
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Start Time', 'Duration', 'Title', 'Description', 'Team Lead', 'Team Members', 'Logistics', 'Notes', 'Script', 'Category'];
    const csvContent = [
      headers.join(','),
      ...events.map(e => [
        `"${e.startTime}"`,
        `"${e.duration}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.teamLead.replace(/"/g, '""')}"`,
        `"${e.teamMembers.replace(/"/g, '""')}"`,
        `"${e.logistics.replace(/"/g, '""')}"`,
        `"${e.notes.replace(/"/g, '""')}"`,
        `"${(e.script || '').replace(/"/g, '""')}"`,
        `"${e.category}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'program_schedule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if(window.confirm('Reset to original sample data? All changes will be lost.')) {
        saveEvents(INITIAL_EVENTS);
    }
  }

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.teamLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                        <Calendar size={18} strokeWidth={3} />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight text-brand-dark hidden sm:block">EventPlanner</h1>
                </div>
                
                {/* Search Bar */}
                <div className="flex-1 max-w-md relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search events, people..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={handleReset} title="Reset Data" className="hidden sm:flex">
                        <RotateCcw size={18} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleExport} className="hidden sm:flex">
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                     <Button size="sm" variant="primary" onClick={handleAddNew} className="rounded-full w-10 h-10 p-0 sm:w-auto sm:h-auto sm:px-4 sm:py-2">
                        <Plus size={20} className="sm:mr-2" />
                        <span className="hidden sm:inline">Add Event</span>
                    </Button>
                </div>
            </div>
        </header>

        {/* Main List */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
            <div className="flex justify-between items-end pb-2">
                <h2 className="text-xl font-bold text-brand-dark">
                    Program Schedule
                </h2>
                <div className="text-sm font-medium text-gray-500">
                    {loading ? 'Loading...' : `${filteredEvents.length} events`}
                </div>
            </div>

            {/* Error or Supabase Warning */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                {error} - using local data.
              </div>
            )}

            <div className="space-y-4">
                {loading ? (
                   <div className="py-20 text-center text-gray-400">Loading schedule...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="text-gray-300 mb-4 flex justify-center"><Calendar size={48} /></div>
                        <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                        <p className="text-gray-500">Try adjusting your search or add a new event.</p>
                    </div>
                ) : (
                    filteredEvents.map((event, index) => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            index={index}
                            totalEvents={events.length}
                            onMoveUp={() => handleMoveUp(index)}
                            onMoveDown={() => handleMoveDown(index)}
                            onDelete={() => handleDelete(event.id)}
                            onEdit={() => handleEdit(event)}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragging={draggingIndex === index}
                        />
                    ))
                )}
            </div>
        </main>

        <EditModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSave} 
            event={editingEvent}
        />
    </div>
  );
};

export default App;
