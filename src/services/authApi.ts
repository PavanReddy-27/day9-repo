export type UserRole =
  | "Admin"
  | "HR"
  | "Manager"
  | "Employee";

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

interface MockUser extends AuthUser {
  password: string;
}

interface StoredSession {
  user: AuthUser;
  loginTime: number;
  expiresAt: number;
  rememberMe: boolean;
}

const STORAGE_KEY = "auth_user";
const SESSION_EXPIRY_HOURS = 8;

const mockUsers: MockUser[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "Admin",
  },
  {
    id: 2,
    username: "hr",
    password: "hr123",
    role: "HR",
  },
  {
    id: 3,
    username: "manager",
    password: "manager123",
    role: "Manager",
  },
  {
    id: 4,
    username: "employee",
    password: "employee123",
    role: "Employee",
  },
];

const authApi = {
  login(payload: LoginPayload): AuthUser {
    const user = mockUsers.find(
      (u) =>
        u.username.toLowerCase() ===
          payload.username.trim().toLowerCase() &&
        u.password === payload.password
    );

    if (!user) {
      throw new Error(
        "Invalid username or password."
      );
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    this.saveUser(
      authUser,
      payload.rememberMe ?? false
    );

    return authUser;
  },

  saveUser(
    user: AuthUser,
    rememberMe = false
  ) {
    const now = Date.now();

    const session: StoredSession = {
      user,
      loginTime: now,
      expiresAt:
        now +
        SESSION_EXPIRY_HOURS *
          60 *
          60 *
          1000,
      rememberMe,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(session)
    );
  },

  getCurrentUser(): AuthUser | null {
    const sessionString =
      localStorage.getItem(STORAGE_KEY);

    if (!sessionString) {
      return null;
    }

    try {
      const session: StoredSession =
        JSON.parse(sessionString);

      if (
        Date.now() >
        session.expiresAt
      ) {
        this.removeUser();
        return null;
      }

      return session.user;
    } catch {
      this.removeUser();
      return null;
    }
  },

  getUserRole(): UserRole | null {
    return (
      this.getCurrentUser()?.role ?? null
    );
  },

  isAuthenticated() {
    return (
      this.getCurrentUser() !== null
    );
  },

  removeUser() {
    localStorage.removeItem(
      STORAGE_KEY
    );
  },

  refreshSession() {
    const user =
      this.getCurrentUser();

    if (!user) {
      return;
    }

    this.saveUser(user);
  },
};

export default authApi;