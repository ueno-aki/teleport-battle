import { system, world } from "@minecraft/server";
import { ShuffleTeleport } from "../util/index";

let debugCount = 0;
let debugMax = 400;
const mainGame = () => {
    if (++debugCount >= debugMax) return;
    system.run(mainGame);

    const players = [...world.getPlayers()];
    //参加してないプレイヤーに対する処理
    players
        .filter((player) => !player.hasTag("playing") && !player.hasTag("spectator"))
        .forEach((player) => {
            player
                .runCommandAsync("gamemode spectator @s")
                .then(() => player.addTag("spectator"))
                .catch((e) => console.error(e, e.stack));
        });
    if (debugCount % 100) {
        ShuffleTeleport([...world.getPlayers({ tags: ["playing"] })]);
    }
};
