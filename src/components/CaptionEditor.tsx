import React from 'react';
import {
  Type,
  Calendar,
  MapPin,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from 'lucide-react';
import { CaptionFont, CaptionSettings } from '../types';

interface Props {
  settings: CaptionSettings;
  onChange: (updated: CaptionSettings) => void;
}

const FONTS: { id: CaptionFont; name: string; sample: string; className: string }[] = [
  { id: 'handwriting', name: 'Pen Script', sample: 'Moments in bloom', className: 'font-handwriting text-base' },
  { id: 'vintage', name: 'Vintage Serif', sample: 'Moments in bloom', className: 'font-vintage text-sm' },
  { id: 'typewriter', name: 'Typewriter', sample: 'Moments in bloom', className: 'font-typewriter text-xs' },
  { id: 'script', name: 'Cursive Ink', sample: 'Moments in bloom', className: 'font-script text-xs' },
  { id: 'sans', name: 'Modern Sans', sample: 'Moments in bloom', className: 'font-sans text-xs' },
];

const TEXT_COLORS = [
  { label: 'Charcoal', hex: '#222629' },
  { label: 'Vintage Ink', hex: '#1e293b' },
  { label: 'Warm Sepia', hex: '#5c3a21' },
  { label: 'Antique Gold', hex: '#b89326' },
  { label: 'Paper White', hex: '#fbf8f1' },
];

export const CaptionEditor: React.FC<Props> = ({ settings, onChange }) => {
  const insertTodayDate = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
    onChange({ ...settings, showDate: true, dateText: formatted });
  };

  return (
    <div className="space-y-4 text-xs text-white/90">
      {/* Primary Caption Input */}
      <div className="space-y-1.5">
        <label className="font-bold text-[#fbf8f1] flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Primary Title / Caption</span>
        </label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => onChange({ ...settings, text: e.target.value })}
          placeholder="e.g. Memories in bloom..."
          maxLength={60}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1f18] border border-white/15 text-[#fbf8f1] placeholder:text-white/30 focus:border-[#d4af37] focus:outline-hidden text-sm"
        />
      </div>

      {/* Font Family Selection */}
      <div className="space-y-2">
        <label className="font-bold text-[#fbf8f1]">Caption Typography Style</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {FONTS.map((f) => {
            const isSelected = settings.font === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ ...settings, font: f.id })}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-[#d4af37] bg-[#1b3d30] ring-1 ring-[#d4af37]'
                    : 'border-white/10 bg-[#142e23] hover:border-white/20'
                }`}
              >
                <span className="text-[10px] text-white/50 mb-1">{f.name}</span>
                <span className={`${f.className} text-[#fbf8f1] truncate`}>
                  {f.sample}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alignment & Text Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Alignment */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#fbf8f1]">Text Alignment</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'left', icon: AlignLeft },
              { id: 'center', icon: AlignCenter },
              { id: 'right', icon: AlignRight },
            ].map((al) => {
              const Icon = al.icon;
              const isSelected = settings.align === al.id;
              return (
                <button
                  key={al.id}
                  onClick={() => onChange({ ...settings, align: al.id as 'left' | 'center' | 'right' })}
                  className={`py-2 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#d4af37] text-[#0e1f18] border-[#d4af37]'
                      : 'bg-[#142e23] border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#fbf8f1]">Ink Color</label>
          <div className="flex items-center gap-2">
            {TEXT_COLORS.map((col) => {
              const isSelected = settings.color === col.hex;
              return (
                <button
                  key={col.hex}
                  onClick={() => onChange({ ...settings, color: col.hex })}
                  style={{ backgroundColor: col.hex }}
                  className={`w-7 h-7 rounded-full border border-black/30 transition cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#d4af37] scale-110' : 'hover:scale-105'
                  }`}
                  title={col.label}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Date & Location Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Date Row */}
        <div className="p-3 rounded-2xl bg-[#142e23] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold flex items-center gap-1.5 text-[#fbf8f1]">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Date Stamp</span>
            </label>
            <button
              onClick={insertTodayDate}
              className="text-[10px] text-[#d4af37] hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showDate}
              onChange={(e) => onChange({ ...settings, showDate: e.target.checked })}
              className="accent-[#d4af37] cursor-pointer"
            />
            <input
              type="text"
              disabled={!settings.showDate}
              value={settings.dateText}
              onChange={(e) => onChange({ ...settings, dateText: e.target.value })}
              placeholder="e.g. OCTOBER 2026"
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0e1f18] border border-white/10 text-white disabled:opacity-40"
            />
          </div>
        </div>

        {/* Location Row */}
        <div className="p-3 rounded-2xl bg-[#142e23] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold flex items-center gap-1.5 text-[#fbf8f1]">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Location Subtitle</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showLocation}
              onChange={(e) => onChange({ ...settings, showLocation: e.target.checked })}
              className="accent-[#d4af37] cursor-pointer"
            />
            <input
              type="text"
              disabled={!settings.showLocation}
              value={settings.locationText}
              onChange={(e) => onChange({ ...settings, locationText: e.target.value })}
              placeholder="e.g. Venice Beach, CA"
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0e1f18] border border-white/10 text-white disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
