import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services';

@Component({ standalone: false, templateUrl: 'layout.component.html' })
export class LayoutComponent implements OnInit {
    constructor(private router: Router, private accountService: AccountService) {}

    ngOnInit() {
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }
}
