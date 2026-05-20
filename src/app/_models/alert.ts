export class Alert {
    id: string;
    type: AlertType;
    message: string;
    autoClose: boolean;
    keepAfterRouteChange: boolean;
    fade: boolean;

    constructor(init?: Partial<Alert>) {
        this.id = 'default-alert';
        this.type = AlertType.Info;
        this.message = '';
        this.autoClose = true;
        this.keepAfterRouteChange = false;
        this.fade = false;
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}

export class AlertOptions {
    id?: string;
    autoClose?: boolean;
    keepAfterRouteChange?: boolean;
}
