import React from "react";
import MaterialTable from "material-table";
import { deleteQuestion, getQuestions, updateQuestion } from "../../../helper/admin";

function User() {
  const tableRef = React.createRef();
  return (
    <>
      <MaterialTable
        title="Questions"
        columns={[
          { title: 'Category', field: 'category' },
          { title: 'Question', field: 'question' },
          { title: 'Option 1', field: 'one' },
          { title: 'Option 2', field: 'two' },
          { title: 'Option 3', field: 'three' },
          { title: 'Option 4', field: 'four' },
          { title: 'correct', field: 'correct' },
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            getQuestions((query.page + 1), query.pageSize)
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
            icon: 'refresh',
            tooltip: 'Refresh Data',
            isFreeAction: true,
            onClick: () => tableRef.current && tableRef.current.onQueryChange(),
          }
        ]}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                updateQuestion(oldData._id, newData)
                resolve();
              }, 1000)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                deleteQuestion(oldData._id)
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

export default User;