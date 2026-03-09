'use client';

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

export type ProcessingType = 'import' | 'export' | 'download' | null;

export interface ProcessingState {
  isProcessing: boolean;
  type: ProcessingType;
  progress: number;
  message: string;
  fileName?: string;
  totalSteps?: number;
  currentStep?: number;
  operationId?: string; // Add unique operation ID
}

interface ProcessingContextValue {
  processingState: ProcessingState;
  startProcessing: (type: ProcessingType, fileName?: string, totalSteps?: number) => boolean;
  updateProgress: (progress: number, message?: string, currentStep?: number) => void;
  completeProcessing: (success: boolean, finalMessage?: string) => void;
  cancelProcessing: () => void;
  isProcessing: boolean;
}

const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined);

// Storage key for persistent operations
const STORAGE_KEY = 'processing_operation';

export const ProcessingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    type: null,
    progress: 0,
    message: '',
    fileName: undefined,
    totalSteps: undefined,
    currentStep: undefined,
    operationId: undefined,
  });

  // Load persistent operation state on mount
  useEffect(() => {
    const savedOperation = localStorage.getItem(STORAGE_KEY);
    if (savedOperation) {
      try {
        const operation = JSON.parse(savedOperation);
        // Check if operation is still valid (not too old)
        const operationAge = Date.now() - (operation.timestamp || 0);
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        if (operationAge < maxAge && operation.isProcessing) {
          console.log('🔄 Restoring persistent operation:', operation);
          setProcessingState({
            isProcessing: operation.isProcessing,
            type: operation.type,
            progress: operation.progress || 0,
            message: operation.message || 'Operation in progress...',
            fileName: operation.fileName,
            totalSteps: operation.totalSteps,
            currentStep: operation.currentStep,
            operationId: operation.operationId,
          });
        } else {
          // Clear expired operation
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading persistent operation:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save operation state to localStorage whenever it changes
  useEffect(() => {
    if (processingState.isProcessing) {
      const operationToSave = {
        ...processingState,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operationToSave));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [processingState]);

  const startProcessing = useCallback((type: ProcessingType, fileName?: string, totalSteps?: number) => {
    if (processingState.isProcessing) {
      console.warn(`Cannot start ${type} - another operation is already in progress`);
      return false;
    }

    const operationId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setProcessingState({
      isProcessing: true,
      type,
      progress: 0,
      message: `Starting ${type}...`,
      fileName,
      totalSteps,
      currentStep: 1,
      operationId,
    });
    return true;
  }, [processingState.isProcessing]);

  const updateProgress = useCallback((progress: number, message?: string, currentStep?: number) => {
    setProcessingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message,
      currentStep: currentStep || prev.currentStep,
    }));
  }, []);

  const completeProcessing = useCallback((success: boolean, finalMessage?: string) => {
    setProcessingState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 100,
      message: finalMessage || (success ? 'Operation completed successfully!' : 'Operation failed'),
    }));

    // Auto-reset after 3 seconds
    setTimeout(() => {
      setProcessingState({
        isProcessing: false,
        type: null,
        progress: 0,
        message: '',
        fileName: undefined,
        totalSteps: undefined,
        currentStep: undefined,
        operationId: undefined,
      });
    }, 3000);
  }, []);

  const cancelProcessing = useCallback(() => {
    setProcessingState({
      isProcessing: false,
      type: null,
      progress: 0,
      message: 'Operation cancelled',
      fileName: undefined,
      totalSteps: undefined,
      currentStep: undefined,
      operationId: undefined,
    });
  }, []);

  const value: ProcessingContextValue = {
    processingState,
    startProcessing,
    updateProgress,
    completeProcessing,
    cancelProcessing,
    isProcessing: processingState.isProcessing,
  };

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = (): ProcessingContextValue => {
  const ctx = useContext(ProcessingContext);
  if (!ctx) throw new Error('useProcessing must be used within ProcessingProvider');
  return ctx;
};
