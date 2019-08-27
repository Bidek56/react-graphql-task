from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from graphql_client import GraphQLClient
import time, datetime


class TaskRunner:

    def __init__(self):
        authToken = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

        self.ws = GraphQLClient('ws://localhost:8000/graphql', authToken)

        self.mutation = """
            mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $blobs: BlobInput) {
                createTask(task: {status: $status, type: $type, time: $time, blobs: $blobs }) {
                    status
                }
            }
        """

    def run_task(self, task):

        task_type = task['type']

        msg = 'No result'

        if task_type == 'Store Groups':
            ret, msg = True, 'Done' + task_type #  etl.process_store_group_ref(account_path)
        elif task_type == 'Product Attribute':
            ret, msg = True, 'Done' + task_type # etl.process_product_attr(product_master_path, super_cat_path, cost_path)
        elif task_type == 'Promo Table(s)':
            ret, msg = True, 'Done' + task_type # etl.process_isw(source_blob, product_master_path, account_path, super_cat_path)
        else:
            ret, msg = False, 'Unknown etl task'

        time.sleep(5)   # Delays for 5 seconds.

        # del ret, etl

        return ret, msg


    def send_response(self, variables):
        res = self.ws.mutation(self.mutation, variables=variables)
        print("Res:", res)

    def subscribe(self):

        def callback(_id, message):
            print(f"Message received id: {_id}. message: {message}")

            if not message or not message['payload'] or not message['payload']['data'] \
               or not message['payload']['data']['messageSent']:
                return

            status = message['payload']['data']['messageSent']['status']

            if status == 'Started':

                task_type = message['payload']['data']['messageSent']['type']

                print(f"Task: {message['payload']['data']['messageSent']}")

                variables={ 'status': 'Queued', 'type': task_type, 'time': time.strftime("%m/%d/%Y %H:%M:%S") }
                self.send_response(variables)

                ret, msg = self.run_task(message['payload']['data']['messageSent'])

                variables={ 'status': 'Finished', 'type': task_type, 'time': time.strftime("%m/%d/%Y %H:%M:%S"),
                             'blobs': { 'source': msg }
                          }
                self.send_response(variables)

            # send_response(ws, msg)


        query = """
            subscription {
                messageSent {
                    status type time 
                    blobs { 
                        source account product category cost   
                    }
                }
            }
        """
        sub_id = self.ws.subscribe(query, callback=callback)


if __name__ == '__main__':

    task_runner = TaskRunner()

    task_runner.subscribe()