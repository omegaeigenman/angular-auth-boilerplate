import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/_services';
import { Account, Role } from '@app/_models';

@Component({ standalone: false, selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit {
    Role = Role;
    account?: Account | null;

    constructor(private accountService: AccountService, private router: Router) {}

    ngOnInit() {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
        this.router.navigate(['/account/login']);
    }
}
