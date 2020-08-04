"use strict";

// copy to clipboard
document.getElementById("copy").addEventListener("click", function() {
	document.getElementById("output").select();
	document.execCommand("copy");
});

// show/hide dialog
function showDialog() {
	var dialog = document.getElementById("dialog");
	dialog.classList.add("shown", "bubble-show");
	setTimeout(function() {
		dialog.classList.remove("bubble-show");
	}, 400);
}

function hideDialog() {
	var dialog = document.getElementById("dialog");
	dialog.classList.add("bubble-hide");
	setTimeout(function() {
		dialog.classList.remove("shown", "bubble-hide");
	}, 400);
}

function svgAfter() {
	document.getElementById("dialog-close").addEventListener("click", function() {
		hideDialog();
	});
}

// show/hide input fields accordingly
document.querySelectorAll("#type-noun, #type-verb, #type-adj")
	.forEach(function(element) {
		element.addEventListener("change", function() {
			var declension = document.getElementById("declension");
			var gender = document.getElementById("gender");
			var conjugation = document.getElementById("conjugation");
			var degree = document.getElementById("degree");
			
			var hyphNoun = document.getElementById("hyph-noun");
			var hyphVerb = document.getElementById("hyph-verb");
			var hyphAdj = document.getElementById("hyph-adj");
			
			if(element.id === "type-noun") {
				// show declension
				declension.classList.remove("hidden");
				gender.classList.remove("hidden");
				conjugation.classList.add("hidden");
				degree.classList.add("hidden");
				
				// show hyphenation for nouns
				hyphNoun.classList.remove("hidden");
				hyphVerb.classList.add("hidden");
				hyphAdj.classList.add("hidden");
			} else if(element.id === "type-verb") {
				// show conjugation
				conjugation.classList.remove("hidden");
				declension.classList.add("hidden");
				gender.classList.add("hidden");
				degree.classList.add("hidden");
				
				// show hyphenation for verbs
				hyphVerb.classList.remove("hidden");
				hyphNoun.classList.add("hidden");
				hyphAdj.classList.add("hidden");
			} else {
				// show degree
				degree.classList.remove("hidden");
				declension.classList.add("hidden");
				gender.classList.add("hidden");
				conjugation.classList.add("hidden");
				
				// show hyphenation for adjectives
				hyphAdj.classList.remove("hidden");
				hyphNoun.classList.add("hidden");
				hyphVerb.classList.add("hidden");
			}
		});
	});

// auto-convert dots
Array.prototype.forEach.call(
	document.getElementsByClassName("hyph"),
	function(element) {
		element.addEventListener("keyup", function() {
			this.value = this.value.replace(/\./g, "·");
		});
	}
);

// auto-convert <g> to proper IPA symbol
document.getElementById("ipa").addEventListener("keyup", function() {
	this.value = this.value.replace(/g/g, "ɡ");
});

// insert IPA into textbox
document.querySelectorAll("#insert-ipa a").forEach(function(element) {
	element.addEventListener("click", function() {
		var textbox = element.parentNode.parentNode
			.querySelector("input[type='text']");
		var start = textbox.selectionStart;
		var end = textbox.selectionEnd;
		var insert = element.textContent;
		
		textbox.value =
			textbox.value.slice(0, start) +
			insert +
			textbox.value.slice(end);
		
		var pos = start + insert.length;
		textbox.selectionStart = pos;
		textbox.selectionEnd = pos;
		textbox.focus();
	});
});

// generate article
document.getElementById("go").addEventListener("click", function() {
	function getValue(id) {
		var value = document.getElementById(id).value.trim();
		if(["-", "–", "—"].includes(value)) { value = ""; }
		return value;
	}
	
	function makeCode(id, param, isNoun) {
		var data = getValue(id);
		if(isNoun) {
			data = data.split(";").map(i => i.split(","));
			var code = "";
			for(let i = 0; i < data.length; i++) {
				for(let j = 0; j < data[i].length; j++) {
					code += "|" + param +
					(data.length > 1 ? " " + (i + 1) : "") +
					"***".slice(0, j) +
					"=" + (data[i][j] ? data[i][j].trim() : "—") + "\n";
				}
			}
			return code;
		} else {
			data = data.split(/[,;]/);
			var code = "";
			for(let i = 0; i < data.length; i++) {
				code +=
					"|" + param + "***".slice(0, i) +
					"=" + (data[i] ? data[i].trim() : "—") + "\n";
			}
			return code;
		}
	}
	
	var word = getValue("word");
	if(!word) { return false; }
	var type = document.querySelector("input[name='type']:checked").value;
	var references = getValue("references");
	
	var ipa = getValue("ipa").split(/[,;]/)
		.map(i => "{{Lautschrift|" + i.trim() + "}}").join(", ");
	
	var typeHead = "";
	if(type === "noun") {
		typeHead = "{{Wortart|Substantiv|Deutsch}}";
	} else if(type === "verb") {
		typeHead = "{{Wortart|Verb|Deutsch}}"
	} else {
		typeHead = "{{Wortart|Adjektiv|Deutsch}}";
	}
	
	
	var definition = getValue("definition");
	if(/^(?::\[[0-9a-z]\]\s*)*$/.test(definition)) {
		// add missing definition template
		definition = definition.replace(
			/(:\[[0-9a-z]\])/g,
			"$1 {{QS Bedeutungen|fehlend|spr=de}}"
		);
	}
	
	var examples = getValue("examples");
	if(/^(?::\[[0-9a-z]\]\s*)*$/.test(examples)) {
		// add missing examples template
		examples = examples.replace(
			/(:\[[0-9a-z]\])/g,
			"$1 {{Beispiele fehlen|spr=de}}"
		);
	}
	
	var etymology = getValue("etymology");
	if(/^(?::(?:\[[0-9a-z]\])?\s*)*$/.test(etymology)) { etymology = ""; }
	
	var hyphenation = "", inflectionTable = "";
	if(type === "noun") {
		var hyphSg = getValue("hyph-sg");
		var hyphPl = getValue("hyph-pl");
		if(hyphSg) {
			var hyphSg = hyphSg.split(/[,;]/);
			if(hyphSg.length === 1) {
				hyphenation += hyphSg[0];
			} else {
				hyphenation += hyphSg[0] + ", " + "{{Sg.2}} " + hyphSg[1];
			}
		} else {
			hyphenation += "{{kSg.}}";
		}
		hyphenation += ", ";
		if(hyphPl) {
			var hyphPl = hyphPl.split(/[,;]/);
			if(hyphPl.length === 1) {
				hyphenation += "{{Pl.}} " + hyphPl[0];
			} else if(hyphPl.length === 2) {
				hyphenation +=
					"{{Pl.}} " + hyphPl[0] + ", " +
					"{{Pl.2}} " + hyphPl[1];
			} else {
				hyphenation +=
					"{{Pl.}} " + hyphPl[0] + ", " +
					"{{Pl.2}} " + hyphPl[1] + ", " +
					"{{Pl.3}} " + hyphPl[2];
			}
		} else {
			hyphenation += "{{kPl.}}";
		}
		
		var genders = [];
		document.querySelectorAll("input[name='gender']")
			.forEach(function(element) {
				if(element.checked) {
					genders.push(element.value);
				}
			});
		var gender = "", genderHead = "";
		for(let i = 0; i < genders.length; i++) {
			gender += "|Genus" + (genders.length > 1 ?
				" " + (i + 1) : "") + "=" + genders[i] + "\n";
			genderHead += "{{" + genders[i] + "}}" +
				(i < genders.length - 1 ? ", " : "");
		}
		if(!gender || !genderHead) { return false; }
		
		var nomSg = makeCode("nom-sg", "Nominativ Singular", true);
		var genSg = makeCode("gen-sg", "Genitiv Singular", true);
		var datSg = makeCode("dat-sg", "Dativ Singular", true);
		var accSg = makeCode("acc-sg", "Akkusativ Singular", true);
		var nomPl = makeCode("nom-pl", "Nominativ Plural", true);
		var genPl = makeCode("gen-pl", "Genitiv Plural", true);
		var datPl = makeCode("dat-pl", "Dativ Plural", true);
		var accPl = makeCode("acc-pl", "Akkusativ Plural", true);
		
		inflectionTable =
			"{{Deutsch Substantiv Übersicht\n" +
			gender + nomSg + genSg + datSg + accSg +
			nomPl + genPl + datPl + accPl + "}}";
	} else if(type === "verb") {
		var hyphInf = getValue("hyph-inf");
		var hyphPret = getValue("hyph-preterite");
		var hyphPP = getValue("hyph-pp");
		
		hyphenation =
			hyphInf +
			", {{Prät.}} " + (hyphPret ? hyphPret : "—") +
			", {{Part.}} " + (hyphPP ? hyphPP : "—");
		
		var firstSg = makeCode("first-sg", "Präsens_ich", false);
		var secondSg = makeCode("second-sg", "Präsens_du", false);
		var thirdSg = makeCode("third-sg", "Präsens_er, sie, es", false);
		var preterite = makeCode("preterite", "Präteritum_ich", false);
		var subj = makeCode("subj", "Konjunktiv II_ich", false);
		var impSg = makeCode("imp-sg", "Imperativ Singular", false);
		var impPl = makeCode("imp-pl", "Imperativ Plural", false);
		var pp = makeCode("pp", "Partizip II", false);
		var auxVerb = makeCode("aux-verb", "Hilfsverb", false);
		
		inflectionTable =
			"{{Deutsch Verb Übersicht\n" +
			firstSg + secondSg + thirdSg + preterite + subj +
			impSg + impPl + pp + auxVerb + "}}";
	} else if(type === "adj") {
		var hyphPos = getValue("hyph-pos");
		var hyphComp = getValue("hyph-comp");
		var hyphSup = getValue("hyph-sup");
		hyphenation =
			(!hyphPos && !hyphComp && hyphSup ? hyphSup : hyphPos) + ", " +
			(hyphComp && hyphSup ?
				"{{Komp.}} " + hyphComp +
				"{{Sup.}} am " + hyphSup :
				"{{kSt.}}"
			);
		
		var pos = makeCode("pos", "Positiv", false);
		var comp = makeCode("comp", "Komparativ", false);
		var sup = makeCode("sup", "Superlativ", false);
		
		inflectionTable =
			"{{Deutsch Adjektiv Übersicht\n" +
			pos + comp + sup + "}}";
	}
	
	var output =
		"== " + word + " ({{Sprache|Deutsch}}) ==\n" +
		"=== " + typeHead + (type === "noun" ?
			", " + genderHead : "") + " ===\n\n" +
		inflectionTable + "\n\n" +
		"{{Worttrennung}}\n" +
		":" + hyphenation + "\n\n" +
		"{{Aussprache}}\n" +
		":{{IPA}} " + ipa + "\n" +
		":{{Hörbeispiele}} {{Audio|}}\n\n" +
		"{{Bedeutungen}}\n" + definition + "\n\n" +
		(etymology ? "{{Herkunft}}\n" + etymology + "\n\n" : "") +
		"{{Beispiele}}\n" + examples + "\n\n" +
		"==== {{Übersetzungen}} ====\n" +
		"{{Ü-Tabelle|Ü-links=\n" +
		"*{{en}}: [1] {{Ü|en|}}\n" +
		"*{{fr}}: [1] {{Ü|fr|}}\n" +
		"|Ü-rechts=\n" +
		"*{{it}}: [1] {{Ü|it|}}\n" +
		"*{{es}}: [1] {{Ü|es|}}\n" +
		"}}\n" +
		(references ? "\n{{Referenzen}}\n" + references + "\n" : "") +
		(examples.includes("<ref>") ? "\n{{Quellen}}\n" : "");
	document.getElementById("output").value = output;
	
	showDialog();
});

// reference links
document.querySelectorAll("#ref-links a").forEach(function(element) {
	element.target = "_blank";
	element.title = "Link testen";
})

document.getElementById("word").addEventListener("input", function() {
	var word = this.value.trim();
	// Wikipedia article
	document.getElementById("ref-wp").href =
		"https://de.wikipedia.org/wiki/" + word;
	// Wikipedia search
	document.getElementById("ref-wps").href =
		"https://de.wikipedia.org/w/index.php" +
		"?title=Special%3ASearch&profile=default&search=" + word;
	// DWDS
	document.getElementById("ref-dwds").href =
		"https://www.dwds.de/?q=" + word;
	// OWID
	document.getElementById("ref-owid").href =
		"http://www.owid.de/suche/wort?wort=" + word;
	// UniLeipzig
	document.getElementById("ref-ul").href =
		"https://corpora.uni-leipzig.de/de/res" +
		"?corpusId=deu_newscrawl_2011&word=" + word;
	// FreeDictionary
	document.getElementById("ref-fd").href =
		"https://de.thefreedictionary.com/" + word;
	// Duden
	document.getElementById("ref-duden").href =
		"https://www.duden.de/suchen/dudenonline/" + word;
	// PONS
	document.getElementById("ref-pons").href =
		"http://de.pons.eu/deutsche-rechtschreibung/" + word;
});