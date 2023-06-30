declare type ErrorStateType = {};

declare type EventType = {
    eventType: 'navigation' | 'javascript' | 'network' | 'click' | 'console' | 'deadClick' | 'rageClick';
    area: 'error' | 'info';
    location: string;
    date: number;
    sessionId: string;
};

declare type LocationEventType = EventType & {
    data: {
        currentLocation: string;
        previousLocation: string;
    };
};

declare type NetworkResponse = {
    url: string;
    status: number;
    method: string;
    startTime: number;
    endTime: number;
    reqHeaders?: Record<string, any>;
    resHeaders?: Record<string, any>;
    payload?: Record<string, any>;
    response?: Record<string, any>;
    message: string;
};
declare type NetworkEventType = EventType & {
    data: NetworkResponse;
};

declare type consoleResponseType = EventType & {
    data: {
        logData: any[];
        type: string;
    };
};

declare type ClickResponse = {
    tagName: string;
    elementId: string;
    classList: string[];
    eventType: string;
    timeStamp: number;
    textContent: string;
};
declare type ClickEventType = EventType & {
    data: ClickResponse;
};
declare type DeadClickEventType = EventType & {
    data: {
        elementId: string;
        tagName: string;
        classList: string[];
        timeStamp: number;
        textContent: string;
        message: string;
    };
};

declare type ErrorResponse = {
    name: string;
    stack: string;
    fileName: string;
    lineNo: number;
    timeStamp: number;
    message: string;
    colNo: number;
};
declare type ErrorEventType = EventType & {
    data: ErrorResponse;
};

declare type MaskInputOptions = {
    color: boolean;
    date: boolean;
    'datetime-local': boolean;
    email: boolean;
    month: boolean;
    number: boolean;
    range: boolean;
    search: boolean;
    tel: boolean;
    text: boolean;
    time: boolean;
    url: boolean;
    week: boolean;
    textarea: boolean;
    select: boolean;
    password: boolean;
};

declare type MaskProperties = {
    blockSelector?: string;
    ignoreCSSAttributes?: string[];
    maskTextSelector?: string;
    maskAllInputs?: boolean;
    maskInputOptions?: MaskInputOptions;
    recordCanvas?: boolean;
};

declare const checkIfExist: () => boolean;
declare const getStacksGlobally: () => {
    errorStack: ErrorEventType[];
    clickStack: ClickEventType[];
    userAgent: {
        projectId: string;
        sessionId: string;
        origin: string;
        host: string;
        href: string;
        search: string;
        screen: string;
        browser: string;
        browserVersion: string;
        browserMajorVersion: number;
        mobile: boolean;
        os: string;
        osVersion: any;
        cookies: boolean;
        flashVersion: string;
    };
    rageClickStack: DeadClickEventType[];
    deadClickStack: DeadClickEventType[];
    sessionReplayStack: string;
    consoleStack: consoleResponseType[];
    networkStack: NetworkEventType[];
    locationStack: LocationEventType[];
    customErrorStack: ErrorStateType[];
};
declare const Garuda: {
    init: ({ projectId, host, maskProperties, }: {
        projectId: string;
        host: string;
        maskProperties?: MaskProperties;
    }) => Promise<void>;
    identify: (user: {
        name: string;
        email: string;
        subscriptionType?: string;
        uId: string;
    }) => void;
};

export { Garuda, checkIfExist, getStacksGlobally };
