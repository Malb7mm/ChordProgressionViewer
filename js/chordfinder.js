class Chord {
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

    static NOTE_NAMES_SHARP = new Map([
        [0, "C"],
        [1, "C♯"],
        [2, "D"],
        [3, "D♯"],
        [4, "E"],
        [5, "F"],
        [6, "F♯"],
        [7, "G"],
        [8, "G♯"],
        [9, "A"],
        [10, "A♯"],
        [11, "B"]
    ]);

    static NOTE_NAMES_FLAT = new Map([
        [0, "C"],
        [1, "D♭"],
        [2, "D"],
        [3, "E♭"],
        [4, "E"],
        [5, "F"],
        [6, "G♭"],
        [7, "G"],
        [8, "A♭"],
        [9, "A"],
        [10, "B♭"],
        [11, "B"]
    ]);

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
        
        "ハ": "C",
        "ニ": "D",
        "ホ": "E",
        "ヘ": "F",
        "ト": "G",
        "イ": "A",
        "ロ": "B",

        "は": "C",
        "に": "D",
        "ほ": "E",
        "へ": "F",
        "と": "G",
        "い": "A",
        "ろ": "B",
    };
    static SHARP_ALIASES = ["♯"];
    static FLAT_ALIASES = ["♭"];

    static PRIORITY = {
        "omit": 2,
        "5": -1,
        "sus2": 1,
        "m": 0,
        "M": 0,
        "sus4": 1,
        "(♭5)": 1,
        "aug": 1,
        "6": 1,
        "7": 1,
        "M7": 1,
        "(♭9)": 2,
        "(9)": 2,
        "(♯9)": 2,
        "(11)": 2,
        "(♯11)": 2,
        "(♭13)": 2,
        "(13)": 2,
        "add9": 2,
        "add11": 2,
        "dim7": -2,
        "on": 1
    }

    constructor() {
    }

    static parse(str) {
        var components = new Set();
        var root;

        for (var [key, value] of Object.entries(ChordFinder.NOTE_ALIASES))
            str = str.replaceAll(key, value);
        for (var value of ChordFinder.SHARP_ALIASES) 
            str = str.replaceAll(value, "#");
        for (var value of ChordFinder.FLAT_ALIASES)
            str = str.replaceAll(value, "b");

        strLoop: while (str.length > 0) {
            for (var [key, value] of ChordFinder.NOTE_VALUES.entries()) {
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

    static find(chord) {
        var P = ChordFinder.PRIORITY;

        // ①構成音から長２度～増５度の音程の二和音を列挙する（並び変え可）
        var dyads = [];

        for (var note1 of chord.components) { 
            for (var note2 of chord.components) {
                if (note1 >= note2)
                    continue;
                var delta = note2 - note1;

                if (2 <= delta && delta <= 3) {
                    dyads.push([note1, note2]);
                }
                else if (4 <= delta && delta <= 8) {
                    dyads.push([note1, note2]);
                    dyads.push([note2, note1]);
                }
                else if (9 <= delta && delta <= 10) {
                    dyads.push([note2, note1]);
                }
            }
        }

        //console.log(dyads);

        // ②列挙した二和音について、残りの構成音のうち一つを加えてできる三和音を探す
        var chordCandidates = [];

        var majAlready = new Set(); // メジャーコードの重複対策

        let getCandiName = (root, delta, omit = false, minorflat5 = false) => {
            var rootName = ChordFinder.NOTE_NAMES_FLAT.get(root);

            var chordName = "";
            if (delta == 2)
                chordName = "sus2";
            else if (delta == 3)
                rootName += "m";
            else if (delta == 5)
                chordName = "sus4";
            else if (delta == 6)
                if (minorflat5 == false)
                    chordName = "(♭5)";
                if (minorflat5 == true) {
                    rootName += "m";
                    chordName = "(♭5)";
                }
            else if (delta == 8)
                rootName += "aug";

            var omitName = "";
            if (omit == true) {
                if (2 <= delta && delta <= 5)
                    omitName = "(omit5)"
                if (6 <= delta && delta <= 8)
                    omitName = "(omit3)"
            }

            return `${rootName}--${chordName}__${omitName}`
        };

        let getCandiPriority = (delta) => {
            if (delta == 2)
                return P["sus2"];
            else if (delta == 3)
                return P["m"];
            else if (delta == 5)
                return P["sus4"];
            else if (delta == 6)
                return P["(♭5)"];
            else if (delta == 8)
                return P["aug"];
            else
                return P["M"];
        };

        let getNote = (root, interval) => {
            var n = root + interval;
            return n % 12;
        };

        for (var notes of dyads) {
            var delta = notes[1] - notes[0];
            if (notes[0] > notes[1])
                delta = 12 + delta;

            chordCandidates.push([
                getCandiName(notes[0], delta, true), 
                notes, 
                P["omit"]
            ]);

            if (2 <= delta && delta <= 5) { // sus2, m, M, sus4
                if (delta == 4) { // メジャーコードの重複対策
                    if (majAlready.has(notes[0]))
                        continue;
                    else
                        majAlready.add(notes[0]);
                }

                var n = getNote(notes[0], 7); // 完全五度
                if (chord.components.has(n))
                    chordCandidates.push([
                        getCandiName(notes[0], delta),
                        [notes[0], notes[1], n],
                        getCandiPriority(delta)
                    ]);
            }
            else if (delta == 6) { // b5
                var n = getNote(notes[0], 3); // 短三度
                if (chord.components.has(n))
                    chordCandidates.push([
                        getCandiName(notes[0], delta, false, true), 
                        [notes[0], n, notes[1]], 
                        getCandiPriority(delta)
                    ]);

                var n = getNote(notes[0], 4); // 短三度
                if (chord.components.has(n))
                    chordCandidates.push([
                        getCandiName(notes[0], delta), 
                        [notes[0], n, notes[1]], 
                        getCandiPriority(delta)
                    ]);
            }
            else if (delta == 7 || delta == 8) { // M, aug
                if (delta == 7) { // メジャーコードの重複対策
                    if (majAlready.has(notes[0]))
                        continue;
                    else
                        majAlready.add(notes[0]);
                }

                var n = getNote(notes[0], 4); // 長三度
                if (chord.components.has(n))
                    chordCandidates.push([
                        getCandiName(notes[0], delta), 
                        [notes[0], n, notes[1]], 
                        getCandiPriority(delta)
                    ]);
            }
        }

        //console.log(chordCandidates);

        // ④これらのコードに、残りの構成音を加えてコードを完成させる
        var results = [];

        let removeComponents = (components, notes) => {
            if (Array.isArray(notes)) {
                for (var note of notes) {
                    components.delete(note);
                }
                return components;
            }
            else {
                components.delete(notes);
                return components;
            }
        }

        for (var withoutRoot of [false, true]) {
            for (var c of chordCandidates) {
                var restComponents = removeComponents(structuredClone(chord.components), c[1]);
                if (withoutRoot) {
                    if (restComponents.has(chord.root))
                        restComponents.delete(chord.root);
                    else
                        continue;
                }

                var root = c[1][0];

                var components;
                var seventhName;
                var tensionName;
                var tensionPriority;

                var onCode = (root == chord.root) ? "" : "/" + ChordFinder.NOTE_NAMES_FLAT.get(chord.root);
                var onCodePriority = (root == chord.root) ? 0 : P["on"];

                // 6, 7, M7
                for (var interval of [9, 10, 11]) {
                    components = structuredClone(restComponents);
                    seventhName = "";
                    tensionName = "";
                    tensionPriority = 0;

                    // 長六度(6)、短七度(7)、長七度(M7)がそもそもあるか
                    if (!components.has(getNote(root, interval)))
                        continue;
                    components.delete(getNote(root, interval));

                    const seventhNames = new Map([
                        [9, "6"],
                        [10, "7"],
                        [11, "M7"]
                    ]);

                    seventhName += seventhNames.get(interval);
                    tensionPriority += P[seventhNames.get(interval)];

                    const tensionNames = new Map([
                        [1, "(♭9)"],
                        [2, "(9)"],
                        [3, "(♯9)"],
                        [5, "(11)"],
                        [6, "(♯11)"],
                        [8, "(♭13)"],
                        [9, "(13)"]
                    ]);

                    for (var tensionInterval of [1, 2, 3, 5, 6, 8, 9]) {
                        if (components.has(getNote(root, tensionInterval))) {
                            tensionName += tensionNames.get(tensionInterval);
                            tensionPriority += P[tensionNames.get(tensionInterval)];
                            components.delete(getNote(root, tensionInterval));
                        }
                    }

                    if (components.size == 0) {
                        var completeName = c[0].replaceAll("--", seventhName).replaceAll("__", tensionName) + onCode;
                        var priority = c[2] + tensionPriority + onCodePriority;
                        results.push(new ChordName(completeName, priority));
                    }
                }

                // 6、7、M7なしの場合
                {
                    components = structuredClone(restComponents);
                    tensionName = "";
                    tensionPriority = 0;

                    const tensionNames = new Map([
                        [2, "add9"],
                        [5, "add11"]
                    ]);

                    for (var tensionInterval of [2, 5]) {
                        if (components.has(getNote(root, tensionInterval))) {
                            tensionName += tensionNames.get(tensionInterval);
                            tensionPriority += P[tensionNames.get(tensionInterval)];
                            components.delete(getNote(root, tensionInterval));
                        }
                    }

                    if (components.size == 0) {
                        // パワーコード判定
                        if (chord.components.has(getNote(root, 7))
                         && chord.components.size == 2) {
                            var completeName = c[0].replaceAll("--", "").replaceAll("__", "").replaceAll("(omit3)", "5") + onCode;
                            var priority = c[2] + P["5"] + onCodePriority;
                        }
                        else {
                            var completeName = c[0].replaceAll("--", "").replaceAll("__", tensionName) + onCode;
                            var priority = c[2] + tensionPriority + onCodePriority;
                        }
                        results.push(new ChordName(completeName, priority));
                    }
                }

                components = structuredClone(restComponents);

                // dim7判定
                // 1. chord.componentsを直接参照して4音がdim7の形に並んでいるのを確認する
                // 2. componentsを参照して(♭5)(omit3)の場合のみdim7を召喚する
                if (chord.components.has(getNote(root, 3))
                 && chord.components.has(getNote(root, 6))
                 && chord.components.has(getNote(root, 9))
                 && chord.components.size == 4
                 && components.has(getNote(root, 3))
                 && components.has(getNote(root, 9))
                 && components.size == 2) {

                    var completeName = c[0].replaceAll("--", "dim7").replaceAll("__", "").replaceAll("(♭5)", "").replaceAll("(omit3)", "") + onCode;
                    var priority = c[2] + P["dim7"] + onCodePriority;
                    results.push(new ChordName(completeName, priority));
                }
            }
        }
        
        results.sort((a, b) => {
            return a.priority - b.priority;
        });

        for (var result of results) {
            console.log(`(${result.priority}) ${result.name}`);
        }

        return results;
    }

    static degree(chordName, songKey) {
        const NUM = new Map([
            ["D♭",1],
            ["E♭",3],
            ["G♭",6],
            ["A♭",8],
            ["B♭",10],
            ["C",0],
            ["D",2],
            ["E",4],
            ["F",5],
            ["G",7],
            ["A",9],
            ["B",11]
        ]);
        const DEG = new Map([
            [0,"Ⅰ"],
            [1,"♭Ⅱ"],
            [2,"Ⅱ"],
            [3,"♭Ⅲ"],
            [4,"Ⅲ"],
            [5,"Ⅳ"],
            [6,"♭Ⅴ"],
            [7,"Ⅴ"],
            [8,"♭Ⅵ"],
            [9,"Ⅵ"],
            [10,"♭Ⅶ"],
            [11,"Ⅶ"]
        ]);

        let shift = (note, key) => {
            var n = note + key;
            return n % 12;
        };

        var degreeName = chordName;

        for (var [key, value] of NUM.entries()) {
            if (chordName.startsWith(key)) {
                var degree = DEG.get(shift(value, songKey));
                degreeName = degree + degreeName.slice(key.length);
                break;
            }
        }
        if (chordName.includes("/")) {
            for (var [key, value] of NUM.entries()) {
                if (chordName.endsWith(key)) {
                    var degree = DEG.get(shift(value, songKey));
                    degreeName = degreeName.slice(0, -key.length) + degree;
                    break;
                }
            }
        }

        return degreeName;
    }
}

window.ChordFinder = ChordFinder; // デバッグ用

export {Chord, ChordName, ChordFinder}