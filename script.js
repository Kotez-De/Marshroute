let map;

ymaps.ready(init);

function init() {
    map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 13
    });
}

async function calculateRoutes() {
    const resultsDiv = document.getElementById('results');

    // Показываем индикатор загрузки при нажатии кнопки
    resultsDiv.innerHTML = '<div class="loading">Загружаем данные о транспорте...</div>';

    try {
        // Фиксированные точки маршрута
        const start = "Зелёный проспект, 65, Москва";
        const end = "Улица Молостовых, 10А, Москва";

        // Получаем координаты начальной точки
        const startCoords = await getCoordinates(start);

        // Строим маршрут общественным транспортом
        const routeData = await buildTransportRoute(startCoords, end);

        // Анализируем варианты с учётом реального транспорта
        const analysis = analyzeRealTimeOptions();

        // Отображаем результаты
        displayResults(analysis, resultsDiv);

        // Показываем карту с маршрутом
        showRouteOnMap(routeData);
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Ошибка загрузки данных: ${error.message}</p>`;
    }
}

async function getCoordinates(address) {
    return new Promise((resolve, reject) => {
        ymaps.geocode(address).then(function(res) {
            const coords = res.geoObjects.get(0).geometry.getCoordinates();
            resolve(coords);
        }, function(err) {
            reject(new Error('Не удалось определить координаты'));
        });
    });
}

async function buildTransportRoute(startCoords, endAddress) {
    return new Promise((resolve, reject) => {
        ymaps.route([
            startCoords,
            endAddress
        ], {
            routingMode: 'masstransit'
        }).then(function(route) {
            resolve(route);
        }, function(error) {
            reject(error);
        });
    });
}

function analyzeRealTimeOptions() {
    // В реальности эти данные нужно получать через API Яндекс.Расписания
    // Здесь — примерные значения для демонстрации

    const options = [
        {
            id: 1,
            title: 'Ждать автобус на остановке «Зелёный проспект, 65»',
            totalTime: 25,
            waitTime: 5,
            walkTime: 6,
            transportTime: 14,
            description: 'Автобусы: т77, 617, 659. Ближайший автобус т77 приедет через 5 минут.',
            buses: ['т77 (5 мин)', '617 (8 мин)', '659 (12 мин)']
        },
        {
            id: 2,
            title: 'Дойти до остановки «Метро Новогиреево 1В»',
            totalTime: 22,
            waitTime: 4,
            walkTime: 8,
            transportTime: 10,
            description: 'Пешком 8 минут до остановки. Автобусы: 617, м64, 635. Ближайший — 617 через 4 минуты.',
            buses: ['617 (4 мин)', 'м64 (7 мин)', '635 (10 мин)']
        },
        {
            id: 3,
            title: 'Дойти до остановки «Метро Новогиреево 3А_3В»',
            totalTime: 24,
            waitTime: 6,
            walkTime: 9,
            transportTime: 9,
            description: 'Пешком 9 минут до остановки. Автобусы: 247, т77, 237, 659. Ближайший — т77 через 6 минут.',
            buses: ['т77 (6 мин)', '247 (8 мин)', '237 (11 мин)', '659 (15 мин)']
        },
        {
            id: 4,