import {
  Account,
  Character,
  Zone,
  ZoneField,
  ZoneFieldConnection,
  ZoneFieldPosition,
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

export function zoneFieldPositionDto(
  position: ZoneFieldPosition,
): ZoneFieldPosition {
  return {
    x: position.x,
    y: position.y,
  };
}

export function zoneFieldDto(field: ZoneField): ZoneField {
  return {
    position: zoneFieldPositionDto(field.position),
    name: field.name,
    description: field.description,
  };
}

export function zoneFieldConnectionDto(
  connection: ZoneFieldConnection,
): ZoneFieldConnection {
  return {
    positions: [
      zoneFieldPositionDto(connection.positions[0]),
      zoneFieldPositionDto(connection.positions[1]),
    ],
  };
}

export function zoneDto(zone: Zone): Zone {
  return {
    id: zone.id,
    ownerCharacterId: zone.ownerCharacterId,
    name: zone.name,
    description: zone.description,
    fields: zone.fields.map(zoneFieldDto),
    connections: zone.connections.map(zoneFieldConnectionDto),
  };
}
