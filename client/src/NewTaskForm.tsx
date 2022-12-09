import React, { useState, useRef, useContext } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { StatusContext, contextType } from './StatusContext';
import { FormControl, FormLabel, FormGroup, CircularProgress, TextField, MenuItem, Grid, Button } from '@mui/material'
import { Send } from '@mui/icons-material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const CREATE_TASK_MUTATION = gql`
    mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $blobs: BlobInput) {
        createTask(task: {status: $status, type: $type, time: $time, blobs: $blobs }) {
            status
        }
    }
`;

const selectNames = ['Promos', 'Stores', 'Product']

const selectOptions = selectNames.map((name, key) => <MenuItem key={key} value={name}>{name}</MenuItem>)

interface ICustomInput {
    label: string
    sourceBlob: React.MutableRefObject<string>
}

// Custom text field
const CustomTextField: React.FC<ICustomInput> = (ref: React.PropsWithChildren<ICustomInput>): JSX.Element => {
    return (
        <TextField style={{ margin: 8, width: 400.}}
            variant="outlined"
            type="string"
            label={ref.label}
            defaultValue={ref.sourceBlob.current}
            onChange={e => ref.sourceBlob.current = e.target.value}
        />
    )
};

const NewTaskForm: React.FC = (): JSX.Element => {

    const [selectedTask, setSelectedTask] = useState<string>(selectNames[0])

    // References to input blobs, inluding default files used ATM
    const sourceBlobRef = useRef('source');
    const accountPathRef = useRef('account');
    const productRef = useRef('product');
    const categoryRef = useRef('category');
    const costRef = useRef('cost');
    const syndicatedRef = useRef('syndicated')

    const { running } = useContext<contextType>(StatusContext);

    const onSelectChange = (event: SelectChangeEvent) => {
        setSelectedTask(event.target.value as string)
    }

    const [createTask] = useMutation(CREATE_TASK_MUTATION);

    const sumitTask = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        let blobs = {}
        if (selectedTask === selectNames[0]) {
            blobs = {
                source: sourceBlobRef.current,
                account: accountPathRef.current,
                product: productRef.current,
                category: categoryRef.current,
            }
        } else if (selectedTask === selectNames[1]) {
            blobs = {
                account: accountPathRef.current,
            }
        } else if (selectedTask === selectNames[2]) {
            blobs = {
                product: productRef.current,
                category: categoryRef.current,
                cost: costRef.current
            }
        } else if (selectedTask === selectNames[3]) {
            blobs = {
                syndicated: syndicatedRef.current,
                product: productRef.current
            }
        } else {
            console.log("Error: Uknown task")
        }

        createTask({
            variables: {
                status: "Started", type: selectedTask, time: new Date().toLocaleString(), blobs
            }
        });
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={2}>
                <FormControl component="fieldset">
                    <FormLabel style={{ marginLeft: 8, fontSize: 18,}} component="legend">ETL Task</FormLabel>
                    <FormGroup>
                        <Select variant="outlined" value={selectedTask} onChange={onSelectChange} inputProps={{
                            name: 'task-select',
                            id: 'task-select',
                        }}>
                            {selectOptions}
                        </Select>
                        <br />
                        {running ?
                            <CircularProgress/> :
                            <Button variant="contained" color="primary" onClick={sumitTask} endIcon={<Send />}>Run</Button>
                        }
                    </FormGroup>
                </FormControl>
            </Grid>
            {/* based on task selected, display different input options */}
            <Grid item xs={10}>
                {selectedTask === selectNames[0] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for source" sourceBlob={sourceBlobRef} />
                        <CustomTextField label="Path to search for product" sourceBlob={productRef} />
                        <CustomTextField label="Path to search for account" sourceBlob={accountPathRef} />
                        <CustomTextField label="Path to search for category" sourceBlob={categoryRef} />
                    </Grid>
                }
                {selectedTask === selectNames[1] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for account" sourceBlob={accountPathRef} />
                    </Grid>}
                {selectedTask === selectNames[2] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for product" sourceBlob={productRef} />
                        <CustomTextField label="Path to search for category" sourceBlob={categoryRef} />
                        <CustomTextField label="Path to search for cost" sourceBlob={costRef} />
                    </Grid>}
                {selectedTask === selectNames[3] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for synd" sourceBlob={syndicatedRef} />
                        <CustomTextField label="Path to search for product" sourceBlob={productRef} />
                    </Grid>}
            </Grid>
        </Grid>
    );
};

export default NewTaskForm;
