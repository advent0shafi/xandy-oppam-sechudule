import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>}
      <input 
        className={`border border-gray-300 rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all bg-white shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>}
      <textarea 
        className={`border border-gray-300 rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all bg-white shadow-sm min-h-[100px] resize-y ${className}`}
        {...props}
      />
    </div>
  );
};