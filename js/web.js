(function() {
	var output = document.getElementById("output"),
		loading = false,
		proxy = "https://cors-anywhere.herokuapp.com/",
		siteNames = {
			"books.google": "Google Books",
			"sueddeutsche.de": "Süddeutsche",
			"tagesspiegel.de": "Tagesspiegel",
			"spiegel.de": "Spiegel",
			"merkur.de": "Merkur",
			"focus.de": "Focus",
			"stern.de": "Stern",
			"bild.de": "Bild",
			"welt.de": "Welt",
			"faz.net": "FAZ",
			"nzz.ch": "NZZ",
			"taz.de": "taz"
		};
	
	document.getElementById("query")
		.addEventListener("keypress", function(e) {
			if((e.keyCode || e.which) === 13) {
				var query = this.value.trim();
				var url = document.getElementById("url").value.trim();
				cite(query, url);
			}
		}
	);
	document.getElementById("go")
		.addEventListener("click", function() {
			var query = document.getElementById("query").value.trim();
			var url = document.getElementById("url").value.trim();
			cite(query, url);
		}
	);
	
	// copy to clipboard
	document.getElementById("copy")
		.addEventListener("click", function() {
			output.select();
			document.execCommand("copy");
		}
	);
	
	function cite(query, url) {
		if(loading) { return false; }
		loading = true;
		output.value = "Bitte warten…";
		
		if(!/^[a-zA-ZÀ-ž0-9\-; ]{1,100}$/.test(query)) {
			// invalid input
			output.value = "Die Eingabe ist ungültig.";
			loading = false;
			return false;
		}
		try { new URL(url); } catch(error) {
			// invalid URL
			output.value = "Die URL ist ungültig.";
			loading = false;
			return false;
		}
		
		// check if site is recognized
		var site = new URL(url).hostname;
		var recognized = false;
		for(let i in siteNames) {
			if(site.includes(i)) {
				site = siteNames[i];
				recognized = true;
				break;
			}
		}
		if(!recognized) { site = false; }
		
		if(site) {
			if(site === "Google Books") {
				citeBook(query, url);
			} else {
				citeNewspaper(query, url, site);
			}
		} else {
			// bad site
			var newspapers = Object.values(siteNames).slice(1).join(", ");
			output.value = "Diese Seite wird leider nicht anerkannt. " +
				"Du kannst nur aus Büchern bei Google Books zitieren " +
				"oder aus folgenden Online-Zeitungen: " + newspapers;
			loading = false;
		}
	}
	
	// ------------ //
	// --- BOOK --- //
	// ------------ //
	
	function citeBook(query, url) {
		var urlObj = new URL(url),
			bookId = urlObj.searchParams.get("id");
		
		if(!bookId) {
			output.value = "Es wurde kein zu zitierendes Buch gefunden.";
			loading = false;
			return false;
		}
		
		fetch(proxy + "https://www.googleapis.com/books/v1/volumes/" + bookId)
			.then(function(response) { return response.json(); })
			.then(function(response) {
				if(!response.volumeInfo) {
					output.value = "Ein Fehler ist aufgetreten.";
					loading = false;
					return false;
				}
				
				// --- BOOK DETAILS --- //
				var author = (response.volumeInfo.authors || []).join(", ");
				var title = response.volumeInfo.title.replace(/\|/g, "-");
				var publisher = (response.volumeInfo.publisher || "").replace(/\|/g, "-");
				var dateOfPub = (response.volumeInfo.publishedDate || "")
					.match(/^[0-9]{4}/) || "";
				if(dateOfPub) { dateOfPub = dateOfPub[0]; }
				
				// --- ISBN --- //
				function hyphenateISBN(isbn) {
					var prefix = "";
					if(isbn.length === 13) {
						prefix = isbn.substring(0, 3) + "-";
						isbn = isbn.substring(3, 13);
					}
					
					if(parseInt(isbn.substring(0, 1)) === 3) {
						var regex, d = parseInt(isbn.substring(1, 3));
						if(d < 20) {
							regex = /([0-9])([0-9]{2})([0-9]{6})(\w)/;
						} else if(d < 70) {
							regex = /([0-9])([0-9]{3})([0-9]{5})(\w)/;
						} else if(d < 85) {
							regex = /([0-9])([0-9]{4})([0-9]{4})(\w)/;
						} else if(d < 90) {
							regex = /([0-9])([0-9]{5})([0-9]{3})(\w)/;
						} else if(d < 95) {
							regex = /([0-9])([0-9]{6})([0-9]{2})(\w)/;
						} else if(d <= 99) {
							regex = /([0-9])([0-9]{7})([0-9])(\w)/;
						}
						
						if(regex) {
							isbn = prefix + isbn.replace(regex, "$1-$2-$3-$4");
						}
						return isbn;
					}
					return false;
				}
				var isbn = response.volumeInfo.industryIdentifiers || "";
				if(isbn) {
					if(isbn[0].type === "ISBN_13") {
						isbn = hyphenateISBN(isbn[0].identifier);
					} else if(isbn[1] && isbn[1].type === "ISBN_13") {
						isbn = hyphenateISBN(isbn[1].identifier);
					} else { isbn = ""; }
				}
				
				// --- PAGE NUMBER --- //
				var pageUrl = urlObj.searchParams.get("pg");
				var pageNum = pageUrl.match(/(?:PA|PT|PP|PG)([0-9]+)/);
				pageNum = (pageNum ? pageNum[1] : "xxx");
				output.value =
					"„xxx“" +
					"<ref>{{Literatur" +
					(author ? "|Autor=" + author : "") +
					"|Titel=" + title +
					(publisher ? "|Verlag=" + publisher : "") +
					(dateOfPub ? "|Jahr=" + dateOfPub : "") +
					"|Seiten=" + pageNum +
					(isbn ? "|ISBN=" + isbn : "") +
					"|Online=Zitiert nach " +
					"{{GBS|" + bookId +
						(pageUrl ? "|" + pageUrl : "") +
						"|Hervorhebung=\"" +
						(query ? query : "xxx") + "\"}}" +
					"}}</ref>";
				loading = false;
			}).catch(function(error) {
				output.value = "Ein Fehler ist aufgetreten.";
				loading = false;
				console.log(error);
			});
	}
	
	// ----------------- //
	// --- NEWSPAPER --- //
	// ----------------- //
	
	function citeNewspaper(query, url, site) {
		fetch(proxy + url)
			.then(function(data) {
				return data.text();
			}).then(function(data) {
				var html = new DOMParser().parseFromString(data, "text/html");
				var urlObj = new URL(url);
				// fetch all paragraphs
				var paragraphs = [];
				switch(site) {
					case "Bild":
						paragraphs = html.querySelectorAll(
							"article > .txt > p"
						);
						break;
					case "FAZ":
						if(urlObj.hostname === "blogs.faz.net") {
							paragraphs = html.querySelectorAll(
								"article .single-entry-content > p"
							);
						} else {
							paragraphs = html.querySelectorAll(
								"article .atc-Intro > p, article .atc-Text > p"
							);
						}
						break;
					case "Focus":
						if(urlObj.hostname === "praxistipps.focus.de") {
							paragraphs = html.querySelectorAll(
								".Article .Article__Intro," +
								".Article .Article__Text," +
								".Article ul.List"
							);
						} else {
							paragraphs = html.querySelectorAll(
								"#article .articleContent > .leadIn > p," +
								"#article .articleContent > .textBlock > p"
							);
						}
						break;
					case "Merkur":
						paragraphs = html.querySelectorAll(
							"article > .id-Article-body p.id-Article-content-item"
						);
						break;
					case "NZZ":
						paragraphs = html.querySelectorAll(
							"section.container--article > p"
						);
						break;
					case "Spiegel":
						paragraphs = html.querySelectorAll(
							"article div.RichText > p"
						);
						break;
					case "Stern":
						paragraphs = html.querySelectorAll(
							"article > .article-content > .rtf-content-wrapper > p"
						);
						break;
					case "Süddeutsche":
						paragraphs = html.querySelectorAll(
							"article > div[itemprop='articleBody'] > p"
						);
						break;
					case "Tagesspiegel":
						paragraphs = html.querySelectorAll(
							"article .ts-article-body > p"
						);
						break;
					case "taz":
						paragraphs = html.querySelectorAll(
							"article > p.article"
						);
						break;
					case "Welt":
						paragraphs = html.querySelectorAll(
							"article div[itemprop='articleBody'] > p"
						);
						break;
				}
				
				var text = "";
				for(let i = 0; i < paragraphs.length; i++) {
					text += paragraphs[i].textContent.trim() + " ";
				}
				text = text.replace(/[\r\n]/g, " ");
				
				function escapeRegExp(str) {
					return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				}
				// fetch sentence containing the query
				exampleSentence = (text.match(new RegExp(
					"(?:[A-ZÄÖÜ][^.!?]*[^-]|^)" +
					escapeRegExp(query) +
					"(?!-|[a-zäöü]).*?[.!?]"
				)) || [""])[0];
				if(exampleSentence) {
					exampleSentence =
						"„" + (exampleSentence || "xxx")
							.replace(/[„"](.*?)[“"]/g, "‚$1‘")
							.replace(/[\r\n]+/g, " ")
							.replace(
								// automatically italicize query
								new RegExp(
									"([^-]|^)(" +
									escapeRegExp(query) +
									")(?!-|[a-zäöü])", "g"
								), "$1''$2''"
							) + "“";
					var link = "|Online=" + url;
					function getText(element, metatag) {
						var val = "";
						if(metatag) {
							val = (element ? element.getAttribute("content") : "");
						} else {
							val = (element ? element.textContent : "");
						}
						val = val.trim().replace(/\|/g, "-");
						return val;
					}
					
					// --- AUTHOR --- //
					var author = "";
					switch(site) {
						case "Bild":
							author = getText(html.querySelector(
								".authors__name"
							), false);
							break;
						case "FAZ":
							if(urlObj.hostname === "blogs.faz.net") {
								author = getText(html.querySelector(
									"header .entry-author a"
								), false);
							} else {
								author = getText(html.querySelector(
									".atc-MetaAuthor, .atc-MetaAuthorLink"
								), false);
							}
							break;
						case "Focus":
							author = getText(html.querySelector(
								"span[itemprop='author'], a[rel='author']"
							), false);
							break;
						case "Merkur":
							author = getText(html.querySelector(
								"meta[property='lp.article:author']"
							), true);
							break;
						case "NZZ":
						case "Spiegel":
						case "Süddeutsche":
						case "taz":
							if(urlObj.hostname === "blogs.taz.de") {
								author = getText(html.querySelector(
									"p.author span"
								), false);
							} else {
								author = getText(html.querySelector(
									"meta[name='author']"
								), true);
								
								if(author.startsWith("DER SPIEGEL")) { author = ""; }
								if(author === "Süddeutsche Zeitung") { author = ""; }
							}
							break;
						case "Stern":
							author = getText(html.querySelector(
								".o-author-introduction li .content .name"
							), false);
							break;
						case "Tagesspiegel":
							author = getText(html.querySelector(
								".ts-author"
							), false);
							break;
						case "Welt":
							author = getText(html.querySelector(
								".c-author__by-line"
							), false);
							author = author.replace(/^Von/, "").trim();
							break;
					}
					author = (author.match(/[a-zA-ZäöüÄÖÜß\-\s]+/, "") || [""])[0];
					author = author.toLowerCase().replace(
						// fix names written in all uppercase
						/(?:\s|-|^)([a-zA-ZäöüÄÖÜß])/g,
						function(i) { return i.toUpperCase(); }
					);
					author = (author ? "|Autor=" + author : "");
					
					// --- PAGE TITLE --- //
					var title = "";
					switch(site) {
						case "Bild":
							title = getText(html.querySelector(
								"article header .headline"
							), false);
							break;
						case "FAZ":
							if(urlObj.hostname === "blogs.faz.net") {
								title = getText(html.querySelector(
									"header h2.entry-title"
								), false);
							} else {
								title = getText(html.querySelector(
									"article header h2 .atc-HeadlineText"
								), false);
							}
							break;
						case "Spiegel":
							title = getText(html.querySelector(
								"article header span.align-middle"
							), false);
							break;
						case "Focus":
						case "Merkur":
						case "NZZ":
						case "Stern":
						case "Süddeutsche":
						case "Tagesspiegel":
							title = getText(html.querySelector(
								"meta[property='og:title']"
							), true);
							if(site === "NZZ") { title = title.replace(/ - NZZ$/, ""); }
							break;
						case "taz":
							if(urlObj.hostname === "blogs.taz.de") {
								title = getText(html.querySelector(
									"meta[property='og:title']"
								), true);
							} else {
								title = getText(html.querySelector(
									"article h1 span:last-child"
								), false);
							}
							break;
						case "Welt":
							title = getText(html.querySelector(
								"article header h2"
							), false);
							break;
					}
					title = "|Titel=" + (title ? title : "xxx");
					
					// --- PUBLICATION DATE --- //
					var dateDefault = true;
					var dateOfPub = html.querySelector(
						"meta[property='article:published_time'], meta[name='date']"
					);
					dateOfPub = (dateOfPub ? dateOfPub.getAttribute("content") : "");
					if(!dateOfPub) {
						switch(site) {
							case "Bild":
								dateOfPub = html.querySelector("time.authors__pubdate");
								break;
							case "FAZ":
								dateOfPub = html.querySelector("time.atc-MetaTime");
								break;
							case "Spiegel":
							case "Süddeutsche":
								dateOfPub = html.querySelector("article header time");
								break;
							case "Tagesspiegel":
								dateOfPub = html.querySelector("time[itemprop='datePublished']");
								break;
							case "taz":
								if(urlObj.hostname === "blogs.taz.de") {
									dateOfPub = html.querySelector(
										"p.author em:last-child"
									).textContent;
									dateOfPub = dateOfPub.match(
										/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})/
									) || "";
									if(dateOfPub) {
										dateOfPub =
											"|Tag=" + dateOfPub[1] +
											"|Monat=" + dateOfPub[2] +
											"|Jahr=" + dateOfPub[3];
									}
									dateDefault = false;
								}
								break;
						}
						if(dateDefault) {
							dateOfPub = (dateOfPub ? dateOfPub.getAttribute("datetime") : "");
						}
					}
					if(dateDefault) {
						dateOfPub = dateOfPub.match(
							/^([0-9]{4})-([0-9]{2})-([0-9]{2})/
						) || "";
						if(dateOfPub) {
							dateOfPub =
								"|Tag=" + dateOfPub[3] +
								"|Monat=" + dateOfPub[2] +
								"|Jahr=" + dateOfPub[1];
						}
					}
					
					// --- DATE OF ACCESS --- //
					var dateOfAccess = new Date();
					dateOfAccess = "|Zugriff=" +
						dateOfAccess.getFullYear() + "-" +
						String(dateOfAccess.getMonth() + 1).padStart(2, "0") + "-" +
						String(dateOfAccess.getDate()).padStart(2, "0");
					
					// --- DONE --- //
					output.value = exampleSentence +
						"<ref>{{Per-" + site + " Online" +
						link + author + title + dateOfPub + dateOfAccess +
						"}}</ref>";
				} else {
					// example not found
					output.value = "Der Suchbegriff konnte im Artikel " +
						"leider nicht gefunden werden.";
				}
				loading = false;
			}).catch(function(error) {
				output.value = "Ein Fehler ist aufgetreten.";
				loading = false;
				console.log(error);
			});
	}
})();