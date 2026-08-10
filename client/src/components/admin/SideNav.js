import React from "react";
import PropTypes from "prop-types";
import DashboardIcon from "@material-ui/icons/Dashboard";
import VideocamIcon from "@material-ui/icons/Videocam";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import StarBorder from "@material-ui/icons/StarBorder";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import { Link, withRouter } from "react-router-dom";

const styles = (theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

function getItems() {
  var json = [
    {
      id: 1,
      title: "Dashboard",
      link: "/admin/main",
    },
    {
      id: 2,
      title: "User",
      link: "/admin/user",
    },
    {
      id: 7,
      title: "Webcam Monitor",
      link: "/admin/webcam",
    },
    {
      id: 3,
      title: "Question",
      items: [
        {
          id: 21,
          name: "Create",
          link: "/admin/question/create",
        },
        {
          id: 22,
          name: "Manage",
          link: "/admin/question/manage",
        },
      ],
    },
    {
      id: 5,
      title: "Test",
      items: [
        {
          id: 21,
          name: "Create",
          link: "/admin/test/create",
        },
        {
          id: 22,
          name: "Manage",
          link: "/admin/test/manage",
        },
      ],
    },
    {
      id: 6,
      title: "Result",
      link: "/admin/result",
    },
    {
      id: 4,
      title: "Feedback",
      link: "/admin/feedback",
    },
  ];

  return json;
}
class NestedList extends React.Component {
  state = {};
  handleClick = (e) => {
    this.setState({ [e]: !this.state[e] });
  };
  componentDidMount() {
    if (this.props.match.params.platform) {
      var k = this.props.match.params.platform
        .replace(/([A-Z])/g, " $1")
        .trim();
      var result = k.charAt(0).toUpperCase() + k.slice(1);
      this.setState({
        [result]: !this.state[this.props.match.params.platform],
      });
    }
  }
  render() {
    const items = getItems();
    const { classes } = this.props;
    return (
      <>
        <Divider />
        <List className={classes.root}>
          {items.map((item) => {
            return (
              <div key={item.id}>
                {item.items != null ? (
                  <ListItem
                    button
                    key={item.id}
                    onClick={this.handleClick.bind(this, item.title)}
                  >
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.items != null ? (
                      <div>
                        {this.state[item.title] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </ListItem>
                ) : (
                  <Link
                    to={item.link}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <ListItem
                      button
                      key={item.id}
                      onClick={this.handleClick.bind(this, item.title)}
                    >
                      <ListItemIcon>
                        {item.title === "Webcam Monitor" ? <VideocamIcon /> : <DashboardIcon />}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                      {item.items != null ? (
                        <div>
                          {this.state[item.title] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </ListItem>
                  </Link>
                )}
                {item.items != null ? (
                  <div>
                    <Collapse
                      key={items.id}
                      component="li"
                      in={this.state[item.title]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding>
                        {item.items.map((sitem) => {
                          return (
                            <Link
                              to={sitem.link}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              <ListItem
                                button
                                key={sitem.id}
                                className={classes.nested}
                              >
                                <ListItemIcon>
                                  <StarBorder />
                                </ListItemIcon>
                                <ListItemText
                                  key={sitem.id}
                                  primary={sitem.name}
                                />
                              </ListItem>
                            </Link>
                          );
                        })}
                      </List>
                    </Collapse>{" "}
                  </div>
                ) : (
                  " "
                )}
              </div>
            );
          })}
        </List>
      </>
    );
  }
}
NestedList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(withRouter(NestedList));
