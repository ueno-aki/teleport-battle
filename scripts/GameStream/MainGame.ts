import { Player, system, world } from "@minecraft/server";
import { DataBase } from "./DataBase";
import { ShuffleTeleport } from "./Teleport";

let debugCount = 0;
const mainGame = () => {
    if (getPlayersAlive().length < 2) {
        gameFinish();
        debugCount = 0;
        return;
    }
    system.run(mainGame);
    debugCount++;

    //参加してないプレイヤーに対する処理
    [...world.getPlayers()]
        .filter((player) => !player.hasTag("playing") && !player.hasTag("spectator"))
        .forEach((player) => {
            player
                .runCommandAsync("gamemode spectator @s")
                .then(() => player.addTag("spectator"))
                .catch((e) => console.error(e, e.stack));
        });
    //シャッフル
    if (debugCount % 100 == 0) {
        ShuffleTeleport(getPlayersAlive());
    }
};
function getPlayersAlive(): Array<Player> {
    return [...world.getPlayers({ tags: ["playing"] })];
}
function gameFinish() {
    [...world.getPlayers()].forEach((player) => {
        player.removeTag("playing");
        player.removeTag("spectator");
        DataBase.remove(+player.id, "playing");
        DataBase.remove(+player.id, "dead");
        player.runCommandAsync("gamemode c @s").catch((e) => console.error(e, e.stack));
    });
    DataBase.setPlayingOnCode(false);
    DataBase.setPlayingOnDB(false);
}
export const gameStart = () => system.run(mainGame);
