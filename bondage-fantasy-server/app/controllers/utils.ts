import { CharacterDao } from "#dao/character-dao";
import {
  ApplicationException,
  CharacterNotFoundException,
} from "#exceptions/exceptions";
import { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { Exception } from "@poppinss/utils";
import jsonUtils from "@poppinss/utils/json";
import { ErrorCode } from "bondage-fantasy-common";

export function getCharacterIdWithoutCheck(
  ctx: HttpContext,
): number | undefined {
  const characterId = Number.parseInt(
    ctx.request.header("X-CHARACTER-ID") ?? "",
  );
  return Number.isNaN(characterId) ? undefined : characterId;
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

export function safeParseJson(json: string): any {
  try {
    return jsonUtils.safeParse(json);
  } catch (error) {
    throw new Exception("Invalid JSON", {
      status: 422,
    });
  }
}
