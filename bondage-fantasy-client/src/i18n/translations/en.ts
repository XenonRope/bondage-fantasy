import { ResourceLanguage } from "i18next";

export const en: ResourceLanguage = {
  translation: {
    "common.language.en": "English",
    "common.language.pl": "Polish",
    "common.username": "Username",
    "common.password": "Password",
    "common.characterName": "Character name",
    "common.characterNameShort": "Name",
    "common.pronouns": "Pronouns",
    "common.genitals": "Genitals",
    "common.or": "or",
    "common.fieldCannotBeEmpty": "Field cannot be empty",
    "common.fieldTooShort": "Field must have at least {{minLength}} characters",
    "common.fieldTooLong":
      "Field cannot have more than {{maxLength}} characters",
    "common.invalidExpression": "Invalid expression",
    "common.logIn": "Log in",
    "common.logOut": "Log out",
    "common.createNewAccount": "Create new account",
    "common.createNewZone": "Create new zone",
    "common.name": "Name",
    "common.description": "Description",
    "common.search": "Search",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.remove": "Remove",
    "common.condition": "Condition",
    "common.confirm": "Confirm",
    "common.item": "Item",
    "common.uploadImage": "Upload image",
    "common.removeImage": "Remove image",
    "common.fileTooLarge": "File is too large",
    "common.scene": "Scene",
    "common.recommendedImageData":
      "Recommended image resolutation: {{width}}x{{height}}. Max size: {{maxSize}}.",
    "common.removeWearable": "Remove",
    "navbar.characters": "Characters",
    "navbar.zones": "Zones",
    "navbar.explore": "Explore",
    "navbar.crafting": "Crafting",
    "navbar.inventory": "Inventory",
    "pronouns.SHE_HER": "She/Her",
    "pronouns.HE_HIM": "He/Him",
    "genitals.VAGINA": "Vagina",
    "genitals.PENIS": "Penis",
    "genitals.FUTA": "Futa",
    "error.expressionParser.INVALID_SYNTAX": "Invalid syntax",
    "error.expressionParser.INVALID_OPERATOR":
      "{{operator}} is not valid operator",
    "error.expressionParser.INVALID_NUMBER_OF_ARGUMENTS":
      "Invalid number of arguments for operator {{operator}}. Expected {{expected}} but was {{actual}}.",
    "error.unexpecterError": "Unexpected error",
    "error.errorMessage": 'Error code: {{code}}. Message: "{{message}}".',
    "error.somethingWentWrong": "Something went wrong...",
    "accountRegistration.createAccount": "Create account",
    "accountRegistration.usernameTooShort":
      "Username must have at least {{minLength}} characters",
    "accountRegistration.usernameTooLong":
      "Username cannot have more than {{maxLength}} characters",
    "accountRegistration.usernameInvalidFormat":
      "Username must start with letter and can only contain letters A-Z and digits",
    "accountRegistration.usernameWasAlreadyTaken":
      'Username "{{username}}" was already taken',
    "accountRegistration.passwordTooShort":
      "Password must have at least {{minLength}} characters",
    "accountRegistration.passwordTooLong":
      "Password cannot have more than {{maxLength}} characters",
    "loginForm.invalidUsernameOrPassword": "Invalid username or password",
    "loginForm.usernameCannotBeEmpty": "Username cannot be empty",
    "loginForm.passwordCannotBeEmpty": "Password cannot be empty",
    "characterCreation.nameIsTooLong":
      "Name cannot have more than {{maxLength}} characters",
    "characterCreation.createCharacter": "Create character",
    "characterList.createNewCharacter": "Create new character",
    "zone.private": "Private",
    "zoneCreation.createZone": "Create zone",
    "zoneCreation.zoneCreated": "Zone was created",
    "zoneCreation.saveZone": "Save zone",
    "zoneCreation.zoneSaved": "Zone was saved",
    "zoneCreation.removeField": "Remove field",
    "zoneCreation.allowToLeaveZoneOnThisField":
      "Allow to leave zone on this field",
    "zoneCreation.setAsEntrance": "Set as entrance",
    "zoneCreation.removeConnection": "Remove connection",
    "zoneCreation.yourZoneHasNoEntrance":
      "Your zone has no entrance. You should decide on which field your guests will start their adventure.",
    "zoneCreation.tabs.basic": "Basic",
    "zoneCreation.tabs.map": "Map",
    "zoneCreation.tabs.event": "Event",
    "zoneCreation.addEvent": "Add event",
    "zoneCreation.saveEvent": "Save event",
    "zoneCreation.eventCountLimitReached.title": "Limit of events reached",
    "zoneCreation.eventCountLimitReached.message":
      "You cannot add more than {{eventMaxCount}} events",
    "zoneCreation.showConditionally": "Show conditionally",
    "zoneList.join": "Join",
    "zoneList.edit": "Edit",
    "explore.leave": "Leave",
    "explore.move": "Move",
    "explore.interact": "Interact",
    "explore.scene.next": "Next",
    "scene.text": "Text",
    "scene.label": "Label",
    "scene.jumpConditionally": "Jump conditionally",
    "scene.variableName": "Variable name",
    "scene.variableValue": "Variable value",
    "scene.variableGlobal": "Global",
    "scene.addStep": "Add step",
    "scene.stepTitle": "Step: {{stepType}}",
    "scene.addChoiceOption": "Add option",
    "scene.choiceOptionName": "Name",
    "scene.choiceOptionLabel": "Jump to label",
    "scene.choiceOptionShowConditionally": "Show conditionally",
    "scene.bodyParts": "Body parts",
    "scene.fallbackLabel": "Fallback label",
    "scene.wearables": "Wearables",
    "scene.itemDelta": "By how much to increase/decrease the number of items",
    "scene.type.TEXT": "Text",
    "scene.type.LABEL": "Label",
    "scene.type.JUMP": "Jump",
    "scene.type.VARIABLE": "Variable",
    "scene.type.CHOICE": "Choice",
    "scene.type.ABORT": "Abort",
    "scene.type.USE_WEARABLE": "Use wearable",
    "scene.type.REMOVE_WEARABLE": "Remove wearable",
    "scene.type.CHANGE_ITEMS_COUNT": "Change items count",
    "scene.pause": "Pause",
    "scene.pauseMode.AUTO": "Auto",
    "scene.pauseMode.ALWAYS": "Always",
    "scene.pauseMode.NEVER": "Never",
    "item.createNewItem": "Create new item",
    "item.modifyItem": "Modify item",
    "item.createItem": "Create item",
    "item.slots": "Slots",
    "item.type": "Type",
    "item.types.WEARABLE": "Wearable",
    "item.types.STORABLE": "Storable",
    "item.slots.OUTFIT": "Outfit",
    "item.slots.ARMS": "Arms",
    "item.slots.LEGS": "Legs",
    "item.slots.FEET": "Feet",
    "item.slots.MOUTH": "Mouth",
    "item.slots.EYES": "Eyes",
    "item.wear": "Wear",
  },
};
