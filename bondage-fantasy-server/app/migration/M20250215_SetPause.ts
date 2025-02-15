import {
  MigrationScript,
  MigrationScriptParams,
} from "#models/migration-model";
import {
  ObjectType,
  ScenePauseMode,
  SceneStepType,
} from "bondage-fantasy-common";

export default class M20250215_SetPause implements MigrationScript {
  id = "M20250215_SetPause";

  async run({ db }: MigrationScriptParams): Promise<void> {
    const scenes = await db.collection("scenes").find().toArray();
    for (const scene of scenes) {
      let modified = false;

      for (const step of scene.definition.steps) {
        if (step.type === SceneStepType.TEXT && step.pause == null) {
          step.pause = ScenePauseMode.AUTO;
          modified = true;
        }
      }

      if (modified) {
        await db
          .collection("scenes")
          .updateOne({ _id: scene._id }, { $set: scene });
      }
    }

    const zones = await db.collection("zones").find().toArray();
    for (const zone of zones) {
      let modified = false;

      for (const object of zone.objects) {
        if (object.type === ObjectType.EVENT && object.scene) {
          for (const step of object.scene.steps) {
            if (step.type === SceneStepType.TEXT && step.pause == null) {
              step.pause = ScenePauseMode.AUTO;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        await db
          .collection("zones")
          .updateOne({ _id: zone._id }, { $set: zone });
      }
    }
  }
}
