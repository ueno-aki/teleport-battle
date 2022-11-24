import { EntityHealthComponent, Player, system, world } from "@minecraft/server";
import { randomNum } from "../util";
import { DataBase } from "./DataBase";
import { ShuffleTeleport } from "./Teleport";

let current = 0;
let nextShuffleTick: number;
const INTERVAL = 100;
const SHUFFLE_RATE = 200;
const mainGame = () => {
    if (getPlayersAlive().length < 2) {
        gameFinish();
        current = 0;
        return;
    }
    system.run(mainGame);
    current++;

    //参加してないプレイヤーに対する処理
    [...world.getPlayers()]
        .filter(
            (player) => !DataBase.existPlayerID(+player.id, "playing") && !DataBase.existPlayerID(+player.id, "dead")
        )
        .forEach((player) => {
            player
                .runCommandAsync("gamemode spectator @s")
                .then(() => DataBase.set(+player.id, "dead"))
                .catch((e) => console.error(e, e.stack));
        });
    //シャッフル
    if (current == 1) {
        nextShuffleTick = randomNum(INTERVAL, INTERVAL + SHUFFLE_RATE);
    } else if (current == nextShuffleTick) {
        ShuffleTeleport(getPlayersAlive());
        nextShuffleTick = randomNum(current + INTERVAL, current + INTERVAL + SHUFFLE_RATE);
    }
};
world.events.entityHurt.subscribe(({ hurtEntity }) => {
    if (!DataBase.isPlayingOnCode) return;
    const health = hurtEntity.getComponent("health") as EntityHealthComponent;
    if (health.current <= 0) {
        DataBase.set(+hurtEntity.id, "dead");
        DataBase.remove(+hurtEntity.id, "playing");
    }
});
function getPlayersAlive(): Array<Player> {
    return [...world.getPlayers()].filter((player) => DataBase.existPlayerID(+player.id, "playing"));
}
function gameFinish() {
    [...world.getPlayers()].forEach((player) => {
        DataBase.remove(+player.id, "playing");
        DataBase.remove(+player.id, "dead");
        player.runCommandAsync("gamemode c @s").catch((e) => console.error(e, e.stack));
    });
    DataBase.setPlayingOnCode(false);
    DataBase.setPlayingOnDB(false);
}
export const gameStart = () => {
    DataBase.setPlayingOnCode(true);
    DataBase.setPlayingOnDB(true);
    [...world.getPlayers()].forEach((player) => {
        DataBase.set(+player.id, "playing");
        player.runCommandAsync("gamemode s @s").catch((e) => console.error(e, e.stack));
    });
    system.run(mainGame);
};
