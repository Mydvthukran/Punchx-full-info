// Type declarations for third-party modules without bundled types

declare module '@namoidhq/react' {
  import { FC, ReactNode } from 'react';

  export interface NamoIDProviderProps {
    clientId: string;
    redirectUri?: string;
    children: ReactNode;
    onError?: (error: Error) => void;
    fetcher?: any;
  }

  export const NamoIDProvider: FC<NamoIDProviderProps>;
  export const SignIn: FC<any>;

  export interface UseNamoIDReturn {
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    user: import('@namoidhq/js').NamoIDUserInfo | null;
    isLoading: boolean;
    error: Error | null;
    handleCallback: () => Promise<import('@namoidhq/js').NamoIDUserInfo>;
    getAccessToken: () => string | null;
    getIdToken: () => string | null;
  }

  export function useNamoID(): UseNamoIDReturn;
}

declare module '@namoidhq/js' {
  export interface NamoIDUserInfo {
    sub: string;
    name?: string;
    email?: string;
    phone?: string;
    phone_number?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    birthdate?: string;
    dob?: string;
    date_of_birth?: string;
    birth_date?: string;
    [key: string]: unknown;
  }

  export interface NamoIDClientOptions {
    clientId: string;
    redirectUri: string;
    issuer?: string;
  }

  export class NamoIDClient {
    constructor(options: NamoIDClientOptions);
    login(): void;
    logout(): void;
    handleCallback(): Promise<NamoIDUserInfo>;
    getAccessToken(): string | null;
    getIdToken(): string | null;
    getUserInfo(): Promise<NamoIDUserInfo>;
  }
}
