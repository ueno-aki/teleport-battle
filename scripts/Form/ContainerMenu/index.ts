import { Player } from "@minecraft/server";
import { gameStart } from "../../GameStream/MainGame";
import { ContainerMenu } from "./ContainerMenu";
const showConfig = async (target: Player) => {
    const { selectedSlot } = await new ContainerMenu("§0入れ替わりバトロワ", 27)
        .setContents({
            13: { itemKey: "clock", lore: ["game start"], foil: true },
        })
        .show(target);
    if (selectedSlot === 13) {
        gameStart();
    }
};
export { showConfig };
