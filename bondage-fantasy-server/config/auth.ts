import { SessionUser } from "#models/session-model";
import { defineConfig, symbols } from "@adonisjs/auth";
import { sessionGuard } from "@adonisjs/auth/session";
import type { Authenticators, InferAuthEvents } from "@adonisjs/auth/types";
import {
  SessionGuardUser,
  SessionUserProviderContract,
} from "@adonisjs/auth/types/session";

export class SessionUserProvider
  implements SessionUserProviderContract<SessionUser>
{
  declare [symbols.PROVIDER_REAL_USER]: SessionUser;

  async createUserForGuard(
    user: SessionUser,
  ): Promise<SessionGuardUser<SessionUser>> {
    return {
      getId() {
        return user.id;
      },
      getOriginal() {
        return user;
      },
    };
  }

  async findById(id: number): Promise<SessionGuardUser<SessionUser> | null> {
    return await this.createUserForGuard(new SessionUser(id));
  }
}

const authConfig = defineConfig({
  default: "web",
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: new SessionUserProvider(),
    }),
  },
});

export default authConfig;

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module "@adonisjs/auth/types" {
  export interface Authenticators
    extends InferAuthenticators<typeof authConfig> {}
}
declare module "@adonisjs/core/types" {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
