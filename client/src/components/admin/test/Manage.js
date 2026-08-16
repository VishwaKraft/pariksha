import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@mui/material';
import MaterialTable from "@material-table/core";
import { deleteTest, getTests, updateTest, getQuestions } from '../../../helper/admin';
import { toast } from 'react-toastify';

export default function BasicTextFields() {
  const tableRef = React.createRef();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [currentShareLink, setCurrentShareLink] = useState("");
  const [currentTestDetails, setCurrentTestDetails] = useState(null);

  const handleShareClick = async () => {
    if (shareEmail) {
      try {
        let totalQ = "N/A";
        if (currentTestDetails) {
          try {
            const qRes = await getQuestions(1, 10000);
            if (qRes && qRes.results) {
               const allCats = [...(currentTestDetails.mandatoryCategory || []), ...(currentTestDetails.optionalCategory || [])];
               const filtered = qRes.results.filter(q => allCats.includes(q.category));
               totalQ = filtered.length.toString();
            }
          } catch(e) {
            console.log("Failed to fetch questions for count", e);
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_EMAIL_API_URL}/api/email-events/trigger/pariksha-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: [shareEmail],
            variables: { 
              candidateName: shareEmail.split('@')[0],
              testName: currentTestDetails ? currentTestDetails.title : "",
              startTime: currentTestDetails && currentTestDetails.startTime ? new Date(currentTestDetails.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "",
              duration: currentTestDetails && currentTestDetails.duration ? currentTestDetails.duration.toString() + " mins" : "",
              totalQuestions: totalQ,
              testLink: currentShareLink
            }
          })
        });
        if (response.ok) {
          toast.success("Invite sent successfully!");
        } else {
          toast.error("Failed to send invite");
        }
      } catch (err) {
        console.error("Error sending invite:", err);
        toast.error("Error sending invite");
      }
      setShareModalOpen(false);
      setShareEmail("");
    }
  };

  return (
    <>
      <MaterialTable
        title="Test Repository"
        tableRef={tableRef}
        columns={[
          { title: 'Title', field: 'title' },
          { title: 'Description', field: 'description' },
          { 
            title: 'Duration (mins)', 
            field: 'duration', 
            type: 'numeric',
            render: rowData => {
              if (typeof rowData.duration === 'object' && rowData.duration !== null) {
                return (rowData.duration.hour || 0) * 60 + (rowData.duration.minute || 0);
              }
              return rowData.duration || 0;
            },
            editComponent: props => {
              const val = typeof props.value === 'object' && props.value !== null 
                ? ((props.value.hour || 0) * 60 + (props.value.minute || 0)) 
                : props.value;
              return (
                <TextField
                  type="number"
                  value={val || ''}
                  onChange={e => props.onChange(e.target.value ? Number(e.target.value) : 0)}
                />
              );
            }
          },
          { title: 'Mandatory Category', field: 'mandatoryCategory', editable: 'never' },
          { title: 'Optional Category', field: 'optionalCategory', editable: 'never' },
          { 
            title: 'Start Time (IST)', 
            field: 'startTime',
            render: rowData => rowData.startTime ? new Date(rowData.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
            editComponent: props => {
              const getISTValue = (val) => {
                if (!val) return '';
                const d = new Date(val);
                const istOffset = 5.5 * 60 * 60 * 1000;
                return new Date(d.getTime() + istOffset).toISOString().slice(0, 16);
              };
              return (
                <TextField
                  type="datetime-local"
                  value={getISTValue(props.value)}
                  onChange={e => {
                    if (!e.target.value) props.onChange(null);
                    else props.onChange(new Date(e.target.value + '+05:30').toISOString());
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              );
            }
          },
          { 
            title: 'End Time (IST)', 
            field: 'endTime',
            render: rowData => rowData.endTime ? new Date(rowData.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
            editComponent: props => {
              const getISTValue = (val) => {
                if (!val) return '';
                const d = new Date(val);
                const istOffset = 5.5 * 60 * 60 * 1000;
                return new Date(d.getTime() + istOffset).toISOString().slice(0, 16);
              };
              return (
                <TextField
                  type="datetime-local"
                  value={getISTValue(props.value)}
                  onChange={e => {
                    if (!e.target.value) props.onChange(null);
                    else props.onChange(new Date(e.target.value + '+05:30').toISOString());
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              );
            }
          },
          { title: 'createdAt', field: 'createdAt', editable: 'never', hidden: true },
          { title: 'updatedAt', field: 'updatedAt', editable: 'never', hidden: true },
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            console.log("MaterialTable fetching data for page", query.page);
            getTests((query.page + 1) || 1, query.pageSize || 10)
              .then(result => {
                console.log("MaterialTable fetched data:", result.data.results);
                resolve({
                  data: result.data.results ? result.data.results.map(item => {
                    return { ...item }
                  }) : [],
                  page: result.page ? result.page - 1 : 0,
                  totalCount: result.total || (result.data.results ? result.data.results.length : 0),
                })
              })
              .catch(err => {
                console.error("Error fetching data:", err);
                reject(err);
              });
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
          },
          {
            icon: 'share',
            tooltip: 'Share Link',
            onClick: (event, rowData) => {
              const currentPath = window.location.pathname;
              const basePath = currentPath.replace(/\/admin\/test\/manage.*$/, '');
              const link = window.location.origin + basePath + "/student/test/" + rowData._id;
              setCurrentShareLink(link);
              setCurrentTestDetails(rowData);
              setShareModalOpen(true);
            }
          }
        ]}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              console.log("onRowUpdate triggered!");
              console.log("oldData:", oldData);
              console.log("newData:", newData);
              const payload = { ...newData };
              console.log("Payload sent to updateTest:", payload);
              updateTest(oldData._id, payload).then((res) => {
                console.log("updateTest response:", res);
                if (tableRef.current) {
                  console.log("Triggering onQueryChange to refresh table...");
                  tableRef.current.onQueryChange();
                }
                resolve();
              }).catch(err => {
                console.error("Error updating test:", err);
                resolve();
              });
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              deleteTest(oldData._id).then(() => {
                if (tableRef.current) {
                  tableRef.current.onQueryChange();
                }
                resolve();
              }).catch(err => {
                console.error(err);
                resolve();
              });
            }),
        }}
        options={{
          actionsColumnIndex: -1
        }}
      />

      <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Share Test Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To share this test, please enter the email address of the recipient. 
            An email client will open with the test link.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleShareClick} color="primary">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </>

  );
}
