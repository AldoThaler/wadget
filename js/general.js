(function() {
	"use strict";

	// prepare check & radio & toggle buttons
	document.querySelectorAll(".check, .radio, .toggle")
		.forEach(function(element) {
			var id = element.querySelector("input").getAttribute("id");
			var target = element.querySelector("div");
			var label = target.innerHTML;
			target.outerHTML =
				"<label for='" + id + "'>" +
					"<div class='button'>" +
						(element.classList.contains("toggle") ?
							"<span class='bar'></span>" +
							"<span class='knob'></span>" :
							"<span class='box'></span>" +
							"<span class='mark'></span>" +
							"<span class='ripple'></span>"
						) +
					"</div>" +
					label +
				"</label>";
		}
	);

	// convert images to inline SVGs
	var svgCount = 0;
	var svgList = document.querySelectorAll("img[src$='.svg']");
	for(let i = 0; i < svgList.length; i++) {
		var img = svgList[i];
		(function(img) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if(this.readyState === 4) {
					var svg = new DOMParser()
						.parseFromString(xhr.responseText, "text/xml")
						.firstChild;
					var img_id = img.getAttribute("id");
					var img_class = img.getAttribute("class");
					var img_height = img.getAttribute("height");
					var img_width = img.getAttribute("width");
					
					if(img_id) { svg.setAttribute("id", img_id); }
					if(img_class) { svg.setAttribute("class", img_class); }
					if(img_height) { svg.setAttribute("height", img_height); }
					if(img_width) { svg.setAttribute("width", img_width); }
					
					img.parentNode.replaceChild(svg, img);
					
					svgCount++;
					if(svgCount === svgList.length &&
						typeof svgAfter === "function") { svgAfter(); }
				}
			}
			xhr.open("GET", img.getAttribute("src"));
			xhr.send();
		})(img);
	}
	
	// turn off spellcheck
	document.querySelectorAll("input[type='text'], textarea")
		.forEach(function(element) {
			element.spellcheck = false;
		}
	);
})();