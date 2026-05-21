import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ standalone: false, templateUrl: 'update.component.html' })
export class UpdateComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    deleting = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        const account = this.accountService.accountValue!;
        this.form = this.formBuilder.group({
            title: [account.title, Validators.required],
            firstName: [account.firstName, Validators.required],
            lastName: [account.lastName, Validators.required],
            email: [account.email, [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validators: [MustMatch('password', 'confirmPassword')]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) return;
        this.loading = true;
        this.accountService.update(this.accountService.accountValue!.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Profile updated', { keepAfterRouteChange: true });
                    this.router.navigate(['/profile']);
                },
                error: err => {
                    this.error = err;
                    this.loading = false;
                }
            });
    }

    onDelete() {
        if (!confirm('Are you sure you want to delete your account?')) return;
        this.deleting = true;
        this.accountService.delete(this.accountService.accountValue!.id)
            .pipe(first())
            .subscribe(() => {
                this.alertService.success('Account deleted successfully');
            });
    }
}
