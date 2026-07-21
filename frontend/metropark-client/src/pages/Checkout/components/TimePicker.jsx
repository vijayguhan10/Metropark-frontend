import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { formatTimeForInput, parseTimeInput } from '../utils/formatters';

const TimePicker = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  baseDate,
  placeholder = "HH:MM AM/PM",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (error) {
      // Clear error on change - parent will handle validation
    }
  };

  const handleFocus = () => {
    setShowPicker(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow picker clicks
    setTimeout(() => {
      setShowPicker(false);
      onBlur?.();
    }, 200);
  };

  const incrementHour = () => {
    const parsed = parseTimeInput(value, baseDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(parsed.getHours() + 1);
      onChange(formatTimeForInput(parsed));
    }
  };

  const decrementHour = () => {
    const parsed = parseTimeInput(value, baseDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(parsed.getHours() - 1);
      onChange(formatTimeForInput(parsed));
    }
  };

  const incrementMinute = () => {
    const parsed = parseTimeInput(value, baseDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setMinutes(parsed.getMinutes() + 15);
      onChange(formatTimeForInput(parsed));
    }
  };

  const decrementMinute = () => {
    const parsed = parseTimeInput(value, baseDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setMinutes(parsed.getMinutes() - 15);
      onChange(formatTimeForInput(parsed));
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-light flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-violet" />
        </div>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`input-luxury w-full py-3 text-lg font-mono tracking-wider ${
              error ? 'border-error focus:border-error focus:ring-error/20' : ''
            }`}
            placeholder={placeholder}
          />
          {error && (
            <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              {error}
            </p>
          )}
        </div>
      </div>
      
      {showPicker && !error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 shadow-lg z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={decrementHour}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                aria-label="Decrease hour"
              >
                <ChevronDown className="w-5 h-5 text-on-surface-variant" />
              </button>
              <span className="text-lg font-mono font-bold text-on-surface w-12 text-center">
                {value.split(':')[0]}
              </span>
              <button
                type="button"
                onClick={incrementHour}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                aria-label="Increase hour"
              >
                <ChevronUp className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <span className="text-lg font-mono font-bold text-on-surface">:</span>
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={decrementMinute}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                aria-label="Decrease minute"
              >
                <ChevronDown className="w-5 h-5 text-on-surface-variant" />
              </button>
              <span className="text-lg font-mono font-bold text-on-surface w-12 text-center">
                {value.split(':')[1]?.split(' ')[0] || '00'}
              </span>
              <button
                type="button"
                onClick={incrementMinute}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                aria-label="Increase minute"
              >
                <ChevronUp className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const parsed = parseTimeInput(value, baseDate);
                  if (!isNaN(parsed.getTime())) {
                    parsed.setHours(parsed.getHours() >= 12 ? parsed.getHours() - 12 : parsed.getHours() + 12);
                    onChange(formatTimeForInput(parsed));
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-label-sm font-medium transition-colors bg-violet-light text-violet hover:bg-violet/90"
              >
                {value.includes('AM') ? 'PM' : 'AM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;