import React from "react";

//Styles
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import "./style.css";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

//Router
import { withRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";

//REDUX
import { connect } from "react-redux";
import { ocultarAlerta } from "@Redux/Actions/alerta";
import { login, cerrarSesion } from "@Redux/Actions/usuario";
import { push, replace } from "connected-react-router";

//Componentes
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { IconButton, Icon } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import _ from "lodash";

//Mis componentes
import Pagina404 from "@UI/_Pagina404";
import Mapa from "@UI/Mapa";

//Mis rules
import Rules_Usuario from "@Rules/Rules_Usuario";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#149257"
    },
    secondary: {
      main: "#149257"
    },
    background: {
      default: "#eee"
    }
  }
});

const mapStateToProps = state => {
  return {
    usuario: state.Usuario.usuario,
    alertas: state.Alerta.alertas
  };
};

const mapDispatchToProps = dispatch => ({
  onAlertaClose: id => {
    dispatch(ocultarAlerta(id));
  },
  login: comando => {
    dispatch(login(comando));
  },
  cerrarSesion: () => {
    dispatch(cerrarSesion());
  },
  redireccionar: url => {
    dispatch(push(url));
  },
  replace: url => {
    dispatch(replace(url));
  }
});

Promise.prototype.finally = function(callback) {
  return this.then(
    value => this.constructor.resolve(callback()).then(() => value),
    reason =>
      this.constructor.resolve(callback()).then(() => {
        throw reason;
      })
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      validandoToken: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.token != nextProps.token) {
      if (nextProps.token === undefined) {
        this.props.cerrarSesion();
        window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
      }
    }
  }

  componentDidMount() {
    let token = localStorage.getItem("token");
    let search = this.props.location.search;
    if (search.startsWith("?")) {
      search = search.substring(1);
      search = new URLSearchParams(search);
      let tokenQueryString = search.get("token");
      if (tokenQueryString) {
        token = tokenQueryString;
      }
    }
    if (token == undefined || token == null || token == "undefined" || token == "") {
      this.props.cerrarSesion();
      window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
      return;
    }

    this.setState({ validandoToken: true }, () => {
      Rules_Usuario.datos(token)
        .then(datos => {
          this.props.login({
            usuario: datos,
            token: token
          });

          if (search) {
            let url = search.get("url") || "/";
            this.props.redireccionar(url);
          }
          this.onLogin();
        })
        .catch(error => {
          this.props.cerrarSesion();
          window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
        })
        .finally(() => {
          this.setState({ validandoToken: false });
        });
    });
  }

  onLogin = () => {
    //Cada 5 seg valido el token
    this.intervalo = setInterval(() => {
      let token = localStorage.getItem("token");
      if (token == undefined || token == null || token == "undefined") {
        this.props.cerrarSesion();
        window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
        return;
      }
      Rules_Usuario.validarToken(token)
        .then(resultado => {
          if (resultado == false) {
            this.props.cerrarSesion();
            window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
            return;
          }
        })
        .catch(error => {
          this.props.cerrarSesion();
          window.location.href = window.Config.URL_LOGIN + "?url=" + this.props.location.pathname + this.props.location.search;
        });
    }, 5000);
  };

  componentWillUnmount() {
    this.intervalo && clearInterval(this.intervalo);
  }

  render() {
    const { classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />

          {this.renderContent()}
          {this.renderAlertas()}
        </div>
      </MuiThemeProvider>
    );
  }

  renderContent() {
    const { classes } = this.props;

    let base = "";

    const login = this.state.validandoToken == false && this.props.usuario != undefined;

    return (
      <main className={classes.content}>
        <AnimatedSwitch atEnter={{ opacity: 0 }} atLeave={{ opacity: 0 }} atActive={{ opacity: 1 }} className={"switch-wrapper"}>
          <Route exact path={`${base}/`} component={login ? Mapa : null} />
          <Route component={Pagina404} />
        </AnimatedSwitch>
      </main>
    );
  }

  renderAlertas() {
    const { classes } = this.props;

    return this.props.alertas.map((alerta, index) => {
      return (
        <Snackbar
          key={alerta.id}
          key={index}
          open={alerta.visible}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          autoHideDuration={5000}
          onClose={() => {
            this.props.onAlertaClose(alerta.id);
          }}
          ContentProps={{
            "aria-describedby": "message-id" + alerta.id
          }}
        >
          <SnackbarContent
            style={{ backgroundColor: alerta.color }}
            aria-describedby="client-snackbar"
            message={
              <span id={"message-id" + alerta.id} className={classes.snackMessage}>
                {alerta.icono != undefined && <Icon className={classes.snackCustomIcon}>{alerta.icono}</Icon>}
                {alerta.texto}
              </span>
            }
            action={[
              alerta.mostrarIconoCerrar && (
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => {
                    this.props.onAlertaClose(alerta.id);
                  }}
                >
                  <CloseIcon className={classes.icon} />
                </IconButton>
              )
            ]}
          />
        </Snackbar>
      );
    });
  }
}

const styles = theme => {
  return {
    root: {
      display: "flex",
      height: "100vh",
      overflow: "hidden"
    },
    content: {
      display: "flex",
      flexGrow: 1,
      overflow: "auto",
      overflow: "hidden"
    },
    icon: {
      fontSize: 20
    },
    snackCustomIcon: {
      marginRight: theme.spacing.unit
    },
    snackMessage: {
      display: "flex",
      alignItems: "center"
    }
  };
};

let componente = App;
componente = withStyles(styles)(componente);
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
componente = withRouter(componente);
export default componente;
