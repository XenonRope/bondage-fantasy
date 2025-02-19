import { CharacterDao } from "#dao/character-dao";
import {
  CannotWearItemException,
  CharacterNotFoundException,
  TooManyCharactersException,
} from "#exceptions/exceptions";
import { SequenceCode } from "#models/sequence-model";
import { inject } from "@adonisjs/core";
import {
  Character,
  CHARACTERS_MAX_COUNT,
  Genitals,
  hasDuplicates,
  ItemSlot,
  ItemType,
  Pronouns,
  WearableItem,
  WearableItemOnCharacter,
} from "bondage-fantasy-common";
import { ItemService } from "./item-service.js";
import lockService, { LOCKS } from "./lock-service.js";
import { SequenceService } from "./sequence-service.js";

@inject()
export default class CharacterService {
  constructor(
    private characterDao: CharacterDao,
    private sequenceService: SequenceService,
    private itemService: ItemService,
  ) {}

  async getById(id: number): Promise<Character> {
    const character = await this.characterDao.getById(id);
    if (character == null) {
      throw new CharacterNotFoundException();
    }
    return character;
  }

  async create(params: {
    accountId: number;
    name: string;
    pronouns: Pronouns;
    genitals: Genitals;
  }): Promise<Character> {
    return await lockService.run(
      LOCKS.account(params.accountId),
      "1s",
      async () => {
        const charactersCount = await this.characterDao.countByAccountId(
          params.accountId,
        );
        if (charactersCount >= CHARACTERS_MAX_COUNT) {
          throw new TooManyCharactersException();
        }

        const character: Character = {
          id: await this.sequenceService.nextSequence(SequenceCode.CHARACTER),
          accountId: params.accountId,
          name: params.name,
          pronouns: params.pronouns,
          genitals: params.genitals,
          wearables: [],
          inventory: [],
        };

        await this.characterDao.insert(character);

        return character;
      },
    );
  }

  async wearItem(params: {
    characterId: number;
    itemId: number;
  }): Promise<void> {
    return await lockService.run(
      LOCKS.character(params.characterId),
      "1s",
      async () => {
        const character = await this.getById(params.characterId);
        const item = await this.itemService.getById(params.itemId, {
          checkAccessForCharacterId: params.characterId,
        });
        if (item.type !== ItemType.WEARABLE) {
          throw new CannotWearItemException(`Item ${item.id} is not wearable`);
        }
        const itemWorn = this.wearItemsOnCharacter(character, [item]);
        if (!itemWorn) {
          throw new CannotWearItemException(
            `Item ${item.id} was not worn successfully`,
          );
        }
        await this.characterDao.update(character);
      },
    );
  }

  wearItemsOnCharacter(character: Character, items: WearableItem[]): boolean {
    const wearablesToAdd: WearableItemOnCharacter[] = items.map((wearable) => ({
      itemId: wearable.id,
      name: wearable.name,
      description: wearable.description,
      imageKey: wearable.imageKey,
      slots: wearable.slots,
    }));
    const slots = wearablesToAdd.flatMap((wearable) => wearable.slots);
    if (hasDuplicates(slots)) {
      return false;
    }
    character.wearables = character.wearables.filter(
      (wearable) => !wearable.slots.some((slot) => slots.includes(slot)),
    );
    character.wearables.push(...wearablesToAdd);
    return true;
  }

  async removeWearables(characterId: number, slots: ItemSlot[]): Promise<void> {
    return await lockService.run(
      LOCKS.character(characterId),
      "1s",
      async () => {
        const character = await this.getById(characterId);
        const removed = this.removeWearablesFromCharacter(character, slots);
        if (removed) {
          await this.characterDao.update(character);
        }
      },
    );
  }

  removeWearablesFromCharacter(
    character: Character,
    slots: ItemSlot[],
  ): boolean {
    const newWearables = character.wearables.filter(
      (wearable) => !wearable.slots.some((slot) => slots.includes(slot)),
    );
    if (character.wearables.length === newWearables.length) {
      return false;
    }
    character.wearables = newWearables;
    return true;
  }
}
