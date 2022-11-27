import { EntityHealthComponent, Player, system, world } from "@minecraft/server";
import { Execute, randomNum } from "../util/util";
import { MainGameDB, Spectators } from "./DataBase";
import { MainGameStream } from "./Stream";
import { ShuffleTeleport } from "../util/Teleport";

const INTERVAL = 100;
const SHUFFLE_RATE = 200;

let current = 0;
let nextShuffleTick: number;

const mainGame = () => {
    if (!MainGameStream.isPlaying || getPlayersAlive().length < 2) {
        getPlayersAlive().length < 2 && gameFinish();
        current = 0;
        return;
    }
    ShiftPlayingToDeadForLeftPlayer();
    current++;
    system.run(mainGame);

    //戦ってないプレイヤー
    Execute(
        (player) => {
            /** ワールドに入ってきて死んでない人に参加付与、ただし途中参加オンのとき */
            if (MainGameStream.autoMatchEnable && !MainGameDB.existPlayerID(+player.id, "dead")) {
                player
                    .runCommandAsync("gamemode s @s")
                    .then(() => MainGameDB.set(+player.id, "playing"))
                    .catch((e) => console.error(e, e.stack));
            } /* 死人は観戦 */ else {
                player
                    .runCommandAsync("gamemode spectator @s")
                    .then(() => {
                        Spectators.add(+player.id);
                        if (!MainGameDB.existPlayerID(+player.id, "dead")) MainGameDB.set(+player.id, "dead");
                    })
                    .catch((e) => console.error(e, e.stack));
            }
        },
        (target) => !MainGameDB.existPlayerID(+target.id, "playing") && !Spectators.has(+target.id)
    );
    //シャッフル
    if (current == 1) {
        nextShuffleTick = randomNum(INTERVAL, INTERVAL + SHUFFLE_RATE);
    } else if (current == nextShuffleTick) {
        ShuffleTeleport(getPlayersAlive());
        nextShuffleTick = randomNum(current + INTERVAL, current + INTERVAL + SHUFFLE_RATE);
    }
};
world.events.entityHurt.subscribe(({ hurtEntity }) => {
    if (!MainGameStream.isPlaying || !MainGameDB.existPlayerID(+(hurtEntity as Player).id, "playing")) return;
    const health = hurtEntity.getComponent("health") as EntityHealthComponent;
    if (health.current <= 0) {
        MainGameDB.set(+hurtEntity.id, "dead");
        MainGameDB.remove(+hurtEntity.id, "playing");
    }
});
function getPlayersAlive(): Array<Player> {
    return [...world.getPlayers()].filter((player) => MainGameDB.existPlayerID(+player.id, "playing"));
}
/** 試合中に抜けたらplayingからdeadに移す */
function ShiftPlayingToDeadForLeftPlayer(): void {
    MainGameDB.get().playing.forEach((v) => {
        if (![...world.getPlayers()].some((player) => +player.id == v)) {
            MainGameDB.remove(v, "playing");
            MainGameDB.set(v, "dead");
        }
    });
}
function gameFinish() {
    const winner = getPlayersAlive()?.[0];
    if (winner) {
        Execute((target) => {
            target.onScreenDisplay.setTitle("FINISH");
            target.tell(`Winner:${winner.name}`);
            target.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack));
        });
    } else {
        Execute((target) => {
            target.onScreenDisplay.setTitle("§l全員死!");
            target.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack));
        });
    }
    MainGameDB.reset("playing");
    MainGameDB.reset("dead");
    MainGameStream.setPlayingBit(false);
    MainGameStream.setPlayingOnDB(false);
    Spectators.clear();
}
export function gameStart(resumeBit: /*試合再開*/ boolean = false) {
    MainGameStream.setPlayingBit(true);
    MainGameStream.setPlayingOnDB(true);
    MainGameDB.reset("playing");
    Spectators.clear();
    if (!resumeBit) MainGameDB.reset("dead");
    Execute(
        (player) => {
            MainGameDB.set(+player.id, "playing");
            player.runCommandAsync("gamemode s @s").catch((e) => console.error(e, e.stack));
        },
        // resumeBit ? 死んでる人以外 : 全員
        (player) => !resumeBit || !MainGameDB.existPlayerID(+player.id, "dead")
    );
    system.run(mainGame);
}
export function gameSuspend() {
    MainGameStream.setPlayingBit(false);
    Spectators.clear();
    Execute((player) => {
        player.onScreenDisplay.setTitle("FINISH");
        player.tell(`試合を中断しました.`);
        player.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack));
    });
}
