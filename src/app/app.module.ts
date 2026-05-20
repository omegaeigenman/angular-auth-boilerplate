import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { environment } from '@environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { appInitializer, JwtInterceptor, ErrorInterceptor, fakeBackendProvider } from './_helpers';
import { AccountService } from './_services';

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        AlertComponent
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        // Fake backend — disabled in production
        ...(environment.production ? [] : [fakeBackendProvider])
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
