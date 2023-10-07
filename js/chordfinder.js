class Chord {
    static NOTE_VALUES = new Map([
        ["C#", 1],
        ["D#", 3],
        ["F#", 6],
        ["G#", 8],
        ["A#", 10],
        ["Db", 1],
        ["Eb", 3],
        ["Gb", 6],
        ["Ab", 8],
        ["Bb", 10],
        ["C", 0],
        ["D", 2],
        ["E", 4],
        ["F", 5],
        ["G", 7],
        ["A", 9],
        ["B", 11]
    ]);

    constructor(components, root) {
        this.components = components;
        this.root = root;
    }
}

class ChordName {
    constructor(name, priority) {
        this.name = name;
        this.priority = priority;
    }
}

class ChordFinder {
    static NOTE_ALIASES = {
        "ド": "C",
        "レ": "D",
        "ミ": "E",
        "ファ": "F",
        "ソ": "G",
        "ラ": "A",
        "シ": "B",

        "ど": "C",
        "れ": "D",
        "み": "E",
        "ふぁ": "F",
        "そ": "G",
        "ら": "A",
        "し": "B",
        
        "イ": "C",
        "ロ": "D",
        "ハ": "E",
        "ニ": "F",
        "ホ": "G",
        "ヘ": "A",
        "ト": "B",

        "い": "C",
        "ろ": "D",
        "は": "E",
        "に": "F",
        "ほ": "G",
        "へ": "A",
        "と": "B",
    };
    static SHARP_ALIASES = ["♯"];
    static FLAT_ALIASES = ["♭"];

    constructor() {
    }

    static parse(str) {
        var components = new Set();
        var root;

        for (var [key, value] of Object.entries(ChordFinder.NOTE_ALIASES))
            str = str.replace(key, value);
        for (var value of ChordFinder.SHARP_ALIASES) 
            str = str.replace(value, "#");
        for (var value of ChordFinder.FLAT_ALIASES)
            str = str.replace(value, "b");

        strLoop: while (str.length > 0) {
            for (var [key, value] of Chord.NOTE_VALUES.entries()) {
                if (str.startsWith(key)) {
                    components.add(value);
                    if (root === undefined)
                        root = value;
                    str = str.substring(key.length);
                    continue strLoop;
                }
            }
            str = str.substring(1);
        }

        return new Chord(components, root);
    }

    static find(str) {
        
    }
}

window.ChordFinder = ChordFinder; // デバッグ用

export {Chord, ChordName, ChordFinder}