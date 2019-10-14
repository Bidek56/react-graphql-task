import React, { useState, useRef, useContext } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks'
import { StatusContext } from '../context/StatusContext';
import { FormControl, FormLabel, FormGroup, CircularProgress, TextField, Select, MenuItem, Grid, Button } from '@material-ui/core'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Send } from '@material-ui/icons';

const CREATE_TASK_MUTATION = gql`
    mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $blobs: BlobInput) {
        createTask(task: {status: $status, type: $type, time: $time, blobs: $blobs }) {
            status
        }
    }
`;

const selectNames = ['Promo Table', 'Store Groups', 'Product Attribute']

const selectOptions = selectNames.map((name, key) => <MenuItem key={key} value={name}>{name}</MenuItem>)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            margin: 8,
            width: 400.
        },
        labelRoot: {
            marginLeft: 8,
            fontSize: 18,
        },
        progress: {
            margin: theme.spacing(2),
        },
        selectEmpty: {
            marginTop: theme.spacing(1),
            marginLeft: theme.spacing(1)
        },
    }),
);

interface ICustomInput {
    classes: any
    label: string
    sourceBlob: React.MutableRefObject<string>
}

// Custom text field
const CustomTextField: React.FC<ICustomInput> = (ref: React.PropsWithChildren<ICustomInput>): JSX.Element => {
    return (
        <TextField className={ref.classes.textField}
            InputLabelProps={{ classes: { root: ref.classes.labelRoot } }}
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

    // References to input blobs
    const sourceBlobRef = useRef('raw-source/20190930/ISW_SSBAK');
    const accountPathRef = useRef('raw-source/20190624/masteraccount');
    const productMasterRef = useRef('raw-source/20190916/productmaster');
    const superCategoryRef = useRef('raw-source/20190405/super_category');
    const costRef = useRef('raw-source/20190829/CostUBP');
    const activeSalesRef = useRef('raw-source/dbs/Frozen/active_sales_20190830.txt.gz/part-000');

    const { running } = useContext<{ running: boolean; setRunning: React.Dispatch<React.SetStateAction<boolean>>; }>(StatusContext);

    const onSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
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
                product: productMasterRef.current,
                category: superCategoryRef.current,
                sales: activeSalesRef.current
            }
        } else if (selectedTask === selectNames[1]) {
            blobs = {
                account: accountPathRef.current,
            }
        } else if (selectedTask === selectNames[2]) {
            blobs = {
                product: productMasterRef.current,
                category: superCategoryRef.current,
                cost: costRef.current
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

    const classes = useStyles();

    return (
        <Grid container spacing={1}>
            <Grid item xs={2}>
                <FormControl component="fieldset">
                    <FormLabel className={classes.labelRoot} component="legend">ETL Task</FormLabel>
                    <FormGroup>
                        <Select className={classes.selectEmpty} variant="outlined" value={selectedTask} onChange={onSelectChange} inputProps={{
                            name: 'task-select',
                            id: 'task-select',
                        }}>
                            {selectOptions}
                        </Select>
                        <br />
                        {running ?
                            <CircularProgress className={classes.progress} /> :
                            <Button className={classes.button} variant="contained" color="primary" onClick={sumitTask} endIcon={<Send />}>Run</Button>
                        }
                    </FormGroup>
                </FormControl>
            </Grid>
            {/* based on task selected, display different input options */}
            <Grid item xs={10}>
                {selectedTask === selectNames[0] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for source blob" classes={classes} sourceBlob={sourceBlobRef} />
                        <CustomTextField label="Path to search for product master blob" classes={classes} sourceBlob={productMasterRef} />
                        <CustomTextField label="Path to search for master account blob" classes={classes} sourceBlob={accountPathRef} />
                        <CustomTextField label="Path to search for super category blob" classes={classes} sourceBlob={superCategoryRef} />
                        <CustomTextField label="Path to search for active sales blob" classes={classes} sourceBlob={activeSalesRef} />
                    </Grid>
                }
                {selectedTask === selectNames[1] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for master account blob" classes={classes} sourceBlob={accountPathRef} />
                    </Grid>}
                {selectedTask === selectNames[2] &&
                    <Grid container direction="column">
                        <CustomTextField label="Path to search for product master blob" classes={classes} sourceBlob={productMasterRef} />
                        <CustomTextField label="Path to search for super category blob" classes={classes} sourceBlob={superCategoryRef} />
                        <CustomTextField label="Path to search for cost blob" classes={classes} sourceBlob={costRef} />
                    </Grid>}
            </Grid>
        </Grid>
    );
};

export default NewTaskForm;
