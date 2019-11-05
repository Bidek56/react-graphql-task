import React, { useEffect, useContext } from 'react';
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag';
import { StatusContext } from './StatusContext';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Assignment } from '@material-ui/icons';

// Dialog related items
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const TASK_QUERY = gql`
    query {
        tasks {
           status type time log
           blobs { 
                source account product category cost discontinued syndicated
           }
        }
    }
`;

const TASK_SUBSCRIPTION = gql`
  subscription {
    messageSent {
        status type time log blobs { 
            source account product category cost discontinued syndicated
        }
    }
  }
`;

const LOG_QUERY = gql`
    query logs($path: String) {
        log(path: $path)
    }
`

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
        dialog: {
            whiteSpace: 'pre-line'
        }
    }),
);

type taskType = {
    status: string
    type: string
    time: string
    log: string
    blobs: {
        source: string
    }
}

const ScrollDialog: React.FC<{ path: string }> = ({ path }) => {

    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');

    const descriptionElementRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        const { current: descriptionElement } = descriptionElementRef;
        if (descriptionElement !== null) {
            descriptionElement.focus();
        }
    }, [open]);

    const [getLog, { loading, error, data }] = useLazyQuery(LOG_QUERY)

    if (error) return <div>`Error:${error.message}`</div>;
    if (loading) return <div>Loading</div>;

    const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
        setOpen(true);
        setScroll(scrollType);
        getLog({ variables: { path } })
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="contained" color="primary" endIcon={<Assignment />} onClick={handleClickOpen('paper')}>Show Log</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                maxWidth='lg'
            >
                <DialogTitle id="scroll-dialog-title">Content from {path}</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {data && data.log}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const TaskItem: React.FC<{ task: taskType }> = ({ task }): JSX.Element => {

    return (
        <TableRow >
            <TableCell>{task.type}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>{task.time}</TableCell>
            <TableCell>{task.blobs && Object.entries(task.blobs)
                .filter(([key, val]) => key !== "__typename")
                .map(([key, val]) => <p key={key}>{val}</p>)}
            </TableCell>
            <TableCell>{task.log && <ScrollDialog path={task.log} />}</TableCell>
        </TableRow >)
};

const TaskTableView: React.FC<{ data: { tasks: taskType[] } }> = ({ data }): JSX.Element => {

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
                    <TableCell>Log</TableCell>
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
