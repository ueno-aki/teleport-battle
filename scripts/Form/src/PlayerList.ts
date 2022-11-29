import { Player, world } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { showConfigMenu } from "./index";
import { MainGameDB } from "../../GameStream/DataBase";
import { MainGameStream } from "../../GameStream/Stream";
import { OP } from "../../util/OP";
import { Execute, isAdministrator } from "../../util/util";
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
                    player.id,
                    "§7§oクリックしてTP",
                ],
                foil: OP.isRegistered(player) || isAdministrator(player),
            });
        });
        const { selectedItem, canceled, selectedSlot } = await playerList.show(target);
        if (canceled) showConfigMenu(target);
        else if (!selectedItem || selectedSlot === playerList.size - 1 /*portal*/) showPlayerList(target);
        else {
            Execute(
                ({ dimension, location }) => target.teleport(location, dimension, 0, 0),
                ({ id }) => id === selectedItem?.lore?.[3]
            );
        }
    } else {
        players.forEach((player, index) => {
            playerList.setItem(index, {
                itemKey: "carved_pumpkin",
                lore: [
                    `§l${player.name}`,
                    "",
                    player.id,
                    `  --§7§oクリックでOP権限を${OP.isRegistered(player) ? "剥奪" : "付与"}する.`,
                ],
                foil: OP.isRegistered(player) || isAdministrator(player),
            });
        });
        const { selectedItem, canceled, selectedSlot } = await playerList.show(target);
        if (canceled) showConfigMenu(target);
        else if (!selectedItem || selectedSlot === playerList.size - 1 /*portal*/) showPlayerList(target);
        else
            Execute(
                (player) => {
                    if (OP.isRegistered(player)) layOffConfirm(target, player);
                    else AuthorityConfirm(target, player);
                },
                ({ id }) => id === selectedItem?.lore?.[2]
            );
    }
}

async function AuthorityConfirm(target: Player, content: Player) {
    const { selection } = await new MessageFormData()
        .button1("YES")
        .button2("NO")
        .title("§c確認")
        .body(`${content.name}にOP権限を付与しますか？\nOP権限者はワールド内の本アドオンの設定を変更できます`)
        .show(target);
    if (selection === 1) OP.register(content);
    showConfigMenu(target);
}

async function layOffConfirm(target: Player, content: Player) {
    const { selection } = await new MessageFormData()
        .button1("YES")
        .button2("NO")
        .title("§c確認")
        .body(`${content.name}のOP権限を剥奪しますか？`)
        .show(target);
    if (selection === 1) OP.layOff(content);
    showConfigMenu(target);
}
