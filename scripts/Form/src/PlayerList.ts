import { Player, world } from "@minecraft/server";
import { showConfigMenu } from ".";
import { MainGameDB } from "../../GameStream/DataBase";
import { MainGameStream } from "../../GameStream/Stream";
import { isAdministrator } from "../../util/util";
import { ContainerMenu } from "../ContainerMenu/index";

export async function showPlayerList(target: Player) {
    const players = [...world.getPlayers()];
    const playerList = new ContainerMenu("プレイヤーリスト", players.length + 9);
    playerList.setItem(-1, { itemKey: "portal", lore: ["更新する"] });
    if (MainGameStream.isPlaying) {
        players.forEach((player, index) => {
            playerList.setItem(index, {
                itemKey: MainGameDB.existPlayerID(+player.id, "playing") ? "lit_pumpkin" : "carved_pumpkin",
                lore: [
                    player.name,
                    `現在${MainGameDB.existPlayerID(+player.id, "playing") ? "§e生存中" : "§b観戦中"}`,
                    "",
                    "§7§oクリックして詳細を見る",
                ],
                foil: isAdministrator(player),
            });
        });
        const { selectedItem, canceled, selectedSlot } = await playerList.show(target);
        if (canceled) showConfigMenu(target);
        else if (!selectedItem || selectedSlot === playerList.size - 1 /*portal*/) showPlayerList(target);
    } else {
        players.forEach((player, index) => {
            playerList.setItem(index, {
                itemKey: "carved_pumpkin",
                lore: [player.name, "", "§7§oクリックして詳細を見る"],
                foil: isAdministrator(player),
            });
        });
        const { selectedItem, canceled, selectedSlot } = await playerList.show(target);
        if (canceled) showConfigMenu(target);
        else if (!selectedItem || selectedSlot === playerList.size - 1 /*portal*/) showPlayerList(target);
    }
}
