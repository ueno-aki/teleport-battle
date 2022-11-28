import { MinecraftItemTypes, Player, world } from "@minecraft/server";
import { showConfigMenu } from "./Form/src/index";
import { MainGameDB, Spectators } from "./GameStream/DataBase";
import { CountDownStream, MainGameStream } from "./GameStream/Stream";
import { isAdministrator } from "./util/util";
world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (!isAdministrator(<Player>source)) return;
    if (item.typeId === MinecraftItemTypes.compass.id) {
        showConfigMenu(<Player>source);
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
            [Spectators]:${[...Spectators]}
            [autoMatch]${MainGameStream.autoMatchEnable}`
        );
    }
});
