import 'next-auth';
import { UserRole } from './auth';
import type { UserFeatures } from './features';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      companyName?: string;
      agentCode?: string;

      features?: UserFeatures;
    };
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    companyName?: string;
    agentCode?: string;

    features?: UserFeatures;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    companyName?: string;
    agentCode?: string;

    features?: UserFeatures;
  }
}
