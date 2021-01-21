import React, { useState } from "react";
import Section from "./Section";
import AppBar from "@material-ui/core/AppBar";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import { Link } from "./../util/router";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
// import { useAuth } from "./../util/auth";
import useDarkMode from "use-dark-mode";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  logo: {
    height: 28,
    marginRight: theme.spacing(2),
  },
  drawerList: {
    width: 250,
  },
  spacer: {
    flexGrow: 1,
  },
}));

function Navbar(props: any) {
  const classes = useStyles();

  // const auth = useAuth();
  const darkMode = useDarkMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuState, setMenuState] = useState(null);

  // Use inverted logo if specified
  // and we are in dark mode
  const logo =
    props.logoInverted && darkMode.value ? props.logoInverted : props.logo;

  const handleOpenMenu = (event: any, id: any) => {
    // Store clicked element (to anchor the menu to)
    // and the menu id so we can tell which menu is open.
    // @ts-ignore
    setMenuState({ anchor: event.currentTarget, id });
  };

  const handleCloseMenu = () => {
    setMenuState(null);
  };

  return (
    <Section bgColor={props.color} size="auto">
      <AppBar position="static" color="transparent" elevation={0}>
        <Container disableGutters={true}>
          <Toolbar>
            <Link to="/">
              <img src={logo} alt="Logo" className={classes.logo} />
            </Link>
            <div className={classes.spacer} />
            <Hidden mdUp={true} implementation="css">
              <IconButton
                onClick={() => {
                  setDrawerOpen(true);
                }}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden smDown={true} implementation="css">
              <Button color="inherit" component={Link} to="/about">
                About
              </Button>

              <Button color="inherit" component={Link} to="/pricing">
                Pricing
              </Button>

              <Button color="inherit" component={Link} to="/faq">
                FAQ
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                component={Link}
                to="/analyze"
              >
                Analyze a Property
              </Button>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List
          className={classes.drawerList}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItem button={true} component={Link} to="/about">
            <ListItemText>About</ListItemText>
          </ListItem>

          <ListItem button={true} component={Link} to="/faq">
            <ListItemText>Pricing</ListItemText>
          </ListItem>

          <ListItem button={true} component={Link} to="/about">
            <ListItemText>FAQ</ListItemText>
          </ListItem>

          <ListItem button={true} component={Link} to="/analyze">
            <ListItemText>Analyze a Property</ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </Section>
  );
}

export default Navbar;
