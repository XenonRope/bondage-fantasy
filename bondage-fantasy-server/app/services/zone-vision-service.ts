import { CharacterDao } from "#dao/character-dao";
import { ZoneDao } from "#dao/zone-dao";
import { CharacterNotFoundException } from "#exceptions/exceptions";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  CharacterZoneVisionObject,
  EventZoneVisionObject,
  Field,
  ObjectType,
  parseExpression,
  ZoneObject,
  ZoneVision,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ExpressionEvaluator } from "./expression-evaluator.js";
import { TemplateRenderer } from "./template-renderer.js";

@inject()
export class ZoneVisionService {
  constructor(
    private zoneDao: ZoneDao,
    private characterDao: CharacterDao,
    private expressionEvaluator: ExpressionEvaluator,
    private templateRenderer: TemplateRenderer,
  ) {}

  async tryGetZoneVision(characterId: number): Promise<ZoneVision | undefined> {
    const zone = await this.zoneDao.getByCharacterObject(characterId);
    if (zone == null) {
      return undefined;
    }

    const characterObject = zone.objects.find(
      (object) =>
        object.type === ObjectType.CHARACTER &&
        object.characterId === characterId,
    )!;
    const objects = zone.objects.filter((object) =>
      arePositionsEqual(object.position, characterObject.position),
    );
    const zoneVisionObjects = await this.mapObjectsToZoneVisionObjects(objects);
    const currentField = zone.fields.find((field) =>
      arePositionsEqual(field.position, characterObject.position),
    )!;
    const currentFieldDescription = await this.renderFieldDescription({
      field: currentField,
      characterId,
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

    return objects
      .map((object) => {
        if (object.type === ObjectType.CHARACTER) {
          const character: CharacterZoneVisionObject = {
            type: ObjectType.CHARACTER,
            position: object.position,
            characterId: object.characterId,
            name:
              characters.find(
                (character) => character.id === object.characterId,
              )?.name ?? "",
          };
          return character;
        } else if (object.type === ObjectType.EVENT) {
          if (object.condition != null) {
            const [expression, error] = parseExpression(object.condition);
            if (error) {
              return null;
            }
            if (!this.expressionEvaluator.evaluateAsBoolean(expression)) {
              return null;
            }
          }
          const event: EventZoneVisionObject = {
            type: ObjectType.EVENT,
            position: object.position,
            eventId: object.eventId,
            name: object.name,
            canInteract: object.scene != null && object.scene.steps.length > 0,
          };
          return event;
        }
      })
      .filter((object) => object != null);
  }

  private async renderFieldDescription(params: {
    field: Field;
    characterId: number;
  }): Promise<string> {
    const character = await this.characterDao.getById(params.characterId);
    if (!character) {
      throw new CharacterNotFoundException();
    }

    return this.templateRenderer.render(params.field.description, {
      character,
    });
  }
}
