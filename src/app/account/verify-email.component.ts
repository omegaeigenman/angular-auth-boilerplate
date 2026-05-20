import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'verify-email.component.html' })
export class VerifyEmailComponent implements OnInit {
    verifying = true;
    verifyFailed = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        const token = this.route.snapshot.queryParams['token'];
        if (!token) {
            this.router.navigate(['/account/login']);
            return;
        }
        this.accountService.verifyEmail(token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['/account/login']);
                },
                error: () => {
                    this.verifyFailed = true;
                    this.verifying = false;
                }
            });
    }
}
