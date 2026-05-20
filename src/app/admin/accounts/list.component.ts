import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: any[] = [];

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => this.accounts = accounts);
    }

    deleteAccount(account: any) {
        account.isDeleting = true;
        this.accountService.delete(account.id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== account.id);
            });
    }
}
