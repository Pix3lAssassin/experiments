class QueueElement {
    value;
    priority;
    constructor(value, priority) {
        this.value = value;
        this.priority = priority;
    }
}
class PQueue {
    items;
    constructor() {
        this.items = [];
    }
    enqueue(value, priority) {
        const qElement = new QueueElement(value, priority);
        let contain = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > priority) {
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }
        if (!contain)
            this.items.push(qElement);
    }
    dequeue() {
        if (this.isEmpty())
            return null;
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
    length() {
        return this.items.length;
    }
}
class BinaryTree {
    value;
    left;
    right;
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
    dfs(callback, currentNode = this, position = -1, depth = 0) {
        if (currentNode === null) {
            return;
        }
        callback(currentNode.value, position, depth);
        currentNode.dfs(callback, currentNode.left, position < 0 ? 0 : (position >>> 0) << 1, depth + 1);
        currentNode.dfs(callback, currentNode.right, position < 0 ? 1 : (position >>> 0) << (1 + 1), depth + 1);
    }
    bfs(callback) {
        const queue = [this];
        while (queue.length > 0) {
            const node = queue.shift();
            callback(node.value);
            if (node.left) {
                queue.push(node.left);
            }
            if (node.right) {
                queue.push(node.right);
            }
        }
    }
}
export const encodeHuffman = (str) => {
    const buffer = [];
    const codeArr = [];
    const count = {};
    const queue = new PQueue();
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        codeArr.push(code);
        if (count[code] != null) {
            count[code]++;
        }
        else {
            count[code] = 1;
        }
    }
    const codes = Object.keys(count);
    codes.forEach((code) => {
        queue.enqueue(new BinaryTree(Number(code)), count[code]);
    });
    let treeData = null;
    while (!queue.isEmpty()) {
        const leftNode = queue.dequeue();
        const rightNode = queue.dequeue();
        const priority = (leftNode?.priority || 0) + (rightNode?.priority || 0);
        const tree = new BinaryTree(null);
        tree.left = leftNode?.value ?? null;
        tree.right = rightNode?.value ?? null;
        if (!queue.isEmpty()) {
            queue.enqueue(tree, priority);
        }
        else {
            treeData = tree;
        }
    }
    const map = {};
    treeData.dfs((value, position, depth) => {
        if (value !== null) {
            map[value] = [position, depth];
        }
    });
    treeData.bfs((value) => {
        buffer.push(value ? value & 255 : 0);
    });
    buffer.push(2);
    let bitCount = 0;
    codeArr.forEach((value) => {
        bitCount += map[value][1];
    });
    let position = 8 - (bitCount % 8);
    let byte = position < 8 ? 1 << position : 0;
    let offset = position;
    let leftOverBits = 0;
    const mask = [1, 3, 7, 15, 31, 63, 127, 255];
    codeArr.forEach((value) => {
        const mappedCode = map[value][0];
        offset -= map[value][1];
        if (offset <= 0) {
            leftOverBits = Math.abs(offset);
            byte += mappedCode >>> leftOverBits;
            buffer.push(byte);
            offset = 8;
        }
        if (leftOverBits > 0) {
            offset -= leftOverBits;
            const maskedBits = mappedCode & mask[leftOverBits];
            leftOverBits = 0;
        }
        byte += mappedCode << offset;
    });
    const bytes = new Uint8Array(buffer);
    return new Blob([bytes.buffer]);
};
export const decodeHuffman = (str) => { };
const str = "CBBDCCDBAEAEBEBBEEBBCCDACECADDBEBADABEBDBEBBCDCABDCBDEAACBDCACBDDCDEDEEBAEEBAEACCBBACBABAABBBBBBBBBB";
const encodedData = encodeHuffman(str);
encodedData.arrayBuffer().then((buffer) => {
    console.log('Buffer: ', buffer);
    const bytes = new Uint8Array(buffer);
    const binaryStrArr = [];
    bytes.forEach((byte) => {
        let str = (byte >>> 0).toString(2);
        const zeroPadded = 8 - str.length;
        for (let i = 0; i < zeroPadded; i++) {
            str = '0' + str;
        }
        binaryStrArr.push(str);
    });
    console.log('Binary String: ', binaryStrArr.join(' '));
});
console.log("Initial String: ", str);
console.log("Encoded Data: ", encodedData);
console.log("Decoded String: ", decodeHuffman(encodedData));
