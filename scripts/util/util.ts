import { Player, world } from "@minecraft/server";

const isAdministrator = (target: Player): boolean => +target.id === -4294967295;

const randomNum = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

/** シャッフルされた配列が帰ってくる */
const ShuffleArray = <T>(arr: Array<T>, shuffleCount: number = 0): Array<T> => {
    let copy = arr;
    for (let i = 0; i <= shuffleCount; i++) {
        const former = randomNum(0, arr.length - 1);
        const latter = randomNum(0, arr.length - 1);

        let valueTemp = copy[former];
        copy[former] = arr[latter];
        copy[latter] = valueTemp;
    }
    return copy;
};
type playerCall = (target: Player) => void;

/**
 * 
 * @param task 関数
 * @param filter  ``` <Array>.filter(v => <boolean>) ```のこれ
 * 
## Example
```ts 
　Execute(
　    (player) => {
　        player.tell('Hello' + player.name + '!!!');
　    },
　    (player) => player.hasTag("hello")
　);
```
 */
const Execute = (task: playerCall | Array<playerCall>, filter: (target: Player) => boolean = () => true) => {
    [...world.getPlayers()].filter(filter).forEach((player) => {
        if (Array.isArray(task)) {
            task.forEach((func) => {
                func.call(null, player);
            });
        } else {
            task.call(null, player);
        }
    });
};
export { randomNum, ShuffleArray, Execute, isAdministrator as isOP };
