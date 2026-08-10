import React from "react";
import MaterialTable from "material-table";
import { deleteUser, getUsers, updateUser } from "../../helper/admin";
import EmailIcon from "@material-ui/icons/Email";

function User() {
  const handleInvite = async (rowData) => {
    try {
      const response = await fetch('https://smart-stocks-1c68.onrender.com/api/email-events/trigger/pariksha-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [rowData.email],
          variables: { name: rowData.name }
        })
      });
      if (response.ok) {
        alert(`Invite sent to ${rowData.email}`);
      } else {
        alert('Failed to send invite');
      }
    } catch (err) {
      console.error('Failed to send invite:', err);
      alert('Error sending invite');
    }
  };

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
        actions={[
          {
            icon: () => <EmailIcon />,
            tooltip: 'Invite Test Taker',
            onClick: (event, rowData) => handleInvite(rowData)
          }
        ]}
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