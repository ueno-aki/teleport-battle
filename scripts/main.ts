import { Player, world } from "@minecraft/server";
import { showMainMenu } from "./Form/ContainerMenu/index";
world.events.beforeItemUseOn.subscribe((ev) => {
    const { blockLocation, source, item } = ev;
    const block = source.dimension.getBlock(blockLocation);
    if (block.typeId === "minecraft:chest" || block.typeId === "minecraft:brewing_stand") {
        ev.cancel = true;
        showMainMenu(<Player>source);
    }
});
