import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ standalone: false, templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    isAddMode!: boolean;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        const passwordValidators = [Validators.minLength(6)];
        if (this.isAddMode) passwordValidators.push(Validators.required);

        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['User', Validators.required],
            password: ['', passwordValidators],
            confirmPassword: ['']
        }, {
            validators: [MustMatch('password', 'confirmPassword')]
        });

        if (!this.isAddMode) {
            this.accountService.getById(this.id!)
                .pipe(first())
                .subscribe(account => this.form.patchValue(account));
        }
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();
        if (this.form.invalid) return;
        this.loading = true;
        if (this.isAddMode) {
            this.createAccount();
        } else {
            this.updateAccount();
        }
    }

    private createAccount() {
        this.accountService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account created', { keepAfterRouteChange: true });
                    this.router.navigate(['/admin/accounts']);
                },
                error: err => {
                    this.error = err;
                    this.loading = false;
                }
            });
    }

    private updateAccount() {
        this.accountService.update(this.id!, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account updated', { keepAfterRouteChange: true });
                    this.router.navigate(['/admin/accounts']);
                },
                error: err => {
                    this.error = err;
                    this.loading = false;
                }
            });
    }
}
