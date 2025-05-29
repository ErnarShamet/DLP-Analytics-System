// frontend/src/types/index.ts
// Этот файл будет основным для ваших типов данных.
// Рекомендуется также создать frontend/src/types/api.ts для специфичных типов API.

// --- Пользователи и Аутентификация ---
export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    role: 'User' | 'Analyst' | 'IncidentResponder' | 'Admin' | 'SuperAdmin';
    isActive: boolean;
    lastLogin?: string | Date; // Может быть строкой ISO или объектом Date
    twoFactorEnabled?: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

export interface RegisterData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    // role?: string; // Если разрешена самостоятельная установка роли
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null; // Сообщение об ошибке
}

// --- Политики ---
export interface PolicyCondition {
    field: string;
    operator: 'contains' | 'not_contains' | 'matches_regex' | 'not_matches_regex' | 'equals' | 'not_equals' | 'is_one_of' | 'is_not_one_of' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
    value: any; // string | number | boolean | string[]
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array_string';
}

export interface PolicyAction {
    type: 'alert' | 'block' | 'log' | 'encrypt' | 'notify_user' | 'quarantine' | 'require_justification';
    parameters?: any; // { severity: 'High' }
}

export interface Policy {
    _id: string;
    name: string;
    description?: string;
    isEnabled: boolean;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    createdBy: User | string; // Может быть объектом User или ID
    updatedBy: User | string;
    version: number;
    tags?: string[];
    scope?: {
        users?: (User | string)[];
        userGroups?: string[];
    };
    createdAt: string | Date;
    updatedAt: string | Date;
}

// --- Оповещения (Alerts) ---
export interface AlertNote {
    _id?: string; // mongoose subdocs get _id
    text: string;
    user: User | string; // User object or ID
    createdAt: string | Date;
}

export interface AlertHistoryEntry {
    _id?: string;
    user?: User | string;
    action: string;
    timestamp: string | Date;
    details?: any;
}

export interface Alert {
    _id: string;
    title: string;
    description?: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Informational';
    status: 'New' | 'Acknowledged' | 'Investigating' | 'Resolved' | 'Closed' | 'FalsePositive';
    policyTriggered?: Policy | string; // Policy object or ID
    userInvolved?: (User | string)[]; // Array of User objects or IDs
    dataSnapshot?: any;
    source?: string;
    tags?: string[];
    notes?: AlertNote[];
    assignedTo?: User | string;
    incidentId?: Incident | string; // Incident object or ID
    generatedBy?: User | string;
    history?: AlertHistoryEntry[];
    timestamp: string | Date; // Когда сработало оповещение
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface AlertState {
    alerts: Alert[];
    currentAlert: Alert | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        count: number;
        page: number;
        pageSize: number;
        // totalPages: number;
    } | null;
}


// --- Инциденты ---
export interface IncidentComment {
    _id?: string;
    user: User | string;
    text: string;
    createdAt: string | Date;
}

export interface IncidentHistoryEntry {
    _id?: string;
    user?: User | string;
    action: string;
    timestamp: string | Date;
    oldValue?: any;
    newValue?: any;
}

export interface Incident {
    _id: string;
    title: string;
    description: string;
    status: 'Open' | 'Investigating' | 'Contained' | 'Eradicated' | 'Recovered' | 'LessonsLearned' | 'Closed' | 'OnHold';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    severity?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Informational';
    assignee?: User | string;
    relatedAlerts?: (Alert | string)[];
    comments?: IncidentComment[];
    tags?: string[];
    resolutionDetails?: {
        summary?: string;
        resolvedAt?: string | Date;
        resolvedBy?: User | string;
        actionsTaken?: string[];
    };
    impactAssessment?: {
        businessImpact?: string;
        technicalImpact?: string;
        dataImpact?: string;
    };
    sourceOfIncident?: string;
    detectionTime?: string | Date;
    containmentTime?: string | Date;
    eradicationTime?: string | Date;
    recoveryTime?: string | Date;
    history?: IncidentHistoryEntry[];
    createdBy: User | string;
    updatedBy: User | string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// Общий тип для состояния загрузки/ошибки для разных срезов
export interface GenericState<T> {
    data: T[];
    currentItem: T | null;
    isLoading: boolean;
    error: string | null;
    // Дополнительные поля, например, для пагинации
}