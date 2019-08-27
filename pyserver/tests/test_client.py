import pytest
import time

from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from graphql_client import GraphQLClient

@pytest.mark.skip(reason="skipping for dev only")
def test_retries():
    expected_retries = 3

    client = Client(
        retries=expected_retries,
        transport=RequestsHTTPTransport(url='http://localhost:8000/graphql', use_json=True),
        fetch_schema_from_transport=True
    )

    query = gql('''
    {
        messages {
            id content
        }
    }
    ''')

    ret = client.execute(query)

    # print(f'Res: {ret}')

    assert 'messages' in ret
    assert len(ret['messages']) == 2
    assert 'id' in ret['messages'][0]

    # print("Res:", ret['messages'])

def send_response(ws):

    query = """
        query {
            tasks {
                type sourceBlob
            }
        }
    """
    print("Sending response..")
    # res = ws.query(query)
    # print(res)

    mutation = """
        mutation task($status: _TaskStatus!, $type: String!, $sourceBlob: String! ) {
            createTask(task: {status: $status, type: $type, sourceBlob: $sourceBlob }) {
                type sourceBlob
            }
        }
    """

    variables={ 'status': 'QUEUED', 'type': 'foo', 'content': 'Task has been queued' }

    res = ws.mutation(mutation, variables=variables)
    print("Res:", res)


def test_subs():

    ws = GraphQLClient('ws://localhost:8000/graphql')
    def callback(_id, message):
        print(f"msg id: {_id}. message: {message}")

        if not message or not message['payload'] or not message['payload']['data'] \
            or not message['payload']['data']['messageSent'] \
            or not message['payload']['data']['messageSent']['node']:
            return

        print(f"Task: {message['payload']['data']['messageSent']['node']}")

        type = message['payload']['data']['messageSent']['node']['type']

        time.sleep(3)   # Delays for 5 seconds.

        # print("Sending response..")
        # send_response(ws)


    query = """
        subscription {
            messageSent {
                status
                node {
                    type sourceBlob
                }
            }
        }
    """
    sub_id = ws.subscribe(query, callback=callback)