import { Player } from "@minecraft/server";
import { CountDownStream, MainGameStream } from "../../GameStream/Stream";
import { configMenus } from "./ConfigMenus";
export const showConfigMenu = async (target: Player) => {
    if (CountDownStream.isCountDown || MainGameStream.isPlaying) {
        configMenus.Suspend(target);
    } else if (!MainGameStream.isPlaying && MainGameStream.isPlayingOnDB) {
        configMenus.Resume(target);
    } else {
        configMenus.Default(target);
    }
};
