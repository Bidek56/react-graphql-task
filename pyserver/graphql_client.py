# -*- coding: utf-8 -*-
import string, random, json, time, threading, websocket
from  custom_logger import CustomLogger

class GraphQLClient():
    """
    From: https://github.com/ecthiender/py-graphql-client
    A simple GraphQL client that works over Websocket as the transport protocol, instead of HTTP.
    This follows the Apollo protocol: https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md
    """

    def __init__(self, url, authToken):
        # constructor

        self.myLogger = CustomLogger(__name__)
        self.logger = self.myLogger.logger

        self.ws_url = url
        # websocket.enableTrace(True)
        self._conn = websocket.create_connection(self.ws_url,
                                                 on_message=self._on_message,
                                                 on_error=self._on_error,
                                                 subprotocols=["graphql-transport-ws"]
                                                 )
        self._conn.on_message = self._on_message
        self._subscription_running = False
        self._st_id = None
        self.authToken = authToken

    def _on_error(self, ws, error):
        self.logger.error(f"Error: {error}")

    def _on_message(self, message):
        data = json.loads(message)

        # skip keepalive messages
        if data['type'] != 'ka':
            self.logger.info("Ka: %s", message)

    def _conn_init(self, headers=None):
        payload = {
            'type': 'connection_init',
            'payload': { 'headers': headers, 'authToken': self.authToken }
        }

       # print(f"Conn init: {payload=}")

        self._conn.send(json.dumps(payload))
        rec = self._conn.recv()

        if len(rec):
            r = json.loads(rec)

            if r['type'] == 'error':
                self.logger.error("Error: %s", rec)
            elif r["type"] != "connection_ack":
                self.logger.error("Error: %s", rec)

    def _start(self, payload):
        _id = gen_id()
        frame = {'id': _id, 'type': 'subscribe', 'payload': payload}
        self._conn.send(json.dumps(frame))
        return _id

    def _stop(self, _id):
        payload = {'id': _id, 'type': 'complete'}
        self._conn.send(json.dumps(payload))
        return self._conn.recv()

    def query(self, query, variables=None, headers=None):
        self._conn_init(headers)
        payload = {'headers': headers, 'query': query, 'variables': variables}
        _id = self._start(payload)
        res = self._conn.recv()
        self._stop(_id)
        return res

    def mutation(self, mutation, variables=None, headers=None):
        # self._conn_init(headers)
        payload = {'headers': headers, 'query': mutation, 'variables': variables}
        _id = self._start(payload)
        res = self._conn.recv()
        self._stop(_id)
        
        return res

    def subscribe(self, query, variables=None, headers=None, callback=None):
        self._conn_init(headers)
        payload = {'headers': headers, 'query': query, 'variables': variables}
        _cc = self._on_message if not callback else callback
        _id = self._start(payload)
        def subs(_cc):
            self._subscription_running = True
            while self._subscription_running:
                rec = self._conn.recv()
                if len(rec):
                    r = json.loads(rec)
                else:
                    self.logger.info("Empty sub string")
                    continue

                if r['type'] == 'error':
                    self.logger.error("Error: %s", r)
                    break

                if r['type'] == 'complete':
                    continue

                    # self.stop_subscribe(_id)
                    # break
                elif r['type'] != 'ka':
                    _cc(_id, r)
                time.sleep(1)

        self._st_id = threading.Thread(target=subs, args=(_cc,))
        self._st_id.start()
        return _id

    def stop_subscribe(self, _id):
        self._subscription_running = False
        self._st_id.join()
        self._stop(_id)

    def close(self):
        self._conn.close()


# generate random alphanumeric id
def gen_id(size=6, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
