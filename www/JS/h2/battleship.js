var random = Math.floor(Math.random() * 5);
var location1 = random;
var location2 = location1 + 1;
var location3 = location2 + 1;

var guess;
var hits = 0;
var guesses = 0;

var isSunk = false;

while (isSunk == false) {

guess = prompt("Стреляй! (введите число от 0 до 6):");


	if (guess < 0 || guess > 6) {
		alert("Введите число от 0 до 6");
	} else {
		guesses = guesses + 1;

		if (guess==location1 || guess==location2 || guess==location3) {
			hits = hits + 1;
			alert("Попал!");

			if (hits == 3) {
				isSunk = true;
				alert("Корабль потоплен!");
			}
		} else {
			alert("Мимо!");
		}

	}
}

var stats = "Ты сделал " + guesses + " выстрелов, " 
						+ "точность выстрелов " + (3/guesses);
alert(stats);