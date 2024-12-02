import { ZoneDao } from "#dao/zone-dao";
import { InvalidZoneException } from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  arePositionsEqual,
  findFieldByPosition,
  Zone,
  ZoneField,
  ZoneFieldConnection,
  ZoneFieldPosition,
} from "bondage-fantasy-common";
import { SequenceService } from "./sequence-service.js";

@inject()
export class ZoneService {
  constructor(
    private zoneDao: ZoneDao,
    private sequenceService: SequenceService,
  ) {}

  async create(params: {
    ownerCharacterId: number;
    name: string;
    description: string;
    entrance: ZoneFieldPosition;
    fields: ZoneField[];
    connections: ZoneFieldConnection[];
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

  private validateFields(fields: ZoneField[]): void {
    const positions = new Set<string>();
    for (const field of fields) {
      const position = `${field.position.x}-${field.position.y}`;
      if (positions.has(position)) {
        throw new InvalidZoneException(
          `More than two fields with position [${field.position.x}, ${field.position.y}]`,
        );
      }
      positions.add(position);
    }
  }

  private validateConnections(
    connections: ZoneFieldConnection[],
    fields: ZoneField[],
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
      const connectionKey1 = `${connection.positions[0].x}-${connection.positions[0].y}-${connection.positions[1].x}-${connection.positions[1].y}`;
      const connectionKey2 = `${connection.positions[1].x}-${connection.positions[1].y}-${connection.positions[0].x}-${connection.positions[0].y}`;
      if (
        connectionsKeys.has(connectionKey1) ||
        connectionsKeys.has(connectionKey2)
      ) {
        throw new InvalidZoneException(
          `Duplicated connection from [${connection.positions[0].x}, ${connection.positions[0].y}] to [${connection.positions[1].x}, ${connection.positions[1].y}]`,
        );
      }
      connectionsKeys.add(connectionKey1);
      connectionsKeys.add(connectionKey2);
    }
  }

  private validateEntrance(entrance: ZoneFieldPosition, fields: ZoneField[]) {
    if (findFieldByPosition(fields, entrance) == null) {
      throw new InvalidZoneException(
        `Invalid entrance. Field with position [${entrance.x}, ${entrance.y}] doesn't exist.`,
      );
    }
  }

  private arePositionsAdjacent(
    { x: x1, y: y1 }: ZoneFieldPosition,
    { x: x2, y: y2 }: ZoneFieldPosition,
  ) {
    return (
      (x1 == x2 && Math.abs(y1 - y2) === 1) ||
      (y1 === y2 && Math.abs(x1 - x2) === 1)
    );
  }
}
