import { NpcDao } from "#dao/npc-dao";
import { ZoneDao } from "#dao/zone-dao";
import { ZoneObjectDao } from "#dao/zone-object-dao";
import {
  CannotLeaveException,
  CannotMoveException,
  CharacterInZoneException,
  CharacterNotInZoneException,
  InvalidZoneException,
  NoAccessToZoneException,
  ZoneIsDraftException,
  ZoneNotFoundException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  CharacterObject,
  Field,
  FieldConnection,
  findConnectionByConnectionKey,
  findFieldByPosition,
  getFieldConnectionKey,
  getFieldKey,
  hasDuplicates,
  NpcObject,
  ObjectType,
  Position,
  Zone,
  ZoneObject,
  ZoneRequestNpcObject,
  ZoneRequestObject,
} from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { NpcAccessService } from "./npc-access-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class ZoneService {
  constructor(
    private zoneDao: ZoneDao,
    private zoneObjectDao: ZoneObjectDao,
    private sequenceService: SequenceService,
    private npcAccessService: NpcAccessService,
    private npcDao: NpcDao,
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

  async create(params: {
    characterId: number;
    name: string;
    description: string;
    draft: boolean;
    entrance: Position;
    fields: Field[];
    connections: FieldConnection[];
    objects: ZoneRequestObject[];
  }): Promise<Zone> {
    this.validateFields(params.fields);
    this.validateConnections(params.connections, params.fields);
    this.validateEntrance(params.entrance, params.fields);
    this.validateObjects(params.objects, params.fields);
    await this.validateCharacterHasAccessToAllNpc(
      params.characterId,
      params.objects,
    );

    const zone: Zone = {
      id: await this.sequenceService.nextSequence(SequenceCode.ZONE),
      ownerCharacterId: params.characterId,
      name: params.name,
      description: params.description,
      draft: params.draft,
      entrance: params.entrance,
      fields: params.fields,
      connections: params.connections,
    };
    await this.zoneDao.insert(zone);

    await this.createObjects(params.objects, [], zone.id);

    return zone;
  }

  async edit(params: {
    zoneId: number;
    characterId: number;
    name: string;
    description: string;
    draft: boolean;
    entrance: Position;
    fields: Field[];
    connections: FieldConnection[];
  }): Promise<void> {
    this.validateFields(params.fields);
    this.validateConnections(params.connections, params.fields);
    this.validateEntrance(params.entrance, params.fields);
    const positions = params.fields.map((field) => field.position);

    await lockService.run(LOCKS.zone(params.zoneId), "1s", async () => {
      await this.assertCharacterIsOwnerOfZone(
        params.characterId,
        params.zoneId,
      );

      await this.zoneObjectDao.deleteManyInZoneExcludingPositions({
        zoneId: params.zoneId,
        positions,
      });
      if (params.draft) {
        await this.zoneObjectDao.deleteCharacterObjectsByZoneId(params.zoneId);
      }
      await this.zoneDao.update(params.zoneId, {
        name: params.name,
        description: params.description,
        draft: params.draft,
        entrance: params.entrance,
        fields: params.fields,
        connections: params.connections,
      });
    });
  }

  async join(params: { characterId: number; zoneId: number }): Promise<void> {
    await lockService.run(
      LOCKS.character(params.characterId),
      "1s",
      async () => {
        if (
          (await this.zoneObjectDao.getCharacterObject(params.characterId)) !=
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

        const chracterObject: CharacterObject = {
          id: await this.sequenceService.nextSequence(SequenceCode.ZONE_OBJECT),
          type: ObjectType.CHARACTER,
          zoneId: params.zoneId,
          position: zone.entrance,
          characterId: params.characterId,
        };
        await this.zoneObjectDao.insert(chracterObject);
      },
    );
  }

  async leave(params: { characterId: number }): Promise<void> {
    await lockService.run(
      LOCKS.character(params.characterId),
      "1s",
      async () => {
        const characterObject = await this.zoneObjectDao.getCharacterObject(
          params.characterId,
        );
        if (characterObject == null) {
          throw new CharacterNotInZoneException();
        }

        const zone = await this.zoneDao.getById(params.characterId);
        if (!zone) {
          throw new ZoneNotFoundException();
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

        await this.zoneObjectDao.deleteCharacterObject(params.characterId);
      },
    );
  }

  async move(params: {
    characterId: number;
    destination: Position;
  }): Promise<void> {
    await lockService.run(
      LOCKS.character(params.characterId),
      "1s",
      async () => {
        const characterObject = await this.zoneObjectDao.getCharacterObject(
          params.characterId,
        );
        if (characterObject == null) {
          throw new CharacterNotInZoneException();
        }

        const zone = await this.zoneDao.getById(characterObject.zoneId);
        if (!zone) {
          throw new ZoneNotFoundException();
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

        await this.zoneObjectDao.updatePosition(
          characterObject.id,
          params.destination,
        );
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

  private validateObjects(objects: ZoneRequestObject[], fields: Field[]) {
    for (const object of objects) {
      if (!findFieldByPosition(fields, object.position)) {
        throw new InvalidZoneException(
          `Cannot create object of field [${object.position.x}, ${object.position.y}] because the field doesn't exist`,
        );
      }
    }
    const ids = objects.map((object) => object.id).filter((id) => id != null);
    if (hasDuplicates(ids)) {
      throw new InvalidZoneException(`At least two objects have the same id`);
    }
    const npcObjects = objects.filter(
      (object) => object.type === ObjectType.NPC,
    );
    for (let i = 0; i < npcObjects.length; i++) {
      for (let j = i + 1; j < npcObjects.length; j++) {
        if (
          npcObjects[i].npcId === npcObjects[j].npcId &&
          arePositionsEqual(npcObjects[i].position, npcObjects[j].position)
        ) {
          throw new InvalidZoneException(
            `There are two NPC with id ${npcObjects[i].npcId} on field [${npcObjects[i].position.x}, {${npcObjects[i].position.y}}]`,
          );
        }
      }
    }
  }

  private async validateCharacterHasAccessToAllNpc(
    characterId: number,
    objects: ZoneRequestObject[],
  ) {
    const npcIds = objects
      .filter((object) => object.type === ObjectType.NPC)
      .map((object) => object.npcId);
    const npcList = await this.npcDao.getManyByIds(npcIds);

    for (const npc of npcList) {
      if (!this.npcAccessService.hasAccessToNpc({ characterId, npc })) {
        throw new InvalidZoneException(`No access to NPC with id ${npc.id}`);
      }
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

  private async createObjects(
    requestedObjects: ZoneRequestObject[],
    currentObjects: ZoneObject[],
    zoneId: number,
  ) {
    for (const requestedObject of requestedObjects) {
      await this.createObject(requestedObject, currentObjects, zoneId);
    }
  }

  private async createObject(
    requestedObject: ZoneRequestObject,
    currentObjects: ZoneObject[],
    zoneId: number,
  ) {
    const currentObject =
      requestedObject.id == null
        ? undefined
        : currentObjects.find(
            (object) =>
              object.id === requestedObject.id &&
              object.type === requestedObject.type,
          );
    if (requestedObject.id != null) {
      if (!currentObject) {
        throw new InvalidZoneException(
          `Object with id ${requestedObject.id} doesn't exist in zone ${zoneId}`,
        );
      }
      if (
        !arePositionsEqual(requestedObject.position, currentObject.position)
      ) {
        throw new InvalidZoneException(
          `Cannot move object with id ${currentObject.id}`,
        );
      }
    }

    switch (requestedObject.type) {
      case ObjectType.NPC:
        await this.createNpcObject(
          requestedObject,
          currentObject as NpcObject | undefined,
          zoneId,
        );
        break;
      default:
        throw new InvalidZoneException(
          `Cannot create object with type ${requestedObject.type}`,
        );
    }
  }

  private async createNpcObject(
    requestedObject: ZoneRequestNpcObject,
    currentObject: NpcObject | undefined,
    zoneId: number,
  ) {
    if (requestedObject.id != null) {
      if ((requestedObject.npcId, currentObject!.npcId)) {
        throw new InvalidZoneException(
          "Cannot change NPC id of existing NPC object",
        );
      }
    }

    const object: NpcObject = {
      id: await this.sequenceService.nextSequence(SequenceCode.ZONE_OBJECT),
      type: ObjectType.NPC,
      zoneId,
      position: requestedObject.position,
      npcId: requestedObject.npcId,
    };
    await this.zoneObjectDao.insert(object);
  }
}
