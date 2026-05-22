import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, timeout } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'forgot-password.component.html' })
export class ForgotPasswordComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        this.error = '';
        if (this.form.invalid) return;

        this.alertService.info('Please check your email for password reset instructions');
        this.loading = false;

        this.accountService.forgotPassword(this.f['email'].value)
            .pipe(first(), timeout(5000))
            .subscribe({
                next: () => {},
                error: () => {}
            });
    }
}
