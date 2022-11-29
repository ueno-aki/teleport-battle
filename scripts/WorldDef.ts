import { DynamicPropertiesDefinition, world } from "@minecraft/server";

export const DEFINE_ID = {
    DB: "gamedata",
    IS_PLAYING: "isplaying",
    AUTO_MATCH: "automatch",
    OP: "op",
} as const;

world.events.worldInitialize.subscribe((ev) => {
    const worldDef = new DynamicPropertiesDefinition();
    worldDef.defineString(DEFINE_ID.DB, 4000);
    worldDef.defineBoolean(DEFINE_ID.IS_PLAYING);
    worldDef.defineBoolean(DEFINE_ID.AUTO_MATCH);
    worldDef.defineString(DEFINE_ID.OP, 4000);
    ev.propertyRegistry.registerWorldDynamicProperties(worldDef);
});
