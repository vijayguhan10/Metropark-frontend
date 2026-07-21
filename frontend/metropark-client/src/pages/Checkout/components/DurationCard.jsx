import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatTimeForInput, parseTimeInput } from '../utils/formatters';

const DurationCard = ({
  entryTime,
  exitTime,
  entryTimeInput,
  exitTimeInput,
  timeErrors,
  duration,
  totalAmount,
  onEntryTimeChange,
  onExitTimeChange,
  onQuickDuration,
  onEntryFocus,
  onEntryBlur,
  onExitFocus,
  onExitBlur,
}) => {
  return (
    <div className="luxury-card p-6">
      <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">DURATION</p>
      
      {/* Entry Time - Editable */}
      <div className="mb-4">
        <label className="block text-label-sm font-medium text-on-surface-variant mb-2">ENTRY TIME</label>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-light flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-violet" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={entryTimeInput}
                onChange={(e) => onEntryTimeChange(e.target.value)}
                onFocus={onEntryFocus}
                onBlur={onEntryBlur}
                className={`input-luxury w-full py-3 text-lg font-mono tracking-wider ${
                  timeErrors.entry ? 'border-error focus:border-error focus:ring-error/20' : ''
                }`}
                placeholder="HH:MM AM/PM"
              />
              {timeErrors.entry && (
                <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  {timeErrors.entry}
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 text-label-sm text-on-surface-variant">
          {formatDate(entryTime)}
        </p>
      </div>

      {/* Exit Time - Editable */}
      <div className="mb-4">
        <label className="block text-label-sm font-medium text-on-surface-variant mb-2">EXIT TIME</label>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-light flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-violet" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={exitTimeInput}
                onChange={(e) => onExitTimeChange(e.target.value)}
                onFocus={onExitFocus}
                onBlur={onExitBlur}
                className={`input-luxury w-full py-3 text-lg font-mono tracking-wider ${
                  timeErrors.exit ? 'border-error focus:border-error focus:ring-error/20' : ''
                }`}
                placeholder="HH:MM AM/PM"
              />
              {timeErrors.exit && (
                <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  {timeErrors.exit}
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 text-label-sm text-on-surface-variant">
          {formatDate(exitTime)}
        </p>
      </div>

      {/* Quick Duration Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 4, 8, 12, 24].map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => onQuickDuration(hours)}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all duration-200 ${
              duration === hours
                ? 'bg-violet text-on-violet shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {hours}h
          </button>
        ))}
      </div>

      {/* Duration Summary */}
      <div className="pt-3 border-t border-outline-variant/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-on-surface-variant" />
          <span className="text-label-md font-bold text-on-surface">{duration} Hours Total</span>
        </div>
        <span className="text-headline-sm font-bold text-violet">{totalAmount}</span>
      </div>
    </div>
  );
};

export default DurationCard;