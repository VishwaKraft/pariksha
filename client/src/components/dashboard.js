import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Card, CardActions, CardContent, Typography, Button, CardActionArea, CardMedia, Grid } from '@mui/material';
import { getTests } from '../helper/Test';
import NavBar from "./nav";
import { useRouter } from 'next/router';
import { isAuthenticated } from '../helper/Auth';
import useStudentAuth from '../hooks/useStudentAuth';
import CircularProgress from "@mui/material/CircularProgress";

const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: 345,
    minWidth: 345,
    backgroundColor: '#171717',
    color: '#ffffff',
    border: '1px solid #333',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
    },
  },
  cardMedia: {
    filter: 'grayscale(100%)',
    transition: 'filter 0.3s ease',
  },
  cardMediaHover: {
    '&:hover $cardMedia': {
      filter: 'grayscale(0%)',
    }
  },
  btnStart: {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#e6e6e6',
    }
  },
  btnEnded: {
    color: '#666666',
  }
}));

export default function Dashboard() {
  const classes = useStyles();
  const [values, setValues] = useState([]);
  const router = useRouter();
  const { loading: authLoading, authenticated } = useStudentAuth();

  useEffect(() => {
    if (authenticated) {
      if (typeof window !== 'undefined' && localStorage.getItem("test-token")) {
         router.push("/student/questions");
         return;
      }
      
      getTests().then(async result => {
        if (result && result.success === true) {
          setValues(result.data.results)
        } else {
          localStorage.removeItem("token")
          router.push('/');
        }
      })
    }
  }, [router, authenticated])

  const handleSelect = (id) => {
    var test = values.find(i => i._id === id)
    localStorage.setItem("test", JSON.stringify(test))
    router.push("/student/test/" + id)
  }

  if (authLoading || !authenticated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;
  }

  return (
    <React.Fragment>
      <NavBar>
        <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '3rem' }}>
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
                            <Card className={`${classes.card} ${classes.cardMediaHover}`}>
                              <CardActionArea>
                                <CardMedia
                                  className={classes.cardMedia}
                                  component="img"
                                  alt="Test Banner"
                                  height="140"
                                  image={item.testUrl ? item.testUrl : "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80"}
                                  title="Test Banner"
                                />
                                <CardContent>
                                  <Typography gutterBottom variant="h5" component="h2" style={{ color: '#fff', fontWeight: 600 }}>
                                    {item.title.toUpperCase()}
                                  </Typography>
                                  {item.description ? <Typography variant="body2" style={{ color: '#a3a3a3' }} component="p">
                                    {item.description.toUpperCase()}
                                  </Typography> : <></>}
                                  <Typography variant="body2" style={{ color: '#a3a3a3', marginTop: '0.5rem' }} component="p">
                                    Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                      day: 'numeric',
                                      year: 'numeric',
                                      month: 'long',
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      second: 'numeric',
                                    })}
                                  </Typography>
                                  <Typography variant="body2" style={{ color: '#a3a3a3' }} component="p">
                                    Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                              <CardActions>
                                {
                                  ((new Date(item.endTime)).getTime()) > ((new Date()).getTime()) ? <Button size="small" className={classes.btnStart} variant="contained" onClick={() => handleSelect(item._id)}>
                                    Start
                                  </Button> : <Button size="small" className={classes.btnEnded} disabled >
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
                          <Card className={`${classes.card} ${classes.cardMediaHover}`}>
                            <CardActionArea>
                              <CardMedia
                                className={classes.cardMedia}
                                component="img"
                                alt="Test Banner"
                                height="140"
                                image={item.testUrl ? item.testUrl : "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"}
                                title="Test Banner"
                              />
                              <CardContent>
                                <Typography gutterBottom variant="h5" component="h2" style={{ color: '#fff', fontWeight: 600 }}>
                                  {item.title.toUpperCase()}
                                </Typography>
                                {item.description ? <Typography variant="body2" style={{ color: '#a3a3a3' }} component="p">
                                  {item.description.toUpperCase()}
                                </Typography> : <></>}
                                <Typography variant="body2" style={{ color: '#a3a3a3', marginTop: '0.5rem' }} component="p">
                                  Start Time : {(new Date(item.startTime)).toLocaleString(undefined, {
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'long',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                  })}
                                </Typography>
                                <Typography variant="body2" style={{ color: '#a3a3a3' }} component="p">
                                  Duration : {item.duration.hour + "h " + item.duration.minute + "m"}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            <CardActions>
                              <Button size="small" className={classes.btnEnded} disabled >
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
        </div>
      </NavBar>
    </React.Fragment >
  );
}
