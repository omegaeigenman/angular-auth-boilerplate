import { Component, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'home.component.html' })
export class HomeComponent implements OnInit {
    account?: Account | null;

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.account = this.accountService.accountValue;
    }
}
