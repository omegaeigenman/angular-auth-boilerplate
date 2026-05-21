import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: any[] = [];

    constructor(
        private accountService: AccountService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts: any) => {
                    console.log('Accounts loaded:', accounts);
                    this.accounts = accounts as any[];
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Failed to load accounts:', err);
                }
            });
    }

    deleteAccount(account: any) {
        account.isDeleting = true;
        this.accountService.delete(account.id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== account.id);
                this.cdr.detectChanges();
            });
    }
}
