import React, { useState, useRef } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks'

const CREATE_TASK_MUTATION = gql`
    mutation task($status: _TaskStatus!, $type: String!, $time: Date!, $blobs: BlobInput) {
        createTask(task: {status: $status, type: $type, time: $time, blobs: $blobs }) {
            status
        }
    }
`;

// Custom input div
const CustomInput = (ref) => {
    return <div>
        <h4><span className="badge badge-pill badge-primary">{ref.label}</span></h4>
        <input type="text" className="form-control" placeholder={ref.sourceBlob} defaultValue={ref.sourceBlob} onChange={ref.onChange} />
    </div>;
};

const selectNames = ['Promo Table(s)', 'Store Groups', 'Product Attribute']
const selectOptions = selectNames.map((name, key) => <option key={key} value={name}>{name}</option>)

const NewTaskForm = () => {

    const [selectedTask, setSelectedTask] = useState(selectNames[0])

    // References to input blobs
    const sourceBlobRef = useRef('raw-source/20190708/ISW_Buitoni');
    const accountPathRef = useRef('raw-source/20190624/masteraccount');
    const productMasterRef = useRef('raw-source/20190515/productmaster');
    const superCategoryRef = useRef('raw-source/20190405/super_category');
    const costRef = useRef('raw-source/20190405/CostUBP');

    const onSelectChange = (event) => {
        setSelectedTask(event.target.value);
        // console.log('Changed:', selectedTask)
        // setTaskStatus(null);
        // setProgressPct(0);
    }

    const [createTask] = useMutation(CREATE_TASK_MUTATION);

    const sumitTask = (event) => {
        event.preventDefault();
        createTask({
            variables: {
                status: "Started", type: selectedTask, time: new Date().toLocaleString(),
                blobs: {
                    source: sourceBlobRef.current, account: accountPathRef.current,
                    product: productMasterRef.current, category: superCategoryRef.current,
                    cost: costRef.current
                }
            }
        });
    };

    return (
        <main role="main">
            <div className="starter-template">
                <div className="row">
                    <div className="col-sm-2">
                        <h4><span className="badge badge-pill badge-primary">ETL Task</span></h4>
                        <select className="custom-select d-block" onChange={e => onSelectChange(e)}>
                            {selectOptions}
                        </select>
                    </div>

                    {/* based on task selected, display different input options */}
                    {selectedTask === selectNames[0] &&
                        <div className="input-div col-sm-5">
                            <CustomInput label="Path to search for source blob(s)" sourceBlob={sourceBlobRef.current} onChange={e => sourceBlobRef.current = e.target.value} />
                            <CustomInput label="Path to search for product master blob" sourceBlob={productMasterRef.current} onChange={e => productMasterRef.current = e.target.value} />
                            <CustomInput label="Path to search for master account blob" sourceBlob={accountPathRef.current} onChange={e => accountPathRef.current = e.target.value} />
                            <CustomInput label="Path to search for super category blob" sourceBlob={superCategoryRef.current} onChange={e => superCategoryRef.current = e.target.value} />
                        </div>
                    }
                    {selectedTask === selectNames[1] && <div className="input-div col-sm-5">
                        <CustomInput label="Path to search for master account blob" sourceBlob={accountPathRef.current} onChange={e => accountPathRef.current = e.target.value} />
                    </div>}
                    {selectedTask === selectNames[2] &&
                        <div className="input-div col-sm-5">
                            <CustomInput label="Path to search for product master blob" sourceBlob={productMasterRef.current} onChange={e => productMasterRef.current = e.target.value} />
                            <CustomInput label="Path to search for super category blob" sourceBlob={superCategoryRef.current} onChange={e => superCategoryRef.current = e.target.value} />
                            <CustomInput label="Path to search for cost blob" sourceBlob={costRef.current} onChange={e => costRef.current = e.target.value} />
                        </div>}

                    <div className="col-sm-1 align-self-end" id="etl-run">
                        <button className="btn btn-outline-primary" type="button" onClick={sumitTask}>Run ETL</button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default NewTaskForm;
