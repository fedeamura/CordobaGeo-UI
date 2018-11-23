import React from "react";

//Styles
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";

//Router
import { withRouter } from "react-router-dom";

//REDUX
import { connect } from "react-redux";
import { goBack, push } from "connected-react-router";
import { cerrarSesion } from "@Redux/Actions/usuario";

//Componentes
import Card from "@material-ui/core/Card";
import Input from "@material-ui/core/Input";
import ButtonBase from "@material-ui/core/ButtonBase";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconSearch from "@material-ui/icons/Search";
import { withScriptjs, withGoogleMap, GoogleMap, Polygon, InfoWindow } from "react-google-maps";
import _ from "lodash";

//Mis componentes
import StringUtils from "@Componentes/Utils/String";
import CordobaFilesUtils from "@Componentes/Utils/CordobaFiles";

//Rules
import Rules_CordobaGeo from "@Rules/Rules_CordobaGeo";

const defaultCenter = { lat: -31.4170846, lng: -64.1912119 };
const mapStateToProps = state => {
  return { usuario: state.Usuario.usuario, token: state.Usuario.token };
};

const mapDispatchToProps = dispatch => ({
  goBack: () => {
    dispatch(goBack());
  },
  redirigir: url => {
    dispatch(push(url));
  },
  cerrarSesion: () => {
    dispatch(cerrarSesion());
  }
});

const defaultMapOptions = {
  fullscreenControl: false,
  mapTypeControl: false
};

const MyMapComponent = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap onClick={props.onClick} ref={props.onRef} defaultZoom={13} defaultCenter={defaultCenter} defaultOptions={defaultMapOptions}>
      {/* Cpc seleccionado */}
      {props.cpcs !== undefined &&
        props.cpcs.map(cpc => {
          if (props.cpcSeleccionado == undefined || props.cpcSeleccionado.id != cpc.id) return null;
          return <Polygon key={cpc.id} path={cpc.poligono} defaultOptions={{ fillColor: window.Config.COLOR_CPC, strokeColor: "black" }} />;
        })}

      {/* Barrio seleccionado */}
      {props.barrios !== undefined &&
        props.barrios.map(barrio => {
          if (props.barrioSeleccionado == undefined || props.barrioSeleccionado.id != barrio.id) return null;

          return (
            <Polygon
              key={barrio.id}
              path={barrio.poligono}
              defaultOptions={{ fillColor: window.Config.COLOR_BARRIO, strokeColor: "black" }}
            />
          );
        })}

      {/* Popup */}
      {props.popup && (
        <InfoWindow onCloseClick={props.popup.onClose} defaultPosition={new window.google.maps.LatLng(props.popup.lat, props.popup.lng)}>
          {props.popup.content()}
        </InfoWindow>
      )}

      {/* Ejido */}
      {props.ejido !== undefined && props.ejidoVisible === true && (
        <Polygon path={props.ejido.poligono} defaultOptions={{ fillColor: "transparent", strokeColor: window.Config.COLOR_EJIDO }} />
      )}
    </GoogleMap>
  ))
);

const MODO_BARRIO = "MODO_BARRIO";
const MODO_CPC = "MODO_CPC";
const MODO_BUSQUEDA = "MODO_BUSQUEDA";

class Mapa extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputBusqueda: "",
      info: undefined,
      mostrarError: false,
      error: undefined,
      cargando: false,
      barrioSeleccionado: undefined,
      cpcSeleccionado: undefined,
      panelVisible: false,
      modo: undefined,
      popup: undefined
    };
  }

  componentDidMount() {
    this.setState({ mostrarError: false, cargando: true }, () => {
      Rules_CordobaGeo.get()
        .then(info => {
          info.cpcs = _.orderBy(info.cpcs, "numero");
          info.barrios = _.orderBy(info.barrios, "nombre");

          info.cpcs.forEach(item => {
            item.nombre = StringUtils.toTitleCase(item.nombre);
          });

          info.barrios.forEach(item => {
            item.nombre = StringUtils.toTitleCase(item.nombre);
          });

          this.setState({ info: info });
        })
        .catch(error => {
          this.setState({ mostrarError: true, error: error });
        })
        .finally(() => {
          this.setState({ cargando: false });
        });
    });
  }

  onBotonCpcsClick = () => {
    if (this.state.cargando === true) return;

    if (this.state.modo == MODO_CPC) {
      this.limpiar();
      return;
    }
    this.limpiar();
    this.setState({
      panelVisible: true,
      modo: MODO_CPC
    });
  };

  onBotonBarriosClick = () => {
    if (this.state.cargando === true) return;

    if (this.state.modo == MODO_BARRIO) {
      this.limpiar();
      return;
    }
    this.limpiar();
    this.setState({
      panelVisible: true,
      modo: MODO_BARRIO
    });
  };

  onBotonEjidoClick = () => {
    let ejidoVisible = !this.state.ejidoVisible;
    this.setState({ ejidoVisible: ejidoVisible });

    if (ejidoVisible == true) {
      const bounds = new window.google.maps.LatLngBounds();
      this.state.info.ejido.poligono.forEach(pos => {
        bounds.extend(pos);
      });
      this.map && this.map.fitBounds(bounds);
    }
  };

  onBarrioClick = id => {
    let { classes } = this.props;

    let entity = _.find(this.state.info.barrios, barrio => barrio.id == id);
    if (entity == undefined) return;

    //Armo las bounds
    const bounds = new window.google.maps.LatLngBounds();
    entity.poligono.forEach(pos => {
      bounds.extend(pos);
    });

    //Armo el popup
    let popup = {
      lat: bounds.getCenter().lat(),
      lng: bounds.getCenter().lng(),
      onClose: () => {
        this.setState({
          popup: undefined,
          barrioSeleccionado: undefined
        });
      },
      content: () => (
        <div className={classes.popup} style={{ borderLeft: `4px solid ${window.Config.COLOR_BARRIO}`, paddingLeft: "8px" }}>
          <Typography variant="body2">Barrio</Typography>
          <Typography variant="body1">{entity.nombre}</Typography>
        </div>
      )
    };

    this.limpiar();
    this.setState({ popup: popup, barrioSeleccionado: entity }, () => {
      this.map && this.map.fitBounds(bounds);
    });
  };

  onCpcClick = id => {
    let { classes } = this.props;

    let entity = _.find(this.state.info.cpcs, cpc => cpc.id == id);
    if (entity == undefined) return;

    //Armo las bounds
    const bounds = new window.google.maps.LatLngBounds();
    entity.poligono.forEach(pos => {
      bounds.extend(pos);
    });

    //Creo el popup
    let popup = {
      lat: bounds.getCenter().lat(),
      lng: bounds.getCenter().lng(),
      onClose: () => {
        this.setState({
          popup: undefined,
          cpcSeleccionado: undefined
        });
      },
      content: () => (
        <div className={classes.popup} style={{ borderLeft: `4px solid ${window.Config.COLOR_CPC}`, paddingLeft: "8px" }}>
          <Typography variant="body2">CPC</Typography>
          <Typography variant="body1">{`N° ${entity.numero} - ${entity.nombre}`}</Typography>
        </div>
      )
    };

    this.limpiar();
    this.setState({ popup: popup, cpcSeleccionado: entity }, () => {
      this.map && this.map.fitBounds(bounds);
    });
  };

  onMapaRef = ref => {
    this.map = ref;
  };

  onInputBusquedaChange = e => {
    this.setState({ inputBusqueda: e.currentTarget.value });
  };

  onInputBusquedaKeyPress = e => {
    if (e.key == "Enter") {
      this.onBotonBuscarClick();
    }
  };

  onBotonBuscarClick = () => {
    if (this.state.cargando === true) return;

    let busqueda = this.state.inputBusqueda;
    if (busqueda.trim() == "") return;

    this.limpiar();
    this.setState({ cargando: true, inputBusqueda: busqueda }, () => {
      Rules_CordobaGeo.buscar(busqueda)
        .then(data => {
          data.forEach((item, index) => {
            item.id = index;
          });

          //Si no hay
          if (data.length == 0) {
            return;
          }

          //Si hay muchos
          if (data.length > 1) {
            this.setState({
              itemsBusqueda: data,
              panelVisible: true,
              modo: MODO_BUSQUEDA
            });
            return;
          }

          //Si hay uno solo
          this.setState(
            {
              itemsBusqueda: data
            },
            () => {
              this.onItemBusquedaClick(data[0].id);
            }
          );
        })
        .catch(error => {
          this.setState({ mostrarError: true, error: error });
        })
        .finally(() => {
          this.setState({ cargando: false });
        });
    });
  };

  onMapaClick = e => {
    let { latLng } = e;
    this.limpiar();

    this.setState({ cargando: true, mostrarError: false }, () => {
      Rules_CordobaGeo.buscarCoordenada({
        lat: latLng.lat(),
        lng: latLng.lng()
      })
        .then(data => {
          if (data == undefined) return;
          this.mostrarUbicacionEnMapa(data, false);
        })
        .catch(error => {
          this.setState({ mostrarError: true, error: error });
        })
        .finally(() => {
          this.setState({ cargando: false });
        });
    });
  };

  onItemBusquedaClick = id => {
    let item = _.find(this.state.itemsBusqueda, a => {
      return a.id == id;
    });
    if (item == undefined) return;

    this.mostrarUbicacionEnMapa(item);
  };

  mostrarUbicacionEnMapa = (item, mover) => {
    let { classes } = this.props;

    this.limpiar();

    let popup = {
      lat: item.latLng.lat,
      lng: item.latLng.lng,
      onClose: () => {
        this.setState({
          popup: undefined,
          barrioSeleccionado: undefined,
          cpcSeleccionado: undefined
        });
      },
      content: () => (
        <div className={classes.popup} style={{ padding: 0 }}>
          {item.direccion && (
            <div style={{ padding: "8px" }}>
              <Typography variant="body1">{`${StringUtils.toTitleCase(item.direccion.nombre)}`}</Typography>
            </div>
          )}
          {item.barrio && (
            <div
              style={{
                padding: "8px",
                paddingTop: "0px",
                paddingBottom: "0px",
                borderLeft: "4px solid " + window.Config.COLOR_BARRIO
              }}
            >
              <Typography variant="body2">Barrio</Typography>
              <Typography variant="body1">{`${StringUtils.toTitleCase(item.barrio.nombre)}`}</Typography>
            </div>
          )}
          {item.cpc && (
            <div
              style={{
                padding: "8px",
                paddingTop: "0px",
                paddingBottom: "0px",
                borderLeft: "4px solid " + window.Config.COLOR_CPC
              }}
            >
              <Typography variant="body2">CPC</Typography>
              <Typography variant="body1">{`N° ${item.cpc.numero} - ${StringUtils.toTitleCase(item.cpc.nombre)}`}</Typography>
            </div>
          )}
        </div>
      )
    };

    this.setState(
      {
        popup: popup,
        barrioSeleccionado: item.barrio,
        cpcSeleccionado: item.cpc
      },
      () => {
        //Armo las bounds
        const bounds = new window.google.maps.LatLngBounds();

        let barrio = _.find(this.state.info.barrios, b => {
          return b.id == item.barrio.id;
        });
        if (barrio) {
          barrio.poligono.forEach(pos => {
            bounds.extend(pos);
          });
        }
        let cpc = _.find(this.state.info.cpcs, b => {
          return b.id == item.cpc.id;
        });
        if (cpc) {
          cpc.poligono.forEach(pos => {
            bounds.extend(pos);
          });
        }

        if (mover == undefined || mover == true) {
          this.map && this.map.fitBounds(bounds);
        }
      }
    );
  };

  limpiar = () => {
    this.setState({
      inputBusqueda: "",
      mostrarError: false,
      popup: undefined,
      barrioSeleccionado: undefined,
      cpcSeleccionado: undefined,
      panelVisible: false,
      modo: undefined,
      itemsBusqueda: undefined
    });
  };

  render() {
    console.log(this.props.usuario);

    let { classes } = this.props;

    return (
      <div className={classes.root}>
        {/* Mapa */}
        {this.renderMapa()}

        {/* Busqueda */}
        {this.renderPanelBusqueda()}

        {/* Botones */}
        {this.renderBotones()}

        {/* Usuario logeado */}
        {this.renderUsuarioLogeado()}
      </div>
    );
  }

  renderMapa() {
    let { classes } = this.props;

    return (
      <div className={classes.mapa}>
        <MyMapComponent
          onRef={this.onMapaRef}
          onClick={this.onMapaClick}
          isMarkerShown
          googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${
            window.Config.GOOGLE_MAPS_API_KEY
          }`}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `100%` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          barrios={this.state.info && this.state.info.barrios}
          cpcs={this.state.info && this.state.info.cpcs}
          barrioSeleccionado={this.state.barrioSeleccionado}
          cpcSeleccionado={this.state.cpcSeleccionado}
          ejidoVisible={this.state.ejidoVisible}
          ejido={this.state.info && this.state.info.ejido}
          popup={this.state.popup}
        />
      </div>
    );
  }

  renderPanelBusqueda() {
    let { classes } = this.props;

    let placeholderBusqueda = "Buscar en Cordoba Geo";
    if (this.state.modo) {
      switch (this.state.modo) {
        case MODO_BARRIO:
          {
            placeholderBusqueda = "Buscar barrio";
          }
          break;

        case MODO_CPC:
          {
            placeholderBusqueda = "Buscar CPC";
          }
          break;
      }
    }

    return (
      <div className={classNames(classes.contenedorBusqueda, this.state.info && "visible")}>
        {/* Panel */}
        <div className={classNames("panel", this.state.panelVisible === true && "visible")}>
          {/* Barrios */}
          {this.state.info &&
            this.state.info.barrios.map(barrio => {
              let deboMostrar = this.state.panelVisible === true && this.state.modo == MODO_BARRIO;
              let cumpleFiltro = barrio.nombre.toLowerCase().indexOf(this.state.inputBusqueda.toLowerCase()) != -1;
              let visible = deboMostrar && cumpleFiltro;

              return (
                <div className={classNames("item", visible === true && "visible")} key={"barrio" + barrio.id}>
                  <ItemListado id={barrio.id} texto={barrio.nombre} onClick={this.onBarrioClick} />
                </div>
              );
            })}

          {/* CPC */}
          {this.state.info &&
            this.state.info.cpcs.map(cpc => {
              let deboMostrar = this.state.panelVisible === true && this.state.modo == MODO_CPC;
              let cumpleFiltro = cpc.nombre.toLowerCase().indexOf(this.state.inputBusqueda.toLowerCase()) != -1;
              let visible = deboMostrar && cumpleFiltro;

              return (
                <div className={classNames("item", visible === true && "visible")} key={"barrio" + cpc.id}>
                  <ItemListado id={cpc.id} texto={`N° ${cpc.numero} - ${cpc.nombre}`} onClick={this.onCpcClick} />
                </div>
              );
            })}

          {/* Busqueda */}
          {this.state.itemsBusqueda &&
            this.state.itemsBusqueda.map((item, index) => {
              let deboMostrar = this.state.panelVisible === true && this.state.modo == MODO_BUSQUEDA;
              let visible = deboMostrar;

              return (
                <div className={classNames("item", visible === true && "visible")} key={"busqueda" + item.id}>
                  <ItemListado
                    id={item.id}
                    texto={`${StringUtils.toTitleCase(item.direccion.nombre)}`}
                    onClick={this.onItemBusquedaClick}
                  />
                </div>
              );
            })}
        </div>

        {/* Caja busqueda */}
        <Card className={classNames("card", this.state.cargando && "cargando")}>
          <Input
            placeholder={placeholderBusqueda}
            value={this.state.inputBusqueda}
            onKeyPress={this.onInputBusquedaKeyPress}
            disableUnderline={true}
            onChange={this.onInputBusquedaChange}
            className="input"
          />
          <IconButton onClick={this.onBotonBuscarClick}>
            <IconSearch />
          </IconButton>
          <LinearProgress className="progress" />
        </Card>
      </div>
    );
  }

  renderBotones() {
    let { classes } = this.props;

    return (
      <div className={classNames(classes.contenedorBotones, this.state.info && "visible")}>
        {/* Barrios */}
        <ButtonBase
          variant="raised"
          className={classNames(classes.boton, classes.botonBarrios, this.state.modo == MODO_BARRIO && "seleccionado")}
          onClick={this.onBotonBarriosClick}
          style={{ borderColor: window.Config.COLOR_BARRIO }}
        >
          Barrios
        </ButtonBase>

        {/* CPC */}
        <ButtonBase
          variant="raised"
          className={classNames(classes.boton, classes.botonCPCs, this.state.modo == MODO_CPC && "seleccionado")}
          onClick={this.onBotonCpcsClick}
          style={{ borderColor: window.Config.COLOR_CPC }}
        >
          CPCs
        </ButtonBase>

        {/* Ejido */}
        <ButtonBase
          variant="raised"
          className={classNames(classes.boton, classes.botonEjido, this.state.ejidoVisible == true && "seleccionado")}
          onClick={this.onBotonEjidoClick}
          style={{ borderColor: window.Config.COLOR_EJIDO }}
        >
          Ejido
        </ButtonBase>
      </div>
    );
  }

  onUsuarioPress = e => {
    this.setState({
      anchorPopupUsuario: e.currentTarget
    });
  };

  onUsuarioMenuClose = () => {
    this.setState({
      anchorPopupUsuario: undefined
    });
  };

  onBotonMiPerfilClick = () => {
    window.location.href = window.Config.URL_MI_PERFIL + "/#/?token=" + this.props.token;
  };

  onBotonCerrarSesionPress = () => {
    this.props.cerrarSesion();
  };

  renderUsuarioLogeado() {
    let { classes, usuario } = this.props;
    let urlFotoPerfil = CordobaFilesUtils.getUrlFotoMediana(usuario.identificadorFotoPersonal, usuario.sexoMasculino);
    let urlFotoPerfilMiniatura = CordobaFilesUtils.getUrlFotoMiniatura(usuario.identificadorFotoPersonal, usuario.sexoMasculino);
    return (
      <React.Fragment>
        <IconButton onClick={this.onUsuarioPress} color="inherit" className={classes.usuarioLogeado}>
          <Avatar alt="Menu del usuario" src={urlFotoPerfilMiniatura} className={"foto"} />
        </IconButton>
        {usuario && (
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorPopupUsuario}
            getContentAnchorEl={null}
            className={classes.menuUsuario}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(this.state.anchorPopupUsuario)}
            onClose={this.onUsuarioMenuClose}
          >
            <div className={classes.menuUsuarioInfo} style={{ display: "flex" }}>
              <Avatar alt="Menu del usuario" src={urlFotoPerfil} className={classNames(classes.icono)} />
              <Typography align="center" variant="subheading" color="inherit">
                {this.props.usuario.nombre + " " + this.props.usuario.apellido}
              </Typography>
            </div>

            <MenuItem divider onClick={this.onBotonMiPerfilClick}>
              Mi perfil
            </MenuItem>
            <MenuItem onClick={this.onBotonCerrarSesionPress}>Cerrar sesión</MenuItem>
          </Menu>
        )}
      </React.Fragment>
    );
  }
}

class ItemListado extends React.PureComponent {
  onClick = () => {
    this.props.onClick && this.props.onClick(this.props.id);
  };

  render() {
    return (
      <ListItem button onClick={this.onClick}>
        <ListItemText>{this.props.texto}</ListItemText>
        <ListItemText>{this.props.detalle}</ListItemText>
      </ListItem>
    );
  }
}

let componente = Mapa;
componente = connect(
  mapStateToProps,
  mapDispatchToProps
)(componente);
componente = withStyles(styles)(componente);
componente = withRouter(componente);

export default componente;
