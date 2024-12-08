import { CharacterDao } from "#dao/character-dao";
import {
  ApplicationException,
  CharacterNotFoundException,
} from "#exceptions/exceptions";
import { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { ErrorCode } from "bondage-fantasy-common";

export function getCharacterIdWithoutCheck(
  ctx: HttpContext,
): number | undefined {
  const characterId = parseInt(ctx.request.header("X-CHARACTER-ID") ?? "");
  return isNaN(characterId) ? undefined : characterId;
}

export async function getCharacterId(ctx: HttpContext): Promise<number> {
  const characterId = getCharacterIdWithoutCheck(ctx);
  if (characterId == null) {
    throw new ApplicationException({
      code: ErrorCode.E_NO_CHARACTER_ID,
      message: "Header X-CHARACTER-ID was not provided or has invalid value",
      status: 422,
    });
  }

  const characterDao = await app.container.make(CharacterDao);
  const characterOwnedByAccount = await characterDao.isCharacterdOwnedByAccount(
    characterId,
    ctx.auth.user!.id,
  );
  if (!characterOwnedByAccount) {
    throw new CharacterNotFoundException();
  }

  return characterId;
}
