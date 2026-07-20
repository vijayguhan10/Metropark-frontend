import { useState, useCallback, useEffect } from 'react';
import { parseTimeInput, formatTimeForInput } from '../utils/formatters';

export const useTimeValidation = (initialEntryTime, initialExitTime) => {
  const [entryTime, setEntryTime] = useState(initialEntryTime);
  const [exitTime, setExitTime] = useState(initialExitTime);
  const [entryTimeInput, setEntryTimeInput] = useState(() => formatTimeForInput(initialEntryTime));
  const [exitTimeInput, setExitTimeInput] = useState(() => formatTimeForInput(initialExitTime));
  const [timeErrors, setTimeErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState({ entry: false, exit: false });

  // Validate time inputs - returns validation result without side effects
  const validateTimes = useCallback(() => {
    const errors = {};
    const now = new Date();
    now.setSeconds(0, 0);
    
    const entry = parseTimeInput(entryTimeInput, entryTime);
    const exit = parseTimeInput(exitTimeInput, exitTime);
    
    if (entry < now) {
      errors.entry = 'Entry time cannot be in the past';
    }
    
    if (exit <= entry) {
      errors.exit = 'Exit time must be after entry time';
    }
    
    const maxHours = 24;
    const diffHours = (exit - entry) / (1000 * 60 * 60);
    if (diffHours > maxHours) {
      errors.exit = `Maximum parking duration is ${maxHours} hours`;
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [entryTimeInput, exitTimeInput, entryTime, exitTime]);

  // Validate times and update errors state (called from event handlers)
  const validateAndSetErrors = useCallback(() => {
    const { isValid, errors } = validateTimes();
    setTimeErrors(errors);
    return isValid;
  }, [validateTimes]);

  // Handle time input changes
  const handleEntryTimeChange = (value) => {
    setEntryTimeInput(value);
    const parsed = parseTimeInput(value, entryTime);
    if (!isNaN(parsed.getTime())) {
      setEntryTime(parsed);
    }
    if (timeErrors.entry) {
      setTimeErrors(prev => ({ ...prev, entry: null }));
    }
  };

  const handleExitTimeChange = (value) => {
    setExitTimeInput(value);
    const parsed = parseTimeInput(value, exitTime);
    if (!isNaN(parsed.getTime())) {
      setExitTime(parsed);
    }
    if (timeErrors.exit) {
      setTimeErrors(prev => ({ ...prev, exit: null }));
    }
  };

  // Quick duration buttons
  const setQuickDuration = (hours) => {
    const newExit = new Date(entryTime.getTime() + hours * 60 * 60 * 1000);
    setExitTime(newExit);
    setExitTimeInput(formatTimeForInput(newExit));
  };

  return {
    entryTime,
    exitTime,
    entryTimeInput,
    exitTimeInput,
    timeErrors,
    showTimePicker,
    setShowTimePicker,
    validateTimes,
    validateAndSetErrors,
    handleEntryTimeChange,
    handleExitTimeChange,
    setQuickDuration,
  };
};