import { MinecraftItemTypes, Player, world } from "@minecraft/server";
import { showConfigMenu } from "./Form/src/index";
import { MainGameDB, Spectators } from "./GameStream/DataBase";
import { CountDownStream, MainGameStream } from "./GameStream/Stream";
import { OP } from "./util/OP";
import { isAdministrator } from "./util/util";
import { DEFINE_ID } from "./WorldDef";
world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (!(OP.isRegistered(<Player>source) || isAdministrator(<Player>source))) return;
    if (item.typeId === MinecraftItemTypes.compass.id) {
        showConfigMenu(<Player>source);
    }
});
world.events.beforeChat.subscribe((ev) => {
    const { message } = ev;
    /* debug */
    if (message === "clear") {
        world.removeDynamicProperty(DEFINE_ID.DB);
        world.removeDynamicProperty(DEFINE_ID.IS_PLAYING);
        world.removeDynamicProperty(DEFINE_ID.AUTO_MATCH);
        world.removeDynamicProperty(DEFINE_ID.OP);
        MainGameStream.setPlayingBit(false);
    } else if (message === "get") {
        console.warn(
            `[Main]playing:${MainGameDB.get().playing},dead:${MainGameDB.get().dead},
            [CountDown]:${CountDownStream.isCountDown},
            [PlayingBit]onCode:${MainGameStream.isPlaying},OnDB:${MainGameStream.isPlayingOnDB}
            [Spectators]:${[...Spectators]}
            [autoMatch]${MainGameStream.autoMatchEnable}
            [op]${OP.get().players}`
        );
    }
});
