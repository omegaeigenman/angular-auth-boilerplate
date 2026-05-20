import { Component, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'details.component.html' })
export class DetailsComponent implements OnInit {
    account?: Account | null;

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.account = this.accountService.accountValue;
    }
}
