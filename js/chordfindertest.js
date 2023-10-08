import {Chord, ChordName, ChordFinder} from "./chordfinder.js?4";

export function reflesh() {
    var chordInput = $("#chordinput").val();
    var keyInput = $("#keyinput").val();
    var chordNames = ChordFinder.find(ChordFinder.parse(chordInput));
    
    $("#result").children().children().each((i, e) => {
        if (i > 0) e.remove();
    });
    for (var chordName of chordNames) {
        $(`<tr><td>${chordName.priority}</td><td>${chordName.name}</td><td>${ChordFinder.degree(chordName.name, parseInt(keyInput))}</td></tr>`).appendTo($("#result").children());
    }
}

window.reflesh = reflesh;