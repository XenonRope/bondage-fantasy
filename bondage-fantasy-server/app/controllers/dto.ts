import {
  Account,
  Character,
  Item,
  Scene,
  SessionData,
  Zone,
} from "bondage-fantasy-common";

export function accountDto(account: Account & { _id?: unknown }): Account {
  const { _id, password, ...rest } = account;
  return {
    ...rest,
  } as Account;
}

export function characterDto(
  character: Character & { _id?: unknown },
): Character {
  const { _id, accountId, ...rest } = character;
  return {
    ...rest,
  } as Character;
}

export function zoneDto(zone: Zone & { _id?: unknown }): Zone {
  const { _id, ...rest } = zone;
  return {
    ...rest,
  };
}

export function itemDto(item: Item & { _id?: unknown }): Item {
  const { _id, ...rest } = item;
  return {
    ...rest,
  };
}

export function sceneDto(scene: Scene & { _id?: unknown }): Scene {
  const {
    _id,
    ownerCharacterId,
    definition,
    currentStep,
    choices,
    variables,
    ...rest
  } = scene;

  return {
    ...rest,
    choices: scene.choices?.map((choice) => ({
      ...choice,
      index: undefined,
    })),
  } as Scene;
}

export function sessionDataDto(sessionData: SessionData): SessionData {
  return {
    account: sessionData.account ? accountDto(sessionData.account) : undefined,
    character: sessionData.character
      ? characterDto(sessionData.character)
      : undefined,
    zone: sessionData.zone,
    scene: sessionData.scene ? sceneDto(sessionData.scene) : undefined,
  };
}
