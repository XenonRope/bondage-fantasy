import { CharacterDao } from "#dao/character-dao";
import { ZoneDao } from "#dao/zone-dao";
import { ZoneObjectDao } from "#dao/zone-object-dao";
import {
  CharacterNotInZoneException,
  ZoneNotFoundException,
} from "#exceptions/exceptions";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  CharacterObject,
  CharacterZoneVisionObject,
  isCharacterObject,
  ObjectType,
  ZoneObject,
  ZoneVision,
  ZoneVisionObject,
} from "bondage-fantasy-common";

@inject()
export class ZoneVisionService {
  constructor(
    private zoneObjectDao: ZoneObjectDao,
    private zoneDao: ZoneDao,
    private characterDao: CharacterDao,
  ) {}

  async getVisionForCharacter(chracterId: number): Promise<ZoneVision> {
    const characterObject =
      await this.zoneObjectDao.getCharacterObject(chracterId);
    if (characterObject == null) {
      throw new CharacterNotInZoneException();
    }

    const zone = await this.zoneDao.getById(characterObject.zoneId);
    if (zone == null) {
      throw new ZoneNotFoundException();
    }

    const objects = await this.zoneObjectDao.getManyByPosition(
      characterObject.position,
    );
    const charactersIds = objects
      .filter((object) => object.type === ObjectType.CHARACTER)
      .map((object) => (object as CharacterObject).characterId);
    const characters = await this.characterDao.getNamesByIds(charactersIds);
    const charactersNamesByIds = new Map(
      characters.map(({ id, name }) => [id, name]),
    );
    const currentField = zone.fields.find((field) =>
      arePositionsEqual(field.position, characterObject.position),
    )!;

    return {
      currentPosition: characterObject.position,
      currentFieldDescription: currentField.description,
      fields: zone.fields.map((field) => ({
        position: field.position,
        name: field.name,
        canLeave: field.canLeave,
        objects: this.mapObjectsToZoneVisionObjects(
          objects.filter((object) =>
            arePositionsEqual(object.position, field.position),
          ),
          charactersNamesByIds,
        ),
      })),
      connections: zone.connections.map((connection) => ({
        positions: connection.positions,
      })),
    };
  }

  private mapObjectsToZoneVisionObjects(
    objects: ZoneObject[],
    charactersNamesByIds: Map<number, string>,
  ): ZoneVisionObject[] {
    return objects.map((object) => {
      if (isCharacterObject(object)) {
        return {
          id: object.id,
          type: object.type,
          position: object.position,
          characterId: object.characterId,
          name: charactersNamesByIds.get(object.characterId),
        } as CharacterZoneVisionObject;
      } else {
        throw new Error(`Object type "${object.type}" is not supported`);
      }
    });
  }
}
