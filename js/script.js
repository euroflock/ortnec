(f = (_) => { // just jq-ui easings
    let baseEasings = {}
    $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], (i, name) => {
        baseEasings[name] = (p) => Math.pow(p, i + 2)
    })
    $.extend(baseEasings, {
        Sine: (p) => 1 - Math.cos(p * Math.PI / 2),
        Circ: (p) => 1 - Math.sqrt(1 - p * p),
        Elastic: (p) => p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15),
        Back: (p) => p * p * (3 * p - 2),
        Bounce: (p) => {
            let pow2, bounce = 4
            while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2)
        }
    })
    $.each(baseEasings, (name, easeIn) => {
        $.easing["easeIn" + name] = easeIn
        $.easing["easeOut" + name] = (p) => 1 - easeIn(1 - p)
        $.easing["easeInOut" + name] = (p) => p < 0.5 ? easeIn( p * 2 ) / 2 : 1 - easeIn( p * -2 + 2 ) / 2
    })
})()

let currentState = 'home'
let currentData = null
const animationSpeed = 1500

const isMobile = () => {
    try {
        document.createEvent("TouchEvent")
        return true
    } catch (e) {
        return false
    }
}

Math.rnd = (min, max) => {
	min = parseInt(min, 10)
	max = parseInt(max, 10)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

$('html').toggleClass('mobile', isMobile())

window.onload = e => {
    updateState();
}

window.onpopstate = e => {
    let state = e.target.location.hash
    updateState(state)
}

updateState = state => {
    state = state || window.location.hash
    state = !state ? 'home' : state.substring(1)
    // console.log('onpopstate', state)

    $('#' + currentState).toggleClass('visible', false)
    if (state.includes('-')) {
        let temp = state.split('-')
        state = temp[0]
        let data = temp[1]
        currentData = data
    } else {
        currentData = null
    }
    currentState = state
    $('#' + currentState).toggleClass('visible', true)

    createCards()
}

createCards = (force) => {
    let state = currentState
    let $cards = $('#' + state + ' .cards .card')
    let $cardsContainer = $('#' + state + ' .cards')
    if (state == 'home') {
        if (!force) {
            setTimeout(() => {
                $("html, body").animate({scrollTop: 0}, animationSpeed, 'easeInOutExpo')
            }, 100)
        }
        if ($cards.length && !force) return
        createCardsView(CARDS_LIST, $cardsContainer)
    } else {
        let card = null
        let cardIndex = null
        if (state == 'details') {
            createDetailsView()
            let data = currentData
            if (data) {
                card = CARDS_LIST.find(f => f.id == data)
                if (card) {
                    cardIndex = CARDS_LIST.findIndex(f => f.id == data)
                }
                // console.log(card)
            }
        }
        let count = 4
        let max = CARDS_LIST.length - 1
        let randomCards = []
        while (count) {
            let r = Math.rnd(0, max);
            if (!randomCards.includes(r)) {
                if (!card || r != cardIndex) {
                    randomCards.push(r)
                    count--
                }
            }
        }
        randomCards = randomCards.map(i => CARDS_LIST[i])
        $cardsContainer.html('')
        createCardsView(randomCards, $cardsContainer)
    }
}

createCardsView = (cardsList, $container) => {
    for (let data of cardsList) {
        let $card = $('<a href="#details-' + data.id + '"><div class="card vip-' + data.vip + '" data-id="' + data.id + '"><div class="dt">' + data.dt + '</div><div class="short">' + data.short + '</div><div class="from">' + data.from + '</div></div></a>')
        $card.appendTo($container)
    }
}

$('.scroll').on('click', (e) => {
    $("html, body").animate({scrollTop: $('.cards').offset().top}, animationSpeed, 'easeInOutExpo')
})

$('.more').on('click', (e) => {
    let $cards = $('.cards');
    let newCardsTop = $cards.offset().top + $cards.height()
    createCards(true) // probably load more cards from the server, etc.
    $("html, body").animate({scrollTop: newCardsTop}, animationSpeed, 'easeInOutExpo')
})

createDetailsView = () => {
    if (currentData) {
        let data = CARDS_LIST.find(f => f.id == currentData)
        let $container = $('#details .inner.data')
        $container.html('')
        let $view = $('<div class="card-details"><div class="img" style="background-image:url(./img/' + data.img + '.png);"></div><div class="description"><div class="dt">' + data.dt + '</div><div class="title">' + data.title + '</div><div class="desc">' + data.desc + '</div><div class="note">' + data.note + '</div></div></div>')
        $view.appendTo($container)
        setTimeout(() => {
            $("html, body").animate({scrollTop: 0}, animationSpeed, 'easeInOutExpo')
        }, 100)
}
}
