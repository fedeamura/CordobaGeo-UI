const styles = theme => {
  return {
    root: {
      width: "100%",
      height: "100%",
      "& .infoBox img": {
        right: "12px",
        top: "12px"
      }
    },
    contenedorBusqueda: {
      position: "absolute",
      height: "100%",
      width: "calc(100%)",
      maxWidth: "inherit",
      pointerEvents: "none",
      display: "flex",
      zIndex: 100,
      "& .card": {
        position: "relative",
        zIndex: 10,
        margin: "10px",
        pointerEvents: "all",
        height: "56px",
        width: "100%",
        display: "flex",
        paddingTop: "4px",
        paddingBottom: "4px",
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        "& .input": {
          flex: 1,
          transition: "all 0.3s"
        },
        "& button": {
          transition: "all 0.3s"
        },
        "& .progress": {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          transition: "all 0.3s"
        },
        "&.cargando .input": {
          opacity: 0.5,
          pointerEvents: "none"
        },
        "&.cargando button": {
          opacity: 0.5,
          pointerEvents: "none"
        },
        "&.cargando .progress": {
          opacity: 1
        },
        marginRight: "70px",
        [theme.breakpoints.up("sm")]: {
          marginRight: "26px"
        }
      },
      "& .panel": {
        overflow: "auto",
        paddingTop: "72px",
        pointerEvents: "all",
        backgroundColor: "#F5F5F5",
        position: "absolute",
        width: "100%",
        height: "100%",
        boxShadow: "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)",
        transform: "translateX(-100%)",
        transition: "all 0.3s",
        "&.visible": {
          transform: "translateX(0%)"
        },
        "& .item": {
          opacity: 0,
          maxHeight: 0,
          overflow: "hidden",
          transition: "opacity 0.3s, max-height 0.3s 0.3s",
          "&.visible": {
            opacity: 1,
            maxHeight: 100,
            transition: "opacity 0.3s 0.3s, max-height 0.3s"
          }
        }
      },
      [theme.breakpoints.up("sm")]: {
        width: "calc(100% - " + theme.spacing.unit * 2 + "px)",
        maxWidth: "30rem"
      },
      opacity: 0,
      transform: "translateY(-50px)",
      transition: "all 0.3s",
      "&.visible": {
        opacity: 1,
        transform: "translateY(0px)"
      }
    },
    mapa: {
      width: "100%",
      height: "100%",
      position: "absolute"
    },
    contenedorBotones: {
      display: "flex",
      boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
      position: "absolute",
      height: "40px",
      right: "60px",
      bottom: "23px",
      flexDirection: "row",
      opacity: 0,
      transition: "all 0.3s",
      pointerEvents: "none",
      "&.visible": {
        pointerEvents: "all",
        opacity: 1
      },
      "& button.seleccionado": {
        backgroundColor: "rgb(230, 230, 230)"
      },
      "& button:not(:last-child)": {
        borderRight: "1px solid rgb(230, 230, 230) !important"
        // marginLeft: "10px",
        // marginBottom: "10px"
      }
    },
    boton: {
      paddingLeft: "8px",
      paddingRight: "8px",
      height: "40px",
      display: "flex",
      backgroundColor: "white"
    },
    botonBarrios: {
      borderBottom: "4px solid red"
    },
    botonCPCs: {
      borderBottom: "4px solid blue"
    },
    botonEjido: {
      borderBottom: "4px solid black"
    },
    popup: {
      // backgroundColor: "white",
      // padding: "8px",
      // borderRadius: "8px",
      // boxShadow: "0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2)",
      // margin: "8px"
    },
    usuarioLogeado: {
      position: "absolute",
      zIndex: "101",
      right: "10px",
      top: "15px",
      "& .foto": {
        boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)"
      }
    },
    menuUsuario: {
      "& div:nth-child(2)": {
        width: "20rem",
        // minWidth: "20rem",
        maxWidth: "calc(100% - 2rem)"
      },
      "& ul": {
        paddingTop: 0
      }
    },
    menuUsuarioInfo: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.unit * 2,
      "& h2": {
        marginLeft: theme.spacing.unit
      },
      "& > div": {
        width: "5rem",
        height: "5rem",
        marginBottom: "0.5rem"
      },
      "&:focus": {
        outline: "none"
      },
      backgroundColor: "rgba(0,0,0,0.025)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.095);"
    }
  };
};

export default styles;
