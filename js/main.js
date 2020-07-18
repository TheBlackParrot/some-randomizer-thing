$(".addButton").on("click", function(event) {
	let html = $($("#itemTemplate").html()).hide();
	html.appendTo(".inputs");
	html.find(".inputLargeBox").on("input", function () {
		this.style.height = "auto";
		this.style.height = `${this.scrollHeight}px`;
	});
	html.fadeIn(100);
});

$(document).on("click", ".deleteButton", function(event) {
	let card = $(this).parent().parent();
	card.fadeOut(100, function() {
		card.remove();
	});
});

$(".generateButton").on("click", function(event) {
	generate();
})

function loadFromStorage() {
	console.log("loading from localStorage...");

	// gather our stored items, if there's nothing, stop
	let storedItems = JSON.parse(localStorage.getItem("_items"));
	if(storedItems === null) {
		console.log("nothing to load!");
		return;
	}

	// loop through our stored items and load item data
	for(let idx in storedItems) {
		let item = storedItems[idx];
		let itemData = JSON.parse(localStorage.getItem(`_item_${item}`));
		if(itemData === null) {
			// no data is present, this shouldn't happen but y'know w/e
			continue;
		}

		console.log(`loading item ${item}`);

		let html = $($("#itemTemplate").html()).hide();

		html.find(".inputSmallBox").val(item);

		let largeBox = html.find(".inputLargeBox");
		largeBox.val(itemData.choices.join("\n"));
		largeBox.on("input", function () {
			this.style.height = "auto";
			this.style.height = `${this.scrollHeight}px`;
		});

		html.appendTo(".inputs");
		html.fadeIn(100);
	}
}
function triggerInputEvents() {
	$(".inputs").find(".inputLargeBox").each(function(idx) {
		// e
		let elem = $(this);
		elem.trigger("input");
		console.log("triggered input?");
	});
}
window.addEventListener("load", function() {
	loadFromStorage();
	triggerInputEvents();
});

function generate() {
	let seenItems = [];

	// gather our stored items and initiate our stored item array if need be
	let storedItems = JSON.parse(localStorage.getItem("_items"));
	if(storedItems === null) {
		storedItems = [];
	}

	// sanity check
	if($(".inputs").children().length === 0) {
		alert("No items are present! Add some!");
		return;
	}

	// clear any previous output
	$(".output").empty();
	$(".outputSection").show(); // temporary

	$(".inputs").children(".inputSection").each(function(idx) {
		// firefox acts weird here so im just
		let elem = $(this);

		// gather input box values
		let item = elem.find(".inputSmallBox").val();
		let choices = elem.find(".inputLargeBox").val().split("\n").map(function(x) { return x.trim(); });

		// no duplicates!! messes up storage
		if(seenItems.indexOf(item) !== -1) {
			alert(`You have duplicates of ${item}! Please remove all but one.`);
			return;
		}
		seenItems.push(item);

		// item is new! add it
		if(storedItems.indexOf(item) === -1) {
			console.log(`${item} is new, storing in localStorage`);
			storedItems.push(item);
		}

		// modify/add choices for item
		localStorage.setItem(`_item_${item}`, JSON.stringify({version: 1, choices: choices}));

		console.log(`${item}: ${choices}`);

		// randomly grab a choice and add it to the result table
		let result = choices[Math.floor(Math.random() * choices.length)];
		$(".output").append($(`<tr><td>${item}</td><td>${result}</td></tr>`));
	});

	// remove any stored items we didn't use, then save
	for(let idx in storedItems) {
		if(seenItems.indexOf(storedItems[idx]) === -1) {
			console.log(`removing ${storedItems[idx]} from localStorage`);

			localStorage.removeItem(`_item_${storedItems[idx]}`);
			storedItems.splice(idx, 1);
			idx--;
		}
	}
	localStorage.setItem(`_items`, JSON.stringify(storedItems));
}