import { CharacterDao } from "#dao/character-dao";
import { ApplicationException } from "#exceptions/exceptions";
import { inject } from "@adonisjs/core";
import { ContainerResolver } from "@adonisjs/core/container";
import { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import { ErrorCode } from "bondage-fantasy-common";

class CharacterId {
  constructor(public value: number) {}
}

export async function getCharacterId(
  containerResolver: ContainerResolver<any>,
): Promise<number> {
  const characterId = await containerResolver.make(
    CharacterId,
    undefined,
    () =>
      new ApplicationException({
        code: ErrorCode.E_NO_CHARACTER_ID,
        message: "Header X-CHARACTER-ID was not provided or has invalid value",
        status: 422,
      }),
  );
  return characterId.value;
}

@inject()
export default class ContainerBindingsMiddleware {
  constructor(private characterDao: CharacterDao) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const characterId = parseInt(ctx.request.header("X-CHARACTER-ID") ?? "");
    if (ctx.auth.user && !isNaN(characterId)) {
      const characterOwnedByAccount =
        await this.characterDao.isCharacterdOwnedByAccount(
          characterId,
          ctx.auth.user.id,
        );
      if (characterOwnedByAccount) {
        ctx.containerResolver.bindValue(
          CharacterId,
          new CharacterId(characterId),
        );
      } else {
        throw new ApplicationException({
          code: ErrorCode.E_INVALID_CHARACTER_ID,
          message: `You are not owner of character with id ${characterId}`,
          status: 401,
        });
      }
    }

    return next();
  }
}
