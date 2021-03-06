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
document.querySelectorAll("#type-noun, #type-verb, #type-adj, #type-adv")
	.forEach(function(element) {
		element.addEventListener("change", function() {
			var declension = document.getElementById("declension");
			var gender = document.getElementById("gender");
			var conjugation = document.getElementById("conjugation");
			var degree = document.getElementById("degree");
			
			var hyphNoun = document.getElementById("hyph-noun");
			var hyphVerb = document.getElementById("hyph-verb");
			var hyphAdj = document.getElementById("hyph-adj");
			var hyphAdv = document.getElementById("hyph-adv");
			
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
				hyphAdv.classList.add("hidden");
				
				// show etymology template
				document.getElementById("etymology").value =
					":[[Determinativkompositum]] aus den Substantiven " +
					"''[[xxx]]'' und ''[[xxx]]'' sowie dem " +
					"[[Fugenelement]] ''[[-xxx]]''\n\n" +
					":[[Ableitung]] des Adjektivs ''[[xxx]]'' " +
					"zum Substantiv mit dem [[Derivatem]] " +
					"([[Ableitungsmorphem]]) ''[[-xxx]]''";
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
				hyphAdv.classList.add("hidden");
				
				// show etymology template
				document.getElementById("etymology").value =
					":[[Derivation]] ([[Ableitung]]) des Verbs " +
					"''[[xxx]]'' mit dem [[Präfix]] " +
					"([[Derivatem]]) ''[[xxx-]]''";
			} else if(element.id === "type-adj") {
				// show degree
				degree.classList.remove("hidden");
				declension.classList.add("hidden");
				gender.classList.add("hidden");
				conjugation.classList.add("hidden");
				
				// show hyphenation for adjectives
				hyphAdj.classList.remove("hidden");
				hyphNoun.classList.add("hidden");
				hyphVerb.classList.add("hidden");
				hyphAdv.classList.add("hidden");
				
				// show etymology template
				document.getElementById("etymology").value =
					":[[Derivation]] ([[Ableitung]]) zum Substantiv " +
					"''[[xxx]]'' mit dem [[Derivatem]] " +
					"([[Ableitungsmorphem]]) ''[[-xxx]]''";
			} else if(element.id === "type-adv") {
				// hide inflection
				declension.classList.add("hidden");
				gender.classList.add("hidden");
				conjugation.classList.add("hidden");
				degree.classList.add("hidden");
				
				// show hyphenation for adverbs
				hyphAdv.classList.remove("hidden");
				hyphNoun.classList.add("hidden");
				hyphVerb.classList.add("hidden");
				hyphAdj.classList.add("hidden");
				
				// show etymology template
				document.getElementById("etymology").value =
					":[[Ableitung]] zum Adjektiv ''[[xxx]]'' mit dem [[Derivatem]] ([[Ableitungsmorphem]]) ''[[-xxx]]'' sowie dem [[Fugenelement]] ''[[-xxx]]''";
			}
		});
	});

// auto-convert dots
Array.prototype.forEach.call(
	document.getElementsByClassName("hyph"),
	function(element) {
		element.addEventListener("keyup", function() {
			var start = this.selectionStart;
			this.value = this.value.replace(/\./g, "·");
			this.selectionStart = start;
			this.selectionEnd = start;
			this.focus();
		});
	}
);

// auto-convert <g> to proper IPA symbol
document.getElementById("ipa").addEventListener("keyup", function() {
	var start = this.selectionStart;
	this.value = this.value.replace(/g/g, "ɡ");
	this.selectionStart = start;
	this.selectionEnd = start;
	this.focus();
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
	} else if(type === "adj") {
		typeHead = "{{Wortart|Adjektiv|Deutsch}}";
	} else if(type === "adv") {
		typeHead = "{{Wortart|Adverb|Deutsch}}";
	}
	
	var definition = getValue("definition");
	if(/^(?::\[[0-9a-z]\]\s*)*$/.test(definition)) {
		// add missing definition template
		definition = definition.replace(
			/^:\[[0-9a-z]+\]/gm,
			"$& {{QS Bedeutungen|fehlend|spr=de}}"
		);
	}
	
	var etymology = getValue("etymology");
	
	var synonyms = getValue("synonyms");
	if(/^(?::(?:\[[0-9a-z]+\])?\s*)*$/.test(synonyms)) { synonyms = ""; }
	
	var examples = getValue("examples");
	if(/^(?::\[[0-9a-z]+\]\s*)*$/.test(examples)) {
		// add missing examples template
		examples = examples.replace(
			/^:\[[0-9a-z]+\]/gm,
			"$& {{Beispiele fehlen|spr=de}}"
		);
	}
	
	var hyphenation = "", inflectionTable = "";
	if(type === "noun") {
		// hyphenation
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
		
		// gender
		var genders = [];
		document.querySelectorAll("input[name='gender']")
			.forEach(function(element) {
				if(element.checked) {
					genders.push(element.value);
				}
			});
		
		var gender = "";
		for(let i = 0; i < genders.length; i++) {
			gender += "|Genus" + (genders.length > 1 ?
				" " + (i + 1) : "") + "=" + genders[i] + "\n";
		}
		if(!gender) { return false; }
		var genderHead = genders.join("");
		genderHead = "{{" + (genderHead === "mn" ? "mn." : genderHead) + "}}";
		
		// inflection table
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
		// hyphenation
		var hyphInf = getValue("hyph-inf");
		var hyphPret = getValue("hyph-preterite");
		var hyphPP = getValue("hyph-pp");
		
		hyphenation =
			hyphInf +
			", {{Prät.}} " + (hyphPret ? hyphPret : "—") +
			", {{Part.}} " + (hyphPP ? hyphPP : "—");
		
		// inflection table
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
		// hyphenation
		var hyphPos = getValue("hyph-pos");
		var hyphComp = getValue("hyph-comp");
		var hyphSup = getValue("hyph-sup");
		hyphenation =
			(!hyphPos && !hyphComp && hyphSup ? hyphSup : hyphPos) + ", " +
			(hyphComp && hyphSup ?
				"{{Komp.}} " + hyphComp + ", " +
				"{{Sup.}} am " + hyphSup :
				"{{kSt.}}"
			);
		
		// degree
		var pos = makeCode("pos", "Positiv", false);
		var comp = makeCode("comp", "Komparativ", false);
		var sup = makeCode("sup", "Superlativ", false);
		
		inflectionTable =
			"{{Deutsch Adjektiv Übersicht\n" +
			pos + comp + sup + "}}";
	} else if(type === "adv") {
		hyphenation = getValue("hyph-adv-lemma");
	}
	
	// make entry
	var output =
		"== " + word + " ({{Sprache|Deutsch}}) ==\n" +
		"=== " + typeHead + (type === "noun" ?
			", " + genderHead : "") + " ===\n\n" +
		(inflectionTable ? inflectionTable + "\n\n" : "") +
		"{{Worttrennung}}\n" +
		":" + hyphenation + "\n\n" +
		"{{Aussprache}}\n" +
		":{{IPA}} " + ipa + "\n" +
		":{{Hörbeispiele}} {{Audio|}}\n\n" +
		"{{Bedeutungen}}\n" + definition + "\n\n" +
		(etymology ? "{{Herkunft}}\n" + etymology + "\n\n" : "") +
		(synonyms ? "{{Synonyme}}\n" + synonyms + "\n\n" : "") +
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
var refWP = document.getElementById("ref-wp");
var refWPS = document.getElementById("ref-wps");
var refDWDS = document.getElementById("ref-dwds");
var refOWID = document.getElementById("ref-owid");
var refUL = document.getElementById("ref-ul");
var refFD = document.getElementById("ref-fd");
var refDuden = document.getElementById("ref-duden");
var refPONS = document.getElementById("ref-pons");

setRefs("Wort");
document.getElementById("word").addEventListener("input", function() {
	// update links while typing
	setRefs(this.value.trim());
});

function setRefs(word) {
	// Wikipedia article
	refWP.href = "https://de.wikipedia.org/wiki/" + word;
	// Wikipedia search
	refWPS.href = "https://de.wikipedia.org/w/index.php" +
		"?title=Special%3ASearch&profile=default&search=" + word;
	// DWDS
	refDWDS.href = "https://www.dwds.de/?q=" + word;
	// OWID
	refOWID .href = "http://www.owid.de/suche/wort?wort=" + word;
	// UniLeipzig
	refUL.href = "https://corpora.uni-leipzig.de/de/res" + 
		"?corpusId=deu_newscrawl_2011&word=" + word;
	// FreeDictionary
	refFD.href = "https://de.thefreedictionary.com/" + word;
	// Duden
	refDuden.href = "https://www.duden.de/suchen/dudenonline/" + word;
	// PONS
	refPONS.href = "http://de.pons.eu/deutsche-rechtschreibung/" + word;
}

// open all links
document.getElementById("ref-open-all")
	.addEventListener("click", function() {
		window.open(refWP.href, "_blank");
		window.open(refWPS.href, "_blank");
		window.open(refDWDS.href, "_blank");
		window.open(refOWID.href, "_blank");
		window.open(refUL.href, "_blank");
		window.open(refFD.href, "_blank");
		window.open(refDuden.href, "_blank");
		window.open(refPONS.href, "_blank");
	}
);