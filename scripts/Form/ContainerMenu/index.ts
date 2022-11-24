import { Player, world } from "@minecraft/server";
import { DataBase } from "../../GameStream/DataBase";
import { gameStart } from "../../GameStream/MainGame";
import { ContainerMenu } from "./ContainerMenu";
const showConfig = async (target: Player) => {
    const { selectedSlot } = await new ContainerMenu("§0入れ替わりバトロワ", 27)
        .setItem([0, 2, 4, 6], { itemKey: "soul_fire", foil: true })
        .show(target);
    if (selectedSlot === 2) {
        target.dimension.runCommandAsync("gamemode s @a");
        DataBase.setPlayingOnCode(true);
        DataBase.setPlayingOnDB(true);
        target.dimension.runCommandAsync("tag @a add playing").then(() => {
            [...world.getPlayers()].forEach((player) => {
                DataBase.set(+player.id, "playing");
            });
            gameStart();
        });
    }
};
export { showConfig };
