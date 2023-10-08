import {Chord, ChordName, ChordFinder} from "./chordfinder.js"

export function reflesh() {
    var input = $("#chordinput").val();
    var chordNames = ChordFinder.find(ChordFinder.parse(input));
    
    $("#result").children().children().each((i, e) => {
        if (i > 0) e.remove();
    });
    for (var chordName of chordNames) {
        $(`<tr><td>${chordName.priority}</td><td>${chordName.name}</td></tr>`).appendTo($("#result").children());
    }
}

window.reflesh = reflesh;