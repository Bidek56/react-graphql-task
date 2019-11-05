from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from graphql_client import GraphQLClient
import time, datetime
from pytz import timezone
from datetime import datetime
from  custom_logger import CustomLogger

class TaskRunner:

    def __init__(self):
        authToken = '$2a$04$QjLmJvTZdxA8xbUUxMMQ1uwJukncFPPfSUPD7cK4wa2s.4zDWh7aC'

        self.ws = GraphQLClient('ws://localhost:8000/graphql', authToken)

        self.mutation = """
            mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $log: String, $blobs: BlobInput) {
                createTask(task: {status: $status, type: $type, time: $time, log: $log, blobs: $blobs }) {
                    status
                }
            }
        """

        self.subscription = """
            subscription {
                messageSent {
                    status type time log
                    blobs {
                        source account product category cost discontinued syndicated
                    }
                }
            }
        """

        self.myLogger = CustomLogger(__name__)
        self.logger = self.myLogger.logger


    def run_task(self, task):
        ret = False
        msg = 'No result'
        log = ''

        try:
            # get task type
            if not 'type' in task:
                return False, "No task type found"

            task_type = task['type']

            if not 'blobs' in task:
                return False, "No input blobs found"

            blobs = task['blobs']

            self.logger.info('Task Running: %s blobs: %s', task_type, blobs) 

            if task_type == 'Store Groups':
                ret, msg = True, 'Done' + task_type #  etl.process_store_group_ref(account_path)
            elif task_type == 'Product Attribute':
                ret, msg = True, 'Done' + task_type # etl.process_product_attr(product_master_path, super_cat_path, cost_path)
            elif task_type == 'Promo Table':
                ret, msg = True, 'Done' + task_type # etl.process_isw(source_blob, product_master_path, account_path, super_cat_path)
            else:
                ret, msg = False, 'Unknown etl task'

            time.sleep(3)   # Delays for 5 seconds.

            # del ret, etl

        except Exception as e:
            msg = f'Task error: {e}'
            self.logger.error(msg)
            return False, msg

        return ret, msg, 'log'


    def send_response(self, variables):
        res = self.ws.mutation(self.mutation, variables=variables)
        print("Res:", res)

    def callback(self, _id, message):

        self.logger.info("Message id: %s message: %s", _id, message)

        if not message or not message['payload'] or not message['payload']['data'] \
            or not message['payload']['data']['messageSent']:
            return

        self.logger.info("Task: %s", message['payload']['data']['messageSent'])

        status = message['payload']['data']['messageSent']['status']

        if status == 'Started':

            task_type = message['payload']['data']['messageSent']['type']

            eastern = timezone('US/Eastern')
            variables={ 'status': 'Queued', 'type': task_type, 'time': datetime.now(eastern).strftime("%m/%d/%Y %I:%M:%S %p") }
            self.send_response(variables)

            # self.logger.info("Submitting Task: %s", message['payload']['data']['messageSent'])
            ret, msg, log = self.run_task(message['payload']['data']['messageSent'])

            variables={ 'status': 'Finished', 'type': task_type, 'time': datetime.now(eastern).strftime("%m/%d/%Y %I:%M:%S %p"), 'log': log, 'blobs': { 'source': msg } }
            self.send_response(variables)

    def subscribe(self):
        sub_id = self.ws.subscribe(self.subscription, callback=self.callback)
        self.logger.info("Subscribing to: %s", sub_id)


if __name__ == '__main__':

    task_runner = TaskRunner()

    task_runner.subscribe()