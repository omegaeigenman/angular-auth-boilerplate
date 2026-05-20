import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubNavComponent } from './subnav.component';

@NgModule({
    imports: [CommonModule, RouterModule, AdminRoutingModule],
    declarations: [LayoutComponent, OverviewComponent, SubNavComponent]
})
export class AdminModule {}
