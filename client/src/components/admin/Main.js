import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import clsx from "clsx";
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { getCount } from '../../helper/admin';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "12px",
  },
  fixedHeight: {
    height: 180,
  },
  img: {
    height: "-webkit-fill-available",
    width: "-webkit-fill-available",
  },
  img1: {
    height: "-webkit-fill-available",
    width: "70%",
  },
}));

export default function Main() {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [values, setValues] = useState({
    users: 0,
    questions: 0,
    tests: 0,
    responses: 0,
    feedbacks: 0
  });

  const { users, questions, feedbacks, tests, responses } = values;

  useEffect(() => {
    async function initials() {
      getCount()
        .then((data) => {
          if (data.success === false) {
            alert(data.error.message);
          } else {
            setValues({ ...values, ...data.data });
          }
        })
        .catch((error) => {
          return error;
        });
    }
    initials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      container
      spacing={3}
      direction="row"
      justify="center"
      alignItems="center"
    >
      {/* Recent Deposits */}
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper} elevation={2}>
          <Typography component="h2" variant="h6" align="left" color="textSecondary" style={{ fontWeight: 600 }}>
            USERS
          </Typography>
          <Typography component="p" variant="h2" align="left" color="primary" style={{ fontWeight: 'bold' }}>
            {users}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper} elevation={2}>
          <Typography component="h2" variant="h6" align="left" color="textSecondary" style={{ fontWeight: 600 }}>
            QUESTIONS
          </Typography>
          <Typography component="p" variant="h2" align="left" color="primary" style={{ fontWeight: 'bold' }}>
            {questions}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper} elevation={2}>
          <Typography component="h2" variant="h6" align="left" color="textSecondary" style={{ fontWeight: 600 }}>
            TESTS
          </Typography>
          <Typography component="p" variant="h2" align="left" color="primary" style={{ fontWeight: 'bold' }}>
            {tests}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper} elevation={2}>
          <Typography component="h2" variant="h6" align="left" color="textSecondary" style={{ fontWeight: 600 }}>
            RESPONSES
          </Typography>
          <Typography component="p" variant="h2" align="left" color="primary" style={{ fontWeight: 'bold' }}>
            {responses}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper} elevation={2}>
          <Typography component="h2" variant="h6" align="left" color="textSecondary" style={{ fontWeight: 600 }}>
            FEEDBACKS
          </Typography>
          <Typography component="p" variant="h2" align="left" color="primary" style={{ fontWeight: 'bold' }}>
            {feedbacks}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
