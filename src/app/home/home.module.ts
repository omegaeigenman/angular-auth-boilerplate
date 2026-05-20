import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '@app/_helpers';
import { HomeComponent } from './home.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            { path: '', component: HomeComponent, canActivate: [AuthGuard] }
        ])
    ],
    declarations: [HomeComponent]
})
export class HomeModule {}
