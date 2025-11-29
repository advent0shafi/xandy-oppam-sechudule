
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Edit3, GripVertical, User, Users, Package, StickyNote, ScrollText, ChevronRight } from 'lucide-react';
import { EventItem, CATEGORY_STYLES } from '../types';

interface EventCardProps {
  event: EventItem;
  index: number;
  totalEvents: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  isDragging: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
  totalEvents,
  onMoveUp,
  onMoveDown,
  onDelete,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) => {
  const [showScript, setShowScript] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`
        group relative flex flex-col sm:flex-row gap-5
        bg-white rounded-2xl p-5
        transition-all duration-300 ease-out
        border border-transparent
        ${isDragging 
          ? 'opacity-40 scale-95 shadow-none' 
          : 'opacity-100 shadow-card hover:shadow-card-hover hover:border-gray-200'
        }
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-gray-600 hidden sm:block z-10">
        <GripVertical size={20} />
      </div>

      {/* Time Column */}
      <div className="flex sm:flex-col items-start sm:items-center sm:justify-center gap-2 sm:w-24 shrink-0 sm:border-r border-gray-100 sm:pr-4 sm:ml-6">
        <div className="text-xl font-bold text-brand-dark tracking-tight">{event.startTime}</div>
        {event.duration && (
            <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">
                {event.duration}
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${CATEGORY_STYLES[event.category]}`}>
                  {event.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
              </div>
              <h3 className="font-semibold text-lg text-brand-dark leading-tight">{event.title}</h3>
            </div>
            
             {/* Mobile Actions */}
             <div className="flex sm:hidden gap-1">
                <button onClick={onEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Edit3 size={16}/></button>
                <button onClick={onDelete} className="p-2 text-brand-primary hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
            </div>
        </div>
        
        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
        )}

        {/* Details Grid */}
        <div className="flex flex-wrap gap-3 mt-1">
            {/* Team Lead */}
            {event.teamLead && (
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200" title="Team Lead / Person in Charge">
                    <User size={14} className="text-brand-dark" />
                    {event.teamLead}
                </div>
            )}
            
            {/* Team Members */}
            {event.teamMembers && (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 border-dashed" title="Team Members / Delegates">
                    <Users size={14} className="text-gray-400" />
                    {event.teamMembers}
                </div>
            )}

            {/* Logistics */}
            {event.logistics && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <Package size={14} className="text-gray-400" />
                    {event.logistics}
                </div>
            )}
            
             {/* Notes */}
             {event.notes && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                    <StickyNote size={14} className="text-amber-500" />
                    {event.notes}
                </div>
            )}

             {/* Script Toggle */}
             {event.script && (
                <button 
                  onClick={() => setShowScript(!showScript)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${showScript ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
                >
                    <ScrollText size={14} />
                    Anchor Script
                    <ChevronRight size={14} className={`transition-transform duration-200 ${showScript ? 'rotate-90' : ''}`} />
                </button>
            )}
        </div>

        {/* Script Content */}
        {showScript && event.script && (
             <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-serif text-slate-800 leading-relaxed italic relative">
                 <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full uppercase tracking-wider">Script</div>
                 "{event.script}"
             </div>
        )}
      </div>

      {/* Desktop Actions (Right Side) */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-2 pl-2 border-l border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="flex flex-col gap-1">
            <button 
                onClick={onMoveUp} 
                disabled={index === 0}
                className="p-1.5 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full disabled:opacity-20 transition-colors"
            >
                <ChevronUp size={18} />
            </button>
            <button 
                onClick={onMoveDown}
                disabled={index === totalEvents - 1}
                className="p-1.5 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full disabled:opacity-20 transition-colors"
            >
                <ChevronDown size={18} />
            </button>
        </div>
        <div className="w-8 h-px bg-gray-100 my-1"></div>
        <div className="flex flex-col gap-1">
            <button 
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-brand-secondary hover:bg-teal-50 rounded-full transition-colors"
              title="Edit"
            >
                <Edit3 size={16} />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-brand-primary hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
