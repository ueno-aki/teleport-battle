import { MinecraftItemTypes, Player, world } from "@minecraft/server";
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
