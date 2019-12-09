$(document).ready(function() {

// -- Global Variables --
	var sixDecks = [];

// -- Game Steps --
// Create 6 decks of cards and shuffle them
	createSixDecks();
	newHand();
// Player places a bet
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

// Player hits
	$('#hit').on('click', function() {
		$('#dbl-down').fadeOut();
		var $playerTotal = $('span.player-total');
		var $total = parseInt($playerTotal.text());
		var $cards = $('.card.new, .player-hand .card');
		if ($total < 21){
				hit($playerTotal, $cards);
		}
	});

// Player stays
	$('#stay').on('click', function() {
		endPlayerTurn();
	});

// Player doubles down
	$('#dbl-down').on('click', function() {
		// doubledown();
		var $betValue = parseInt($('.current-bet').text().replace('$', ''));
		var $betInput = $('.current-bet');
		$betInput.text('$' + $betValue * 2);
		var $playerTotal = $('span.player-total');
		var $playerCards = $('.card.new, .player-hand .card');
		hit($playerTotal, $playerCards);
		if ($playerTotal.text() === 'BUST!') {
			winOrLose();
		} else {
			endPlayerTurn();
		}
	});

// -- Functions --
// MAKE 6 DECKS OF CARDS
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
	// USE 6 DECKS OF CARDS
		for (var i = 0; i < 6; i++) {
			sixDecks = sixDecks.concat(deck);
		}
	// SHUFFLE ALL 6 DECKS
		shuffle(sixDecks);
	}

// SHUFFLE
	function shuffle(deck) {
		for (var length = deck.length - 1; length > 0; length--) {
			var swap = Math.floor(Math.random() * (length + 1));
			[deck[length], deck[swap]] = [deck[swap], deck[length]];
		}
	}

// PLACE BET
	function placeBet() {
		var $bet = parseInt($('.bet-input').val())
		var $bank = parseInt($('.player-bank').text())
		var $currentBet = $('.current-bet');
		if (!isNaN($bet) && $bet <= $bank && $bet !== 0) {
			$currentBet.text(' $' + $bet);
			$('.bet input[type="text"]').val('');
			$('.place-bet .hideaway').slideUp();
			$('.player-bank').text($bank - $bet);
			placeBet.called = true;
			dealFirstCards();
		} else if ($bet > $bank) {
			var $message = 'Bet cannot exceed the amount in your bank!';
			alertModal($message);
		} else if (isNaN($bet)) {
			var $message = 'Enter a number, without "$".';
			alertModal($message);
		} else if ($bet === 0) {
			var $message = "Betting nothing won't get you very far...";
			alertModal($message);
		}
	}

// DEAL FIRST CARDS
	function dealFirstCards() {
		var $firstCards = $('.first-card');
		var $secondCards = $('.second-card');
		var $total = $('div.player-total');
		var $totalSpan = $('span.player-total');
		var $player = $('.player-hand .card');
		var $buttons = $('#hit, #stay, #dbl-down');
		drawCard($firstCards);
		drawCard($secondCards);
		$('.card-facedown').show();
		$firstCards.removeClass('hide');
		$secondCards.removeClass('hide');
		$total.removeClass('hide');
		$buttons.slideDown(600);
		var $playerCards = getCardValues($player);
		var playerCombos = getAllCombos($playerCards[0], $playerCards[1]);
		var $playerTotal = highestUnder21(playerCombos)
		displayTotal($playerTotal, $totalSpan);
		dealFirstCards.called = true;
		if ($playerTotal === 21) {
				winOrLose();
		}
	}

// STORE CARD PIP VALUES IN AN ARRAY
	function getCardValues(cards) {
		var values = cards.map(function(index, card) {
			return [$(card).attr('pip-value').split(',')];
		}).toArray();
		return values;
	}

// ADD TOGETHER SINGLE CARD VALUES
	function addSingleValues(array) {
		var total = 0;
		array.forEach(function(value) {
			if (value.length === 1) {
				total = [parseInt(value) + parseInt(total)];
			}
		});
		return total;
	}

// FIND THE ACES
	function getAces(cards) {
		var aces = [];
		cards.map(function(value) {
			if (value.length === 2) {
				aces.push(value);
			}
		});
		if (aces.length > 1) {
			var aceCombos = [];
			for (var i = 0; i < aces.length; i++) {
				for (var k = i + 1; k < aces.length; k++) {
					if (aces[i] != aces[k]) {
						aceCombos = getAllCombos(aces[i], aces[k]);
						}
					}
				}
				return aceCombos;
			} else if (aces.length === 1) {
				ace = aces[0];
				return ace;
			} else {
				return aces;
			}
		}

// GET ALL CARD COMBOS AS AN ARRAY
	function getAllCombos(array1, array2) {
		var allCombos = [];
		array1.forEach(function(value1) {
			array2.forEach(function(value2) {
				var total = parseInt(value1) + parseInt(value2);
				allCombos.push(total);
			});
		});
		return allCombos;
	}

// FIND HIGHEST POSSIBLE COMBO UNDER 21
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

// GET TOTAL
	function getTotal(cards, input) {
		var $cards = getCardValues(cards);
		var $combos = getAllCombos($cards[0], $cards[1]);
		var $total = highestUnder21($combos);
		return $total;
	}

// DISPLAY TOTAL
	function displayTotal(value, element) {
		var $total = element;
		if (value <= 21) {
			$total.text(value);
			if (!dealersTurn.called && $total === 21) {
				endPlayerTurn();
			}
		} else {
			$total.text('BUST!');
			if (!dealersTurn.called) {
					winOrLose();
			}
		}
	}

// DRAW ONE CARD
	function drawCard(cards) {
		$(cards).each(function(index, card) {
			var nextCard = sixDecks[0];
			$(card).css('background-image', 'url("' + nextCard.image + '")').attr('pip-value', nextCard.pipValue);
			sixDecks.shift();
		});
	}

// HIT
	function hit(totalInput, cards){
			// Draw a new card onto the board
			var $container = $('.card-container');
			var $newCard = $('<div class="card new"></div>');
			drawCard($newCard);
			$container.append($newCard);
			$newCard.fadeIn(600);
			// Get all card values
			cards.push($newCard);
			var $cardValues = getCardValues(cards);
			var $singles = addSingleValues($cardValues);
			// Check for aces & display a new total
			var $aces = getAces($cardValues);
			if ($aces.length > 0) {
				var $allCombos = getAllCombos($singles, $aces);
				var $highestPossible = highestUnder21($allCombos);
				displayTotal($highestPossible, totalInput);
			} else {
				displayTotal($singles, totalInput);
			}
	}

// END TURN (STAY)
	function endPlayerTurn() {
		var $playerHand = $('.player-hand .cards');
		var $addedCards = $('.card-container .card');
		// Hide the buttons in the Player module
		$('#stay, #hit, #dbl-down').fadeOut(600);
		// Move all cards into player module and overlap them
		$playerHand.append($addedCards);
		$('.cards .card').animate({marginLeft: '-100px'});
		setTimeout(function() {
			dealersTurn();
		}, 1000);
	}

// DEALER TURN
	function dealersTurn() {
		dealersTurn.called = true;
		// Show the Dealer's facedown card
		$('.card-facedown').fadeOut(600);
		// Show Dealer's initial total
		var $dealerTotalSpan = $('span.dealer-total');
		$dealerTotalSpan.css('display', 'inherit');
		var $dealerCards = $('.dealer-cards .card').not('.card-facedown');
		$dealerTotal = getTotal($dealerCards, $dealerTotalSpan);
		displayTotal($dealerTotal, $dealerTotalSpan);
		// Dealer must hit if total is less than 17
		if ($dealerTotal < 17) {
			(function dealerHit($dealerTotal) {
				setTimeout(function() {
					hit($dealerTotalSpan, $dealerCards);
					total = parseInt($dealerTotalSpan.text());
					if (total < 17) {
						dealerHit(total);
					} else {
						winOrLose();
					}
				}, 1500);
			})();
		} else {
			winOrLose();
		}
	}

// COMPARE DEALER TO PLAYER (WIN, LOSE, PUSH)
	function winOrLose() {
		var $dealerTotal = parseInt($('.dealer-total').text());
		var $playerTotal = parseInt($('span.player-total').text());
		var $bet = parseInt($('.current-bet').text().replace('$', ''));
		var $bank = $('.player-bank');
		var $currentBank = parseInt($bank.text());
		var $newBank, $message;
		// var $alert = $('.alert-message');
		// switch($playerTotal) {
		// 	case $playerTotal > $dealerTotal:
		// 	$newBank = $currentBank + $bet * 2;
		// 	$message = 'You won $' + $bet * 2 + '! YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal;
		// 	break;
		// 	case $playerTotal === 21 && !dealersTurn.called:
		// 	$newBank = $currentBank + $bet * 2.5;
		// 	$messsage = 'BLACKJACK! You won $' + $bet * 2.5 + '!';
		// 	break;
		// 	case isNaN($playerTotal) && !dealersTurn.called:
		// 	$newBank = $currentBank;
		// 	$message = 'You lost $' + $bet + '. Bust!';
		// 	break;
		// 	case $dealerTotal === $playerTotal:
		// 	$newBank = $currentBank + $bet;
		// 	$message = 'Push. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal;
		// 	break;
		// 	case $playerTotal < $dealerTotal:
		// 	$newBank = $currentBank;
		// 	$message = 'You lost $' + $bet + '. YOU: ' + $playerTotal + ' DEALER: ' + $dealerTotal;
		// 	break;
		// 	case $playerTotal <= 21 && isNaN($dealerTotal):
		// 	$newBank = $currentBank + $bet * 2;
		// 	$message = 'You won $' + $bet * 2 + '! YOU: ' + $playerTotal + ' DEALER: Bust!';
		// 	break;
		// 	default:
		// 	$message = 'Something is not right...'
		// }
		// $modalText.text($message);
		// $('.modal').show();
		// setTimeout(function() {
		// 	$('.modal').fadeOut();
		// }, 4000);
		// $('.close').on('click', function() {
		// 	$('.modal').hide();
		// });

		if ($dealerTotal < $playerTotal) {
			$newBank = $currentBank + $bet * 2;
			$message = 'You won $' + $bet + '!';
		} else if ($playerTotal === 21 && !dealersTurn.called) {
			$newBank = $currentBank + $bet * 1.5;
			$message = 'BLACKJACK! You won $' + $bet * 1.5 + '!';
		} else if (isNaN($playerTotal) && !dealersTurn.called) {
			$newBank = $currentBank;
			$message = 'You lost $' + $bet + '.';
		} else if ($dealerTotal === $playerTotal) {
			$newBank = $currentBank + $bet;
			$message = 'Push!';
		} else if ($dealerTotal > $playerTotal) {
			$newBank = $currentBank;
			$message = 'You lost $' + $bet + '.';
		} else if ($playerTotal <= 21 && isNaN($dealerTotal)) {
			$newBank = $currentBank + $bet * 2;
			$dealerTotal = 'Bust!';
			$message = 'You won $' + $bet + '!';
		}
		// Start new hand after 5 seconds
		setTimeout(function() {
			alertModal($message, $playerTotal, $dealerTotal);
			setTimeout(function () {
				$bank.text($newBank);
				newHand();
			}, 3000);
		}, 2000);
	}

// MAKE TEXT GREEN
	function green(text) {
		$(text).css('color', '#477148');
	}

// MAKE TEXT RED
	function red(text) {
		$(text).css('color', '#591D1D');
	}
// SHOW MODAL
	function alertModal(message, result1, result2) {
		$alertMessage = $('.alert-message');
		$results = $('.results');
		$player = $('.you');
		$dealer = $('.dealer');
		$alertMessage.text(message);
		if (result2) {
			$results.show();
			$player.text(result1);
			$dealer.text(result2);
			if (result1 > result2) {
				green($player);
				red($dealer);
			} else if (result1 < result2) {
				red($player);
				green($dealer);
			}
		} 
		$('.modal').fadeIn(400);
		setTimeout(function() {
			$('.modal').fadeOut(1000);
		}, 2000);
	}

// CLOSE MODAL
	$('.close').on('click', function() {
		if (dealFirstCards.called) {
			newHand();
		} else {
			$('.modal').hide();
		}
	});

// END HAND
	function newHand() {
		var $firstCards = $('.first-card');
		var $secondCards = $('.second-card');
		$firstCards.addClass('hide');
		$secondCards.addClass('hide');
		$('.action .button, .results').hide();
		$('div.player-total').addClass('hide');
		$('span.player-total').text('');
		$('.current-bet').text('');
		$('.bet-button').removeClass('glow');
		$('.cards .card.new').remove();
		$('.place-bet .hideaway').slideDown();
		$('.card-container').empty();
		$('.player-hand .card').css('margin', '0 10px');
		$('.dealer-total').text('');
		$('div.bet').addClass('glow');
		$('.bet-input').focus();
		placeBet.called = false;
		dealersTurn.called = false;
	}


});
