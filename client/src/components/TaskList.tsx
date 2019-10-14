import React, { useEffect, useContext } from 'react';
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag';
import { StatusContext } from '../context/StatusContext';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

const TASK_QUERY = gql`
    query {
        tasks {
           status type time 
           blobs { 
                source account product category cost sales
           }
        }
    }
`;

const TASK_SUBSCRIPTION = gql`
  subscription {
    messageSent {
        status type time blobs { 
            source account product category cost sales
        }
    }
  }
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            marginTop: theme.spacing(3),
            overflowX: 'auto',
        },
        table: {
            minWidth: 650,
        },
        head: {
            backgroundColor: '#e3f2fd',
            color: theme.palette.common.white,
        },
    }),
);

type taskType = {
    status: string
    type: string
    time: string
    blobs: {
        source: string
    }
}
const TaskItem: React.FC<{ task: taskType }> = ({ task }): JSX.Element => (
    <TableRow>
        <TableCell>{task.type}</TableCell>
        <TableCell>{task.status}</TableCell>
        <TableCell>{task.time}</TableCell>
        <TableCell>{task.blobs && Object.entries(task.blobs)
            .filter(([key, val]) => key !== "__typename")
            .map(([key, val]) => <p key={key}>{val}</p>)}
        </TableCell>
    </TableRow>
);

const TaskTableView: React.FC<{ data: { tasks: taskType[] } }> = ({ data }): JSX.Element => {

    // console.log('Data:', data)

    const classes = useStyles();

    const { setRunning } = useContext<{ running: boolean; setRunning: React.Dispatch<React.SetStateAction<boolean>>; }>(StatusContext);

    if (!data || !data.tasks)
        return (<div />)

    // set running status
    setRunning(data && data.tasks && data.tasks[0] && data.tasks[0].status !== 'Finished')

    return (
        <Table className={classes.table}>
            <TableHead className={classes.head}>
                <TableRow>
                    <TableCell>Task Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Input/Output Blobs</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data && data.tasks && data.tasks.map((value: taskType, index: number) => <TaskItem key={index} task={value} />)}
            </TableBody>
        </Table>
    );
};

const TaskList: React.FC = (): JSX.Element => {

    const subscribeToNewComments = () => subscribeToMore({
        document: TASK_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;

            const task: taskType = subscriptionData.data.messageSent;

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
    })

    useEffect(() => {
        subscribeToNewComments();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { loading, error, subscribeToMore, ...result } = useQuery<any, Record<string, taskType>>(TASK_QUERY)

    // if network errors
    if (result && result.networkStatus === 8)
        return <p>Apollo Client Network Error</p>;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return <TaskTableView data={result.data} />;
};

export default TaskList;
