import React from "react";
import MaterialTable from "material-table";
import { getFeedbacks } from "../../helper/admin";

function User() {
    return (
        <>
            <MaterialTable
                title="Feedback"
                columns={[
                    { title: 'Name', field: 'name' },
                    { title: 'Email', field: 'email' },
                    { title: 'Quality', field: 'quality' },
                    { title: 'Feedback', field: 'feedback', },
                ]}
                data={query =>
                    new Promise((resolve, reject) => {
                        getFeedbacks((query.page + 1), query.pageSize)
                            .then(result => {
                                resolve({
                                    data: result.data.results,
                                    page: result.data.page - 1,
                                    totalCount: result.data.total,
                                })
                            })
                    })}
                actions={[
                    {
                        icon: 'info',
                        tooltip: 'User',
                        onClick: (_event, rowData) => alert("User Id " + rowData._id)
                    },
                ]}
                options={{
                    actionsColumnIndex: -1
                }}
            />
        </>
    )
}

export default User;