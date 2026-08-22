import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Card, CardActions, CardContent, Typography, Button, CardActionArea, CardMedia, Grid } from '@mui/material';
import { getPublicTests } from '../helper/Test';
import NavBar from "./nav";
import { useRouter } from 'next/router';
import { isAuthenticated } from '../helper/Auth';
import useStudentAuth from '../hooks/useStudentAuth';
import CircularProgress from "@mui/material/CircularProgress";
import LoginModal from './LoginModal';

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    minWidth: 345,
  }
}));

export default function Dashboard() {
  const classes = useStyles();
  const [values, setValues] = useState([]);
  const router = useRouter();
  const { loading: authLoading, authenticated } = useStudentAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTestId, setPendingTestId] = useState(null);
  const [fetchingTests, setFetchingTests] = useState(true);

  useEffect(() => {
    getPublicTests().then(async result => {
      if (result && result.success === true) {
        setValues(result.data.results || result.data || []);
      }
      setFetchingTests(false);
    }).catch(err => {
      console.error(err);
      setFetchingTests(false);
    });
  }, [router, authenticated])

  const navigateToTest = (id) => {
    var test = values.find(i => i._id === id)
    localStorage.setItem("test", JSON.stringify(test))
    var testNameSlug = test.title ? test.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'test';
    router.push(`/student/test/${testNameSlug}-${id}-testid`)
  }

  const handleSelect = (id) => {
    if (!authenticated) {
      setPendingTestId(id);
      setShowLoginModal(true);
    } else {
      navigateToTest(id);
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingTestId) {
      navigateToTest(pendingTestId);
    } else {
      router.reload(); // Reload to update auth state if no test was pending
    }
  }

  if (fetchingTests || authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;
  }

  return (
    <React.Fragment>
      <NavBar onLoginClick={() => setShowLoginModal(true)}>
        <Grid direction="column">
          {
            values.filter(item => (new Date(item.endTime)).getTime() > ((new Date()).getTime())).length > 0 ?
              <Container>
                <Typography style={{ paddingTop: "1rem" }} variant="h5" gutterBottom component="div">
                  Ongoing Tests
                </Typography>
                <Box my={2}>
                  <Grid
                    container
                    direction="row"
                    justify="right"
                    alignItems="center"
                    spacing={4}
                  >
                    {values.filter(item => (new Date(item.endTime)).getTime() > ((new Date()).getTime()))
                      .map((item) => {
                        return (
                          <Grid item key={item._id}>
                            <Card className={classes.card}>
                              <CardActionArea>
                                <CardMedia
                                  component="img"
                                  alt="Contemplative Reptile"
                                  height="140"
                                  image={item.testUrl ? item.testUrl : "https://png.pngtree.com/background/20210710/original/pngtree-recruitment-background-banner-picture-image_1037995.jpg"}
                                  title="Contemplative Reptile"
                                />
                                <CardContent>
                                  <Typography gutterBottom variant="h5" component="h2">
                                    {item.title.toUpperCase()}
                                  </Typography>
                                  {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                    {item.description.toUpperCase()}
                                  </Typography> : <></>}
                                  <Typography variant="body2" color="textSecondary" component="p">
                                    Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                      day: 'numeric',
                                      year: 'numeric',
                                      month: 'long',
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      second: 'numeric',
                                    })}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary" component="p">
                                    Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                              <CardActions>
                                {
                                  ((new Date(item.endTime)).getTime()) > ((new Date()).getTime()) ? <Button size="small" style={{ color: "blue" }} onClick={() => handleSelect(item._id)}>
                                    Start
                                  </Button> : <Button size="small" color="inherit" disabled >
                                    Ended
                                  </Button>
                                }
                              </CardActions>
                            </Card>
                          </Grid>
                        )
                      })}
                  </Grid>
                </Box>
              </Container>
              : <></>
          }

        </Grid>
        <Grid direction="column">
          {values.filter(item => (new Date(item.endTime)).getTime() <= ((new Date()).getTime())).length > 0 ?
            <Container>
              <Typography style={{ paddingTop: "1rem" }} variant="h5" gutterBottom component="div">
                Expired Tests
              </Typography>
              <Box my={2}>
                <Grid
                  container
                  direction="row"
                  justify="right"
                  alignItems="center"
                  spacing={4}
                >
                  {values.filter(item => (new Date(item.endTime)).getTime() <= ((new Date()).getTime()))
                    .map((item) => {
                      return (
                        <Grid item key={item._id}>
                          <Card className={classes.card}>
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                alt="Contemplative Reptile"
                                height="140"
                                image={item.testUrl ? item.testUrl : "http://validata-software.com/images/blog/wp-content/uploads/2017/02/service-automation_banner.png"}
                                title="Contemplative Reptile"
                              />
                              <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                  {item.title.toUpperCase()}
                                </Typography>
                                {item.description ? <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description.toUpperCase()}
                                </Typography> : <></>}
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'long',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                  })}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            <CardActions>
                              <Button size="small" color="inherit" disabled >
                                Ended
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      )
                    })}
                </Grid>
              </Box>
            </Container>
            : <></>}
        </Grid>
      </NavBar>
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={handleLoginSuccess} 
      />
    </React.Fragment >
  );
}
