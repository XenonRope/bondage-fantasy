import {
  Account,
  Character,
  Field,
  FieldConnection,
  Npc,
  Position,
  SessionData,
  Zone
} from "bondage-fantasy-common";

export function accountDto(account: Account): Account {
  const dto: Omit<Account, "password"> = {
    id: account.id,
    username: account.username,
  };

  return dto as Account;
}

export function characterDto(character: Character): Character {
  const dto: Omit<Character, "accountId"> = {
    id: character.id,
    name: character.name,
    pronouns: character.pronouns,
    genitals: character.genitals,
  };

  return dto as Character;
}

export function positionDto(position: Position): Position {
  return {
    x: position.x,
    y: position.y,
  };
}

export function zoneFieldDto(field: Field): Field {
  return {
    position: positionDto(field.position),
    name: field.name,
    description: field.description,
    canLeave: field.canLeave,
  };
}

export function zoneFieldConnectionDto(
  connection: FieldConnection,
): FieldConnection {
  return {
    positions: [
      positionDto(connection.positions[0]),
      positionDto(connection.positions[1]),
    ],
  };
}

export function zoneDto(zone: Zone): Zone {
  return {
    id: zone.id,
    ownerCharacterId: zone.ownerCharacterId,
    name: zone.name,
    description: zone.description,
    draft: zone.draft,
    entrance: zone.entrance,
    fields: zone.fields.map(zoneFieldDto),
    connections: zone.connections.map(zoneFieldConnectionDto),
  };
}

export function sessionDataDto(sessionData: SessionData): SessionData {
  return {
    account: sessionData.account ? accountDto(sessionData.account) : undefined,
    character: sessionData.character
      ? characterDto(sessionData.character)
      : undefined,
    zone: sessionData.zone,
  };
}

export function npcDto(npc: Npc): Npc {
  return {
    id: npc.id,
    ownerCharacterId: npc.ownerCharacterId,
    name: npc.name,
  };
}
