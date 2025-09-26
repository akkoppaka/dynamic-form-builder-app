import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { MatButton } from '@angular/material/button';

type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'radio';

interface FormField {
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

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
})
export class FormBuilderComponent implements OnInit {
  fieldTypes: FieldType[] = ['text', 'textarea', 'select', 'checkbox', 'date', 'radio'];

  formFields: FormField[] = [];

  form: FormGroup;

  selectedFieldIndex: number | null = null;
  editForm: FormGroup | null = null;

  submittedData: any = null;
  submitError: string | null = null;
  submitting = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private _snackBar: MatSnackBar, private authService: AuthService) {
    this.form = this.fb.group({
      fields: this.fb.array([]),
    });
  }

  ngOnInit() { }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.formFields, event.previousIndex, event.currentIndex);
      const controls = this.fields.controls;
      const ctrl = controls.splice(event.previousIndex, 1)[0];
      controls.splice(event.currentIndex, 0, ctrl);
      this.fields.updateValueAndValidity();
    } else {
      const type = event.previousContainer.data[event.previousIndex] as FieldType;
      const newField: FormField = {
        id: `field_${Date.now()}`,
        type,
        label: this.capitalize(type),
        required: false,
      };
      if (['select', 'checkbox', 'radio'].includes(type)) {
        newField.options = ['Option 1', 'Option 2'];
      }
      this.formFields.splice(event.currentIndex, 0, newField);
      this.fields.insert(event.currentIndex, this.createFormControl(newField));
    }
  }

  createFormControl(field: FormField): FormGroup {
    const validators = [];
    if (field.required) validators.push(Validators.required);
    if (field.minLength) validators.push(Validators.minLength(field.minLength));
    if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
    if (field.pattern) validators.push(Validators.pattern(field.pattern));

    return this.fb.group({
      id: [field.id],
      type: [field.type],
      label: [field.label, Validators.required],
      required: [field.required],
      helpText: [field.helpText || ''],
      options: [field.options || []],
      minLength: [field.minLength || null],
      maxLength: [field.maxLength || null],
      pattern: [field.pattern || ''],
      value: ['', validators],
    });
  }

  selectField(index: number) {
    this.selectedFieldIndex = index;
    const selectedFG = this.fields.at(index);
    if (!selectedFG) {
      console.error('Invalid field index:', index);
      return;
    }
    this.editForm = this.fb.group({
      id: [selectedFG.get('id')?.value],
      type: [selectedFG.get('type')?.value],
      label: [selectedFG.get('label')?.value, Validators.required],
      required: [selectedFG.get('required')?.value],
      helpText: [selectedFG.get('helpText')?.value || ''],
      options: [selectedFG.get('options')?.value || []],
      minLength: [selectedFG.get('minLength')?.value || null],
      maxLength: [selectedFG.get('maxLength')?.value || null],
      pattern: [selectedFG.get('pattern')?.value || ''],
      value: [selectedFG.get('value')?.value || ''],
    });
  }

  deleteField(index: number) {
    this.formFields.splice(index, 1);
    this.fields.removeAt(index);

    if (this.selectedFieldIndex === index) {
      this.selectedFieldIndex = null;
      this.editForm = null;
    } else if (this.selectedFieldIndex && this.selectedFieldIndex > index) {
      this.selectedFieldIndex--; // adjust selected index after deletion
    }
  }


  onSave() {
    if (this.selectedFieldIndex === null || !this.editForm) return;
    const fg = this.fields.at(this.selectedFieldIndex);
    const index = this.selectedFieldIndex;

    this.formFields[index] = {
      ...this.formFields[index],
      ...this.editForm.value,
    };

    fg.patchValue(this.editForm.value);

    const validators = [];
    if (this.editForm.value.required) validators.push(Validators.required);
    if (this.editForm.value.minLength) validators.push(Validators.minLength(this.editForm.value.minLength));
    if (this.editForm.value.maxLength) validators.push(Validators.maxLength(this.editForm.value.maxLength));
    if (this.editForm.value.pattern) validators.push(Validators.pattern(this.editForm.value.pattern));

    const valueCtrl = fg.get('value');
    if (valueCtrl) {
      valueCtrl.setValidators(validators);
      valueCtrl.updateValueAndValidity();
    }

    this.selectedFieldIndex = null;
    this.editForm = null;
  }

  cancelEdit() {
    this.selectedFieldIndex = null;
    this.editForm = null;
  }

  updateOptions(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const options = input.value.split(',').map(opt => opt.trim()).filter(opt => opt);
    if (this.editForm) {
      this.editForm.patchValue({ options });
    }
  }

  capitalize(text: string): string {
    return text[0].toUpperCase() + text.slice(1);
  }

  checkedValues: { [key: number]: Set<string> } = {};

  onCheckboxChange(event: any, index: number) {
    if (!this.checkedValues[index]) this.checkedValues[index] = new Set<string>();

    if (event.target.checked) {
      this.checkedValues[index].add(event.target.value);
    } else {
      this.checkedValues[index].delete(event.target.value);
    }

    this.fields.at(index).patchValue({ value: Array.from(this.checkedValues[index]) });
  }

  isChecked(index: number, value: string): boolean {
    return this.checkedValues[index]?.has(value);
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this._snackBar.open('Please fix validation errors before submitting.', 'Close', { duration: 3000 });
      return;
    }
    if (!this.fields.length) {
      this._snackBar.open('No fields to submit.', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    this.submitError = null;
    this.submittedData = null;

    // Map form controls to payload objects
    const payload = this.fields.controls.map(ctrl => {
      const type = ctrl.get('type')?.value;
      let value = ctrl.get('value')?.value;

      // For checkboxes which store an array of selected values, convert to comma-separated string for display
      if (type === 'checkbox' && Array.isArray(value)) {
        value = value.join(', ');
      }

      // For radio/select, ensure value is string
      if (['select', 'radio'].includes(type) && value && typeof value !== 'string') {
        value = String(value);
      }

      return {
        label: ctrl.get('label')?.value,
        value,
      };
    });

    this.http.post('https://jsonplaceholder.typicode.com/posts', payload).subscribe({
      next: (response: any) => {
        this.submittedData = payload; // Assign payload to show submitted label:value, not raw response
        this._snackBar.open('Form submitted successfully!', 'Close', { duration: 3000 });
        this.submitting = false;
      },
      error: err => {
        this.submitError = 'Submission failed: ' + err.message;
        this._snackBar.open(this.submitError, 'Close', { duration: 3000 });
        this.submitting = false;
      },
    });

    console.log(this.submittedData);
  }

}
