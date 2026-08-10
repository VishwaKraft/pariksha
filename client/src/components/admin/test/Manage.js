import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@material-ui/core';
import MaterialTable from 'material-table';
import { deleteTest, getTests, updateTest } from '../../../helper/admin';
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
        const response = await fetch(`${process.env.REACT_APP_EMAIL_API_URL}/api/email-events/trigger/pariksha-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: [shareEmail],
            variables: { 
              candidateName: shareEmail.split('@')[0],
              testName: currentTestDetails ? currentTestDetails.title : "",
              startTime: currentTestDetails && currentTestDetails.startTime ? new Date(currentTestDetails.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "",
              duration: currentTestDetails && currentTestDetails.duration ? currentTestDetails.duration.toString() + " mins" : "",
              totalQuestions: "N/A",
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
          { title: 'Duration (mins)', field: 'duration', type: 'numeric' },
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
            getTests((query.page + 1), query.pageSize)
              .then(result => {
                resolve({
                  data: result.data.results.map(item => {
                    return { ...item }
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
          },
          {
            icon: 'share',
            tooltip: 'Share Link',
            onClick: (event, rowData) => {
              const link = window.location.origin + "/student/test/" + rowData._id;
              setCurrentShareLink(link);
              setCurrentTestDetails(rowData);
              setShareModalOpen(true);
            }
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
