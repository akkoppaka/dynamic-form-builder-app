export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'radio';

export interface FormFieldConfig {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
