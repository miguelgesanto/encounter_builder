export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateHP = (value: string, maxHP?: number): ValidationResult => {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'HP must be a number' };
  }

  if (num < 0) {
    return { isValid: false, error: 'HP cannot be negative' };
  }

  if (num > 999) {
    return { isValid: false, error: 'HP cannot exceed 999' };
  }

  if (maxHP && num > maxHP * 2) {
    return { isValid: false, error: 'HP too high for this creature' };
  }

  return { isValid: true };
};

export const validateAC = (value: string): ValidationResult => {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'AC must be a number' };
  }

  if (num < 1 || num > 30) {
    return { isValid: false, error: 'AC must be between 1 and 30' };
  }

  return { isValid: true };
};

export const validateInitiative = (value: string): ValidationResult => {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Initiative must be a number' };
  }

  if (num < -10 || num > 50) {
    return { isValid: false, error: 'Initiative must be between -10 and 50' };
  }

  return { isValid: true };
};

export const validateName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (value.length > 50) {
    return { isValid: false, error: 'Name must be 50 characters or less' };
  }

  return { isValid: true };
};