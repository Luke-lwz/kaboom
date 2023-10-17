export function findIndexCombinations(arr, targetSum) {
    const result = [];

    function backtrack(currentIndex, currentSum, currentCombination) {
        if (currentSum === targetSum) {
            console.log(targetSum)
            result.push([...currentCombination]);
            return;
        }

        for (let i = currentIndex; i < arr.length; i++) {
            if (currentSum + arr[i] <= targetSum) {
                currentCombination.push(i);
                backtrack(i + 1, currentSum + arr[i], currentCombination);
                currentCombination.pop();
            }
        }
    }

    backtrack(0, 0, []);

    return result;
}