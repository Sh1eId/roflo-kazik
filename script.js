const button = document.querySelector('.spin-button');
var random = true;
 
button.addEventListener('click', function() {
	setTimeout(rollAll, 100);
	// Блокирует кнопку
	button.disabled = true;
});

// Инициализация переменных
const debugEl = document.getElementById('debug'),
			// Сопоставление индексов с иконками
			iconMap = ["podval", "roflan", "jaba", "barny", "1win", "adun", "FBI_roflan", "rice"],
			// Width of the icons
			icon_width = 79,	
			// Высота одной иконки
			icon_height = 79,	
			// Количество иконок
			num_icons = 8,	
			// Максимальная скорость в мс для анимации одного значка вниз
			time_per_icon = 100,
			// Содержит индексы значков
			indexes = [0, 0, 0, 0, 0];


/** 
 * Roll one reel
 */

const norand = {
    command() {
		if(random){
			random = false;
                console.log("random off");
		}else{
			random = true;
                console.log("random on");
		}
    
    },
};
const roll = (reel, offset = 0) => {
	// Определяем количество иконок, на которые будет происходить вращение
	var delta;
	if(random){
	delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);
	}else{
	delta = 1;
	}
	// Возвращаем промис, чтобы дождаться завершения всех вращений
	return new Promise((resolve, reject) => {
		
		const style = getComputedStyle(reel), // Получаем стили рулета
					// Текущая позиция фона
					backgroundPositionY = parseFloat(style["background-position-y"]),
					// Целевая позиция фона
					targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
					// Нормализованная позиция фона для сброса
					normTargetBackgroundPositionY = targetBackgroundPositionY%(num_icons * icon_height);
		
		// Задержка для избегания сбоев анимации
		setTimeout(() => { 
			// Устанавливаем параметры анимации
			reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
			// Обновляем позицию фона
			reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
		}, offset * 150);
			
		 // Обновляем позицию фона
		setTimeout(() => {
			// Сбрасываем позицию, чтобы не было бесконечного смещения
			reel.style.transition = `none`;
			reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
			// Завершаем промис, возвращая количество сдвинутых иконок
			resolve(delta%num_icons);
		}, (8 + 1 * delta) * time_per_icon + offset * 150);
		
	});
};

/**
 *  Функция для вращения всех рулетов
 */
function rollAll() {
	
	debugEl.textContent = 'rolling...';
	
	const reelsList = document.querySelectorAll('.slots > .reel');
	
	Promise
		
		// Активируем каждый рулет, преобразуя NodeList в массив
		.all( [...reelsList].map((reel, i) => roll(reel, i)) )	
		
		// Когда все рулеты завершили анимацию
		.then((deltas) => {
			// Обновляем индексы по всем рулетам
			deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta)%num_icons);
			debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');
		
			// Условия выигрыша
			if (indexes[0] === indexes[1] && indexes[1] === indexes[2] && indexes[2] === indexes[3] && indexes[3] === indexes[4]){
				const winCls = indexes[0] == indexes[1] == indexes[2] == indexes[3] == indexes[4]? "win2" : "win1";
				document.querySelector(".slots").classList.add(winCls);
				setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 1350)
				var audio = new Audio('jackpot.mp3');
                                audio.play();
			}
		     button.disabled = false;
			// Можно добавить возможность запустить ещё раз
			//setTimeout(rollAll, 3000);
		});
};
