import { SessionRememberMeToken, SessionUser } from "#models/session-model";
import { defineConfig, symbols } from "@adonisjs/auth";
import { RememberMeToken, sessionGuard } from "@adonisjs/auth/session";
import type { Authenticators, InferAuthEvents } from "@adonisjs/auth/types";
import {
  SessionGuardUser,
  SessionUserProviderContract,
  SessionWithTokensUserProviderContract,
} from "@adonisjs/auth/types/session";
import { Secret } from "@adonisjs/core/helpers";
import app from "@adonisjs/core/services/app";
import { Collection, Db, ObjectId } from "mongodb";

export class SessionUserProvider
  implements SessionWithTokensUserProviderContract<SessionUser>
{
  declare [symbols.PROVIDER_REAL_USER]: SessionUser;

  private db?: Db;

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

  async createRememberToken(
    user: SessionUser,
    expiresIn: string | number,
  ): Promise<RememberMeToken> {
    const collection = await this.getCollection();
    const transientToken = RememberMeToken.createTransientToken(
      user.id,
      40,
      expiresIn,
    );

    const now = new Date();
    const result = await collection.insertOne({
      tokenableId: transientToken.userId as number,
      hash: transientToken.hash,
      createdAt: now,
      updatedAt: now,
      expiresAt: transientToken.expiresAt,
    });

    return new RememberMeToken({
      identifier: result.insertedId.toHexString(),
      tokenableId: transientToken.userId,
      secret: transientToken.secret,
      hash: transientToken.hash,
      createdAt: now,
      updatedAt: now,
      expiresAt: transientToken.expiresAt,
    });
  }

  async verifyRememberToken(
    tokenValue: Secret<string>,
  ): Promise<RememberMeToken | null> {
    const decodedToken = RememberMeToken.decode(tokenValue.release());
    if (!decodedToken) {
      return null;
    }

    const collection = await this.getCollection();
    const sessionRememberMeToken = await collection.findOne({
      _id: new ObjectId(decodedToken.identifier),
    });

    if (!sessionRememberMeToken) {
      return null;
    }

    const rememberMeToken = new RememberMeToken({
      identifier: sessionRememberMeToken._id.toHexString(),
      tokenableId: sessionRememberMeToken.tokenableId,
      hash: sessionRememberMeToken.hash,
      createdAt: sessionRememberMeToken.createdAt,
      updatedAt: sessionRememberMeToken.updatedAt,
      expiresAt: sessionRememberMeToken.expiresAt,
    });

    if (
      !rememberMeToken.verify(decodedToken.secret) ||
      rememberMeToken.isExpired()
    ) {
      return null;
    }

    return rememberMeToken;
  }

  async recycleRememberToken(
    user: SessionUser,
    tokenIdentifier: string | number | BigInt,
    expiresIn: string | number,
  ): Promise<RememberMeToken> {
    await this.deleteRemeberToken(user, tokenIdentifier);
    return this.createRememberToken(user, expiresIn);
  }

  async deleteRemeberToken(
    user: SessionUser,
    tokenIdentifier: string | number | BigInt,
  ): Promise<number> {
    const collection = await this.getCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(tokenIdentifier as string),
      tokenableId: user.id,
    });

    return result.deletedCount;
  }

  private async getCollection(): Promise<Collection<SessionRememberMeToken>> {
    if (!this.db) {
      this.db = await app.container.make(Db);
    }
    return this.db.collection("remember_me_tokens");
  }
}

const authConfig = defineConfig({
  default: "web",
  guards: {
    web: sessionGuard({
      useRememberMeTokens: true,
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
