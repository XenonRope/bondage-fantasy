import { ZoneDao } from "#dao/zone-dao";
import { ZoneObjectDao } from "#dao/zone-object-dao";
import {
  CannotLeaveException,
  CharacterInZoneException,
  CharacterNotInZoneException,
  InvalidZoneException,
  ZoneNotFoundException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  CharacterObject,
  Field,
  FieldConnection,
  findFieldByPosition,
  getFieldConnectionKey,
  getFieldKey,
  ObjectType,
  Position,
  Zone,
} from "bondage-fantasy-common";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export class ZoneService {
  constructor(
    private zoneDao: ZoneDao,
    private zoneObjectDao: ZoneObjectDao,
    private sequenceService: SequenceService,
  ) {}

  async create(params: {
    ownerCharacterId: number;
    name: string;
    description: string;
    entrance: Position;
    fields: Field[];
    connections: FieldConnection[];
  }): Promise<Zone> {
    this.validateFields(params.fields);
    this.validateConnections(params.connections, params.fields);
    this.validateEntrance(params.entrance, params.fields);

    const zone: Zone = {
      ownerCharacterId: params.ownerCharacterId,
      id: await this.sequenceService.nextSequence(SequenceCode.ZONE),
      name: params.name,
      description: params.description,
      entrance: params.entrance,
      fields: params.fields,
      connections: params.connections,
    };

    await this.zoneDao.insert(zone);

    return zone;
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

        const zone = await this.zoneDao.getById(params.zoneId);
        if (!zone) {
          throw new ZoneNotFoundException();
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
