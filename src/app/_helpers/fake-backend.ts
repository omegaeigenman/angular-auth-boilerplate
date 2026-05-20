import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';

const accountsKey = 'angular-21-boilerplate-accounts';
let accounts: any[] = JSON.parse(localStorage.getItem(accountsKey)!) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        // Capture alertService for use inside inner functions
        const alertSvc = this.alertService;
        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST': return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST': return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST': return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST': return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST': return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST': return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST': return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST': return resetPassword();
                case url.endsWith('/accounts') && method === 'GET': return getAccounts();
                case !!(url.match(/\/accounts\/\d+$/) && method === 'GET'): return getAccountById();
                case url.endsWith('/accounts') && method === 'POST': return createAccount();
                case !!(url.match(/\/accounts\/\d+$/) && method === 'PUT'): return updateAccount();
                case !!(url.match(/\/accounts\/\d+$/) && method === 'DELETE'): return deleteAccount();
                default: return next.handle(request);
            }
        }

        function authenticate() {
            const { email, password } = body;
            const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
            if (!account) return error('Email or password is incorrect');
            account.refreshTokens.push(generateRefreshToken());
            saveAccounts();
            return ok({ ...basicDetails(account), jwtToken: generateJwtToken(account) });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();
            if (!refreshToken) return unauthorized();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            if (!account) return unauthorized();
            account.refreshTokens = account.refreshTokens.filter((x: string) => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            saveAccounts();
            return ok({ ...basicDetails(account), jwtToken: generateJwtToken(account) });
        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();
            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            account.refreshTokens = account.refreshTokens.filter((x: string) => x !== refreshToken);
            saveAccounts();
            return ok({ message: 'Token revoked' });
        }

        function register() {
            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                setTimeout(() => alertSvc.info(`
                    <h4>Email Already Registered</h4>
                    <p>Your email ${account.email} is already registered.</p>
                    <p>If you don't know your password please visit the
                    <a href="/account/forgot-password">forgot password</a> page.</p>
                `, { autoClose: false }), 1000);
                return ok();
            }
            account.id = newAccountId();
            account.role = account.id === 1 ? Role.Admin : Role.User;
            account.verificationToken = new Date().getTime().toString();
            account.isVerified = false;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            saveAccounts();
            setTimeout(() => {
                const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                alertSvc.info(`
                    <h4>Verification Email</h4>
                    <p>Thanks for registering!</p>
                    <p>Please click the below link to verify your email address:</p>
                    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                `, { autoClose: false });
            }, 1000);
            return ok({ message: 'Registration successful, please check your email for verification instructions' });
        }

        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => x.verificationToken === token);
            if (!account) return error('Verification failed');
            account.isVerified = true;
            saveAccounts();
            return ok({ message: 'Verification successful, you can now login' });
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);
            if (!account) return ok({ message: 'Please check your email for password reset instructions' });
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            saveAccounts();
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertSvc.info(`
                    <h4>Reset Password Email</h4>
                    <p>Please click the below link to reset your password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                `, { autoClose: false });
            }, 1000);
            return ok({ message: 'Please check your email for password reset instructions' });
        }

        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x =>
                x.resetToken === token && new Date() < new Date(x.resetTokenExpires)
            );
            if (!account) return error('Invalid token');
            return ok({ message: 'Token is valid' });
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                x.resetToken === token && new Date() < new Date(x.resetTokenExpires)
            );
            if (!account) return error('Invalid token');
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            saveAccounts();
            return ok({ message: 'Password reset successful, you can now login' });
        }

        function getAccounts() {
            if (!isAuthenticated()) return unauthorized();
            return ok(accounts.map(x => basicDetails(x)));
        }

        function getAccountById() {
            if (!isAuthenticated()) return unauthorized();
            const account = accounts.find(x => x.id === idFromUrl());
            return ok(basicDetails(account));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                return error(`Email ${account.email} is already registered`);
            }
            account.id = newAccountId();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            saveAccounts();
            return ok(basicDetails(account));
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();
            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());
            if (!isAuthorized(Role.Admin) && account.id !== currentAccount()?.id) return unauthorized();
            if (params.email && accounts.find(x => x.email === params.email && x.id !== account.id)) {
                return error(`Email ${params.email} is already registered`);
            }
            if (!params.password) delete params.password;
            Object.assign(account, params);
            saveAccounts();
            return ok(basicDetails(account));
        }

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();
            let account = accounts.find(x => x.id === idFromUrl());
            if (!isAuthorized(Role.Admin) && account.id !== currentAccount()?.id) return unauthorized();
            accounts = accounts.filter(x => x.id !== idFromUrl());
            saveAccounts();
            return ok({ message: 'Account deleted successfully' });
        }

        // Helpers
        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
        }
        function error(message: string) {
            return throwError(() => ({ error: { message } })).pipe(materialize(), delay(500), dematerialize());
        }
        function unauthorized() {
            return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } })).pipe(materialize(), delay(500), dematerialize());
        }
        function basicDetails(account: any) {
            const { id, title, firstName, lastName, email, role, isVerified } = account;
            return { id, title, firstName, lastName, email, role, isVerified };
        }
        function isAuthenticated() { return !!currentAccount(); }
        function isAuthorized(role: Role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }
        function currentAccount() {
            const authHeader = headers.get('Authorization');
            if (!authHeader?.startsWith('Bearer fake-jwt-token')) return;
            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > jwtToken.exp * 1000;
            if (tokenExpired) return;
            return accounts.find(x => x.id === jwtToken.id);
        }
        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }
        function getRefreshToken() {
            return document.cookie.split(';')
                .find(x => x.trim().startsWith('fakeRefreshToken='))?.split('=')[1];
        }
        function generateJwtToken(account: any) {
            const tokenPayload = {
                exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
                id: account.id
            };
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }
        function generateRefreshToken() {
            const token = new Date().getTime().toString();
            document.cookie = `fakeRefreshToken=${token}; path=/; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}`;
            return token;
        }
        function saveAccounts() {
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
