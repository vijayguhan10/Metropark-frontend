import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Wallet as WalletIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { walletApi } from '../../../api';
import { formatCurrency } from '../utils/formatters';

const WalletModal = ({
  isOpen,
  onClose,
  userId,
  initialBalance = 0,
  onBalanceUpdate,
}) => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(initialBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBalance(initialBalance);
      setAmount('');
      setStatus(null);
      setAmountError('');
    }
  }, [isOpen, initialBalance]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (!value || isNaN(num) || num <= 0) {
      return 'Please enter a valid amount greater than 0.';
    }
    if (num > 1000000) {
      return 'Amount exceeds the maximum allowed limit.';
    }
    return '';
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setAmountError('');
      setStatus(null);
    }
  };

  const handleAddMoney = async () => {
    const err = validateAmount(amount);
    if (err) {
      setAmountError(err);
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setAmountError('');

    try {
      const response = await walletApi.addMoney({
        userId: String(userId),
        amount: parseFloat(amount),
      });

      const newBalance =
        response?.balance ??
        response?.walletBalance ??
        response?.amount ??
        balance + parseFloat(amount);

      setBalance(newBalance);
      if (onBalanceUpdate) onBalanceUpdate(newBalance);
      setStatus({ type: 'success', message: 'Money added to your wallet successfully!' });
      setAmount('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to add money. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        {/* Decorative top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet via-primary to-violet" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-light flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-violet" />
            </div>
            <div>
              <h2 id="wallet-modal-title" className="text-headline-md font-bold text-on-surface">
                Add Money to Wallet
              </h2>
              <p className="text-label-sm text-on-surface-variant">Top up your Metropark wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            aria-label="Close wallet modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Current balance */}
          <div className="rounded-2xl bg-gradient-to-br from-on-surface to-on-surface/90 p-5 text-white">
            <p className="text-label-sm text-white/60 mb-1">Current Wallet Balance</p>
            <p className="text-display-md font-bold tracking-tight">{formatCurrency(balance)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-label-sm text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-muted" />
              Available for parking payments
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="input-luxury-label">Amount to Add</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className={`input-luxury pl-9 text-lg font-semibold ${
                  amountError ? 'input-luxury-error' : ''
                }`}
                autoFocus
              />
            </div>
            {amountError && <p className="input-luxury-error-text">{amountError}</p>}
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setAmount(String(q));
                  setAmountError('');
                  setStatus(null);
                }}
                className={`px-4 py-2 rounded-xl text-label-md font-semibold border transition-all ${
                  parseFloat(amount) === q
                    ? 'bg-violet-light border-violet text-violet'
                    : 'bg-surface-container-low border-outline-variant/50 text-on-surface-variant hover:border-violet/40 hover:text-on-surface'
                }`}
              >
                ${q}
              </button>
            ))}
          </div>

          {/* Status feedback */}
          {status && (
            <div
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm border ${
                status.type === 'success'
                  ? 'bg-success-light border-success/30 text-success'
                  : 'bg-error-light border-error/30 text-error'
              }`}
              role="status"
            >
              {status.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleAddMoney}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-label-lg font-semibold rounded-xl bg-violet text-on-violet shadow-luxury hover:bg-violet-hover hover:shadow-luxury-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding Money...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Money</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-label-sm text-on-surface-variant">
            Your wallet balance updates instantly after a successful top-up.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WalletModal;
