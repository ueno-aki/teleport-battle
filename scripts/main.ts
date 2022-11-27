import { MinecraftItemTypes, Player, world } from "@minecraft/server";
import { showMainMenu } from "./Form/ContainerMenu/index";
import { MainGameDB, Spectators } from "./GameStream/DataBase";
import { CountDownStream, MainGameStream } from "./GameStream/Stream";
import { isOP } from "./util/util";
world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (!isOP(<Player>source)) return;
    if (item.typeId === MinecraftItemTypes.compass.id) {
        showMainMenu(<Player>source);
    }
});
world.events.beforeChat.subscribe((ev) => {
    const { message } = ev;
    /* debug */
    if (message === "clear") {
        world.removeDynamicProperty("gamedata");
        world.removeDynamicProperty("isplaying");
        world.removeDynamicProperty("automatch");
        MainGameStream.setPlayingBit(false);
    } else if (message === "get") {
        console.warn(
            `[Main]playing:${MainGameDB.get().playing},dead:${MainGameDB.get().dead},
            [CountDown]:${CountDownStream.isCountDown},
            [PlayingBit]onCode:${MainGameStream.isPlaying},OnDB:${MainGameStream.isPlayingOnDB}
            [Spectators]:${[...Spectators]}`
        );
    } else if (message === "reverse") {
        MainGameStream.setAutoMatchEnable(!MainGameStream.autoMatchEnable);
        console.warn(`[autoMatch]${MainGameStream.autoMatchEnable}`);
    }
});
