import { CannotAcquireLockException } from "#exceptions/exceptions";
import app from "@adonisjs/core/services/app";
import lock from "@adonisjs/lock/services/main";
import { Duration } from "@adonisjs/lock/types";

export const LOCKS = {
  migrations: "migrations",
  account: (id: number) => `account.${id}`,
  character: (id: number) => `character.${id}`,
};

export class LockService {
  async run<T>(name: string, ttl: Duration, run: () => Promise<T>): Promise<T> {
    const [executed, result] = await lock
      .createLock(name, ttl)
      .run(() => run());

    if (!executed) {
      throw new CannotAcquireLockException(name);
    }

    return result;
  }
}

const lockService = await app.container.make(LockService);
export { lockService as default };
