import React, { useEffect, useContext } from 'react';
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { useCookies } from 'react-cookie';
import { StatusContext, contextType } from './StatusContext';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Assignment } from '@mui/icons-material';

// Dialog related items
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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

    const [cookies, ,] = useCookies(['token']);

    let authorization = 'Bearer '
    if (cookies && cookies.token)
        authorization += cookies.token

    const [getLog, { loading, error, data }] = useLazyQuery(LOG_QUERY, { context: { headers: { 'authorization': authorization } } })

    if (!cookies || !cookies.token)
        return <div>Error finding authorization token</div>

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
        </TableRow >
    )
};

const TaskTableView: React.FC<{ messageSent: taskType }> = ({ messageSent }): JSX.Element => {

    const { setRunning } = useContext<contextType>(StatusContext);

    // set running status
    useEffect(() => { 
        setRunning(messageSent?.status !== 'Finished')
    }, [messageSent]);

    // console.log("Data:", messageSent);

    if (!messageSent)
        return (<div />)

    return (
        <Table style={{minWidth: 650}}>
            <TableHead style={{backgroundColor: '#e3f2fd'}}>
                <TableRow>
                    <TableCell>Task Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Input/Output Blobs</TableCell>
                    <TableCell>Log</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TaskItem key={0} task={messageSent} />
            </TableBody>
        </Table>
    );
};

const TaskList: React.FC = (): JSX.Element => {

    const { data, loading } = useSubscription( TASK_SUBSCRIPTION );

    if (loading) return <div />;

    if (!data?.messageSent)
        return <div />;

    return <TaskTableView messageSent={data?.messageSent} />;
};

export default TaskList;
