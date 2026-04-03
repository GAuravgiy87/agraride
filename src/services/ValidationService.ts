/**
 * Validation Service - Strategy Pattern
 * Provides different validation strategies for forms and data
 */

interface ValidationRule {
  validate(value: any): { isValid: boolean; message?: string };
}

interface ValidationStrategy {
  validate(
    data: Record<string, any>,
  ): Record<string, { isValid: boolean; message?: string }>;
}

// Concrete validation rules
class RequiredRule implements ValidationRule {
  validate(value: any): { isValid: boolean; message?: string } {
    const isValid = value !== null && value !== undefined && value !== "";
    return {
      isValid,
      message: isValid ? undefined : "This field is required",
    };
  }
}

class EmailRule implements ValidationRule {
  validate(value: any): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = typeof value === "string" && emailRegex.test(value);
    return {
      isValid,
      message: isValid ? undefined : "Please enter a valid email address",
    };
  }
}

class PhoneRule implements ValidationRule {
  validate(value: any): { isValid: boolean; message?: string } {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const isValid =
      typeof value === "string" &&
      phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""));
    return {
      isValid,
      message: isValid ? undefined : "Please enter a valid phone number",
    };
  }
}

class MinLengthRule implements ValidationRule {
  constructor(private minLength: number) {}

  validate(value: any): { isValid: boolean; message?: string } {
    const isValid = typeof value === "string" && value.length >= this.minLength;
    return {
      isValid,
      message: isValid
        ? undefined
        : `Minimum ${this.minLength} characters required`,
    };
  }
}

class MaxLengthRule implements ValidationRule {
  constructor(private maxLength: number) {}

  validate(value: any): { isValid: boolean; message?: string } {
    const isValid = typeof value === "string" && value.length <= this.maxLength;
    return {
      isValid,
      message: isValid
        ? undefined
        : `Maximum ${this.maxLength} characters allowed`,
    };
  }
}

class NumericRule implements ValidationRule {
  validate(value: any): { isValid: boolean; message?: string } {
    const isValid = !isNaN(value) && !isNaN(parseFloat(value));
    return {
      isValid,
      message: isValid ? undefined : "Please enter a valid number",
    };
  }
}

class RangeRule implements ValidationRule {
  constructor(
    private min: number,
    private max: number,
  ) {}

  validate(value: any): { isValid: boolean; message?: string } {
    const num = parseFloat(value);
    const isValid = !isNaN(num) && num >= this.min && num <= this.max;
    return {
      isValid,
      message: isValid
        ? undefined
        : `Value must be between ${this.min} and ${this.max}`,
    };
  }
}

// Validation strategies
class UserRegistrationStrategy implements ValidationStrategy {
  private rules = {
    name: [new RequiredRule(), new MinLengthRule(2), new MaxLengthRule(50)],
    email: [new RequiredRule(), new EmailRule()],
    phone: [new RequiredRule(), new PhoneRule()],
    password: [new RequiredRule(), new MinLengthRule(8)],
  };

  validate(data: Record<string, any>) {
    const results: Record<string, { isValid: boolean; message?: string }> = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];
      for (const rule of rules) {
        const result = rule.validate(value);
        if (!result.isValid) {
          results[field] = result;
          break;
        }
      }
      if (!results[field]) {
        results[field] = { isValid: true };
      }
    }

    return results;
  }
}

class RideCreationStrategy implements ValidationStrategy {
  private rules = {
    origin: [new RequiredRule(), new MinLengthRule(3)],
    destination: [new RequiredRule(), new MinLengthRule(3)],
    departure_time: [new RequiredRule()],
    available_seats: [
      new RequiredRule(),
      new NumericRule(),
      new RangeRule(1, 8),
    ],
    price_per_seat: [
      new RequiredRule(),
      new NumericRule(),
      new RangeRule(10, 10000),
    ],
  };

  validate(data: Record<string, any>) {
    const results: Record<string, { isValid: boolean; message?: string }> = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];
      for (const rule of rules) {
        const result = rule.validate(value);
        if (!result.isValid) {
          results[field] = result;
          break;
        }
      }
      if (!results[field]) {
        results[field] = { isValid: true };
      }
    }

    return results;
  }
}

class BookingStrategy implements ValidationStrategy {
  private rules = {
    ride_id: [new RequiredRule(), new NumericRule()],
    seats_booked: [new RequiredRule(), new NumericRule(), new RangeRule(1, 4)],
  };

  validate(data: Record<string, any>) {
    const results: Record<string, { isValid: boolean; message?: string }> = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];
      for (const rule of rules) {
        const result = rule.validate(value);
        if (!result.isValid) {
          results[field] = result;
          break;
        }
      }
      if (!results[field]) {
        results[field] = { isValid: true };
      }
    }

    return results;
  }
}

// Main validation service
class ValidationService {
  private static instance: ValidationService;
  private strategies: Map<string, ValidationStrategy> = new Map();

  private constructor() {
    this.strategies.set("userRegistration", new UserRegistrationStrategy());
    this.strategies.set("rideCreation", new RideCreationStrategy());
    this.strategies.set("booking", new BookingStrategy());
  }

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  validate(
    strategyName: string,
    data: Record<string, any>,
  ): Record<string, { isValid: boolean; message?: string }> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Validation strategy '${strategyName}' not found`);
    }
    return strategy.validate(data);
  }

  isValid(
    validationResult: Record<string, { isValid: boolean; message?: string }>,
  ): boolean {
    return Object.values(validationResult).every((result) => result.isValid);
  }

  getFirstError(
    validationResult: Record<string, { isValid: boolean; message?: string }>,
  ): string | null {
    for (const result of Object.values(validationResult)) {
      if (!result.isValid && result.message) {
        return result.message;
      }
    }
    return null;
  }
}

export const validationService = ValidationService.getInstance();

// Export rule classes for custom validation
export {
  RequiredRule,
  EmailRule,
  PhoneRule,
  MinLengthRule,
  MaxLengthRule,
  NumericRule,
  RangeRule,
};
