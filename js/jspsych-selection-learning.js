var jsPsychSelectionLearning = (function (jspsych) {
	"use strict";

	/**
	 * **SELECTION LEARNING**
	 *
	 * SHORT PLUGIN DESCRIPTION
	 *
	 * @author Nathan Liang
	 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
	 */

	// Default values for images / labels: ["image1", "image2", ..., "imageN"]
	const defaultImages = [...Array(100)].map((_, i) => `image${i + 1}`);
	const defaultLabels = [...Array(100)].map((_, i) => `label${i + 1}`);

	const info = {
		name: "selection-learning",
		parameters: {
			selection_learning: {
				type: jspsych.ParameterType.IMAGE,
				default: defaultImages
			},
			selection_labels: {
				type: jspsych.ParameterType.HTML_STRING,
				default: defaultLabels
			},
			choices: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Choices",
				default: undefined,
				array: true,
			},
		}
	};

	class SelectionLearningPlugin {
		constructor(jsPsych) {
			this.jsPsych = jsPsych;
		};

		trial(display_element, trial) {
			display_element.innerHTML +=
				// Pt. 1: Box
				`<div id="jspsych-instructions">
					<div class="quote">
						<h2>Search Task</h2>
						<p>
							Now you can see what other people think.
							Click on an avatar to see that person's opinion on the following sentence:
						</p>
						<blockquote>
							${trial.statement}
						</blockquote>
					</div>
				</div>` +

				// Pt. 2: Box
				`<div id="trial-presentation-space" class="popup"></div><div id="overlay"></div>` +

				// Pt. 3: Prompt
				`<div id="prompt-container"></div>` +

				// Pt. 4: Avatar Grid
				`<div class="grid-container-wrapper">
					<div class="grid-container" id="avatar-grid"></div>
				</div>`;

			// Ratings
			const selectionRatingsDict = {
				// <!-- Q12: Roentgen -->
				epistemicRatingsQ12: [
					  3,  30,  33,  34,  34,  45,  47,  47,  47,  47, 
					 48,  48,  48,  48,  49,  49,  49,  50,  51,  51, 
					 55,  56,  56,  57,  57,  59,  60,  60,  61,  62, 
					 63,  63,  64,  64,  65,  66,  67,  68,  68,  68, 
					 68,  69,  71,  71,  72,  72,  73,  74,  75,  75, 
					 75,  76,  77,  77,  77,  77,  78,  79,  79,  79, 
					 80,  80,  82,  83,  83,  83,  84,  84,  84,  84, 
					 84,  85,  86,  87,  89,  89,  89,  90,  92,  92, 
					 92,  93,  94,  95,  96,  99,  99,  99, 100, 100, 
					100, 100, 100, 100, 100, 100, 100, 100, 100, 100
				],

				moralRatingsQ12: [
					  0,   3,   4,  27,  30,  42,  43,  45,  46,  47, 
					 48,  49,  51,  51,  52,  52,  52,  53,  53,  54, 
					 54,  56,  57,  57,  58,  58,  60,  60,  60,  60, 
					 61,  61,  62,  62,  63,  63,  64,  64,  64,  65, 
					 66,  67,  68,  68,  68,  70,  71,  72,  73,  73, 
					 73,  74,  74,  75,  75,  75,  75,  77,  77,  77, 
					 78,  78,  78,  78,  79,  79,  80,  81,  82,  82, 
					 82,  82,  83,  84,  85,  86,  86,  89,  89,  91, 
					 91,  93,  95,  95,  96,  96,  97,  98, 100, 100, 
					100, 100, 100, 100, 100, 100, 100, 100, 100, 100
				],

				// <!-- Q26: Akon -->
				epistemicRatingsQ26: [
					87, 45, 100, 65, 100, 53, 48, 33, 4, 67,
					52, 49, 66, 85, 72, 48, 19, 32, 39, 90,
					60, 82, 83, 48, 50, 0, 63, 54, 68, 46,
					0, 95, 90, 22, 51, 59, 46, 47, 47, 50,
					54, 19, 66, 29, 88, 58, 68, 48, 26, 45,
					48, 47, 53, 51, 4, 51, 40, 86, 6, 62,
					39, 47, 52, 74, 58, 48, 47, 49, 77, 52,
					50, 31, 31, 66, 54, 32, 44, 24, 47, 91,
					37, 48, 47, 50, 52, 53, 49, 72, 84, 71,
					47, 67, 71, 41, 36, 73, 51, 51, 48, 69
				],
				moralRatingsQ26: [
					88, 19, 94, 76, 99, 50, 47, 58, 3, 55,
					49, 31, 66, 48, 83, 49, 9, 41, 39, 52,
					70, 79, 27, 0, 40, 49, 45, 51, 75, 52,
					34, 42, 49, 62, 51, 61, 49, 47, 48, 47,
					7, 15, 70, 3, 67, 55, 58, 50, 44, 66,
					50, 47, 17, 67, 92, 62, 39, 99, 70, 25,
					40, 44, 65, 16, 78, 53, 100, 46, 59, 48,
					52, 38, 85, 29, 27, 35, 43, 20, 69, 83,
					63, 21, 25, 18, 22, 6, 52, 74, 2, 14,
					28, 63, 34, 42, 54, 73, 68, 57, 26, 100
				],

				// <!-- Q27: Gandhi -->
				epistemicRatingsQ27: [
					73, 87, 79, 61, 82, 58, 81, 56, 72, 50,
					74, 25, 80, 84, 79, 100, 85, 53, 66, 85,
					67, 100, 100, 42, 66, 100, 100, 81, 100, 88,
					92, 97, 79, 100, 97, 62, 84, 83, 88, 89,
					87, 21, 100, 70, 49, 45, 100, 85, 100, 76,
					81, 100, 100, 92, 79, 82, 96, 37, 85, 71,
					85, 93, 86, 98, 94, 78, 93, 44, 100, 100,
					70, 85, 71, 80, 96, 54, 48, 59, 31, 64,
					96, 100, 100, 86, 97, 48, 78, 82, 65, 82,
					32, 61, 100, 76, 68, 61, 78, 81, 46, 91
				],
				moralRatingsQ27: [
					100, 86, 69, 44, 64, 71, 84, 56, 61, 51,
					57, 51, 78, 82, 91, 100, 85, 60, 67, 94,
					65, 87, 90, 58, 78, 64, 58, 76, 62, 89,
					87, 97, 77, 78, 98, 47, 78, 96, 48, 81,
					88, 86, 100, 78, 65, 69, 71, 73, 46, 56,
					56, 100, 69, 92, 82, 94, 87, 62, 60, 82,
					96, 90, 60, 99, 96, 79, 83, 65, 95, 70,
					66, 90, 78, 84, 49, 54, 75, 80, 76, 74,
					50, 72, 87, 71, 74, 55, 70, 67, 83, 100,
					49, 67, 66, 82, 66, 80, 75, 80, 75, 77
				],

				// <!-- Q29: Lovelace -->
				epistemicRatingsQ29: [
					88, 53, 53, 63, 44, 55, 94, 44, 47, 0,
					19, 100, 54, 24, 97, 83, 66, 76, 48, 55,
					21, 74, 43, 78, 100, 85, 81, 59, 28, 100,
					100, 64, 63, 86, 92, 73, 68, 23, 31, 72,
					83, 94, 73, 77, 50, 88, 53, 52, 85, 100,
					29, 50, 82, 100, 50, 50, 45, 69, 99, 100,
					69, 11, 44, 71, 78, 90, 53, 48, 52, 83,
					7, 67, 60, 49, 83, 47, 48, 52, 47, 56,
					41, 94, 48, 67, 98, 87, 46, 55, 33, 28,
					48, 91, 60, 47, 35, 65, 48, 48, 89, 44
				],
				moralRatingsQ29: [
					33, 49, 49, 61, 32, 53, 95, 63, 73, 39,
					48, 47, 83, 77, 52, 82, 55, 65, 49, 56,
					46, 94, 43, 50, 50, 79, 100, 55, 52, 100,
					73, 47, 63, 90, 50, 51, 51, 47, 53, 56,
					81, 49, 54, 21, 51, 50, 51, 33, 86, 100,
					58, 61, 82, 49, 25, 50, 61, 51, 83, 56,
					68, 48, 43, 33, 67, 86, 67, 64, 51, 14,
					8, 76, 92, 49, 100, 50, 67, 53, 49, 100,
					63, 64, 59, 82, 97, 91, 46, 54, 24, 47,
					45, 49, 86, 49, 55, 59, 47, 78, 14, 36
				],

				// <!-- Q30: Turing -->
				epistemicRatingsQ30: [
					55, 88, 85, 85, 94, 50, 97, 53, 100, 62,
					100, 100, 47, 95, 21, 78, 72, 86, 50, 74,
					100, 47, 70, 29, 87, 53, 85, 100, 71, 51,
					64, 58, 62, 77, 62, 70, 67, 94, 48, 83,
					58, 16, 76, 50, 95, 82, 73, 1, 100, 60,
					95, 78, 94, 63, 99, 84, 79, 58, 85, 50,
					94, 92, 93, 90, 2, 53, 48, 86, 100, 48,
					52, 48, 55, 32, 79, 82, 88, 95, 67, 100,
					28, 78, 62, 86, 74, 50, 98, 50, 61, 43,
					51, 58, 63, 82, 81, 12, 69, 49, 64, 92
				],
				moralRatingsQ30: [
					70, 89, 100, 34, 97, 80, 95, 4, 72, 63,
					100, 100, 35, 89, 32, 28, 16, 83, 45, 70,
					51, 60, 100, 52, 88, 57, 100, 100, 53, 50,
					58, 63, 66, 80, 64, 69, 48, 52, 49, 83,
					67, 89, 99, 50, 82, 77, 75, 63, 49, 64,
					65, 100, 85, 8, 93, 88, 50, 70, 18, 49,
					100, 89, 81, 81, 76, 49, 62, 55, 65, 14,
					73, 48, 49, 49, 82, 54, 26, 73, 100, 79,
					64, 85, 49, 86, 82, 49, 25, 19, 78, 26,
					70, 61, 47, 95, 25, 65, 48, 5, 64, 16
				]
			};

			const trialPresentationSpace = $('#trial-presentation-space');

			// Generate circles
			const avatarCircleContainer = $('#avatar-grid');

			// Avatar NUMBER randomized from 1 to 100; not index 0 to 99
			const randomizedAvatarNumberArray = jsPsych.randomization.shuffle([...Array(100).keys()].map(x => x + 1));

			// Create an array of labels, 50 for each party, and shuffle it
			if (politicalManipulation == "present") {
				var politicalAffiliationArray = jsPsych.randomization.shuffle(
					new Array(50).fill('avatar-circle-democrat').concat(new Array(50).fill('avatar-circle-republican'))
				);
			};

			// Generate circles
			// i = the actual avatar INDEX
			for (let i = 0; i < 100; i++) {
				if (politicalManipulation == "present") {
					var avatarCircle = $(`<div class='avatar-circle ${politicalAffiliationArray[i]}' id='circle${randomizedAvatarNumberArray[i]}'></div>`);
				} else {
					var avatarCircle = $(`<div class='avatar-circle avatar-circle-none' id='circle${randomizedAvatarNumberArray[i]}'></div>`);
				};

				avatarCircleContainer.append(avatarCircle);
				const circleId = $(`#circle${randomizedAvatarNumberArray[i]}`);
				const avatarPhoto = $(`<img class='avatar-photo' src='./avatars/avatar${randomizedAvatarNumberArray[i]}.webp'>`);
				circleId.append(avatarPhoto);
			};

			var selectionRatings = {
				0: selectionRatingsDict['moralRatingsQ12'],
				1: selectionRatingsDict['moralRatingsQ26'],
				2: selectionRatingsDict['moralRatingsQ27'],
				3: selectionRatingsDict['moralRatingsQ29'],
				4: selectionRatingsDict['moralRatingsQ30']
			}

			// Pt. 3: Prompt
			const samplingPromptContainer = $('#prompt-container');
			samplingPromptContainer.html(`
				<strong id="samplingPrompt" style="text-transform: uppercase;">
					Click on the person whose opinion you would like to read next	
				</strong>
				<br>
				(SCROLL TO VIEW MORE)
				<br>`
			);

			trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';

			let trialDuration = "NA";
			let avatarSelections = [];
			let avatarPoliticalAffiliations = [];
			let avatarPositionIndices = [];
			let avatarPositionXIndices = [];
			let avatarPositionYIndices = [];
			let rtArray = [];
			let sliderRatings = [];

			// this takes the number of the avatar (e.g., #12) and uses the number (1 to 100) as an index to retrieve the rating number at that
			// "index" from the selectionRatings array's trial.trialIndex element. If the avatar is 12, then we actually are retrieving the 11th (12 - 1) index
			// However, the problem is that trial.trialIndex is not what we want. The order is not always 0 to 4 Roentgen, Akon, Gandhi, Lovelace, Turing.
			for (let i = 0; i < randomizedAvatarNumberArray.length; i++) {
				var yokedPseudoIndex = randomizedAvatarNumberArray[i] - 1; // this is the number of the avatar, already shuffled
				console.log(trials);
				console.log(trial.trialIndex);
				console.log(trials[trial.trialIndex]);
				sliderRatings.push(selectionRatings[trials[trial.trialIndex]][yokedPseudoIndex]); // this is not an index, but ok.
				console.log(sliderRatings);
			};

			let start_time = (new Date()).getTime();
			const initLearning = (avatarNumber) => {
				let tic = (new Date()).getTime();
				$('#overlay').fadeIn();
				trialPresentationSpace.empty();
				trialPresentationSpace.fadeIn();

				const trialFormat     = $(`<div id="trial-format"></div>`);
				const trialFeedback   = $(`<div id="selection-buttons"></div>`);
				const avatarContainer = $('<div id="avatar-container"></div>')

				// Create a new circle to hold the chosen avatar
				// Add it to the presentation space
				const avatarCircleSelection = $('<div></div>', {
					class: 'avatar-circle',
					id: `circle${avatarNumber}`
				}).appendTo(avatarContainer);

				if (politicalManipulation == "present") {
					avatarCircleSelection.addClass(politicalAffiliationArray[randomizedAvatarNumberArray.indexOf(avatarNumber)]);
				} else {
					avatarCircleSelection.addClass('avatar-circle-none');
				};

				// Create copy of the chosen avatar photo
				// Add it inside the avatar circle
				$('<img>', {
					src: `./avatars/avatar${avatarNumber}.webp`,
					class: 'avatar-photo'
				}).appendTo(avatarCircleSelection);

				let ratingPrompt = "NA";
				let textDownRating = "NA";
				let textUpRating = "NA";

				ratingPrompt = "How morally good or morally bad do you think this action is?"
				textDownRating = "Extremely morally bad";
				textUpRating = "Extremely morally good";

				const labelElement = $('<label>', {
					for: "rating-slider",
				}).text(ratingPrompt);

				const inputElement = $('<input>', {
					name: 'rating-slider',
					type: 'range',
					class: 'jspsych-slider bipolar-clicked',
					value: sliderRatings[avatarNumber],
					min: 0, max: 100, step: 1,
					id: 'rating-slider',
					oninput: `
						this.classList.remove('bipolar-clicked');
						$('#rating-slider').addClass('fade-out');
					`,
					disabled: true
				});

				const sliderRating = $('<div>', {
					style: 'position: relative;'
				}).append(
					labelElement,
					inputElement,
					$('<br>'),
					$('<span>', {
						style: 'position: absolute; left: 0; font-size: 10pt;',
						text: textDownRating
					}),
					$('<span>', {
						style: 'position: absolute; right: 0; font-size: 10pt;',
						text: textUpRating
					})
				);

				trialFormat.append(avatarContainer, sliderRating);
				trialPresentationSpace.html(`<div></div>`);
				trialPresentationSpace.append(trialFormat);

				samplingPromptContainer.empty();
				avatarCircleContainer.addClass('fade-out-partial');

				setTimeout(function () {
					const learningStartTime = (new Date()).getTime();

					let buttons = [];
					if (Array.isArray(trial.button_html)) {
						if (trial.button_html.length == trial.choices.length) {
							buttons = trial.button_html;
						};
					} else {
						for (let i = 0; i < trial.choices.length; i++) {
							buttons.push(trial.button_html);
						};
					};
					trialPresentationSpace.html(trialFormat);

					trialFeedback.html(`
						<hr></hr>
						<p>Would you like to continue sampling?</p>
						<div id="jspsych-selection-learning-btngroup" class="center-content block-center"></div>`
					);

					trialPresentationSpace.append(trialFeedback);

					for (let l = 0; l < trial.choices.length; l++) {
						var str = buttons[l].replace(/%choice%/, trial.choices[l]);
						$('#jspsych-selection-learning-btngroup').append(
							$(str).attr('id', 'jspsych-selection-learning-button-' + l)
								.data('choice', l)
								.addClass('jspsych-selection-learning-button')
								.on('click', function (e) {

									// disable all the buttons after a response
									$('.jspsych-selection-learning-button').off('click')
										.attr('disabled', 'disabled');

									// hide button
									$('.jspsych-selection-learning-button').hide();
									let choice = $('#' + this.id).data('choice');

									const curTime = Date.now();
									const learningStartRT = curTime - learningStartTime;
								})
						);
					};
					$('#jspsych-selection-learning-button-0').on('click', function (e) {
						let toc = (new Date()).getTime();
						let rt = toc - tic;
						rtArray.push(rt);
						$('#overlay').fadeOut();
						trialPresentationSpace.html(`<div id="trial-format"></div><div id="selection-format"></div>`);
						trialPresentationSpace.empty().hide();
						trialFormat.html(`<div id="trial-format"></div>`);
						trialFeedback.html('<div id="selection-buttons"></div>');

						// Fade the prompt back in
						samplingPromptContainer.html(
							`<p id="samplingPrompt" style="text-transform: uppercase;">
								<strong>click on the person whose opinion you would like to read next</strong><br>
								(scroll to view more)
							</p>`
						);

						// Fade the grid back in
						avatarCircleContainer.removeClass('fade-out-partial')
							.addClass('fade-in');
						reattachEventListeners();
					});

					$('#jspsych-selection-learning-button-1').on('click', function (e) {
						endTrial();
					});

				}, 1000); //changed this from 5000 to 3000 for the pilot because it feels very long, now 1000
			};

			const clickHandlers = {};
			let currentSelection = null; // Track the current selection

			for (let i = 1; i <= 100; i++) {
				(function (i) {
					let avatarNumber = i
					let isLearningInProgress = false; // Flag variable
					const clickHandler = function () {

						if (currentSelection !== avatarNumber) {
							// <!-- Find actual index of the avatar --> //
							avatarSelections.push(avatarNumber); // Push circle index to selections
							currentSelection = avatarNumber; // Update current selection

							if (politicalManipulation == "present") {
								var currentIndex = randomizedAvatarNumberArray.indexOf(currentSelection);
								var politicalAffiliaton = politicalAffiliationArray[currentIndex]
								avatarPoliticalAffiliations.push(politicalAffiliaton);
							};

							// <!-- Find positional index of the avatar --> //
							// Assuming you have an ID or a class for the parent div
							var parentDiv = document.getElementById('avatar-grid'); // or use document.querySelector if you have a class
							var childDivs = parentDiv.children; // or parentDiv.querySelectorAll('div') if you need a more specific selector

							// Function to find the index of a specific sub-div
							function findSubDivIndex(subDivId) {
								for (var i = 0; i < childDivs.length; i++) {
									if (childDivs[i].id === subDivId) { // or use another property to identify the sub-div
										return i; // Returns the index of the sub-div
									};
								};
								return -1; // Return -1 if the sub-div is not found
							};

							let avatarPositionIndex = findSubDivIndex('circle' + avatarNumber);
							avatarPositionIndices.push(avatarPositionIndex);

							let avatarPositionXIndex = avatarPositionIndex % 4;
							avatarPositionXIndices.push(avatarPositionXIndex);

							let avatarPositionYIndex = Math.floor(avatarPositionIndex / 4);
							avatarPositionYIndices.push(avatarPositionYIndex);
						};

						if (!isLearningInProgress && !this.classList.contains('disabled')) {

							isLearningInProgress = true; // Set flag to indicate learning is in progress

							// Disable other circles
							for (let j = 1; j <= 100; j++) {
								if (j !== i) {
									$("#circle" + j).addClass('disabled');
								};
							};

							$("#circle" + avatarNumber).css("background-color", "#bbb");  // Fades background color
							if (politicalManipulation == "present") {
								if (politicalAffiliationArray[currentIndex] == "avatar-circle-democrat") {
									$("#circle" + avatarNumber).css("border-color", "rgba(1, 67, 202, 0.5)");
								} else if (politicalAffiliationArray[currentIndex] == "avatar-circle-republican") {
									$("#circle" + avatarNumber).css("border-color", "rgba(232, 27, 35, 0.5)");
								}
							};
							$("#circle" + avatarNumber).css("border-color", "0.5");
							$("#circle" + avatarNumber).find("img.avatar-photo").css("opacity", "0.5");  // Fades avatar photo
							initLearning(avatarNumber);  // Start trial
							isLearningInProgress = false;
						};
					};

					$("#circle" + avatarNumber).on('click', clickHandler);
					clickHandlers[i] = clickHandler;

					start_time = (new Date()).getTime(); // Store the start time
				})(i);
			};

			// Function to reattach event listeners
			function reattachEventListeners() {
				for (let i = 1; i <= 100; i++) {
					$("#circle" + i)
						.removeClass('disabled')
						.on('click', clickHandlers[i]);
				};
				currentSelection = null; // Reset current selection for new phase
			};

			const endTrial = () => {
				const final_time = (new Date()).getTime();
				trialDuration = final_time - start_time;
				const trial_data = {
					"avatar_selections": avatarSelections.join(','),
					"avatar_position_indices": avatarPositionIndices.join(','),
					"avatar_position_x_indices": avatarPositionXIndices.join(','),
					"avatar_position_y_indices": avatarPositionYIndices.join(','),
					"rt_array": rtArray.join(','),
					"trial_duration": trialDuration
				};
				jsPsych.finishTrial(trial_data);
			};
		};
	};

	SelectionLearningPlugin.info = info;

	return SelectionLearningPlugin;
})(jsPsychModule);