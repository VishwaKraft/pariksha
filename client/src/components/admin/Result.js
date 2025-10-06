import React from "react";
import MaterialTable from "material-table";
import { deleteResponse, getResponse } from "../../helper/admin";

function Result() {
    const tableRef = React.createRef();
    return (
        <>
            <MaterialTable
                title="Result"
                columns={[
                    { title: 'Test', field: 'testId' },
                    { title: 'User', field: 'name' },
                    { title: 'Switch', field: 'switchCounter' },
                    { title: 'Max Score', field: 'max' },
                    { title: 'Score', field: 'score' },
                    { title: 'Has Attempted', field: 'hasAttempted' },
                ]}
                data={query =>
                    new Promise((resolve, reject) => {
                        getResponse((query.page + 1), query.pageSize)
                            .then(result => {
                                resolve({
                                    data: result.results,
                                    page: result.page - 1,
                                    totalCount: result.total,
                                })
                            })
                    })}
                actions={[
                    {
                        icon: 'refresh',
                        tooltip: 'Refresh Data',
                        isFreeAction: true,
                        onClick: () => tableRef.current && tableRef.current.onQueryChange(),
                    }
                ]}
                editable={{
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                deleteResponse(oldData._id)
                                resolve();
                            }, 1000)
                        }),
                }}
                options={{
                    grouping: true,
                    actionsColumnIndex: -1,
                    pageSizeOptions: [5, 10, 20, 50, 100, 500],
                    exportButton: true
                }}
            />
        </>
    )
}

export default Result;