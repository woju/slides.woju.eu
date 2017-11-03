#!/usr/bin/env python3

import asyncio
import collections
import logging
import os
import signal
import socket
import sys

from aiohttp import web

app = web.Application()
app['websockets'] = collections.defaultdict(set)

async def websocket_handler(request):
    stem = request.match_info['stem']
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    request.app['websockets'][stem].add(ws)

    try:
        async for msg in ws:
            for peer in request.app['websockets'][stem]:
                if peer is ws:
                    continue
                peer.send_str(msg.data)
    finally:
        request.app['websockets'][stem].remove(ws)

    return ws

# TODO auth

app.router.add_get('/{stem}', websocket_handler)

# influenced by http://uwsgi.readthedocs.io/en/latest/WorkerOverride.html
def main_uwsgi(app):
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.NOTSET,
        format='%(message)s',
    )

    loop = asyncio.get_event_loop()
    loop.add_signal_handler(signal.SIGINT, sys.exit)
    loop.add_signal_handler(signal.SIGHUP, sys.exit)

    handler = app.make_handler()
    servers = []

    for fileno in uwsgi.sockets:
        logging.info('listening on fd=%d', fileno)
        servers.append(loop.run_until_complete(loop.create_unix_server(handler,
            sock=socket.socket(socket.AF_UNIX, socket.SOCK_STREAM,
                fileno=fileno))))

    os.umask(0o027)
    loop.call_soon(uwsgi.accepting)
    loop.run_forever()

if __name__ == '__main__':
    try:
        import uwsgi
    except ImportError:
        web.run_app(app)
    else:
        main_uwsgi(app)


# vim: ts=4 sts=4 sw=4 et
