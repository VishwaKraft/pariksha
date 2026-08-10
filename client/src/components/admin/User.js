import React from "react";
import MaterialTable from "material-table";
import { deleteUser, getUsers, updateUser } from "../../helper/admin";

function User() {

  return (
    <>
      <MaterialTable
        title="User"
        columns={[
          { title: 'Name', field: 'name', editable: 'never' },
          { title: 'Email', field: 'email', editable: 'never' },
          { title: 'updatedAt', field: 'updatedAt', editable: 'never' },
          { title: 'createdAt', field: 'createdAt', editable: 'never' },
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            getUsers((query.page + 1), query.pageSize, query.search)
              .then(result => {
                resolve({
                  data: result.data.results,
                  page: result.data.page - 1,
                  totalCount: result.data.total,
                })
              })
          })}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                updateUser(oldData._id, newData)
                resolve();
              }, 1000)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                deleteUser(oldData._id)
                resolve();
              }, 1000)
            }),
        }}
        options={{
          grouping: true,
          actionsColumnIndex: -1,
          pageSizeOptions: [5, 10, 20, 50, 100, 500],
          exportButton: true,
          search: true
        }}
      />
    </>
  )
}

export default User;