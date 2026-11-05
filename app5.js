"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("cards-grid");
    const statusText = document.getElementById("game-status");
    const btnReiniciar = document.getElementById("btn-reiniciar");
    const diffBtns = document.querySelectorAll(".difficulty-btn");

    let targetNumber = null;
    let gameState = "IDLE"; // IDLE, SHUFFLING, GUESSING, FINISHED
    let speed = 700;
    let totalSwaps = 10;

    // Ajustar dificultad
    diffBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (gameState !== "IDLE" && gameState !== "FINISHED") return;
            diffBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            speed = parseInt(btn.dataset.speed, 10);
            totalSwaps = parseInt(btn.dataset.swaps, 10);
        });
    });

    // Crear el tablero de 20 cartas circulares
    function initGame() {
        grid.replaceChildren();
        gameState = "IDLE";
        targetNumber = null;
        statusText.textContent = "Haz clic en cualquier número del 1 al 20 para seleccionarlo";
        btnReiniciar.style.display = "none";

        const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

        numbers.forEach((num) => {
            const card = document.createElement("div");
            card.className = "card-item";
            card.dataset.number = String(num);

            // Se reemplaza el emoji por el Logo oficial
            card.innerHTML = `
                <div class="card-face card-front">
                    <span>${num}</span>
                </div>
                <div class="card-face card-back">
                    <img src="Logo_DMO.png" alt="Logo D.M.O" class="card-logo-img">
                    <span class="card-brand">D.M.O</span>
                </div>
            `;

            card.addEventListener("click", () => handleCardClick(card, num));
            grid.appendChild(card);
        });
    }

    // Manejar clics y lanzar la alerta al finalizar
    function handleCardClick(cardElement, number) {
        if (gameState === "IDLE") {
            targetNumber = number;
            gameState = "SHUFFLING";
            statusText.textContent = `¡Elegiste el ${targetNumber}! Memoriza la carta... Girando...`;

            // Dar la vuelta a todas las cartas
            setTimeout(() => {
                const allCards = document.querySelectorAll(".card-item");
                allCards.forEach((c) => c.classList.add("flipped"));

                setTimeout(() => {
                    startShuffling();
                }, 700);
            }, 600);

        } else if (gameState === "GUESSING") {
            const clickedNum = parseInt(cardElement.dataset.number, 10);
            cardElement.classList.remove("flipped");

            if (clickedNum === targetNumber) {
                cardElement.classList.add("correct");
                statusText.textContent = `🎉 ¡Excelente! Encontraste el número ${targetNumber}`;
                
                // Alerta de victoria para el cliente
                setTimeout(() => {
                    alert("¡Felicidades, ganaste! 🏆 Demostraste una gran memoria y agilidad con D.M.O Soluciones Mayoristas.");
                }, 300);

            } else {
                cardElement.classList.add("wrong");
                statusText.textContent = `❌ ¡Fallaste! Seleccionaste el ${clickedNum}. El correcto era el ${targetNumber}.`;

                // Revelar también la carta correcta
                const correctCard = Array.from(document.querySelectorAll(".card-item"))
                    .find((c) => parseInt(c.dataset.number, 10) === targetNumber);
                if (correctCard) correctCard.classList.remove("flipped");

                // Alerta de derrota con mensaje amigable
                setTimeout(() => {
                    alert("¡Oh no, perdiste! 😅 Suerte para la próxima, ¡sigue explorando nuestros catálogos y vuelve a intentar!");
                }, 300);
            }

            gameState = "FINISHED";
            btnReiniciar.style.display = "block";
        }
    }

    // Animación física de movimiento intercambiando posiciones
    async function startShuffling() {
        statusText.textContent = "¡Mezclando cartas... Sigue tu número!";
        const cards = Array.from(document.querySelectorAll(".card-item"));

        for (let i = 0; i < totalSwaps; i++) {
            const idx1 = Math.floor(Math.random() * cards.length);
            let idx2 = Math.floor(Math.random() * cards.length);
            while (idx1 === idx2) idx2 = Math.floor(Math.random() * cards.length);

            const card1 = cards[idx1];
            const card2 = cards[idx2];

            const rect1 = card1.getBoundingClientRect();
            const rect2 = card2.getBoundingClientRect();

            const deltaX1 = rect2.left - rect1.left;
            const deltaY1 = rect2.top - rect1.top;
            const deltaX2 = rect1.left - rect2.left;
            const deltaY2 = rect1.top - rect2.top;

            card1.style.transition = `transform ${speed / 1000}s ease-in-out`;
            card2.style.transition = `transform ${speed / 1000}s ease-in-out`;

            card1.style.transform = `translate(${deltaX1}px, ${deltaY1}px) rotateY(180deg) scale(1.08)`;
            card2.style.transform = `translate(${deltaX2}px, ${deltaY2}px) rotateY(180deg) scale(1.08)`;
            card1.style.zIndex = "10";
            card2.style.zIndex = "10";

            await new Promise((resolve) => setTimeout(resolve, speed));

            card1.style.transition = "none";
            card2.style.transition = "none";
            card1.style.transform = "";
            card2.style.transform = "";
            card1.style.zIndex = "";
            card2.style.zIndex = "";

            const tempNode = document.createElement("div");
            grid.insertBefore(tempNode, card1);
            grid.insertBefore(card1, card2);
            grid.insertBefore(card2, tempNode);
            grid.removeChild(tempNode);

            const tempCard = cards[idx1];
            cards[idx1] = cards[idx2];
            cards[idx2] = tempCard;
        }

        cards.forEach((c) => { c.style.transition = ""; });

        statusText.textContent = `¿Dónde quedó el número ${targetNumber}? ¡Haz clic para adivinar!`;
        gameState = "GUESSING";
    }

    btnReiniciar.addEventListener("click", initGame);

    initGame();
});