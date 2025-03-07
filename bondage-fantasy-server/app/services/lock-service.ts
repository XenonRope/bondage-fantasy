import { CannotAcquireLockException } from "#exceptions/exceptions";
import app from "@adonisjs/core/services/app";
import lock from "@adonisjs/lock/services/main";
import { Duration } from "@adonisjs/lock/types";

export const LOCKS = {
  migrations: "migrations",
  account: (id: number) => `account.${id}`,
  character: (id: number) => `character.${id}`,
  zone: (id: number) => `zone.${id}`,
  item: (id: number) => `item.${id}`,
  image: (id: number) => `image.${id}`,
};

export class LockService {
  async run<T>(
    name: string | string[],
    ttl: Duration,
    run: () => Promise<T>,
  ): Promise<T> {
    if (Array.isArray(name)) {
      if (name.length === 0) {
        throw new Error("Argument 'name' must not be an empty array");
      }
      if (name.length === 1) {
        return await this.run(name[0], ttl, run);
      }
      return await this.run(
        name[0],
        ttl,
        async () => await this.run(name.slice(1), ttl, run),
      );
    }

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
