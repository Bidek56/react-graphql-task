import React, { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks'

const TASK_QUERY = gql`
    query {
        tasks {
           status type time 
           blobs { 
                source account product category cost
           }
        }
    }
`;

const TASK_SUBSCRIPTION = gql`
  subscription {
    messageSent {
        status type time blobs { 
            source account product category cost
        }
    }
  }
`;

const TaskItem = ({ task }) => (
    <tr>
        <td>{task.type}</td>
        <td>{task.status}</td>
        <td>{task.time}</td>
        <td>{task.blobs && Object.entries(task.blobs)
            .filter(([key, val]) => key !== "__typename")
            .map(([key, val]) => <p key={key}>{val}</p>)}
        </td>
    </tr>
);

const TaskTableView = ({ data, subscribeToNewComments }) => {

    useEffect(() => {
        subscribeToNewComments();
    }, [])

    // console.log('Data:', data)

    return (
        <table className="table table-sm">
            <thead className="thead-light">
                <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Blobs</th>
                </tr>
            </thead>
            <tbody id="tasks">
                {data && data.tasks && data.tasks.map((task, id) => <TaskItem key={id} task={task} />)}
            </tbody>
        </table>
    );
};

const TaskList = () => {

    const { loading, error, subscribeToMore, ...result } = useQuery(TASK_QUERY)

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return <TaskTableView {...result}
        subscribeToNewComments={() => subscribeToMore({
            document: TASK_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;

                const task = subscriptionData.data.messageSent;

                // console.log('task:', task)
                // console.log("Prev:", prev)

                if (prev && prev.tasks)
                    return Object.assign({}, prev, {
                        tasks: [task, ...prev.tasks],
                    });
                else
                    return Object.assign({}, prev, {
                        tasks: [task],
                    });
            },
        })}
    />;
};

export default TaskList;
