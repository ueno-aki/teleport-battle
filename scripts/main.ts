import { EntityHealthComponent, MinecraftItemTypes, Player, world } from "@minecraft/server";
import { showConfig } from "./Form/ContainerMenu/index";
import { DataBase } from "./GameStream/DataBase";
world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (item.typeId === MinecraftItemTypes.stick.id) {
        showConfig(<Player>source);
    }
});
world.events.beforeChat.subscribe((ev) => {
    const { message, sender } = ev;
    if (message === "clear") {
        world.removeDynamicProperty("gamedata");
        world.removeDynamicProperty("isplaying");
    } else if (message === "get") {
        console.warn(
            DataBase.get().playing,
            "a",
            DataBase.get().dead,
            DataBase.isPlayingOnCode,
            DataBase.isPlayingOnDB
        );
    }
});
world.events.entityHurt.subscribe(({ hurtEntity }) => {
    if (!DataBase.isPlayingOnCode) return;
    const health = hurtEntity.getComponent("health") as EntityHealthComponent;
    if (health.current <= 0) {
        hurtEntity.removeTag("playing");
        DataBase.remove(+hurtEntity.id, "playing");
        DataBase.set(+hurtEntity.id, "dead");
    }
});
