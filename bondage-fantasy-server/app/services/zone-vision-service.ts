import { CharacterDao } from "#dao/character-dao";
import { NpcDao } from "#dao/npc-dao";
import { ZoneDao } from "#dao/zone-dao";
import { ZoneObjectDao } from "#dao/zone-object-dao";
import {
  CharacterNotFoundException,
  CharacterNotInZoneException,
  ZoneNotFoundException,
} from "#exceptions/exceptions";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  CharacterObject,
  Field,
  Genitals,
  ObjectType,
  Pronouns,
  ZoneObject,
  ZoneVision,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import mustache from "mustache";

@inject()
export class ZoneVisionService {
  constructor(
    private zoneObjectDao: ZoneObjectDao,
    private zoneDao: ZoneDao,
    private characterDao: CharacterDao,
    private npcDao: NpcDao,
  ) {}

  async getVisionForCharacterIfInZone(
    characterId: number,
  ): Promise<ZoneVision | undefined> {
    const characterObject =
      await this.zoneObjectDao.getCharacterObject(characterId);
    if (characterObject == null) {
      return undefined;
    }

    return this.getVisionForCharacterObject(characterObject);
  }

  async getVisionForCharacter(characterId: number): Promise<ZoneVision> {
    const characterObject =
      await this.zoneObjectDao.getCharacterObject(characterId);
    if (characterObject == null) {
      throw new CharacterNotInZoneException();
    }

    return this.getVisionForCharacterObject(characterObject);
  }

  async getVisionForCharacterObject(
    characterObject: CharacterObject,
  ): Promise<ZoneVision> {
    const zone = await this.zoneDao.getById(characterObject.zoneId);
    if (zone == null) {
      throw new ZoneNotFoundException();
    }

    const objects = await this.zoneObjectDao.getManyByZoneAndPosition(
      zone.id,
      characterObject.position,
    );
    const zoneVisionObjects = await this.mapObjectsToZoneVisionObjects(objects);
    const currentField = zone.fields.find((field) =>
      arePositionsEqual(field.position, characterObject.position),
    )!;
    const currentFieldDescription = await this.renderFieldDescription({
      field: currentField,
      characterId: characterObject.characterId,
    });

    return {
      currentPosition: characterObject.position,
      currentFieldDescription,
      entrance: zone.entrance,
      fields: zone.fields.map((field) => ({
        position: field.position,
        name: field.name,
        canLeave: field.canLeave,
        objects: zoneVisionObjects.filter((object) =>
          arePositionsEqual(object.position, field.position),
        ),
      })),
      connections: zone.connections.map((connection) => ({
        positions: connection.positions,
      })),
    };
  }

  async mapObjectsToZoneVisionObjects(
    objects: ZoneObject[],
  ): Promise<ZoneVisionObject[]> {
    const charactersIds = objects
      .filter((object) => object.type === ObjectType.CHARACTER)
      .map((object) => object.characterId);
    const characters = await this.characterDao.getNamesByIds(charactersIds);
    const charactersNamesByIds = new Map(
      characters.map(({ id, name }) => [id, name]),
    );
    const npcIds = objects
      .filter((object) => object.type === ObjectType.NPC)
      .map((object) => object.npcId);
    const npcList = await this.npcDao.getNamesByIds(npcIds);
    const npcNamesByIds = new Map(npcList.map(({ id, name }) => [id, name]));

    return objects.map((object) => {
      switch (object.type) {
        case ObjectType.CHARACTER:
          return {
            id: object.id,
            type: object.type,
            position: object.position,
            characterId: object.characterId,
            name: charactersNamesByIds.get(object.characterId) ?? "",
          };
        case ObjectType.NPC:
          return {
            id: object.id,
            type: object.type,
            position: object.position,
            npcId: object.npcId,
            name: npcNamesByIds.get(object.npcId) ?? "",
          };
      }
    });
  }

  private async renderFieldDescription(params: {
    field: Field;
    characterId: number;
  }): Promise<string> {
    const character = await this.characterDao.getById(params.characterId);
    if (!character) {
      throw new CharacterNotFoundException();
    }

    try {
      return mustache.render(params.field.description, {
        name: character.name,

        // Genitals
        hasVagina:
          character.genitals === Genitals.VAGINA ||
          character.genitals === Genitals.FUTA,
        hasOnlyVagina: character.genitals === Genitals.VAGINA,
        hasPenis:
          character.genitals === Genitals.PENIS ||
          character.genitals === Genitals.FUTA,
        hasOnlyPenis: character.genitals === Genitals.PENIS,
        isFuta: character.genitals === Genitals.FUTA,

        // Pronouns
        sheHer: character.pronouns === Pronouns.SHE_HER,
        heHim: character.pronouns === Pronouns.HE_HIM,
      });
    } catch {
      return "<ERROR>";
    }
  }
}
