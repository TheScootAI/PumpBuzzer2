export interface User {
  id: number;
  username: string;
  email: string;
  hasDiscordSetup?: boolean;
  lastPumpAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface PumpStats {
  username: string;
  lastPumpAt?: string;
  hasDiscordSetup: boolean;
}