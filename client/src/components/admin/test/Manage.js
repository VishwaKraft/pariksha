import React from 'react';
import MaterialTable from 'material-table';
import {  deleteTest, getTests, updateTest } from '../../../helper/admin';

export default function BasicTextFields() {
  const tableRef = React.createRef();
  return (
        <>
          <MaterialTable
            title="Test"
            tableRef={tableRef}
            columns={[
              { title: 'Title', field: 'title' },
              { title: 'Description', field: 'description' },
              { title: 'Mandatory Category', field: 'mandatoryCategory', editable: 'never' },
              { title: 'Optional Category', field: 'optionalCategory', editable: 'never' },
              { title: 'Start Time', field: 'startTime' },
              { title: 'End Time', field: 'endTime' },
              { title: 'createdAt', field: 'createdAt', editable: 'never' },
              { title: 'updatedAt', field: 'updatedAt', editable: 'never' },
            ]}
            data={query =>
              new Promise((resolve, reject) => {
                getTests((query.page + 1), query.pageSize)
                  .then(result => {
                    resolve({
                      data: result.data.results.map(item => {
                        var start = new Date(item.startTime)
                        var end = new Date(item.endTime)
                        return { ...item, startTime: start.toLocaleString(), endTime: end.toLocaleString() }
                      }),
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
              },
              {
                icon: 'info',
                tooltip: 'Display Data',
                onClick: (event, rowData) => alert("Test Id : " + rowData._id)
              }
            ]}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    updateTest(oldData._id, newData)
                    resolve();
                  }, 1000)
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    deleteTest(oldData._id)
                    resolve();
                  }, 1000)
                }),
            }}
            options={{
              actionsColumnIndex: -1
            }}
          />
  

    </>

  );
}
