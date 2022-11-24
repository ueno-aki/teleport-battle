const randomNum = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

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
export { randomNum, ShuffleArray };
