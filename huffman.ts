class QueueElement<T> {
  value: T;
  priority: number;
  constructor(value, priority) {
    this.value = value;
    this.priority = priority;
  }
}

class PQueue<T> {
  items: QueueElement<T>[];
  constructor() {
    this.items = [];
  }

  enqueue(value: T, priority: number): void {
    const qElement = new QueueElement<T>(value, priority);
    let contain = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > priority) {
        this.items.splice(i, 0, qElement);
        contain = true;
        break;
      }
    }

    if (!contain) this.items.push(qElement);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  length() {
    return this.items.length;
  }
}

class BinaryTree<T> {
  value: T;
  left: BinaryTree<T>;
  right: BinaryTree<T>;
  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
  }

  dfs(
    callback: (value: T, position: number, depth: number) => void,
    currentNode: BinaryTree<T> = this,
    position = -1,
    depth = 0
  ) {
    if (currentNode === null) {
      return;
    }

    callback(currentNode.value, position, depth);
    currentNode.dfs(
      callback,
      currentNode.left,
      position < 0 ? 0 : (position >>> 0) << 1,
      depth + 1
    );
    currentNode.dfs(
      callback,
      currentNode.right,
      position < 0 ? 1 : ((position >>> 0) << 1) + 1,
      depth + 1
    );
  }

  bfs(callback: (value: T) => void) {
    const queue: BinaryTree<T>[] = [this];

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

  toArray(defaultValue: T, modifier: (value: T) => T = (value) => value): T[] {
    const result = [];
    const recurse = (currentNode: BinaryTree<T> = this, position = 0) => {
      if (currentNode === null) {
        return;
      }

      result[position] = modifier(currentNode.value);
      recurse(currentNode.left, position * 2 + 1);
      recurse(currentNode.right, position * 2 + 2);
    };

    recurse();

    for (let i = 0; i < result.length; i++) {
      if (result[i] == null) {
        result[i] = defaultValue;
      }
    }

    return result;
  }
}

export const encodeHuffman = (str): Blob => {
  const codeArr = [];
  const count: { [key: string]: number } = {};
  const queue = new PQueue<BinaryTree<number>>();

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);

    codeArr.push(code);
    if (count[code] != null) {
      count[code]++;
    } else {
      count[code] = 1;
    }
  }

  const codes = Object.keys(count);
  codes.forEach((code) => {
    queue.enqueue(new BinaryTree(Number(code)), count[code]);
  });

  let treeData: BinaryTree<number> = null;
  while (!queue.isEmpty()) {
    const leftNode = queue.dequeue();
    const rightNode = queue.dequeue();
    const priority = (leftNode?.priority || 0) + (rightNode?.priority || 0);

    const tree = new BinaryTree<number>(null);
    tree.left = leftNode?.value ?? null;
    tree.right = rightNode?.value ?? null;

    if (!queue.isEmpty()) {
      queue.enqueue(tree, priority);
    } else {
      treeData = tree;
    }
  }

  const map: { [key: string]: [number, number] } = {};
  treeData.dfs((value, position, depth) => {
    if (value !== null) {
      map[value] = [position, depth];
    }
  });

  const treeArr = treeData.toArray(27, (value) => {
    return value ? value & 255 : 0;
  });

  let oldValue: number = null;
  let run = 1;
  const buffer = treeArr.reduce((memo: number[], value, index) => {
    if (value !== oldValue) {
      if (run > 3) {
        memo.push(26, run - 1);
      } else if (run > 1) {
        memo.push(...Array(run - 1).fill(oldValue));
      }

      memo.push(value);
      oldValue = value;
      run = 1;
    } else {
      run++;
      if (index === treeArr.length - 1) {
        if (run > 3) {
          memo.push(26, run - 1);
        } else if (run > 1) {
          memo.push(...Array(run - 1).fill(oldValue));
        }
      }
    }

    return memo;
  }, []);

  buffer.push(2);

  let bitCount = 0;
  codeArr.forEach((value) => {
    bitCount += map[value][1];
  });

  const position = bitCount % 8;

  let byte = position === 0 ? 0 : 1 << position;
  let offset = position === 0 ? 8 : position;
  let leftOverBits = 0;
  const mask = [1, 3, 7, 15, 31, 63, 127, 255];
  codeArr.forEach((value) => {
    const mappedCode = map[value][0];
    offset -= map[value][1];

    if (offset <= 0) {
      leftOverBits = Math.abs(offset);
      byte += mappedCode >>> leftOverBits;
      buffer.push(byte);
      byte = 0;
      offset = 8;
    }

    // TODO if leftOverBits is greater than 8 meaning character data has to span over > 2 bytes

    if (leftOverBits > 0) {
      offset -= leftOverBits;
      const maskedBits = mappedCode & mask[leftOverBits - 1];
      leftOverBits = 0;
    }

    byte += mappedCode << offset;
  });

  const bytes = new Uint8Array(buffer);

  return new Blob([bytes.buffer]);
};

export const decodeHuffman = (str) => {};

const str =
  "This is a test!";
const encodedData = encodeHuffman(str);
encodedData.arrayBuffer().then((buffer) => {
  console.log("Buffer: ", buffer);

  const bytes = new Uint8Array(buffer);
  const binaryStrArr: string[] = [];
  bytes.forEach((byte) => {
    let str = (byte >>> 0).toString(2);

    const zeroPadded = 8 - str.length;
    for (let i = 0; i < zeroPadded; i++) {
      str = "0" + str;
    }

    binaryStrArr.push(str);
  });
  console.log("Binary String: ", binaryStrArr.join(" "));
});
console.log(`Initial String: ${str}, ${str.length}`);
console.log("Encoded Data: ", encodedData);
console.log("Decoded String: ", decodeHuffman(encodedData));
