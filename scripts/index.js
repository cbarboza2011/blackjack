$(document).ready(function() {


	// Deck of Cards API
	// $.ajax({
	// 	url: 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1',
	// 	success: function(data) {
	// 		var deckId = data.deck_id;
	// 		init(deckId);
	// 	}
	// });

	// console.log(sixDecks);

// GLOBAL VARIABLES
	var sixDecks = [];
	var playerCombos, dealerCombos;

// FUNCTION SEQUENCE
	createSixDecks();

	// Place bet
	$('div.bet').on('click', function() {
		$(this).removeClass('glow');
		$('.bet-button').addClass('glow');
	});
	$('.bet-button').on('click', function() {
		event.preventDefault();
		if (!placeBet.called) {
			placeBet();
		}
	});

	// Hit button
	$('#hit').on('click', function() {
		var $currentTotal = parseInt($('.player-total').text());
		var $player = $('.player-total');
		if ($currentTotal < 21 && !dealersTurn.called) {
			var hit = hitMe($player, playerCombos);
			playerCombos = hit;
		}
	});

	// Stay button
	$('#stay').on('click', function() {
		endPlayerTurn();
		dealersTurn();
	});

	// Make six decks of cards
	function createSixDecks() {
		var pipValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		var suits = [['heart', 'H'], ['diamond', 'D'], ['spade', 'S'], ['club', 'C']];
		var deck = [];
		pipValues.forEach(function(pip) {
			suits.forEach(function(suit) {
				var values = [];
				if (!isNaN(pip)) {
					values.push(pip);
				} else if (isNaN(pip) && pip !== 'A') {
					values.push(10);
				} else if (pip === 'A') {
					values.push(11, 1);
				}
				deck.push({
					card: pip + ' of ' + suit[0] + 's',
					suit: suit[0],
					pipValue: values,
					image: 'images/card-faces/' + pip + suit[1] + '.png',
				});
			});
		});

		// Use 6 decks of cards
		for (var i = 0; i < 6; i++) {
			sixDecks = sixDecks.concat(deck);
		}
		// Shuffle all six decks
		shuffleDeck(sixDecks);
	}

	// Shuffle the deck
	function shuffleDeck(deck) {
		for (var length = deck.length - 1; length > 0; length--) {
			var swap = Math.floor(Math.random() * (length + 1));
			[deck[length], deck[swap]] = [deck[swap], deck[length]];
		}
	}

	// Place a bet
	function placeBet() {
		var $bet = parseInt($('.bet input').val());
		var $bank = parseInt($('.player-bank').text())
		var $currentBet = $('.current-bet');
		if (!isNaN($bet) && $bet <= $bank) {
			$currentBet.text(' $' + $bet);
			$('.bet input[type="text"]').val('');
			$('.place-bet .hideaway').slideUp();
			$('.player-bank').text($bank - $bet);
			placeBet.called = true;
			showFirstCards();
			dealCards();
		} else if ($bet > $bank) {
			alert('Your bet amount cannot exceed the amount in your Bank!');
		} else if (isNaN($bet)) {
			alert('You must enter a number, without "$".');
		}
	}

	// Draw a card
	function drawCard(cards) {
		$(cards).each(function(index, card) {
			var nextCard = sixDecks[0];
			$(card).css('background-image', 'url("' + nextCard.image + '")').attr('pip-value', nextCard.pipValue);
			sixDecks.shift();
		});
	}

	// Deal cards
	function dealCards() {
		var $firstCards = $('.first-card');
		var $secondCards = $('.second-card');
		var $playerTotal = $('.player-total');
		drawCard($firstCards);
		drawCard($secondCards);
		var $cards = $('.player-hand .card');
		// Get all the pip-values of the players cards
		var values = $cards.map(function(index, card) {
			return [$(card).attr('pip-value').split(',')];
		}).toArray();
		// Get all combinations of pip-values
		playerCombos = getAllCombos(values[0], values[1]);
		// Get the highest under 21
		var highestValue = highestUnder21(playerCombos);
		displayTotal(highestValue, $playerTotal);
	}

	// See if value is under 21 and display current point total or bust
	function displayTotal(value, element) {
		var $total = element;
		if (value <= 21) {
			$total.text(value);
		} else {
			$total.text('BUST!');
		}
	}

	// Get all possible pip value combinations
	function getAllCombos(arr1, arr2) {
			var allCombos = [];
			arr1.forEach(function(value1) {
				arr2.forEach(function(value2) {
					var total = parseInt(value1) + parseInt(value2);
					allCombos.push(total);
				});
			});
			return allCombos;
		}

	// Find the highest possible combination without going over 21
	function highestUnder21(combos) {
		var highestValue;
		combos.forEach(function(value) {
			if(value <= 21) {
			if (!highestValue || value > highestValue) {
				highestValue = value;
			}
		}
		});
		return highestValue;
	}

	// Hit button
	function hitMe(player, combos) {
		// debugger;
		// Draw a new card onto the board
		var $container = $('.card-container');
		var $newCard = $('<div class="card new"></div>');
		drawCard($newCard);
		$container.append($newCard);
		// Make an array of all the new cards pip-values
		var $newCards = $('.card-container .card');
		var cardValues = $newCards.map(function(index, card) {
			return [$(card).attr('pip-value').split(',')];
		}).toArray();
		console.log(cardValues);
		// Get all the possible value combinations
		var newCombos = getAllCombos(combos, cardValues);
		// Get the highest combo under 21
		var highestValue = highestUnder21(newCombos);
		displayTotal(highestValue, player);

		return newCombos
	}

	// End Player's turn
	function endPlayerTurn() {
		var $playerHand = $('.player-hand .cards');
		var $addedCards = $('.card-container .card');
		// Move all cards into player module and overlap them
		$playerHand.append($addedCards);
		$('.cards .card').css('margin-left', '-100px')
	}

	// Dealer's turn
	function dealersTurn() {
		dealersTurn.called = true;
		var $dealer = $('.dealer-total');
		var $dealerCards = $('.dealer-cards .card').not('.card-facedown');

		// Hide the Dealer's facedown card
		$('.card-facedown').fadeOut(600);
		$dealer.css('display', 'inherit');

		// Show the Dealer's total
		var values = $dealerCards.map(function(index, card) {
			return [$(card).attr('pip-value').split(',')];
		}).toArray();
		dealerCombos = getAllCombos(values[0], values[1]);
		var highestValue = highestUnder21(dealerCombos);
		displayTotal(highestValue, $dealer);

		// Dealer must hit if they have less than 17
		while (highestValue < 17) {
			var hit = hitMe($dealer, dealerCombos);
			dealerCombos = hit;
			// Show the Dealer's NEW total
			var $dealerCards = $('.dealer-cards .card').not('.card-facedown');
			var values = $dealerCards.map(function(index, card) {
				return [$(card).attr('pip-value').split(',')];
			}).toArray();
			var $newCards = $('.card-container .card');
			var newCardValues = $newCards.map(function(index, card) {
				return [$(card).attr('pip-value').split(',')];
			}).toArray();
			highestValue = highestUnder21(dealerCombos);
		}
		winOrLose();
	}

	function winOrLose() {
		var $dealerTotal = parseInt($('.dealer-total').text());
		var $playerTotal = parseInt($('.player-total').text());
		var $bet = parseInt($('.current-bet').text().replace('$', ''));
		var $bank = $('.player-bank');
		var $currentBank = parseInt($bank.text());
		var $newBank;
		if ($dealerTotal < $playerTotal) {
			$newBank = $currentBank + $bet * 2;
			setTimeout(function () {
			    alert('You won! YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal);
			}, 2000);
		} else if ($('.dealer-total').text() === 'BUST!' && $('.player-total').text() === 'BUST!') {
			$newBank = $currentBank + $bet;
			setTimeout(function () {
			    alert('Push. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal);
			}, 2000);
		} else if ($dealerTotal === $playerTotal) {
			$newBank = $currentBank + $bet;
			setTimeout(function () {
			    alert('Push. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal);
			}, 2000);
		} else if ($dealerTotal > $playerTotal) {
			$newBank = $currentBank;
			setTimeout(function () {
			    alert('You lost. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal);
			}, 2000);
		} else if ($dealerTotal <= 21 && $('.player-total').text() === 'BUST!') {
			$newBank = $currentBank;
			setTimeout(function () {
			    alert('You lost. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal);
			}, 2000);
		}


		$('.current-bet').text('');
		$bank.text($newBank.toString());
		setTimeout(function () {
		    newHand();
		}, 5000);

	}

	function showFirstCards() {
		var $firstCards = $('.first-card');
		var $secondCards = $('.second-card');
		$('.card-facedown').show();
		var $total = $('.total');
		$firstCards.removeClass('hide');
		$secondCards.removeClass('hide');
		$total.removeClass('hide');
	}

	function newHand() {
		var $firstCards = $('.first-card');
		var $secondCards = $('.second-card');
		var $total = $('.total');
		$firstCards.addClass('hide');
		$secondCards.addClass('hide');
		$total.addClass('hide');
		$('.cards .card.new').hide();
		$('.place-bet .hideaway').slideDown();
		$('.card-container').empty();
		$('.player-hand .card').css('margin', '0 10px');
		$('.dealer-total').text('');
		$('div.bet').addClass('glow');
		placeBet.called = false;
		dealersTurn.called = false;
	}

});
