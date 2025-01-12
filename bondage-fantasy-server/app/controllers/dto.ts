import {
  Account,
  Character,
  Scene,
  SceneDefinition,
  SessionData,
} from "bondage-fantasy-common";

export function accountDto(account: Account): Account {
  return {
    ...account,
    password: undefined as unknown as string,
  };
}

export function characterDto(character: Character): Character {
  return { ...character, accountId: undefined as unknown as number };
}

export function sceneDto(scene: Scene): Scene {
  return {
    ...scene,
    definition: undefined as unknown as SceneDefinition,
    currentStep: undefined as unknown as number,
    choices: scene.choices?.map((choice) => ({
      ...choice,
      index: undefined as unknown as number,
    })),
    variables: undefined as unknown as Record<string, string>,
  };
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
