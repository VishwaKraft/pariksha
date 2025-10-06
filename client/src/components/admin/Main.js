import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { makeStyles, Typography } from "@material-ui/core";
import { getCount } from '../../helper/admin';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 200,
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
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
        <Paper className={fixedHeightPaper}>
          <Typography component="h2" variant="h6" align="right" color="primary" gutterbottom>
            Users
        </Typography>
          <Typography component="p" variant="h1">
            {users}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper}>
          <Typography component="h2" variant="h6" align="right" color="primary" gutterbottom>
            Questions
        </Typography>
          <Typography component="p" variant="h1">
            {questions}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper}>
          <Typography component="h2" variant="h6" align="right" color="primary" gutterbottom>
            Test
        </Typography>
          <Typography component="p" variant="h1">
            {tests}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper}>
          <Typography component="h2" variant="h6" align="right" color="primary" gutterbottom>
            Response
        </Typography>
          <Typography component="p" variant="h1">
            {responses}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper className={fixedHeightPaper}>
          <Typography component="h2" variant="h6" align="right" color="primary" gutterbottom>
            Feedbacks
        </Typography>
          <Typography component="p" variant="h1">
            {feedbacks}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
