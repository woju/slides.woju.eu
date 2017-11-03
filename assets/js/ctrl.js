function leader(socket) {
    function post() {
        const state = Reveal.getState();
        console.debug('state', state);
        if (!state.overview) {
            console.debug('sending state');
            socket.send(JSON.stringify({
                state: state,
            }));
        }
    };

    Reveal.addEventListener('slidechanged', post);
    Reveal.addEventListener('fragmentshown', post);
    Reveal.addEventListener('fragmenthidden', post);
    Reveal.addEventListener('paused', post);
    Reveal.addEventListener('resumed', post);

    Reveal.addEventListener('overviewhidden', post);
//  Reveal.addEventListener('overviewshown', post);
}

function exec_first() {
    console.debug('exec_first');
    Reveal.slide(0, 0, 0);
}

function exec_last() {
    console.debug('exec_last');
    Reveal.slide(Reveal.getTotalSlides(), 0, 0);
/*  
    while (!Reveal.isLastSlide()) {
        Reveal.down();
    }
*/
}

function follower(socket) {
    socket.onmessage = function (event) {
        console.debug('onmessage', event.data)
        var data = JSON.parse(event.data);
        if ('state' in data) {
            Reveal.setState(data.state);
        }
        if ('method' in data) {
            Reveal[data.method]();
        }
        if ('exec' in data) {
            switch (data.exec) {
            case 'first':
                exec_first();
                break;
            case 'last':
                exec_last();
                break;
            }
        }
    };
}

function ctrl(socket) {
    function onclick(e) {
        console.debug('onclick', this.dataset.method, this.dataset.exec);
        socket.send(JSON.stringify({
            method: this.dataset.method,
            exec: this.dataset.exec,
        }));
    }

    document.querySelectorAll('.ctrl a').forEach(function (btn) {
        console.debug(btn)
        btn.addEventListener('click', onclick);
    });
}

// vim: ts=4 sts=4 sw=4 et
