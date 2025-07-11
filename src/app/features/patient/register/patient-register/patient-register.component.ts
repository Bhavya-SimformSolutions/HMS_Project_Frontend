import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../../core/services/patient.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-patient-register',
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
})
export class PatientRegisterComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  registrationForm: FormGroup;
  isSubmitting = false;
  fieldErrors: { [key: string]: string } = {};
  errorMessage: string = '';
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  private readonly dashboardRoute = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.registrationForm = this.fb.group({
      first_name: [{ value: '', disabled: true }, Validators.required],
      last_name: [{ value: '', disabled: true }, Validators.required],
      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      marital_status: ['', Validators.required],
      address: ['', Validators.required],
      emergency_contact_name: ['', Validators.required],
      emergency_contact_number: ['', [Validators.required, Validators.minLength(10)]],
      relation: ['', Validators.required],
      blood_group: [''],
      allergies: [''],
      medical_conditions: [''],
      medical_history: [''],
      insurance_provider: [''],
      insurance_number: [''],
      privacy_consent: [false, Validators.requiredTrue],
      service_consent: [false, Validators.requiredTrue],
      medical_consent: [false, Validators.requiredTrue],
      img: [''],
      colorCode: [''],
    });
  }

  ngOnInit(): void {
    this.checkAccess();
    this.checkRegistrationStatus();
    // Prefill and disable first_name, last_name, email from AuthService if present
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.firstName) {
        this.registrationForm.patchValue({ first_name: user.firstName });
        this.registrationForm.get('first_name')?.disable();
      } else {
        this.registrationForm.get('first_name')?.enable(); // allow entry if missing
      }
      if (user.lastName) {
        this.registrationForm.patchValue({ last_name: user.lastName });
        this.registrationForm.get('last_name')?.disable();
      } else {
        this.registrationForm.get('last_name')?.enable(); // allow entry if missing
      }
      if (user.email) {
        this.registrationForm.patchValue({ email: user.email });
        this.registrationForm.get('email')?.disable();
      }
    }
  }

  isFieldDisabled(field: string): boolean {
    return this.registrationForm.get(field)?.disabled ?? false;
  }

  /**
   * Checks if the user has access to this page.
   */
  private checkAccess(): void {
    if (this.authService.getRole() !== 'PATIENT') {
      this.toastr.error('Access denied. This page is only for patients.');
      this.router.navigate([this.dashboardRoute]);
    }
    }

  /**
   * Checks if the user has already registered as a patient.
   */
  private checkRegistrationStatus(): void {
    this.patientService.checkPatientRegistration().subscribe({
      next: (isRegistered) => {
        if (isRegistered) {
          this.toastr.info('You have already registered as a patient');
          this.router.navigate([this.dashboardRoute]);
        }
      },
      error: (error) => {
        console.error('Error checking patient registration:', error);
        this.toastr.error('Unable to check registration status. Please try again later.');
      },
    });
  }

  /**
   * Handles the form submission.
   */
  onSubmit(): void {
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';

    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.registrationForm.getRawValue(); // FIX: include disabled fields
      delete formData.img;

      this.patientService.registerPatient(formData, this.selectedImageFile || undefined).subscribe({
        next: () => this.handleRegistrationSuccess(),
        error: (error) => this.handleRegistrationError(error),
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Marks all form fields as touched to trigger validation messages.
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Handles successful registration.
   */
  private handleRegistrationSuccess(): void {
          this.isSubmitting = false;
          this.toastr.success('Patient registration successful!', 'Welcome to VitalCare HMS');
    this.router.navigate([this.dashboardRoute]);
  }

  /**
   * Handles registration errors.
   * 
   * @param error - The error object.
   */
  private handleRegistrationError(error: any): void {
          this.isSubmitting = false;

          if (error.error?.errors) {
            error.error.errors.forEach((err: any) => {
              if (err.field) {
                this.fieldErrors[err.field] = err.message;
              } else {
                this.errorMessage = err.message;
              }
            });
          } else {
            this.errorMessage = error.error?.message || 'An error occurred during registration';
          }
          this.toastr.error(this.errorMessage || 'Registration failed');
        }

  /**
   * Triggers the file input click event.
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles file selection and validates the image file.
   * 
   * @param event - The file input change event.
   */
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!this.isValidImage(file)) {
        return;
      }

      this.selectedImageFile = file;
      this.createImagePreview(file);
    }
  }

  /**
   * Validates the selected image file.
   * 
   * @param file - The selected file.
   * @returns `true` if the file is valid, `false` otherwise.
   */
  private isValidImage(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select an image file');
      return false;
    }

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should not exceed 5MB');
      return false;
    }

    return true;
      }

  /**
   * Creates a preview of the selected image file.
   * 
   * @param file - The selected file.
   */
  private createImagePreview(file: File): void {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

  hasError(controlName: string): boolean {
    const control = this.registrationForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);

    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${controlName} must be at least ${minLength} characters long`;
    }

    if (control?.hasError('email')) {
      return `Please enter a valid email address`;
    }

    return '';
  }
}