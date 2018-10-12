/* eslint-disable quote-props,operator-linebreak */
import * as ArrayUtils from "../src/js/utils/array";

describe("ArrayUtils", () => {
  const testArray = [
    [
      {
        "tag": "w",
        "type": "word",
        "text": "son",
        "occurrence": 1,
        "occurrences": 2
      },
      {
        "tag": "w",
        "type": "word",
        "text": "of",
        "occurrence": 1,
        "occurrences": 2
      }
    ],
    [
      {
        "tag": "w",
        "type": "word",
        "text": "David",
        "occurrence": 1,
        "occurrences": 1
      }
    ],
    {
      "type": "text",
      "text": ","
    },
    [
      {
        "tag": "w",
        "type": "word",
        "text": "son",
        "occurrence": 2,
        "occurrences": 2
      },
      {
        "tag": "w",
        "type": "word",
        "text": "of",
        "occurrence": 2,
        "occurrences": 2
      },
      [
        {
          "tag": "w",
          "type": "word",
          "text": "Abraham",
          "occurrence": 1,
          "occurrences": 1
        }
      ]
    ],
    {
      "type": "text",
      "text": "."
    }
  ];
  const testArrayOriginal = [
    [
      {
        "tag": "w",
        "type": "word",
        "text": "son",
        "occurrence": 1,
        "occurrences": 2
      },
      {
        "tag": "w",
        "type": "word",
        "text": "of",
        "occurrence": 1,
        "occurrences": 2
      }
    ],
    [
      {
        "tag": "w",
        "type": "word",
        "text": "David",
        "occurrence": 1,
        "occurrences": 1
      }
    ],
    {
      "type": "text",
      "text": ","
    },
    [
      {
        "tag": "w",
        "type": "word",
        "text": "son",
        "occurrence": 2,
        "occurrences": 2
      },
      {
        "tag": "w",
        "type": "word",
        "text": "of",
        "occurrence": 2,
        "occurrences": 2
      }
    ],
    [
      {
        "tag": "w",
        "type": "word",
        "text": "Abraham",
        "occurrence": 1,
        "occurrences": 1
      }
    ],
    {
      "type": "text",
      "text": "."
    }
  ];

  it('flattenArray() should work', () => {
    const array = JSON.parse(JSON.stringify(testArrayOriginal));

    const a = ArrayUtils.flattenArray(array);

    expect(array.length).toEqual(6);
    expect(a.length).toEqual(8);
  });

  it('flattenArray() should work deep', () => {
    const array = JSON.parse(JSON.stringify(testArray));

    const a = ArrayUtils.flattenArray(array);

    expect(array.length).toEqual(5);
    expect(a.length).toEqual(8);
  });
});

