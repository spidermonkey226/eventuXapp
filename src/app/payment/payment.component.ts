import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PaymentService } from '../services/payment.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  form: FormGroup;
  successMsg = '';
  errorMsg = '';
  planId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private paymentService: PaymentService
  ) {
    this.form = this.fb.group({
      // We keep digits-only in cardNumber control. Input shows spaces; (input) handler syncs both.
      cardNumber: [
        '',
        [
          Validators.required,
          this.digitsOnlyValidator,
          this.exactLengthDigitsValidator(16),
          this.luhnValidator
        ]
      ],
      expiry: [
        '',
        [
          Validators.required,
          // MM/YY
          Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
          this.expiryNotPastValidator
        ]
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      name: ['', Validators.required]
    });
  }

  get fc() {
    return {
      cardNumber: this.form.get('cardNumber')!,
      expiry: this.form.get('expiry')!,
      cvv: this.form.get('cvv')!,
      name: this.form.get('name')!
    };
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.planId = +params['planId'];
    });
  }

  // ---------------- Validators ----------------

  private digitsOnlyValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v: string = (ctrl.value ?? '').toString();
    return /^\d*$/.test(v) ? null : { digitsOnly: true };
  }

  private exactLengthDigitsValidator = (n: number): ValidatorFn => {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const v: string = (ctrl.value ?? '').toString();
      return v.length === n ? null : { exact16: true };
    };
  };

  // Luhn check (basic card validity)
  private luhnValidator = (ctrl: AbstractControl): ValidationErrors | null => {
    const s = (ctrl.value ?? '').toString();
    if (s.length === 0) return null; // let required handle empty
    let sum = 0;
    let dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = s.charCodeAt(i) - 48;
      if (d < 0 || d > 9) return { luhn: true }; // should not happen due to digitsOnly
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0 ? null : { luhn: true };
  };

  // Expiry must not be in the past (end-of-month semantics)
  private expiryNotPastValidator = (ctrl: AbstractControl): ValidationErrors | null => {
    const v: string = (ctrl.value ?? '').toString(); // expect MM/YY
    const m = v.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return null; // pattern validator will handle format
    const mm = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    const fullYear = 2000 + yy;

    // last day of that month
    const lastDay = new Date(fullYear, mm, 0).getDate();
    const expDate = new Date(fullYear, mm - 1, lastDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expDate < today ? { expiryPast: true } : null;
  };

  // ---------------- Input formatters ----------------

  /** Format card input visually (groups of 4) but keep digits-only in the FormControl */
  onCardNumberInput(e: Event) {
    const input = e.target as HTMLInputElement;

    // Remove non-digits and clamp to 16
    let digits = input.value.replace(/\D/g, '').slice(0, 16);

    // Update the control with digits only (no spaces)
    if (this.fc.cardNumber.value !== digits) {
      this.fc.cardNumber.setValue(digits, { emitEvent: true }); // keep validators running
    }

    // Make a pretty, spaced version for the visible input
    const groups = digits.match(/.{1,4}/g) ?? [];
    const formatted = groups.join(' ');

    // Preserve caret as best as possible
    const prev = input.value;
    const caret = input.selectionStart ?? formatted.length;

    if (prev !== formatted) {
      input.value = formatted;
      const diff = formatted.length - prev.length;
      const newPos = Math.min(Math.max(0, (caret ?? 0) + diff), formatted.length);
      requestAnimationFrame(() => input.setSelectionRange(newPos, newPos));
    }
  }

  /** Auto-insert slash for MM/YY and clamp month */
  onExpiryInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let raw = input.value.replace(/[^\d]/g, '').slice(0, 4); // MMYY max

    if (raw.length >= 1 && raw[0] > '1') {
      // first digit can't be 2-9; prefix with 0 to keep intent (e.g., "9" -> "09")
      raw = '0' + raw[0] + raw.slice(1);
    }
    if (raw.length >= 2) {
      const mm = Math.min(parseInt(raw.slice(0, 2), 10) || 0, 12);
      raw = mm.toString().padStart(2, '0') + raw.slice(2);
    }

    const formatted = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;

    // write to control (this will run validators)
    if (this.fc.expiry.value !== formatted) {
      this.fc.expiry.setValue(formatted, { emitEvent: true });
    }

    // reflect in the input and put caret at end (simple reliable behavior)
    if (input.value !== formatted) {
      input.value = formatted;
      requestAnimationFrame(() => input.setSelectionRange(formatted.length, formatted.length));
    }
  }

  // ---------------- Submit ----------------

  pay(): void {
    // force show field errors if user tries to submit early
    this.form.markAllAsTouched();

    // Extra guard: card must be exactly 16 digits
    const digits = this.fc.cardNumber.value as string;
    if (digits.length !== 16) {
      this.errorMsg = 'Please enter a valid 16-digit card number.';
      return;
    }

    if (this.form.invalid || (!this.planId && this.planId !== 0)) {
      this.errorMsg = 'Please fix the highlighted fields.';
      return;
    }

    this.errorMsg = '';
    const payload = {
      planId: this.planId,
      cardNumber: digits,            // digits-only to backend
      expiry: this.fc.expiry.value,  // MM/YY
      cvv: this.fc.cvv.value,
      name: this.fc.name.value
    };

    this.paymentService.charge(payload).subscribe({
      next: () => {
        this.successMsg = 'Payment successful 🎉 Subscription activated.';
        this.errorMsg = '';
        this.userService.getMe().subscribe({ next: () => {}, error: () => {} });
      },
      error: (err) => {
        this.successMsg = '';
        this.errorMsg = err?.error?.message || 'Payment failed. Your subscription was not changed.';
      }
    });
  }
}
