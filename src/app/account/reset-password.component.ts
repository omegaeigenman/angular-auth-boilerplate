import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

enum TokenStatus {
    Validating = 'Validating',
    Valid = 'Valid',
    Invalid = 'Invalid'
}

@Component({ standalone: false, templateUrl: 'reset-password.component.html' })
export class ResetPasswordComponent implements OnInit {
    TokenStatus = TokenStatus;
    tokenStatus = TokenStatus.Validating;
    token!: string;
    form!: FormGroup;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {}

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];

        this.form = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validators: [MustMatch('password', 'confirmPassword')]
        });

        if (!this.token) {
            this.tokenStatus = TokenStatus.Invalid;
            return;
        }

        this.accountService.validateResetToken(this.token)
            .pipe(first())
            .subscribe({
                next: () => this.setStatus(TokenStatus.Valid),
                error: () => this.setStatus(TokenStatus.Invalid)
            });
    }

    // Forces Angular to detect the state change, no matter what zone/CD setup is in play.
    private setStatus(status: TokenStatus) {
        this.ngZone.run(() => {
            this.tokenStatus = status;
            this.cdr.detectChanges();
            setTimeout(() => this.cdr.detectChanges(), 0);
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) return;
        this.loading = true;
        this.accountService.resetPassword(this.token, this.f['password'].value, this.f['confirmPassword'].value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['/account/login']);
                },
                error: err => {
                    this.error = err;
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
    }
}