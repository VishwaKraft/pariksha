import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { CircularProgress } from '@mui/material';
import { authenticateAdmin, signin } from '../../helper/Auth';
import { withRouter } from 'next/router';
import NextLink from 'next/link';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2070&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignInSide(props) {
  const classes = useStyles();
  const [values, setValues] = useState({
    email: "pariksha@deloitte.com",
    password: "advancePass@123",
    error: "",
    loading: false,
    didRedirect: false,
  });

  const { email, password, loading } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: false, [name]: event.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: false, loading: true });
    signin({ email, password })
        .then((data) => {
          if (data.success === false) {
            setValues({ ...values, error: data.error.message, loading: false });
            alert(data.error.message);
          } else {
            authenticateAdmin(data.data,()=>{
              props.router.push('/admin/main');
            });
          }
        })
        .catch((error) => {
          return error;
        });
    }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              value={email}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="off"
              onChange={handleChange("email")}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              value={password}
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={handleChange("password")}
              autoComplete="off"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              style={{ float: "right", padding: "0.5rem" }}
              onClick={onSubmit}
              className={classes.submit}
            >
               {loading ? (
                        <>
                          <CircularProgress
                            color="light"
                            style={{
                              height: "1.75rem",
                              width: "1.75rem",
                              marginBottom: "-2px",
                            }}
                          />
                        </>
                      ) : (
                        "Sign In"
                      )}
            </Button>
            <Box mt={5}>
                <Typography variant="body2" color="textSecondary" align="center">
                    {'Copyright © '}
                    <NextLink href="/" passHref legacyBehavior>
                      <Link color="inherit">
                        Pariksha
                      </Link>
                    </NextLink>{' '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}

export default withRouter(SignInSide);