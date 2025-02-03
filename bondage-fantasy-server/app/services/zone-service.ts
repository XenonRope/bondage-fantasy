import { ZoneDao } from "#dao/zone-dao";
import {
  CannotInteractWithEventException,
  CannotLeaveException,
  CannotMoveException,
  CharacterInSceneException,
  CharacterInZoneException,
  CharacterNotInZoneException,
  EventNotFoundException,
  InvalidZoneException,
  NoAccessToZoneException,
  ZoneIsDraftException,
  ZoneNotFoundException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  EventObject,
  Field,
  FieldConnection,
  findConnectionByConnectionKey,
  findFieldByPosition,
  getCharacterVariables,
  getFieldConnectionKey,
  getFieldKey,
  hasDuplicates,
  ObjectType,
  Position,
  Zone,
  ZoneObject,
} from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";
import { ExpressionEvaluator } from "./expression-evaluator.js";
import { SceneService } from "./scene-service.js";
import CharacterService from "./character-service.js";

@inject()
export class ZoneService {
  constructor(
    private zoneDao: ZoneDao,
    private sequenceService: SequenceService,
    private expressionEvaluator: ExpressionEvaluator,
    private sceneService: SceneService,
    private characterService: CharacterService,
  ) {}

  async get(
    zoneId: number,
    params?: {
      checkAccessForCharacterId?: number;
      checkLimitedAccessForCharacterId?: number;
    },
  ): Promise<Zone> {
    const zone = await this.zoneDao.getById(zoneId);
    if (!zone) {
      throw new ZoneNotFoundException();
    }
    if (
      params?.checkLimitedAccessForCharacterId != null &&
      params.checkLimitedAccessForCharacterId !== zone.ownerCharacterId &&
      zone.draft
    ) {
      throw new ZoneNotFoundException();
    }
    if (
      params?.checkAccessForCharacterId != null &&
      params.checkAccessForCharacterId !== zone.ownerCharacterId
    ) {
      throw new NoAccessToZoneException();
    }
    return zone;
  }

  async save(params: {
    zoneId?: number;
    characterId: number;
    name: string;
    description: string;
    draft: boolean;
    entrance: Position;
    fields: Field[];
    connections: FieldConnection[];
    objects: ZoneObject[];
  }): Promise<Zone> {
    this.validateFields(params.fields);
    this.validateConnections(params.connections, params.fields);
    this.validateEntrance(params.entrance, params.fields);
    this.validateObjects(params.objects, params.fields);

    const locks =
      params.zoneId == null
        ? [LOCKS.character(params.characterId)]
        : [LOCKS.character(params.characterId), LOCKS.zone(params.zoneId)];
    return await lockService.run(locks, "1s", async () => {
      const zone =
        params.zoneId == null
          ? undefined
          : await this.get(params.zoneId, {
              checkAccessForCharacterId: params.characterId,
            });
      const characterObjects =
        !zone || params.draft
          ? []
          : zone.objects.filter(
              (object) =>
                object.type === ObjectType.CHARACTER &&
                findFieldByPosition(params.fields, object.position) != null,
            );

      const newZone: Zone = {
        id:
          params.zoneId ??
          (await this.sequenceService.nextSequence(SequenceCode.ZONE)),
        ownerCharacterId: params.characterId,
        name: params.name,
        description: params.description,
        draft: params.draft,
        entrance: params.entrance,
        fields: params.fields,
        connections: params.connections,
        objects: [...params.objects, ...characterObjects],
      };

      if (params.zoneId == null) {
        await this.zoneDao.insert(newZone);
      } else {
        await this.zoneDao.update(newZone);
      }

      return newZone;
    });
  }

  async join(params: { characterId: number; zoneId: number }): Promise<void> {
    await lockService.run(
      [LOCKS.zone(params.zoneId), LOCKS.character(params.characterId)],
      "1s",
      async () => {
        if (await this.sceneService.isCharacterInScene(params.characterId)) {
          throw new CharacterInSceneException();
        }
        if (
          (await this.zoneDao.getZoneIdByCharacterObject(params.characterId)) !=
          null
        ) {
          throw new CharacterInZoneException();
        }
        const zone = await this.get(params.zoneId, {
          checkLimitedAccessForCharacterId: params.characterId,
        });
        if (zone.draft) {
          throw new ZoneIsDraftException();
        }

        zone.objects.push({
          type: ObjectType.CHARACTER,
          position: zone.entrance,
          characterId: params.characterId,
        });

        await this.zoneDao.update(zone);
      },
    );
  }

  async leave(params: { characterId: number }): Promise<void> {
    const zoneId = await this.zoneDao.getZoneIdByCharacterObject(
      params.characterId,
    );
    if (zoneId == null) {
      throw new CharacterNotInZoneException();
    }

    await lockService.run(
      [LOCKS.zone(zoneId), LOCKS.character(params.characterId)],
      "1s",
      async () => {
        if (await this.sceneService.isCharacterInScene(params.characterId)) {
          throw new CharacterInSceneException();
        }
        const zone = await this.zoneDao.getById(zoneId);
        if (zone == null) {
          throw new ZoneNotFoundException();
        }
        const characterObject = zone.objects.find(
          (object) =>
            object.type === ObjectType.CHARACTER &&
            object.characterId === params.characterId,
        );
        if (characterObject == null) {
          throw new CharacterNotInZoneException();
        }

        const field = findFieldByPosition(
          zone.fields,
          characterObject.position,
        );

        // If field doesn't exist that means that character is on field that was removed. In such situation always allow to leave.
        if (field && !field.canLeave) {
          throw new CannotLeaveException(
            `Field [${characterObject.position.x}, ${characterObject.position.y}] is not marked as zone exit`,
          );
        }

        zone.objects = zone.objects.filter(
          (object) =>
            object.type !== ObjectType.CHARACTER ||
            object.characterId !== params.characterId,
        );

        await this.zoneDao.update(zone);
      },
    );
  }

  async move(params: {
    characterId: number;
    destination: Position;
  }): Promise<void> {
    const zoneId = await this.zoneDao.getZoneIdByCharacterObject(
      params.characterId,
    );
    if (zoneId == null) {
      throw new CharacterNotInZoneException();
    }

    await lockService.run(
      [LOCKS.zone(zoneId), LOCKS.character(params.characterId)],
      "1s",
      async () => {
        if (await this.sceneService.isCharacterInScene(params.characterId)) {
          throw new CharacterInSceneException();
        }
        const zone = await this.zoneDao.getById(zoneId);
        if (zone == null) {
          throw new ZoneNotFoundException();
        }
        const characterObject = zone.objects.find(
          (object) =>
            object.type === ObjectType.CHARACTER &&
            object.characterId === params.characterId,
        );
        if (characterObject == null) {
          throw new CharacterNotInZoneException();
        }

        if (
          !findConnectionByConnectionKey(
            zone.connections,
            getFieldConnectionKey([
              characterObject.position,
              params.destination,
            ]),
          )
        ) {
          throw new CannotMoveException(
            "Cannot move to field that is not connected",
          );
        }

        characterObject.position = params.destination;

        await this.zoneDao.update(zone);
      },
    );
  }

  async interactWithEvent(params: {
    characterId: number;
    eventId: number;
  }): Promise<void> {
    const zoneId = await this.zoneDao.getZoneIdByCharacterObject(
      params.characterId,
    );
    if (zoneId == null) {
      throw new CharacterNotInZoneException();
    }

    await lockService.run(
      [LOCKS.zone(zoneId), LOCKS.character(params.characterId)],
      "1s",
      async () => {
        if (await this.sceneService.isCharacterInScene(params.characterId)) {
          throw new CharacterInSceneException();
        }
        const zone = await this.zoneDao.getById(zoneId);
        if (zone == null) {
          throw new ZoneNotFoundException();
        }
        const characterObject = zone.objects.find(
          (object) =>
            object.type === ObjectType.CHARACTER &&
            object.characterId === params.characterId,
        );
        if (characterObject == null) {
          throw new CharacterNotInZoneException();
        }
        const character = await this.characterService.getById(
          params.characterId,
        );

        const event = zone.objects.find(
          (object): object is EventObject =>
            object.type === ObjectType.EVENT &&
            object.eventId === params.eventId,
        );
        if (
          event == null ||
          (event.condition != null &&
            !this.expressionEvaluator.evaluateAsBoolean(
              event.condition,
              getCharacterVariables(character),
            ))
        ) {
          throw new EventNotFoundException(params.eventId);
        }
        if (event.scene == null || event.scene.steps.length === 0) {
          throw new CannotInteractWithEventException();
        }

        await this.sceneService.create({
          character,
          zone,
          definition: event.scene,
        });
      },
    );
  }

  async assertCharacterIsOwnerOfZone(
    characterId: number,
    zoneId: number,
  ): Promise<void> {
    if (!(await this.zoneDao.isCharacterOwnerOfZone(characterId, zoneId))) {
      throw new NoAccessToZoneException();
    }
  }

  private validateFields(fields: Field[]): void {
    const fieldsKeys = new Set<string>();
    for (const field of fields) {
      const fieldKey = getFieldKey(field);
      if (fieldsKeys.has(fieldKey)) {
        throw new InvalidZoneException(
          `More than two fields with position [${field.position.x}, ${field.position.y}]`,
        );
      }
      fieldsKeys.add(fieldKey);
    }
  }

  private validateConnections(
    connections: FieldConnection[],
    fields: Field[],
  ): void {
    const connectionsKeys = new Set<string>();
    for (const connection of connections) {
      if (arePositionsEqual(connection.positions[0], connection.positions[1])) {
        throw new InvalidZoneException(
          `Invalid connection from [${connection.positions[0].x}, ${connection.positions[0].y}] to [${connection.positions[1].x}, ${connection.positions[1].y}]`,
        );
      }
      if (!findFieldByPosition(fields, connection.positions[0])) {
        throw new InvalidZoneException(
          `Invalid connection to nonexistent field [${connection.positions[0].x}, ${connection.positions[0].y}]`,
        );
      }
      if (!findFieldByPosition(fields, connection.positions[1])) {
        throw new InvalidZoneException(
          `Invalid connection to nonexistent field [${connection.positions[1].x}, ${connection.positions[1].y}]`,
        );
      }
      if (
        !this.arePositionsAdjacent(
          connection.positions[0],
          connection.positions[1],
        )
      ) {
        throw new InvalidZoneException(
          `Invalid connection. Fields [${connection.positions[0].x}, ${connection.positions[0].y}] and [${connection.positions[1].x}, ${connection.positions[1].y}] are not adjacent.`,
        );
      }
      const connectionKey = getFieldConnectionKey(connection);
      if (connectionsKeys.has(connectionKey)) {
        throw new InvalidZoneException(
          `Duplicated connection from [${connection.positions[0].x}, ${connection.positions[0].y}] to [${connection.positions[1].x}, ${connection.positions[1].y}]`,
        );
      }
      connectionsKeys.add(connectionKey);
    }
  }

  private validateEntrance(entrance: Position, fields: Field[]) {
    if (findFieldByPosition(fields, entrance) == null) {
      throw new InvalidZoneException(
        `Invalid entrance. Field with position [${entrance.x}, ${entrance.y}] doesn't exist.`,
      );
    }
  }

  private validateObjects(objects: ZoneObject[], fields: Field[]) {
    for (const object of objects) {
      const field = findFieldByPosition(fields, object.position);
      if (!field) {
        throw new InvalidZoneException(
          `Object with position [${object.position.x}, ${object.position.y}] is not on any field`,
        );
      }
      this.validateEventObjects(objects);
    }
  }

  private validateEventObjects(objects: ZoneObject[]) {
    const eventsIds = objects
      .filter((object) => object.type === ObjectType.EVENT)
      .map((event) => event.eventId);

    if (hasDuplicates(eventsIds)) {
      throw new InvalidZoneException(`Two events have the same id`);
    }
  }

  private arePositionsAdjacent(
    { x: x1, y: y1 }: Position,
    { x: x2, y: y2 }: Position,
  ) {
    return (
      (x1 == x2 && Math.abs(y1 - y2) === 1) ||
      (y1 === y2 && Math.abs(x1 - x2) === 1)
    );
  }
}
