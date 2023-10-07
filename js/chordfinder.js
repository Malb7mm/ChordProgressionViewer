class Chord {
    static NOTE_VALUES = new Map()[
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
    ];

    constructor(components, root) {
        this.components = components;
        this.root = root;
    }
}